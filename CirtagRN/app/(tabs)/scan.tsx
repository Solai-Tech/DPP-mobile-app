import React, { useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
} from 'react-native';
import { CameraView, BarcodeScanningResult } from 'expo-camera';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import ScanFrame from '../../src/components/ScanFrame';
import LoadingOverlay from '../../src/components/LoadingOverlay';
import { useCamera } from '../../src/hooks/useCamera';
import { useProducts } from '../../src/hooks/useProducts';
import { ScannedProduct } from '../../src/types/ScannedProduct';
import { getBarcodeFormatName, inferBarcodeType } from '../../src/utils/barcodeHelpers';

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
  const { products, isLoading, scanAndSaveProduct } = useProducts();
  const canScan = useRef(true);
  const [scanType, setScanType] = useState<ScanType>('qr');

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

  const getDisplayName = (item: ScannedProduct): string => {
    if (item.productName) return item.productName;
    // Extract a friendly name from URL
    try {
      const url = new URL(item.rawValue);
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length > 0) {
        const last = parts[parts.length - 1];
        // If it's a number, show as "Product #123"
        if (/^\d+$/.test(last)) return `Product #${last}`;
        // Otherwise, clean up the slug
        return last.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      }
      return url.hostname;
    } catch {
      return item.displayValue || item.rawValue;
    }
  };

  const handleProductPress = (item: ScannedProduct) => {
    const isUrl = item.rawValue.startsWith('http://') || item.rawValue.startsWith('https://');
    if (isUrl) {
      // Open the product URL in browser
      Linking.openURL(item.rawValue);
    } else {
      // For non-URL scans, go to internal detail page
      router.push(`/product/${item.id}`);
    }
  };

  const renderProductCard = (item: ScannedProduct) => {
    const name = getDisplayName(item);
    const co2Match = item.co2Total?.match(/([\d.]+)/);
    const co2Val = co2Match ? co2Match[1] : null;
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
            <MaterialIcons name="recycling" size={22} color={GreenAccent} />
          </View>
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>
            {name}
          </Text>
          {item.productId ? (
            <Text style={styles.productDppId} numberOfLines={1}>
              {item.productId.startsWith('DPP-')
                ? item.productId
                : `DPP-${item.productId}`}
            </Text>
          ) : null}
          {supplierInfo ? (
            <Text style={styles.productMeta} numberOfLines={1}>
              {supplierInfo}
              {co2Val ? (
                <Text style={styles.productCo2Label}> {'\u00B7'} Low CO{'\u2082'}</Text>
              ) : null}
            </Text>
          ) : null}
        </View>
        {co2Val ? (
          <View style={styles.co2Col}>
            <Text style={styles.co2Value}>{co2Val}t</Text>
            <Text style={styles.co2Label}>CO{'\u2082'}</Text>
          </View>
        ) : null}
        <MaterialIcons name="chevron-right" size={20} color={TextMutedLight} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Page Header */}
        <View style={[styles.pageHeader, { paddingTop: insets.top + 12 }]}>
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
                size={28}
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
                size={28}
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
          </View>
        ) : (
          <View style={styles.permissionCard}>
            <MaterialIcons name="camera-alt" size={48} color={GreenAccent} />
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
            <MaterialIcons name="inventory-2" size={36} color={TextMutedLight} />
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
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: TextBlack,
  },
  pageSubtitle: {
    fontSize: 14,
    color: TextGray,
    marginTop: 4,
  },
  scanCardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  scanCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  scanCardIconActive: {
    backgroundColor: GreenAccent,
  },
  scanCardIconInactive: {
    backgroundColor: '#F0F2F5',
  },
  scanCardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  scanCardTitleActive: {
    color: GreenAccent,
  },
  scanCardTitleInactive: {
    color: TextGray,
  },
  scanCardSub: {
    fontSize: 11,
    color: TextMutedLight,
    marginTop: 2,
  },
  cameraContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    height: 280,
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
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 12,
    fontWeight: '500',
  },
  permissionCard: {
    backgroundColor: White,
    borderRadius: 16,
    marginHorizontal: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  permTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TextBlack,
    marginTop: 16,
  },
  permSubtitle: {
    fontSize: 13,
    color: TextGray,
    textAlign: 'center',
    marginTop: 6,
  },
  permButton: {
    backgroundColor: GreenAccent,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 20,
  },
  permButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  savedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  savedTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: TextBlack,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '700',
    color: GreenAccent,
  },
  emptyCard: {
    backgroundColor: White,
    borderRadius: 16,
    padding: 32,
    marginHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    color: TextGray,
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 12,
    color: TextMutedLight,
    marginTop: 4,
    textAlign: 'center',
  },
  productsList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: White,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  productImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#F0F2F5',
  },
  productIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: TextBlack,
  },
  productDppId: {
    fontSize: 12,
    color: TextGray,
    fontWeight: '500',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  productMeta: {
    fontSize: 12,
    color: TextMutedLight,
    marginTop: 2,
  },
  productCo2Label: {
    color: GreenAccent,
    fontWeight: '600',
  },
  co2Col: {
    alignItems: 'flex-end',
    marginRight: 4,
  },
  co2Value: {
    fontSize: 18,
    fontWeight: '800',
    color: TextBlack,
  },
  co2Label: {
    fontSize: 11,
    color: TextGray,
  },
});
