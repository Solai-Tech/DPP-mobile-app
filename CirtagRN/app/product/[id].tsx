import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import { ScannedProduct } from '../../src/types/ScannedProduct';
import { useProducts } from '../../src/hooks/useProducts';
import { fetchProductData, DocumentInfo } from '../../src/utils/productDataFetcher';
import * as dao from '../../src/database/scannedProductDao';
import { formatScanDate } from '../../src/utils/dateFormatter';
import { s, vs, ms } from '../../src/utils/scale';

// Premium Botanical theme colors
const CreamBg = '#F5F3EE';
const White = '#FFFFFF';
const SageAccent = '#5A8C5A';
const SageTint = 'rgba(90,140,90,0.08)';
const TextDark = '#2C3E2D';
const TextGray = 'rgba(44,62,45,0.65)';
const TextMutedLight = 'rgba(44,62,45,0.4)';
const Border = 'rgba(44,62,45,0.08)';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getProductById } = useProducts();
  const [product, setProduct] = useState<ScannedProduct | null>(null);
  const [downloading, setDownloading] = useState(false);
  useEffect(() => {
    if (id) {
      getProductById(Number(id)).then((p) => setProduct(p));
    }
  }, [id, getProductById]);

  // Re-fetch CO2 details and documents if missing/incomplete
  useEffect(() => {
    if (!product || !product.rawValue.startsWith('http')) return;
    const needsCo2 = !product.co2Details || product.co2Details.split(',').length < 2;
    const needsDocs = !product.documents;
    if (!needsCo2 && !needsDocs) return;
    let cancelled = false;
    fetchProductData(product.rawValue).then((data) => {
      if (cancelled) return;
      if (needsCo2 && data.co2Details && data.co2Details.split(',').length >= 2) {
        dao.updateProductCO2(product.id, data.co2Total, data.co2Details);
        setProduct((prev) => prev ? { ...prev, co2Total: data.co2Total, co2Details: data.co2Details } : prev);
      }
      if (needsDocs && data.documents) {
        dao.updateProductDocuments(product.id, data.documents);
        setProduct((prev) => prev ? { ...prev, documents: data.documents } : prev);
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [product?.id]);

  if (!product) return null;

  // Extract product name - try productName first, then extract from URL
  let displayName = product.productName && product.productName.trim() !== '' ? product.productName : '';

  // If no productName, try to extract from URL path
  if (!displayName && product.rawValue) {
    try {
      const url = new URL(product.rawValue);
      const nameParam = url.searchParams.get('name') ||
                        url.searchParams.get('product') ||
                        url.searchParams.get('title');
      if (nameParam) {
        displayName = decodeURIComponent(nameParam).replace(/[-_]/g, ' ').trim();
      } else {
        const pathParts = url.pathname.split('/').filter(p =>
          p && p !== 'dpp' && p !== 'dppx' && p !== 'product' && p !== 'products'
        );
        if (pathParts.length > 0) {
          const lastPart = pathParts[pathParts.length - 1];
          if (!/^\d+$/.test(lastPart)) {
            displayName = decodeURIComponent(lastPart).replace(/[-_]/g, ' ').trim();
          } else {
            displayName = `Product ${lastPart}`;
          }
        }
      }
    } catch {
      // Not a URL
    }
  }

  if (!displayName) {
    displayName = product.displayValue || product.rawValue || 'Unknown Product';
  }

  // Clean product name: remove "R_" / "RN_" / "RN " prefix and replace underscores
  displayName = displayName.replace(/^RN?[_ ]/i, '').replace(/_/g, ' ').trim();

  const certs = product.certifications
    ? product.certifications.split(',').map((c) => c.trim())
    : [];
  const hasVerified = certs.some((c) => c.includes('Verified'));

  const normalizeUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  const openUrl = (url: string, title = 'Product Link') => {
    const safeUrl = normalizeUrl(url);
    if (!safeUrl) {
      Alert.alert('Link unavailable', 'No valid link found for this item.');
      return;
    }
    let viewUrl = safeUrl;
    if (/\.pdf(\?|$)/i.test(safeUrl)) {
      viewUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(safeUrl)}`;
    }
    router.push(
      `/webview?url=${encodeURIComponent(viewUrl)}&title=${encodeURIComponent(title)}`
    );
  };

  // Find the first available PDF URL from documents only
  const findPdfUrl = (): string | null => {
    let docs: DocumentInfo[] = [];
    try { if (product.documents) docs = JSON.parse(product.documents); } catch {}
    const pdfDoc = docs.find((d) => /\.pdf(\?|#|$)/i.test(d.url));
    if (pdfDoc) return normalizeUrl(pdfDoc.url);
    // Only use datasheetUrl if it's an actual PDF file
    if (product.datasheetUrl && /\.pdf(\?|#|$)/i.test(product.datasheetUrl)) {
      return normalizeUrl(product.datasheetUrl);
    }
    return null;
  };

  const handleDownloadPdf = async () => {
    if (!product || downloading) return;
    const pdfUrl = findPdfUrl();
    if (!pdfUrl) {
      Alert.alert('No PDF available', 'This product does not have a downloadable PDF.');
      return;
    }
    setDownloading(true);
    try {
      const filename = `${(displayName || 'datasheet').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      const dest = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.downloadAsync(pdfUrl, dest);
      const contentUri = await FileSystem.getContentUriAsync(dest);
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 1,
        type: 'application/pdf',
      });
    } catch {
      Alert.alert('Download failed', 'Unable to download or open the PDF.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    Share.share({
      message: `Check out this product's Digital Product Passport: ${product.rawValue}`,
    });
  };

  const supplierLocation = [product.supplier, product.weight ? `${product.weight}` : null]
    .filter(Boolean)
    .join(' \u00B7 ');

  // Parse CO2 breakdown into boxes
  const co2Boxes: { label: string; value: string }[] = [];
  if (product.co2Details) {
    product.co2Details.split(',').forEach((item) => {
      const [rawLabel, rawValue] = item.split(':');
      if (!rawLabel || !rawValue) return;
      let label = rawLabel.trim();
      // Rename as requested
      if (/transport|shipping/i.test(label)) label = 'Carbon Footprints';
      else if (/end of life|eol/i.test(label)) label = 'Recycle';
      else if (/raw mat/i.test(label)) label = 'Raw Mat.';
      else if (/manufactur/i.test(label)) label = 'Mfg';
      else if (/usage/i.test(label)) label = 'Usage';
      const num = rawValue.replace(/[^\d.]/g, '');
      if (num) co2Boxes.push({ label, value: num });
    });
  }
  // Fallback: show total if no breakdown
  if (co2Boxes.length === 0 && product.co2Total) {
    const num = product.co2Total.replace(/[^\d.]/g, '');
    if (num) co2Boxes.push({ label: 'Carbon Footprints', value: num });
  }

  // CO2 color mapping for each category
  const co2Colors = ['#5A8C5A', '#2E7D8B', '#C17B3A', '#7B6BA8', '#D4694A'];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: vs(32) + insets.bottom }}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={['#5A8C5A', '#4A7A4A', '#3D6B3D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          {/* Header overlay */}
          <View style={styles.heroHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <MaterialIcons name="arrow-back" size={ms(22)} color={White} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Product Passport</Text>
            </View>
            {hasVerified && (
              <View style={styles.verifiedBadge}>
                <MaterialIcons name="verified" size={ms(13)} color={White} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>

          {/* Product image + name inside hero */}
          <View style={styles.heroContent}>
            <View style={styles.imageWrapper}>
              {product.imageUrl ? (
                <Image
                  source={{ uri: product.imageUrl }}
                  style={styles.productImage}
                  contentFit="cover"
                  transition={300}
                />
              ) : (
                <View style={styles.productIconCircle}>
                  <MaterialIcons name="eco" size={ms(36)} color={White} />
                </View>
              )}
            </View>
            <Text style={styles.productName}>{displayName}</Text>
            {supplierLocation ? (
              <Text style={styles.supplierText}>{supplierLocation}</Text>
            ) : null}
            {product.productId ? (
              <View style={styles.dppIdPill}>
                <MaterialIcons name="fingerprint" size={ms(12)} color="rgba(255,255,255,0.7)" />
                <Text style={styles.dppIdText}>
                  {product.productId.startsWith('DPP-')
                    ? product.productId
                    : `DPP-${product.productId}`}
                </Text>
              </View>
            ) : null}
            <Text style={styles.scanDate}>{formatScanDate(product.scannedAt)}</Text>
          </View>
        </LinearGradient>

        {/* Description Card */}
        {product.productDescription ? (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="info-outline" size={ms(16)} color={SageAccent} />
              <Text style={styles.sectionTitle}>About This Product</Text>
            </View>
            <View style={styles.divider} />
            {product.productDescription.includes('\u2022') ? (
              product.productDescription.split('\u2022').map((item, idx) => {
                const trimmed = item.trim();
                if (!trimmed) return null;
                return (
                  <View key={idx} style={styles.descBulletRow}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.descBulletText}>{trimmed}</Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.productDesc}>
                {product.productDescription.replace(/\\n/g, '\n').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')}
              </Text>
            )}
          </View>
        ) : null}

        {/* CO2 Footprint Section */}
        {co2Boxes.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="eco" size={ms(16)} color={SageAccent} />
              <Text style={styles.sectionTitle}>Carbon Footprint</Text>
              {product.co2Total ? (
                <View style={styles.co2TotalPill}>
                  <Text style={styles.co2TotalText}>{product.co2Total}</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.divider} />
            <View style={styles.co2Grid}>
              {co2Boxes.map((box, i) => {
                const color = co2Colors[i % co2Colors.length];
                return (
                  <View key={i} style={styles.co2Card}>
                    <View style={[styles.co2Accent, { backgroundColor: color }]} />
                    <Text style={[styles.co2Value, { color }]}>{box.value}</Text>
                    <Text style={styles.co2Unit}>Kg CO{'\u2082'}</Text>
                    <Text style={styles.co2Label} numberOfLines={2}>{box.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsContainer}>
          <View style={styles.quickActionsGrid}>
<TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push(`/documents?productId=${product.id}`)}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(193,123,58,0.10)' }]}>
                <MaterialIcons name="folder-open" size={ms(16)} color="#C17B3A" />
              </View>
              <Text style={styles.quickActionLabel}>Documents</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => {
                router.push(
                  `/product-chat?productId=${product.id}&productName=${encodeURIComponent(displayName)}&productUrl=${encodeURIComponent(product.rawValue)}`
                );
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(90,140,90,0.10)' }]}>
                <MaterialIcons name="support-agent" size={ms(16)} color={SageAccent} />
              </View>
              <Text style={styles.quickActionLabel}>Get Support</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction} onPress={handleShare} activeOpacity={0.7}>
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(123,107,168,0.10)' }]}>
                <MaterialIcons name="share" size={ms(16)} color="#7B6BA8" />
              </View>
              <Text style={styles.quickActionLabel}>Share DPP</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CreamBg,
  },
  scrollView: {
    flex: 1,
  },

  // --- Hero gradient section ---
  heroGradient: {
    paddingBottom: vs(28),
    borderBottomLeftRadius: s(28),
    borderBottomRightRadius: s(28),
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(4),
    paddingTop: vs(6),
    paddingBottom: vs(4),
  },
  backBtn: {
    padding: s(12),
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: ms(17),
    fontWeight: '700',
    color: White,
    letterSpacing: -0.2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: s(20),
    paddingHorizontal: s(10),
    paddingVertical: vs(5),
    marginRight: s(12),
    gap: s(4),
  },
  verifiedText: {
    fontSize: ms(11),
    fontWeight: '700',
    color: White,
  },
  heroContent: {
    alignItems: 'center',
    paddingTop: vs(4),
  },
  imageWrapper: {
    padding: s(4),
    borderRadius: s(52),
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: vs(12),
  },
  productImage: {
    width: s(88),
    height: s(88),
    borderRadius: s(44),
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  productIconCircle: {
    width: s(88),
    height: s(88),
    borderRadius: s(44),
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  productName: {
    fontSize: ms(21),
    fontWeight: '800',
    color: White,
    textAlign: 'center',
    paddingHorizontal: s(24),
    letterSpacing: -0.3,
  },
  supplierText: {
    fontSize: ms(13),
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginTop: vs(4),
    fontWeight: '500',
  },
  dppIdPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: s(16),
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
    marginTop: vs(8),
    gap: s(4),
  },
  dppIdText: {
    fontSize: ms(11),
    color: 'rgba(255,255,255,0.7)',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '500',
  },
  scanDate: {
    fontSize: ms(11),
    color: 'rgba(255,255,255,0.5)',
    marginTop: vs(6),
    fontWeight: '500',
  },

  // --- Quick Actions ---
  quickActionsContainer: {
    marginTop: vs(10),
    paddingHorizontal: s(16),
    marginBottom: vs(4),
  },
  quickActionsGrid: {
    flexDirection: 'row',
    backgroundColor: White,
    borderRadius: s(12),
    paddingVertical: vs(8),
    paddingHorizontal: s(6),
    shadowColor: '#2C3E2D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    gap: vs(3),
  },
  quickActionIcon: {
    width: s(34),
    height: s(34),
    borderRadius: s(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    fontSize: ms(10),
    fontWeight: '600',
    color: TextDark,
    textAlign: 'center',
  },

  // --- Section Cards ---
  sectionCard: {
    backgroundColor: White,
    borderRadius: s(16),
    marginHorizontal: s(16),
    marginTop: vs(14),
    padding: s(16),
    shadowColor: '#2C3E2D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
  },
  sectionTitle: {
    flex: 1,
    fontSize: ms(14),
    fontWeight: '700',
    color: TextDark,
    letterSpacing: -0.1,
  },
  divider: {
    height: 1,
    backgroundColor: Border,
    marginVertical: vs(10),
  },

  // --- Description ---
  descBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: vs(6),
  },
  bulletDot: {
    width: s(6),
    height: s(6),
    borderRadius: s(3),
    backgroundColor: SageAccent,
    marginTop: vs(6),
    marginRight: s(10),
  },
  descBulletText: {
    flex: 1,
    fontSize: ms(13),
    color: TextGray,
    lineHeight: ms(19),
  },
  productDesc: {
    fontSize: ms(13),
    color: TextGray,
    lineHeight: ms(19),
  },

  // --- CO2 Section ---
  co2TotalPill: {
    backgroundColor: 'rgba(90,140,90,0.10)',
    borderRadius: s(12),
    paddingHorizontal: s(8),
    paddingVertical: vs(3),
  },
  co2TotalText: {
    fontSize: ms(11),
    fontWeight: '700',
    color: SageAccent,
  },
  co2Grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(8),
  },
  co2Card: {
    flexBasis: '30%',
    flexGrow: 1,
    backgroundColor: CreamBg,
    borderRadius: s(12),
    paddingVertical: vs(12),
    paddingHorizontal: s(8),
    alignItems: 'center',
    overflow: 'hidden',
  },
  co2Accent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: s(3),
    borderTopLeftRadius: s(12),
    borderTopRightRadius: s(12),
  },
  co2Value: {
    fontSize: ms(18),
    fontWeight: '800',
    marginTop: vs(2),
  },
  co2Unit: {
    fontSize: ms(9),
    fontWeight: '600',
    color: TextGray,
    marginTop: vs(1),
  },
  co2Label: {
    fontSize: ms(10),
    fontWeight: '600',
    color: TextDark,
    marginTop: vs(4),
    textAlign: 'center',
  },

});
