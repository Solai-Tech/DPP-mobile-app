import React, { useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { CameraView, BarcodeScanningResult } from 'expo-camera';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import ScanFrame from '../../src/components/ScanFrame';
import LoadingOverlay from '../../src/components/LoadingOverlay';
import { useCamera } from '../../src/hooks/useCamera';
import { useProducts } from '../../src/hooks/useProducts';
import { ScannedProduct } from '../../src/types/ScannedProduct';
import { getBarcodeFormatName, inferBarcodeType } from '../../src/utils/barcodeHelpers';
import { s, vs, ms } from '../../src/utils/scale';

type ScanType = 'qr' | 'barcode';

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
const CameraBg = '#0D2818';

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { hasPermission, requestPermission } = useCamera();
  const { products, isLoading, scanAndSaveProduct, deleteProduct } = useProducts();
  const canScan = useRef(true);
  const [scanType, setScanType] = useState<ScanType>('qr');
  const [isScanning, setIsScanning] = useState(false);

  const handleBarCodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      if (!canScan.current || isLoading) return;
      canScan.current = false;

      const rawValue = result.data;
      const product = {
        rawValue,
        displayValue: rawValue,
        format: getBarcodeFormatName(result.type),
        type: inferBarcodeType(rawValue),
        productName: '',
        productDescription: '',
        imageUrl: '',
        productId: '',
        price: '',
        supplier: '',
        skuId: '',
        weight: '',
        co2Total: '',
        co2Details: '',
        certifications: '',
        datasheetUrl: '',
        scannedAt: Date.now(),
      };

      scanAndSaveProduct(product, (savedId) => {
        router.push(`/product/${savedId}`);
        setTimeout(() => {
          canScan.current = true;
        }, 1000);
      });
    },
    [isLoading, scanAndSaveProduct, router]
  );

  useFocusEffect(
    useCallback(() => {
      return () => {
        setIsScanning(false);
      };
    }, [])
  );

  const getDisplayName = (item: ScannedProduct): string => {
    if (item.productName) return item.productName;

    const isUrl = item.rawValue.startsWith('http://') || item.rawValue.startsWith('https://');
    const isNumeric = /^\d{6,}$/.test(item.displayValue || item.rawValue);

    // Try to extract name from image URL filename
    if (item.imageUrl) {
      try {
        const imgParts = item.imageUrl.split('/');
        const filename = imgParts[imgParts.length - 1];
        const cleanName = filename
          .replace(/\.\w+$/, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase())
          .trim();
        if (cleanName.length > 2 && !/^\d+$/.test(cleanName)) {
          return cleanName;
        }
      } catch {
        // ignore
      }
    }

    // Try description
    if (item.productDescription) {
      const desc = item.productDescription.trim();
      if (desc.length > 0 && desc.length < 60) return desc;
      if (desc.length >= 60) return desc.substring(0, 57) + '...';
    }

    // Supplier-based fallback (avoid showing IDs/URLs)
    if (item.supplier) return `${item.supplier} Product`;
    if (!isUrl && !isNumeric && item.displayValue) return item.displayValue;

    return 'Scanned Product';
  };

  const handleProductPress = (item: ScannedProduct) => {
    // Always open inside the app
    router.push(`/product/${item.id}`);
  };

  const renderProductCard = (item: ScannedProduct) => {
    const name = getDisplayName(item);
    const supplierInfo = [
      item.supplier,
      item.skuId ? `Batch #${item.skuId}` : null,
    ]
      .filter(Boolean)
      .join(' \u00B7 ');
    const hasImage = !!item.imageUrl;

    const iconColors = ['#E8F5E9', '#E3F2FD', '#FFF3E0', '#F3E5F5', '#E0F7FA'];
    const colorIndex = item.id % iconColors.length;
    const iconBg = iconColors[colorIndex];

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.productCard}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.7}
      >
        {hasImage ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.productImage}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.productIcon, { backgroundColor: iconBg }]}>
            <MaterialIcons name="recycling" size={ms(22)} color={GreenAccent} />
          </View>
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>
            {name}
          </Text>
          {supplierInfo ? (
            <Text style={styles.productMeta} numberOfLines={1}>
              {supplierInfo}
            </Text>
          ) : null}
        </View>
        <View style={styles.productActions}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() =>
              Alert.alert(
                'Delete product?',
                'This will remove it from your history.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteProduct(item.id),
                  },
                ]
              )
            }
            hitSlop={{ top: s(8), bottom: s(8), left: s(8), right: s(8) }}
          >
            <MaterialIcons name="delete-outline" size={ms(20)} color={TextMutedLight} />
          </TouchableOpacity>
          <MaterialIcons name="chevron-right" size={ms(20)} color={TextMutedLight} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: vs(20) }}
      >
        {/* Page Header */}
        <View style={[styles.pageHeader, { paddingTop: insets.top + vs(12) }]}>
          <Text style={styles.pageTitle}>Scan Product</Text>
          <Text style={styles.pageSubtitle}>
            Choose scan type or tap a saved product
          </Text>
        </View>

        {/* Scan Type Cards */}
        <View style={styles.scanCardsRow}>
          <TouchableOpacity
            style={[
              styles.scanCard,
              scanType === 'qr' ? styles.scanCardActive : styles.scanCardInactive,
            ]}
            onPress={() => setScanType('qr')}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.scanCardIcon,
                scanType === 'qr'
                  ? styles.scanCardIconActive
                  : styles.scanCardIconInactive,
              ]}
            >
              <MaterialIcons
                name="photo-camera"
                size={ms(28)}
                color={scanType === 'qr' ? '#FFFFFF' : TextMutedLight}
              />
            </View>
            <Text
              style={[
                styles.scanCardTitle,
                scanType === 'qr'
                  ? styles.scanCardTitleActive
                  : styles.scanCardTitleInactive,
              ]}
            >
              Scan QR Code
            </Text>
            <Text style={styles.scanCardSub}>Point at QR label</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.scanCard,
              scanType === 'barcode'
                ? styles.scanCardActive
                : styles.scanCardInactive,
            ]}
            onPress={() => setScanType('barcode')}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.scanCardIcon,
                scanType === 'barcode'
                  ? styles.scanCardIconActive
                  : styles.scanCardIconInactive,
              ]}
            >
              <MaterialIcons
                name="view-week"
                size={ms(28)}
                color={scanType === 'barcode' ? '#FFFFFF' : TextMutedLight}
              />
            </View>
            <Text
              style={[
                styles.scanCardTitle,
                scanType === 'barcode'
                  ? styles.scanCardTitleActive
                  : styles.scanCardTitleInactive,
              ]}
            >
              Scan Barcode
            </Text>
            <Text style={styles.scanCardSub}>Point at barcode</Text>
          </TouchableOpacity>
        </View>

        {/* Camera View — rendered directly, NOT inside FlatList */}
        {hasPermission ? (
          <View style={styles.cameraContainer}>
            {isScanning ? (
              <>
                <CameraView
                  style={styles.camera}
                  facing="back"
                  barcodeScannerSettings={{
                    barcodeTypes: [
                      'qr',
                      'aztec',
                      'codabar',
                      'code39',
                      'code93',
                      'code128',
                      'datamatrix',
                      'ean8',
                      'ean13',
                      'itf14',
                      'pdf417',
                      'upc_a',
                      'upc_e',
                    ],
                  }}
                  onBarcodeScanned={isLoading ? undefined : handleBarCodeScanned}
                />
                <View style={styles.frameOverlay} pointerEvents="none">
                  <ScanFrame />
                  <Text style={styles.alignText}>Align within frame to scan</Text>
                </View>
                {isLoading && <LoadingOverlay />}
              </>
            ) : (
              <View style={styles.scanPlaceholder}>
                <MaterialIcons name="qr-code-scanner" size={ms(42)} color={GreenAccent} />
                <Text style={styles.scanPlaceholderTitle}>Ready to Scan</Text>
                <Text style={styles.scanPlaceholderSub}>
                  Tap below to start the camera and scan a product
                </Text>
                <TouchableOpacity
                  style={styles.scanStartBtn}
                  onPress={() => setIsScanning(true)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.scanStartText}>Start Scan</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.permissionCard}>
            <MaterialIcons name="camera-alt" size={ms(48)} color={GreenAccent} />
            <Text style={styles.permTitle}>Camera Access Required</Text>
            <Text style={styles.permSubtitle}>
              CirTag needs camera access to scan QR codes
            </Text>
            <TouchableOpacity
              style={styles.permButton}
              onPress={requestPermission}
            >
              <Text style={styles.permButtonText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Saved Products */}
        <View style={styles.savedHeader}>
          <Text style={styles.savedTitle}>Saved Products</Text>
          {products.length > 0 && (
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          )}
        </View>

        {products.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialIcons name="inventory-2" size={ms(36)} color={TextMutedLight} />
            <Text style={styles.emptyText}>No Scans Yet</Text>
            <Text style={styles.emptySubtext}>
              Scan a QR code to see your product history here
            </Text>
          </View>
        ) : (
          <View style={styles.productsList}>
            {products.map((item) => renderProductCard(item))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LightBg,
  },
  pageHeader: {
    paddingHorizontal: s(20),
    marginBottom: vs(16),
  },
  pageTitle: {
    fontSize: ms(26),
    fontWeight: '800',
    color: TextBlack,
  },
  pageSubtitle: {
    fontSize: ms(14),
    color: TextGray,
    marginTop: vs(4),
  },
  scanCardsRow: {
    flexDirection: 'row',
    paddingHorizontal: s(20),
    gap: s(12),
    marginBottom: vs(16),
  },
  scanCard: {
    flex: 1,
    borderRadius: s(16),
    padding: s(16),
    alignItems: 'center',
    borderWidth: 1.5,
  },
  scanCardActive: {
    backgroundColor: GreenTint,
    borderColor: BrightGreen,
  },
  scanCardInactive: {
    backgroundColor: White,
    borderColor: Border,
  },
  scanCardIcon: {
    width: s(48),
    height: s(48),
    borderRadius: s(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(8),
  },
  scanCardIconActive: {
    backgroundColor: GreenAccent,
  },
  scanCardIconInactive: {
    backgroundColor: '#F0F2F5',
  },
  scanCardTitle: {
    fontSize: ms(14),
    fontWeight: '700',
  },
  scanCardTitleActive: {
    color: GreenAccent,
  },
  scanCardTitleInactive: {
    color: TextGray,
  },
  scanCardSub: {
    fontSize: ms(11),
    color: TextMutedLight,
    marginTop: vs(2),
  },
  cameraContainer: {
    marginHorizontal: s(20),
    borderRadius: s(16),
    overflow: 'hidden',
    height: vs(280),
    backgroundColor: CameraBg,
    borderWidth: 2,
    borderColor: BrightGreen,
  },
  camera: {
    flex: 1,
  },
  frameOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alignText: {
    fontSize: ms(13),
    color: 'rgba(255,255,255,0.5)',
    marginTop: vs(12),
    fontWeight: '500',
  },
  scanPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: s(20),
  },
  scanPlaceholderTitle: {
    fontSize: ms(16),
    fontWeight: '700',
    color: TextBlack,
    marginTop: vs(12),
  },
  scanPlaceholderSub: {
    fontSize: ms(12),
    color: TextGray,
    marginTop: vs(6),
    textAlign: 'center',
  },
  scanStartBtn: {
    marginTop: vs(14),
    backgroundColor: GreenAccent,
    paddingHorizontal: s(18),
    paddingVertical: vs(10),
    borderRadius: s(12),
  },
  scanStartText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: ms(12),
  },
  permissionCard: {
    backgroundColor: White,
    borderRadius: s(16),
    marginHorizontal: s(20),
    padding: s(32),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  permTitle: {
    fontSize: ms(16),
    fontWeight: '700',
    color: TextBlack,
    marginTop: vs(16),
  },
  permSubtitle: {
    fontSize: ms(13),
    color: TextGray,
    textAlign: 'center',
    marginTop: vs(6),
  },
  permButton: {
    backgroundColor: GreenAccent,
    borderRadius: s(12),
    paddingVertical: vs(12),
    paddingHorizontal: s(32),
    marginTop: vs(20),
  },
  permButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: ms(14),
  },
  savedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: s(20),
    marginTop: vs(24),
    marginBottom: vs(12),
  },
  savedTitle: {
    fontSize: ms(20),
    fontWeight: '800',
    color: TextBlack,
  },
  seeAll: {
    fontSize: ms(14),
    fontWeight: '700',
    color: GreenAccent,
  },
  emptyCard: {
    backgroundColor: White,
    borderRadius: s(16),
    padding: s(32),
    marginHorizontal: s(20),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyText: {
    fontSize: ms(15),
    fontWeight: '700',
    color: TextGray,
    marginTop: vs(10),
  },
  emptySubtext: {
    fontSize: ms(12),
    color: TextMutedLight,
    marginTop: vs(4),
    textAlign: 'center',
  },
  productsList: {
    paddingHorizontal: s(20),
    gap: s(10),
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: White,
    borderRadius: s(16),
    padding: s(14),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  productImage: {
    width: s(48),
    height: s(48),
    borderRadius: s(12),
    marginRight: s(12),
    backgroundColor: '#F0F2F5',
  },
  productIcon: {
    width: s(48),
    height: s(48),
    borderRadius: s(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(12),
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: ms(15),
    fontWeight: '700',
    color: TextBlack,
  },
  productMeta: {
    fontSize: ms(12),
    color: TextMutedLight,
    marginTop: vs(2),
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
  },
  deleteButton: {
    padding: s(4),
    borderRadius: s(8),
    backgroundColor: '#F5F6F8',
  },
});
