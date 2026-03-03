import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import { useProducts } from '../src/hooks/useProducts';
import { DocumentInfo } from '../src/utils/productDataFetcher';
import { s, vs, ms } from '../src/utils/scale';

const CreamBg = '#F7F5F0';
const White = '#FFFFFF';
const SageAccent = '#5A8C5A';
const TextDark = '#2C3E2D';
const TextGray = 'rgba(44,62,45,0.65)';
const TextMutedLight = 'rgba(44,62,45,0.4)';
const Border = 'rgba(44,62,45,0.06)';

interface DocCategory {
  key: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  bg: string;
  match: (name: string) => boolean;
}

const categories: DocCategory[] = [
  { key: 'manuals', label: 'MANUALS', icon: 'auto-stories', color: '#C17B3A', bg: 'rgba(193,123,58,0.10)', match: (n) => /manual|user|instruction|assembly/i.test(n) },
  { key: 'datasheet', label: 'DATASHEET', icon: 'insert-drive-file', color: '#2E7D8B', bg: 'rgba(46,125,139,0.10)', match: (n) => /datasheet|data.?sheet|spec.?sheet/i.test(n) },
  { key: 'compliance', label: 'COMPLIANCE INFO', icon: 'gavel', color: '#7B6BA8', bg: 'rgba(123,107,168,0.10)', match: (n) => /compliance|compli/i.test(n) },
  { key: 'warranty', label: 'WARRANTY', icon: 'verified-user', color: '#2E8B7E', bg: 'rgba(46,139,126,0.10)', match: (n) => /warranty/i.test(n) },
  { key: 'repair', label: 'REPAIR', icon: 'handyman', color: '#5A8C5A', bg: 'rgba(90,140,90,0.10)', match: (n) => /repair|guide/i.test(n) },
  { key: 'recycle', label: 'RECYCLE', icon: 'recycling', color: '#43A047', bg: 'rgba(67,160,71,0.10)', match: (n) => /recycl/i.test(n) },
];

export default function DocumentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { getProductById } = useProducts();
  const [docMap, setDocMap] = useState<Record<string, DocumentInfo | null>>({});
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    getProductById(Number(productId)).then((product) => {
      if (!product) return;
      let documentList: DocumentInfo[] = [];
      try {
        if (product.documents) {
          const raw: DocumentInfo[] = JSON.parse(product.documents);
          // Only keep actual PDF files — ignore page URLs
          documentList = raw.filter((d) => d.url && /\.pdf(\?|#|$)/i.test(d.url));
        }
      } catch {}

      const map: Record<string, DocumentInfo | null> = {};
      categories.forEach((cat) => {
        const found = documentList.find((doc) => cat.match(doc.name));
        map[cat.key] = found || null;
      });
      // Any unmatched docs go to first empty category or get appended
      documentList.forEach((doc) => {
        const alreadyUsed = Object.values(map).some((d) => d && d.url === doc.url);
        if (!alreadyUsed) {
          const emptyKey = categories.find((c) => !map[c.key]);
          if (emptyKey) map[emptyKey.key] = doc;
        }
      });
      setDocMap(map);
    });
  }, [productId]);

  const openDocNatively = async (url: string, name: string, catKey: string) => {
    if (loadingKey) return;
    let safeUrl = url || '';
    if (safeUrl && !/^https?:\/\//i.test(safeUrl)) safeUrl = `https://${safeUrl}`;
    if (!safeUrl) return;
    setLoadingKey(catKey);
    try {
      const filename = `${name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      const dest = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.downloadAsync(safeUrl, dest);
      const contentUri = await FileSystem.getContentUriAsync(dest);
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 1,
        type: 'application/pdf',
      });
    } catch {
      Alert.alert('Unable to open', 'Could not download or open this document.');
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={ms(22)} color={TextDark} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Product Documentation</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: vs(14), paddingBottom: vs(32) + insets.bottom }}
      >
        {categories.map((cat) => {
          const doc = docMap[cat.key];
          const hasFile = !!doc;
          const isLoading = loadingKey === cat.key;

          return (
            <TouchableOpacity
              key={cat.key}
              style={styles.docCard}
              activeOpacity={hasFile ? 0.7 : 1}
              onPress={() => {
                if (hasFile) openDocNatively(doc.url, doc.name, cat.key);
              }}
            >
              <View style={[styles.docIconBox, { backgroundColor: cat.bg }]}>
                <MaterialIcons name={cat.icon} size={ms(22)} color={cat.color} />
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docLabel}>{cat.label}</Text>
                {hasFile ? (
                  <Text style={styles.docFileName} numberOfLines={1}>{doc.name}</Text>
                ) : (
                  <Text style={styles.noFileText}>No file uploaded</Text>
                )}
              </View>
              {isLoading ? (
                <ActivityIndicator size="small" color={SageAccent} />
              ) : hasFile ? (
                <View style={styles.viewBtn}>
                  <MaterialIcons name="visibility" size={ms(16)} color={SageAccent} />
                  <Text style={styles.viewBtnText}>View</Text>
                </View>
              ) : (
                <View style={styles.naBadge}>
                  <Text style={styles.naText}>N/A</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CreamBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(4),
    paddingTop: vs(8),
    paddingBottom: vs(14),
    borderBottomWidth: 1,
    borderBottomColor: Border,
  },
  backBtn: {
    padding: s(12),
  },
  headerTitle: {
    fontSize: ms(19),
    fontWeight: '700',
    color: TextDark,
    letterSpacing: -0.3,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: s(16),
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: White,
    borderRadius: s(14),
    paddingVertical: vs(16),
    paddingHorizontal: s(14),
    marginBottom: vs(10),
    borderWidth: 1,
    borderColor: Border,
    shadowColor: '#2C3E2D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  docIconBox: {
    width: s(44),
    height: s(44),
    borderRadius: s(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(14),
  },
  docInfo: {
    flex: 1,
  },
  docLabel: {
    fontSize: ms(11),
    fontWeight: '700',
    color: TextGray,
    letterSpacing: 0.8,
    marginBottom: vs(3),
  },
  docFileName: {
    fontSize: ms(13.5),
    fontWeight: '600',
    color: SageAccent,
  },
  noFileText: {
    fontSize: ms(13),
    fontWeight: '400',
    color: TextMutedLight,
    fontStyle: 'italic',
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(90,140,90,0.10)',
    borderRadius: s(20),
    paddingHorizontal: s(12),
    paddingVertical: vs(6),
    gap: s(4),
  },
  viewBtnText: {
    fontSize: ms(12),
    fontWeight: '600',
    color: SageAccent,
  },
  naBadge: {
    backgroundColor: 'rgba(44,62,45,0.04)',
    borderRadius: s(20),
    paddingHorizontal: s(12),
    paddingVertical: vs(6),
  },
  naText: {
    fontSize: ms(11),
    fontWeight: '500',
    color: TextMutedLight,
  },
});
