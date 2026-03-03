import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { s, vs, ms } from '../src/utils/scale';

const CreamBg = '#F7F5F0';
const White = '#FFFFFF';
const SageAccent = '#5A8C5A';
const TextDark = '#2C3E2D';
const TextGray = 'rgba(44,62,45,0.65)';
const Border = 'rgba(44,62,45,0.06)';

export default function PdfViewerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { url, title } = useLocalSearchParams<{ url: string; title: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  let viewUrl = url || '';
  if (viewUrl && !/^https?:\/\//i.test(viewUrl)) viewUrl = `https://${viewUrl}`;
  if (/\.pdf(\?|#|$)/i.test(viewUrl)) {
    viewUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(viewUrl)}`;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={ms(22)} color={TextDark} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{title || 'Document'}</Text>
        </View>
      </View>

      {/* Document Viewer */}
      <View style={styles.viewerContainer}>
        {error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={ms(48)} color={TextGray} />
            <Text style={styles.errorText}>Unable to load document</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => { setError(false); setLoading(true); }}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <WebView
              source={{ uri: viewUrl }}
              style={styles.viewer}
              onLoadEnd={() => setLoading(false)}
              onError={() => { setLoading(false); setError(true); }}
              javaScriptEnabled
              domStorageEnabled
              scalesPageToFit
              startInLoadingState={false}
            />
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={SageAccent} />
                <Text style={styles.loadingText}>Loading document...</Text>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: White,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(4),
    paddingTop: vs(8),
    paddingBottom: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: Border,
    backgroundColor: White,
  },
  backBtn: {
    padding: s(12),
  },
  headerTitle: {
    fontSize: ms(17),
    fontWeight: '700',
    color: TextDark,
  },
  viewerContainer: {
    flex: 1,
  },
  viewer: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: White,
    gap: vs(12),
  },
  loadingText: {
    fontSize: ms(14),
    color: TextGray,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: White,
    gap: vs(12),
  },
  errorText: {
    fontSize: ms(15),
    color: TextGray,
    fontWeight: '500',
  },
  retryBtn: {
    backgroundColor: SageAccent,
    borderRadius: s(10),
    paddingHorizontal: s(24),
    paddingVertical: vs(10),
    marginTop: vs(8),
  },
  retryText: {
    fontSize: ms(14),
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
