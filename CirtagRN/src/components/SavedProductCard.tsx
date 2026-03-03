import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScannedProduct } from '../types/ScannedProduct';
import { CardDark, Accent, AccentDim, TextPrimary, TextSecondary, TextMuted } from '../theme/colors';
import { formatHistoryDate } from '../utils/dateFormatter';
import { s, vs, ms } from '../utils/scale';

interface Props {
  product: ScannedProduct;
  onPress: () => void;
  onDelete: () => void;
}

export default function SavedProductCard({ product, onPress, onDelete }: Props) {
  // Extract product name from URL path
  let displayName = '';

  const rawUrl = product.rawValue || '';
  if (rawUrl.startsWith('http')) {
    try {
      const url = new URL(rawUrl);
      const pathParts = url.pathname.split('/').filter(Boolean);
      for (let i = pathParts.length - 1; i >= 0; i--) {
        const part = pathParts[i];
        if (part !== 'dpp' && part !== 'dppx' && part !== 'product' && part !== 'products') {
          displayName = decodeURIComponent(part).replace(/[-_]/g, ' ').trim();
          break;
        }
      }
    } catch {
      // URL parsing failed
    }
  }

  if (!displayName && product.productName) {
    displayName = product.productName;
  }

  if (!displayName || displayName.startsWith('http')) {
    displayName = 'Product';
  }

  // Clean product name: remove "R_" / "RN_" / "RN " prefix and replace underscores
  displayName = displayName.replace(/^RN?[_ ]/i, '').replace(/_/g, ' ').trim();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {product.imageUrl ? (
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
      ) : (
        <LinearGradient
          colors={[AccentDim, CardDark]}
          style={styles.placeholder}
        >
          <MaterialIcons name="qr-code-scanner" size={ms(24)} color={Accent} />
        </LinearGradient>
      )}

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {displayName}
        </Text>
        {product.productId ? (
          <Text style={styles.productId} numberOfLines={1}>
            ID: {product.productId}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          <MaterialIcons name="access-time" size={ms(11)} color={TextMuted} />
          <Text style={styles.date}>{formatHistoryDate(product.scannedAt)}</Text>
          {product.co2Total ? (
            <View style={styles.co2Badge}>
              <Text style={styles.co2Text}>{product.co2Total}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <TouchableOpacity onPress={onDelete} hitSlop={8} style={styles.deleteBtn}>
        <MaterialIcons name="delete-outline" size={ms(18)} color={TextMuted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CardDark,
    borderRadius: s(14),
    padding: s(12),
  },
  image: {
    width: s(50),
    height: s(50),
    borderRadius: s(10),
  },
  placeholder: {
    width: s(50),
    height: s(50),
    borderRadius: s(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: s(12),
  },
  name: {
    fontSize: ms(14),
    fontWeight: '700',
    color: TextPrimary,
  },
  productId: {
    fontSize: ms(12),
    color: Accent,
    fontWeight: '500',
    marginTop: vs(2),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vs(4),
    gap: s(4),
  },
  date: {
    fontSize: ms(11),
    color: TextMuted,
  },
  co2Badge: {
    backgroundColor: AccentDim,
    borderRadius: s(8),
    paddingHorizontal: s(6),
    paddingVertical: vs(2),
    marginLeft: s(6),
  },
  co2Text: {
    fontSize: ms(10),
    color: Accent,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: s(8),
  },
});
