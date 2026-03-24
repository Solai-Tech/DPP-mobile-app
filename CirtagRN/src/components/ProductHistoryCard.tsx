import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScannedProduct } from '../types/ScannedProduct';
import { Accent, AccentDim, CardDark, TextPrimary, TextSecondary, TextMuted } from '../theme/colors';
import { typography } from '../theme/typography';
import { formatHistoryDate } from '../utils/dateFormatter';
import { s, vs, ms } from '../utils/scale';

interface Props {
  product: ScannedProduct;
  onPress: () => void;
  onDelete: () => void;
}

export default function ProductHistoryCard({ product, onPress, onDelete }: Props) {
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
          <MaterialIcons name="qr-code-scanner" size={ms(28)} color={Accent} />
        </LinearGradient>
      )}

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {displayName}
        </Text>

        {product.supplier ? (
          <Text style={styles.category} numberOfLines={1}>{product.supplier}</Text>
        ) : null}

        {product.material ? (
          <Text style={styles.material} numberOfLines={1}>{product.material}</Text>
        ) : null}

        <View style={styles.metaRow}>
          <MaterialIcons name="history" size={ms(12)} color={TextMuted} />
          <Text style={styles.date}>{formatHistoryDate(product.scannedAt)}</Text>
          {product.pricePerKg ? (
            <Text style={styles.pricePerKg}>{product.pricePerKg}</Text>
          ) : null}
          {product.price ? (
            <Text style={styles.price}>{product.price}</Text>
          ) : null}
        </View>
      </View>

      <TouchableOpacity onPress={onDelete} hitSlop={8} style={styles.deleteBtn}>
        <MaterialIcons name="delete-outline" size={ms(20)} color={TextMuted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CardDark,
    borderRadius: s(16),
    padding: s(14),
  },
  image: {
    width: s(56),
    height: s(56),
    borderRadius: s(12),
  },
  placeholder: {
    width: s(56),
    height: s(56),
    borderRadius: s(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: s(14),
  },
  name: {
    fontSize: ms(14),
    fontWeight: '700',
    color: TextPrimary,
  },
  productId: {
    ...typography.bodySmall,
    color: Accent,
    fontWeight: '500',
    marginTop: vs(3),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vs(2),
    gap: s(4),
  },
  date: {
    fontSize: ms(11),
    color: TextMuted,
  },
  category: {
    fontSize: ms(11),
    color: Accent,
    fontWeight: '600',
    marginTop: vs(2),
  },
  material: {
    fontSize: ms(11),
    color: TextSecondary,
    fontWeight: '500',
    marginTop: vs(1),
  },
  pricePerKg: {
    fontSize: ms(11),
    color: TextSecondary,
    fontWeight: '600',
    marginLeft: s(8),
  },
  price: {
    fontSize: ms(11),
    color: Accent,
    fontWeight: '600',
    marginLeft: s(8),
  },
  deleteBtn: {
    padding: s(8),
  },
});
