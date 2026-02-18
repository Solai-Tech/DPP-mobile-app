import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScannedProduct } from '../types/ScannedProduct';
import { CardDark, Accent, AccentDim, TextPrimary, TextSecondary, TextMuted } from '../theme/colors';
import { formatHistoryDate } from '../utils/dateFormatter';

interface Props {
  product: ScannedProduct;
  onPress: () => void;
  onDelete: () => void;
}

export default function SavedProductCard({ product, onPress, onDelete }: Props) {
  const displayName =
    product.productName || product.displayValue || product.rawValue;

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
          <MaterialIcons name="qr-code-scanner" size={24} color={Accent} />
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
          <MaterialIcons name="access-time" size={11} color={TextMuted} />
          <Text style={styles.date}>{formatHistoryDate(product.scannedAt)}</Text>
          {product.co2Total ? (
            <View style={styles.co2Badge}>
              <Text style={styles.co2Text}>{product.co2Total}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <TouchableOpacity onPress={onDelete} hitSlop={8} style={styles.deleteBtn}>
        <MaterialIcons name="delete-outline" size={18} color={TextMuted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CardDark,
    borderRadius: 14,
    padding: 12,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  placeholder: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: TextPrimary,
  },
  productId: {
    fontSize: 12,
    color: Accent,
    fontWeight: '500',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  date: {
    fontSize: 11,
    color: TextMuted,
  },
  co2Badge: {
    backgroundColor: AccentDim,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  co2Text: {
    fontSize: 10,
    color: Accent,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 8,
  },
});
