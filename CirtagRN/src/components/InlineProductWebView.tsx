import React, { useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import WebView from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';
import {
  HIDE_SECTIONS_JS,
  PDF_INTERCEPT_JS,
  DESKTOP_VIEWPORT_JS,
  DESKTOP_USER_AGENT,
  HEIGHT_MEASURE_JS,
} from '../utils/webviewScripts';
import { s, vs, ms } from '../utils/scale';

const GreenAccent = '#1B7A3D';
const TextBlack = '#1A1A1A';
const Border = '#E8ECF0';

interface Props {
  url: string;
  onPdfDownload?: (pdfUrl: string) => void;
}

export default function InlineProductWebView({ url, onPdfDownload }: Props) {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [webViewHeight, setWebViewHeight] = useState(400);

  const injectedJS = HIDE_SECTIONS_JS + '\n' + PDF_INTERCEPT_JS + '\n' + HEIGHT_MEASURE_JS;

  const handleMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'height' && typeof data.value === 'number' && data.value > 0) {
          setWebViewHeight((prev) => Math.max(prev, data.value));
        }
        if (data.type === 'pdf_download' && data.url && onPdfDownload) {
          onPdfDownload(data.url);
        }
      } catch {
        // ignore
      }
    },
    [onPdfDownload],
  );

  const handleShouldStartLoad = useCallback(
    (request: { url: string }) => {
      if (/\.pdf(\?|#|$)/i.test(request.url) && !request.url.includes('docs.google.com')) {
        if (onPdfDownload) {
          onPdfDownload(request.url);
        }
        return false;
      }
      return true;
    },
    [onPdfDownload],
  );

  return (
    <View style={styles.wrapper}>
      {/* Section header */}
      <View style={styles.headerRow}>
        <MaterialIcons name="language" size={ms(18)} color={GreenAccent} />
        <Text style={styles.headerText}>Original Product Page</Text>
      </View>
      <View style={styles.divider} />

      {/* WebView container — height matches content */}
      <View style={[styles.webViewContainer, { height: webViewHeight }]}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={GreenAccent} />
            <Text style={styles.loadingText}>Loading product page...</Text>
          </View>
        )}
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          style={styles.webView}
          scrollEnabled={false}
          nestedScrollEnabled={false}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          setSupportMultipleWindows={false}
          allowFileAccess
          userAgent={DESKTOP_USER_AGENT}
          injectedJavaScriptBeforeContentLoaded={DESKTOP_VIEWPORT_JS}
          injectedJavaScript={injectedJS}
          onMessage={handleMessage}
          onShouldStartLoadWithRequest={handleShouldStartLoad}
          onLoadEnd={() => setLoading(false)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: s(20),
    marginTop: vs(8),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    marginBottom: vs(8),
  },
  headerText: {
    fontSize: ms(15),
    fontWeight: '700',
    color: TextBlack,
  },
  divider: {
    height: 1,
    backgroundColor: Border,
    marginBottom: vs(12),
  },
  webViewContainer: {
    borderRadius: s(12),
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    zIndex: 10,
    gap: vs(8),
  },
  loadingText: {
    fontSize: ms(13),
    color: '#999999',
    fontWeight: '500',
  },
});
