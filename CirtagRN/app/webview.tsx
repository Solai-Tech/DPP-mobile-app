import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import WebView from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import { TextMuted, TextPrimary } from '../src/theme/colors';
import { s, vs, ms } from '../src/utils/scale';
import { getChatbotReply } from '../src/utils/chatbotApi';
import { ScannedProduct } from '../src/types/ScannedProduct';

async function downloadPdf(pdfUrl: string) {
  try {
    const filename = `datasheet-${Date.now()}.pdf`;
    const dest = `${FileSystem.documentDirectory}${filename}`;
    await FileSystem.downloadAsync(pdfUrl, dest);
    Alert.alert('Downloaded!', 'PDF has been saved successfully.');
  } catch {
    Alert.alert('Download failed', 'Unable to download the PDF.');
  }
}

const PDF_INTERCEPT_JS = `
(function() {
  document.addEventListener('click', function(e) {
    var el = e.target;
    while (el && el.tagName !== 'A') el = el.parentElement;
    if (!el || !el.href) return;
    if (el.href.match(/\\.pdf(\\?|#|$)/i) || el.hasAttribute('download') ||
        (el.textContent && el.textContent.toLowerCase().includes('download pdf'))) {
      e.preventDefault();
      e.stopPropagation();
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'pdf_download', url: el.href }));
      return false;
    }
  }, true);
  true;
})();
`;

const AUTO_DOWNLOAD_JS = `
(function() {
  function findPdf() {
    var links = document.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      if (links[i].href.match(/\\.pdf(\\?|#|$)/i)) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'pdf_download', url: links[i].href }));
        return;
      }
    }
    for (var i = 0; i < links.length; i++) {
      if (links[i].hasAttribute('download') ||
          (links[i].textContent && links[i].textContent.toLowerCase().includes('download pdf'))) {
        links[i].click();
        return;
      }
    }
    var buttons = document.querySelectorAll('button, [role="button"], .btn');
    for (var i = 0; i < buttons.length; i++) {
      if (buttons[i].textContent && buttons[i].textContent.toLowerCase().includes('download')) {
        buttons[i].click();
        return;
      }
    }
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'no_pdf_found' }));
  }
  setTimeout(findPdf, 2500);
  true;
})();
`;

export default function WebViewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { url, title, autoDownload, productData } = useLocalSearchParams<{
    url?: string;
    title?: string;
    autoDownload?: string;
    productData?: string;
  }>();
  const safeUrl = typeof url === 'string' ? url : '';
  const safeTitle = typeof title === 'string' ? title : 'Web View';
  const isAutoDownload = autoDownload === 'true';
  const [pdfStatus, setPdfStatus] = useState(isAutoDownload ? 'loading' : '');

  // Build JS to intercept Flowise chatbot API calls and route through our OpenAI chatbot
  const webViewRef = useRef<WebView>(null);
  let chatbotInterceptJS = '';
  if (productData) {
    chatbotInterceptJS = `
(function() {
  var pending = {};
  var counter = 0;

  // RN will call this to deliver the OpenAI response
  window.__chatReply = function(id, text) {
    if (pending[id]) {
      pending[id](text);
      delete pending[id];
    }
  };

  var _fetch = window.fetch;
  window.fetch = function(url, opts) {
    // Intercept Flowise prediction API calls
    if (typeof url === 'string' && url.indexOf('/api/v1/prediction/') !== -1) {
      try {
        if (opts && opts.method && opts.method.toUpperCase() === 'POST' && opts.body) {
          var body = JSON.parse(typeof opts.body === 'string' ? opts.body : '{}');
          if (body.question) {
            var id = ++counter;
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'chatbot_question',
              id: id,
              question: body.question
            }));

            return new Promise(function(resolve) {
              pending[id] = function(text) {
                // Build Flowise-format SSE response
                var chatId = 'local-' + Date.now();
                var msgId = 'msg-' + Date.now();
                var sse = '';

                // Start event
                sse += 'data:' + JSON.stringify({event:'start',data:''}) + '\\n\\n';

                // Send full response as one token
                sse += 'data:' + JSON.stringify({event:'token',data:text}) + '\\n\\n';

                // Metadata event
                sse += 'data:' + JSON.stringify({event:'metadata',data:{chatId:chatId,chatMessageId:msgId,question:body.question,sessionId:chatId,memoryType:'Buffer Window Memory'}}) + '\\n\\n';

                // End event
                sse += 'data:' + JSON.stringify({event:'end',data:'[DONE]'}) + '\\n\\n';

                var encoder = new TextEncoder();
                var stream = new ReadableStream({
                  start: function(c) {
                    c.enqueue(encoder.encode(sse));
                    c.close();
                  }
                });
                resolve(new Response(stream, {
                  status: 200,
                  headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache'
                  }
                }));
              };

              setTimeout(function() {
                if (pending[id]) {
                  pending[id]('Sorry, the request timed out. Please try again.');
                }
              }, 30000);
            });
          }
        }
      } catch(e) {}
    }
    return _fetch.apply(this, arguments);
  };
  true;
})();
`;
  }

  const handleMessage = async (event: { nativeEvent: { data: string } }) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      // Debug logging
      if (data.type === 'debug') {
        console.log('[WebView DBG]', data.msg);
        return;
      }

      // Handle chatbot question - route through our OpenAI chatbot
      if (data.type === 'chatbot_question' && data.question && productData) {
        console.log('[WebView] chatbot_question received:', data.question);
        try {
          const pd = JSON.parse(productData);
          const product: Partial<ScannedProduct> = {
            id: 0,
            rawValue: safeUrl,
            displayValue: pd.name || '',
            format: '',
            type: '',
            productName: pd.name || '',
            supplier: pd.supplier || '',
            price: pd.price || '',
            weight: pd.weight || '',
            co2Total: pd.co2Total || '',
            co2Details: pd.co2Details || '',
            certifications: pd.certifications || '',
            productDescription: pd.description || '',
            productId: pd.productId || '',
            skuId: pd.skuId || '',
            datasheetUrl: '',
            imageUrl: '',
            scannedAt: Date.now(),
          };
          const reply = await getChatbotReply(data.question, [product as ScannedProduct]);
          const escaped = JSON.stringify(reply);
          webViewRef.current?.injectJavaScript(
            `if(window.__chatReply) window.__chatReply(${data.id}, ${escaped}); true;`
          );
        } catch (err) {
          const fallback = JSON.stringify('Sorry, something went wrong. Please try again.');
          webViewRef.current?.injectJavaScript(
            `if(window.__chatReply) window.__chatReply(${data.id}, ${fallback}); true;`
          );
        }
        return;
      }

      if (data.type === 'pdf_download' && data.url) {
        if (isAutoDownload) {
          router.back();
          downloadPdf(data.url);
        } else {
          downloadPdf(data.url);
        }
      }
      if (data.type === 'no_pdf_found' && isAutoDownload) {
        router.back();
        Alert.alert('No PDF found', 'No downloadable PDF found for this product.');
      }
    } catch {
      // ignore
    }
  };

  const handleShouldStartLoad = (request: { url: string }) => {
    if (/\.pdf(\?|#|$)/i.test(request.url) && !request.url.includes('docs.google.com')) {
      if (isAutoDownload) router.back();
      downloadPdf(request.url);
      return false;
    }
    return true;
  };

  const injectedJS = (isAutoDownload
    ? PDF_INTERCEPT_JS + '\n' + AUTO_DOWNLOAD_JS
    : PDF_INTERCEPT_JS) + '\n' + chatbotInterceptJS;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios-new" size={ms(18)} color={TextPrimary} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{safeTitle}</Text>
      </View>

      {/* Auto-download: show loading overlay on top of hidden WebView */}
      {isAutoDownload && pdfStatus ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00E676" />
          <Text style={styles.loadingText}>
            {pdfStatus === 'downloading' ? 'Downloading PDF...' : 'Finding PDF...'}
          </Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {safeUrl ? (
        <WebView
          ref={webViewRef}
          source={{ uri: safeUrl }}
          style={isAutoDownload ? styles.hiddenWeb : styles.web}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          setSupportMultipleWindows={false}
          startInLoadingState={!isAutoDownload}
          allowFileAccess
          injectedJavaScriptBeforeContentLoaded={chatbotInterceptJS}
          injectedJavaScript={injectedJS}
          onMessage={handleMessage}
          onShouldStartLoadWithRequest={handleShouldStartLoad}
          onFileDownload={({ nativeEvent }) => {
            if (nativeEvent.downloadUrl) {
              if (isAutoDownload) router.back();
              downloadPdf(nativeEvent.downloadUrl);
            }
          }}
        />
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Invalid URL</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    height: vs(48),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(12),
    backgroundColor: '#0A1A14',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: {
    width: s(34),
    height: s(34),
    borderRadius: s(17),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: s(8),
  },
  title: {
    flex: 1,
    fontSize: ms(14),
    fontWeight: '600',
    color: TextPrimary,
  },
  web: {
    flex: 1,
  },
  hiddenWeb: {
    height: 0,
    opacity: 0,
  },
  loadingOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(16),
  },
  loadingText: {
    fontSize: ms(16),
    fontWeight: '600',
    color: '#1A1A1A',
  },
  cancelBtn: {
    marginTop: vs(12),
    paddingHorizontal: s(24),
    paddingVertical: vs(10),
    borderRadius: s(10),
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  cancelText: {
    fontSize: ms(14),
    fontWeight: '600',
    color: '#6B6B6B',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: TextMuted,
    fontSize: ms(12),
  },
});
