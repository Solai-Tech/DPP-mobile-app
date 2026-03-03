import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import WebView from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import { TextMuted, TextPrimary, Accent, Border } from '../src/theme/colors';
import { s, vs, ms } from '../src/utils/scale';

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
  const { url, title, autoDownload } = useLocalSearchParams<{
    url?: string;
    title?: string;
    autoDownload?: string;
  }>();
  const safeUrl = typeof url === 'string' ? url : '';
  const safeTitle = typeof title === 'string' ? title : 'Web View';
  const isAutoDownload = autoDownload === 'true';
  const [pdfStatus, setPdfStatus] = useState(isAutoDownload ? 'loading' : '');
  const webViewRef = useRef<WebView>(null);

  const handleMessage = async (event: { nativeEvent: { data: string } }) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

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

  const injectedJS = isAutoDownload
    ? PDF_INTERCEPT_JS + '\n' + AUTO_DOWNLOAD_JS
    : PDF_INTERCEPT_JS;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios-new" size={ms(18)} color={TextPrimary} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{safeTitle}</Text>
      </View>

      {isAutoDownload && pdfStatus ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Accent} />
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
    backgroundColor: '#F7F5F0',
  },
  header: {
    height: vs(48),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(12),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Border,
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
    color: '#2C3E2D',
  },
  cancelBtn: {
    marginTop: vs(12),
    paddingHorizontal: s(24),
    paddingVertical: vs(10),
    borderRadius: s(10),
    borderWidth: 1.5,
    borderColor: 'rgba(44,62,45,0.15)',
  },
  cancelText: {
    fontSize: ms(14),
    fontWeight: '600',
    color: 'rgba(44,62,45,0.65)',
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
