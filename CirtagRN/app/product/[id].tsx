import React, { useEffect, useState, useRef } from 'react';
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
import PassportStatCard from '../../src/components/PassportStatCard';
import LifecycleTimeline from '../../src/components/LifecycleTimeline';
import EmissionBreakdown from '../../src/components/EmissionBreakdown';
import ActionButton from '../../src/components/ActionButton';
import { ScannedProduct } from '../../src/types/ScannedProduct';
import { useProducts } from '../../src/hooks/useProducts';
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

  const certs = product.certifications
    ? product.certifications.split(',').map((c) => c.trim())
    : [];
  const hasVerified = certs.some((c) => c.includes('Verified'));
  const filteredCerts = certs.filter(
    (c) => !c.includes('Verified')
  );

  const co2Items = product.co2Details
    ? product.co2Details
        .split(',')
        .map((item) => {
          const parts = item.split(':');
          return parts.length === 2
            ? { label: parts[0].trim(), value: parts[1].trim() }
            : null;
        })
        .filter(Boolean) as { label: string; value: string }[]
    : [];

  const co2Numeric = product.co2Total?.match(/([\d.]+)/)?.[1] || '0';
  const co2Status = parseFloat(co2Numeric) < 5 ? 'Low' : 'High';

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
          <Text style={styles.productDesc}>{product.productDescription}</Text>
        ) : null}

        <View style={{ height: vs(20) }} />

        {/* Stat Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconCircle}>
              <MaterialIcons name="eco" size={ms(18)} color={GreenAccent} />
            </View>
            <Text style={styles.statLabel}>Total CO{'\u2082'}</Text>
            <Text style={styles.statValue}>{co2Numeric}</Text>
            <Text style={styles.statUnit}>Kg CO{'\u2082'}</Text>
            <View style={[
              styles.statBadge,
              { backgroundColor: co2Status === 'Low' ? GreenTint : 'rgba(255,152,0,0.1)' },
            ]}>
              <Text style={[
                styles.statBadgeText,
                { color: co2Status === 'Low' ? GreenAccent : '#FF9800' },
              ]}>
                {co2Status}
              </Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconCircle}>
              <MaterialIcons name="recycling" size={ms(18)} color={GreenAccent} />
            </View>
            <Text style={styles.statLabel}>Recyclability</Text>
            <Text style={styles.statValue}>94%</Text>
            <View style={[styles.statBadge, { backgroundColor: GreenTint }]}>
              <Text style={[styles.statBadgeText, { color: GreenAccent }]}>High</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconCircle}>
              <MaterialIcons name="inventory-2" size={ms(18)} color={GreenAccent} />
            </View>
            <Text style={styles.statLabel}>Batch</Text>
            <Text style={styles.statValue}>
              {product.skuId ? `#${product.skuId}` : 'N/A'}
            </Text>
            <View style={[styles.statBadge, { backgroundColor: GreenTint }]}>
              <Text style={[styles.statBadgeText, { color: GreenAccent }]}>Active</Text>
            </View>
          </View>
        </View>

        <View style={{ height: vs(20) }} />

        {/* Lifecycle Timeline */}
        <LifecycleTimeline />

        <View style={{ height: vs(20) }} />

        {/* Emission Breakdown */}
        {product.co2Details ? (
          <>
            <EmissionBreakdown co2Details={product.co2Details} />
            <View style={{ height: vs(20) }} />
          </>
        ) : null}

        {/* Specifications Card */}
        <View style={styles.specsCard}>
          <Text style={styles.cardTitle}>Specifications</Text>
          <SpecItem label="Supplier" value={product.supplier || 'N/A'} />
          <SpecItem label="Price" value={product.price || 'N/A'} />
          <SpecItem label="Weight" value={product.weight || 'N/A'} />
          {product.skuId ? <SpecItem label="SKU ID" value={product.skuId} /> : null}
        </View>

        <View style={{ height: vs(16) }} />

        {/* Certifications */}
        {filteredCerts.length > 0 && (
          <>
            <View style={styles.certsCard}>
              <Text style={styles.cardTitle}>Certifications</Text>
              {filteredCerts.map((cert) => (
                <View key={cert} style={styles.certRow}>
                  <MaterialIcons name="check-circle" size={ms(16)} color={GreenAccent} />
                  <Text style={styles.certText}>{cert}</Text>
                </View>
              ))}
            </View>
            <View style={{ height: vs(16) }} />
          </>
        )}

        {/* Download PDF */}
        <TouchableOpacity
          style={[styles.datasheetCard, downloading && { opacity: 0.7 }]}
          onPress={handleDownloadPdf}
          disabled={downloading}
        >
          <View style={styles.datasheetLeft}>
            <View style={styles.datasheetIcon}>
              {downloading ? (
                <ActivityIndicator size="small" color={GreenAccent} />
              ) : (
                <MaterialIcons name="description" size={ms(20)} color={GreenAccent} />
              )}
            </View>
            <View>
              <Text style={styles.datasheetTitle}>Product Datasheet</Text>
              <Text style={styles.datasheetSub}>{downloading ? 'Downloading...' : 'Download PDF'}</Text>
            </View>
          </View>
          {downloading ? (
            <ActivityIndicator size="small" color={GreenAccent} />
          ) : (
            <MaterialIcons name="download" size={ms(20)} color={GreenAccent} />
          )}
        </TouchableOpacity>
        <View style={{ height: vs(16) }} />

        {/* Action Buttons - 3 buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtnOutline}
            onPress={() => router.push('/support-chat')}
            activeOpacity={0.7}
          >
            <MaterialIcons name="support-agent" size={ms(16)} color={GreenAccent} />
            <Text style={styles.actionBtnOutlineText}>Get Support</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnOutline}
            onPress={() => router.push('/(tabs)/tickets?tab=tickets&action=raise')}
            activeOpacity={0.7}
          >
            <MaterialIcons name="confirmation-number" size={ms(16)} color={GreenAccent} />
            <Text style={styles.actionBtnOutlineText}>Raise Ticket</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnFilled}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <MaterialIcons name="share" size={ms(16)} color="#FFFFFF" />
            <Text style={styles.actionBtnFilledText}>Share DPP</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: vs(16) }} />

        {/* View original product link */}
        <TouchableOpacity
          style={styles.linkCard}
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
                'Original Product Page'
              )}&productData=${encodeURIComponent(pData)}`
            );
          }}
        >
          <View style={styles.linkLeft}>
            <MaterialIcons name="open-in-new" size={ms(18)} color={GreenAccent} />
            <Text style={styles.linkText}>View Original Product Page</Text>
          </View>
          <MaterialIcons name="chevron-right" size={ms(18)} color={TextMutedLight} />
        </TouchableOpacity>

        <View style={{ height: vs(16) }} />

        {/* Scan Info */}
        <View style={styles.scanInfo}>
          <MaterialIcons name="check-circle" size={ms(14)} color={GreenAccent} />
          <Text style={styles.scanInfoText}>
            Scanned {formatScanDate(product.scannedAt)}
          </Text>
        </View>
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
    paddingVertical: vs(16),
  },
  productImage: {
    width: s(100),
    height: s(100),
    borderRadius: s(50),
  },
  productIconCircle: {
    width: s(80),
    height: s(80),
    borderRadius: s(40),
    backgroundColor: GreenTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productName: {
    fontSize: ms(22),
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
  productDesc: {
    fontSize: ms(13),
    color: TextGray,
    textAlign: 'center',
    paddingHorizontal: s(32),
    marginTop: vs(6),
    lineHeight: ms(18),
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: s(20),
    gap: s(10),
  },
  statCard: {
    flex: 1,
    backgroundColor: White,
    borderRadius: s(16),
    padding: s(12),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconCircle: {
    width: s(32),
    height: s(32),
    borderRadius: s(16),
    backgroundColor: GreenTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(6),
  },
  statLabel: {
    fontSize: ms(10),
    color: TextGray,
    textAlign: 'center',
    marginBottom: vs(2),
  },
  statValue: {
    fontSize: ms(18),
    fontWeight: '800',
    color: TextBlack,
  },
  statUnit: {
    fontSize: ms(10),
    color: GreenAccent,
    fontWeight: '600',
  },
  statBadge: {
    borderRadius: s(8),
    paddingHorizontal: s(8),
    paddingVertical: vs(2),
    marginTop: vs(4),
  },
  statBadgeText: {
    fontSize: ms(10),
    fontWeight: '700',
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
  certsCard: {
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
  certRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    paddingVertical: vs(6),
  },
  certText: {
    fontSize: ms(13),
    fontWeight: '600',
    color: TextBlack,
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(12),
    paddingVertical: vs(12),
    paddingHorizontal: s(8),
    gap: s(4),
    backgroundColor: GreenAccent,
  },
  actionBtnFilledText: {
    fontSize: ms(12),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  linkCard: {
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
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
  },
  linkText: {
    fontSize: ms(13),
    fontWeight: '600',
    color: TextBlack,
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
