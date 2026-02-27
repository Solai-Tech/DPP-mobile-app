import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import VerifiedBadge from '../../src/components/VerifiedBadge';
import LifecycleTimeline from '../../src/components/LifecycleTimeline';
import ActionButton from '../../src/components/ActionButton';
import { ScannedProduct } from '../../src/types/ScannedProduct';
import { useProducts } from '../../src/hooks/useProducts';
import { fetchProductData } from '../../src/utils/productDataFetcher';
import * as dao from '../../src/database/scannedProductDao';
import { formatScanDate } from '../../src/utils/dateFormatter';
import { s, vs, ms } from '../../src/utils/scale';
import {
  Accent,
} from '../../src/theme/colors';

// Light theme colors
const LightBg = '#F5F7FA';
const White = '#FFFFFF';
const GreenAccent = '#1B7A3D';
const BrightGreen = '#00E676';
const GreenTint = 'rgba(0,230,118,0.08)';
const TextBlack = '#1A1A1A';
const TextGray = '#6B6B6B';
const TextMutedLight = '#999999';
const Border = '#E8ECF0';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getProductById } = useProducts();
  const [product, setProduct] = useState<ScannedProduct | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [pdfWebViewUrl, setPdfWebViewUrl] = useState('');
  useEffect(() => {
    if (id) {
      getProductById(Number(id)).then((p) => setProduct(p));
    }
  }, [id, getProductById]);

  // Re-fetch CO2 details if missing/incomplete
  useEffect(() => {
    if (!product || !product.rawValue.startsWith('http')) return;
    if (product.co2Details && product.co2Details.split(',').length >= 2) return;
    let cancelled = false;
    fetchProductData(product.rawValue).then((data) => {
      if (cancelled) return;
      if (data.co2Details && data.co2Details.split(',').length >= 2) {
        dao.updateProductCO2(product.id, data.co2Total, data.co2Details);
        setProduct((prev) => prev ? { ...prev, co2Total: data.co2Total, co2Details: data.co2Details } : prev);
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

  // Clean product name: remove "R_" prefix and replace underscores
  displayName = displayName.replace(/^R_/, '').replace(/_/g, ' ').trim();

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
    // For PDF URLs, wrap with Google Docs viewer so Android WebView can render them
    let viewUrl = safeUrl;
    if (/\.pdf(\?|$)/i.test(safeUrl)) {
      viewUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(safeUrl)}`;
    }
    router.push(
      `/webview?url=${encodeURIComponent(viewUrl)}&title=${encodeURIComponent(title)}`
    );
  };

  const handleDownloadPdf = () => {
    if (!product) return;
    if (downloading) return;
    const url = product.datasheetUrl || product.rawValue;
    const safeUrl = normalizeUrl(url);
    if (!safeUrl) {
      Alert.alert('Unavailable', 'No document link available.');
      return;
    }
    setDownloading(true);
    setPdfWebViewUrl(safeUrl);
  };

  const onPdfMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'pdf_download' && data.url) {
        setPdfWebViewUrl('');
        const pdfUrl = data.url;
        const filename = `${(product.productName || 'datasheet').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        const dest = `${FileSystem.documentDirectory}${filename}`;
        FileSystem.downloadAsync(pdfUrl, dest).then(() => {
          setDownloading(false);
          Alert.alert('Downloaded!', 'PDF has been saved successfully.');
        }).catch(() => {
          setDownloading(false);
          Alert.alert('Download failed', 'Unable to download the PDF.');
        });
      }
      if (data.type === 'no_pdf_found') {
        setPdfWebViewUrl('');
        setDownloading(false);
        Alert.alert('No PDF found', 'No downloadable PDF found for this product.');
      }
    } catch {}
  };

  const pdfFinderJS = `
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
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'no_pdf_found' }));
    }
    setTimeout(findPdf, 2500);
    true;
  })();
  `;

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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={ms(22)} color={TextBlack} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Product Passport</Text>
          <Text style={styles.headerSubtitle}>Scanned just now</Text>
        </View>
        {hasVerified && (
          <View style={styles.verifiedBadge}>
            <MaterialIcons name="verified" size={ms(14)} color={BrightGreen} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: vs(32) + insets.bottom }}
      >
        {/* Product Icon */}
        <View style={styles.productIconSection}>
          {product.imageUrl ? (
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.productImage}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View style={styles.productIconCircle}>
              <MaterialIcons name="recycling" size={ms(40)} color={GreenAccent} />
            </View>
          )}
        </View>

        {/* Product Name */}
        <Text style={styles.productName}>{displayName}</Text>

        {/* Supplier / Location */}
        {supplierLocation ? (
          <Text style={styles.supplierText}>{supplierLocation}</Text>
        ) : null}

        {/* DPP ID */}
        {product.productId ? (
          <Text style={styles.dppId}>
            {product.productId.startsWith('DPP-')
              ? product.productId
              : `DPP-${product.productId}`}
          </Text>
        ) : null}

        {product.productDescription ? (
          <View style={styles.descContainer}>
            {product.productDescription.includes('•') ? (
              product.productDescription.split('•').map((item, idx) => {
                const trimmed = item.trim();
                if (!trimmed) return null;
                return (
                  <View key={idx} style={styles.descBulletRow}>
                    <Text style={styles.descBullet}>{'\u2022'}</Text>
                    <Text style={styles.descBulletText}>{trimmed}</Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.productDesc}>{product.productDescription}</Text>
            )}
          </View>
        ) : null}

        <View style={{ height: vs(10) }} />

        {/* Lifecycle Timeline */}
        <LifecycleTimeline />

        {/* CO2 Footprint Boxes */}
        {co2Boxes.length > 0 && (
          <View style={styles.co2Row}>
            {co2Boxes.map((box, i) => (
              <View key={i} style={styles.co2Box}>
                <Text style={styles.co2Value}>{box.value}</Text>
                <Text style={styles.co2Unit}>Kg CO{'\u2082'}</Text>
                <Text style={styles.co2Label} numberOfLines={1}>{box.label}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: vs(30) }} />

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtnOutline}
            onPress={() => router.push(`/raise-ticket?productId=${product.id}`)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="confirmation-number" size={ms(16)} color={GreenAccent} />
            <Text style={styles.actionBtnOutlineText}>Raise Ticket</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnFilled}
            onPress={() => {
              const pData = JSON.stringify({
                name: displayName,
                supplier: product.supplier || '',
                price: product.price || '',
                weight: product.weight || '',
                co2Total: product.co2Total || '',
                co2Details: product.co2Details || '',
                certifications: product.certifications || '',
                description: product.productDescription || '',
                productId: product.productId || '',
                skuId: product.skuId || '',
              });
              router.push(
                `/webview?url=${encodeURIComponent(product.rawValue)}&title=${encodeURIComponent(
                  displayName + ' Assistant'
                )}&openChat=true&productId=${product.id}&productData=${encodeURIComponent(pData)}`
              );
            }}
            activeOpacity={0.7}
          >
            <Image source={require('../../assets/get-support-icon.png')} style={{ width: ms(26), height: ms(26), position: 'absolute', left: s(12) }} />
            <Text style={styles.actionBtnFilledText}>Get Help</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: vs(8) }} />

        {/* Share DPP */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtnOutline}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <MaterialIcons name="share" size={ms(16)} color={GreenAccent} />
            <Text style={styles.actionBtnOutlineText}>Share DPP</Text>
          </TouchableOpacity>
          <View style={{ flex: 1.3 }} />
        </View>

        <View style={{ height: vs(16) }} />
      </ScrollView>

      {/* Hidden WebView for PDF download - no screen change */}
      {pdfWebViewUrl ? (
        <WebView
          source={{ uri: pdfWebViewUrl }}
          style={{ height: 0, width: 0, opacity: 0, position: 'absolute' }}
          javaScriptEnabled
          domStorageEnabled
          injectedJavaScript={pdfFinderJS}
          onMessage={onPdfMessage}
          onShouldStartLoadWithRequest={(request) => {
            if (/\.pdf(\?|#|$)/i.test(request.url)) {
              onPdfMessage({
                nativeEvent: { data: JSON.stringify({ type: 'pdf_download', url: request.url }) },
              });
              return false;
            }
            return true;
          }}
        />
      ) : null}

    </View>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={specStyles.row}>
      <Text style={specStyles.label}>{label}</Text>
      <Text style={specStyles.value}>{value}</Text>
    </View>
  );
}

const specStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: vs(8),
    borderBottomWidth: 1,
    borderBottomColor: Border,
  },
  label: {
    fontSize: ms(13),
    color: TextGray,
  },
  value: {
    fontSize: ms(13),
    fontWeight: '600',
    color: TextBlack,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LightBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(4),
    paddingVertical: vs(10),
  },
  backBtn: {
    padding: s(12),
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: ms(18),
    fontWeight: '700',
    color: TextBlack,
  },
  headerSubtitle: {
    fontSize: ms(11),
    color: TextGray,
    fontWeight: '500',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GreenTint,
    borderRadius: s(20),
    paddingHorizontal: s(10),
    paddingVertical: vs(5),
    marginRight: s(12),
    gap: s(4),
  },
  verifiedText: {
    fontSize: ms(12),
    fontWeight: '700',
    color: GreenAccent,
  },
  scrollView: {
    flex: 1,
  },
  productIconSection: {
    alignItems: 'center',
    paddingVertical: vs(8),
  },
  productImage: {
    width: s(80),
    height: s(80),
    borderRadius: s(40),
  },
  productIconCircle: {
    width: s(64),
    height: s(64),
    borderRadius: s(32),
    backgroundColor: GreenTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productName: {
    fontSize: ms(19),
    fontWeight: '700',
    color: TextBlack,
    textAlign: 'center',
    paddingHorizontal: s(20),
  },
  supplierText: {
    fontSize: ms(14),
    color: TextGray,
    textAlign: 'center',
    marginTop: vs(4),
  },
  dppId: {
    fontSize: ms(13),
    color: TextMutedLight,
    textAlign: 'center',
    fontFamily: 'monospace',
    marginTop: vs(4),
  },
  descContainer: {
    paddingHorizontal: s(20),
    marginTop: vs(6),
  },
  descBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: vs(4),
  },
  descBullet: {
    fontSize: ms(13),
    color: GreenAccent,
    fontWeight: '700',
    marginRight: s(8),
    lineHeight: ms(18),
  },
  descBulletText: {
    flex: 1,
    fontSize: ms(13),
    color: TextGray,
    lineHeight: ms(18),
  },
  productDesc: {
    fontSize: ms(13),
    color: TextGray,
    textAlign: 'left',
    paddingHorizontal: s(20),
    marginTop: vs(6),
    lineHeight: ms(18),
  },
  specsCard: {
    backgroundColor: White,
    borderRadius: s(16),
    padding: s(16),
    marginHorizontal: s(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: ms(14),
    fontWeight: '700',
    color: TextBlack,
    marginBottom: vs(8),
  },
  datasheetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: White,
    borderRadius: s(14),
    padding: s(14),
    marginHorizontal: s(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  datasheetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(12),
  },
  datasheetIcon: {
    width: s(40),
    height: s(40),
    borderRadius: s(10),
    backgroundColor: GreenTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  datasheetTitle: {
    fontSize: ms(14),
    fontWeight: '600',
    color: TextBlack,
  },
  datasheetSub: {
    fontSize: ms(12),
    color: TextGray,
  },
  co2Row: {
    flexDirection: 'row',
    paddingHorizontal: s(20),
    gap: s(8),
    marginTop: vs(12),
  },
  co2Box: {
    flex: 1,
    backgroundColor: White,
    borderRadius: s(12),
    paddingVertical: vs(10),
    paddingHorizontal: s(8),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  co2Value: {
    fontSize: ms(18),
    fontWeight: '800',
    color: GreenAccent,
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
    color: TextBlack,
    marginTop: vs(4),
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: s(20),
    gap: s(8),
  },
  actionBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(12),
    paddingVertical: vs(12),
    paddingHorizontal: s(8),
    gap: s(4),
    borderWidth: 1.5,
    borderColor: GreenAccent,
    backgroundColor: White,
  },
  actionBtnOutlineText: {
    fontSize: ms(12),
    fontWeight: '700',
    color: GreenAccent,
  },
  actionBtnFilled: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(12),
    paddingVertical: vs(14),
    paddingHorizontal: s(10),
    gap: s(4),
    backgroundColor: GreenAccent,
  },
  actionBtnFilledText: {
    fontSize: ms(12),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scanInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(6),
    padding: s(12),
  },
  scanInfoText: {
    fontSize: ms(12),
    color: TextGray,
    fontWeight: '500',
  },
});
