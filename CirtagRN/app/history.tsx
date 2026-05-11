import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useProducts } from '../src/hooks/useProducts';
import { ScannedProduct } from '../src/types/ScannedProduct';
import { s, vs, ms } from '../src/utils/scale';

const CreamBg = '#F7F5F0';
const White = '#FFFFFF';
const TextDark = '#2C3E2D';
const TextGray = 'rgba(44,62,45,0.65)';
const TextMutedLight = 'rgba(44,62,45,0.4)';
const Border = 'rgba(44,62,45,0.1)';

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const sourceFilter: 'dpp' | 'value' = source === 'value' ? 'value' : 'dpp';
  const { products, refreshProducts, deleteProduct } = useProducts(sourceFilter);

  const handleDelete = (item: ScannedProduct) => {
    Alert.alert(
      'Delete product?',
      `Remove "${getDisplayName(item)}" from history?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteProduct(item.id) },
      ]
    );
  };

  const title = sourceFilter === 'value' ? 'Value Scanner Product History' : 'DPP Scanner Product History';

  useFocusEffect(
    React.useCallback(() => {
      refreshProducts();
    }, [refreshProducts])
  );

  const getDisplayName = (item: ScannedProduct): string => {
    if (item.productName) return item.productName;
    if (item.productDescription) {
      const desc = item.productDescription.trim();
      return desc.length < 60 ? desc : desc.substring(0, 57) + '...';
    }
    if (item.supplier) return `${item.supplier} Product`;
    return item.displayValue || 'Scanned Product';
  };

  const renderCard = (item: ScannedProduct) => {
    const name = getDisplayName(item);
    const meta = sourceFilter === 'value'
      ? [item.supplier, item.price, item.co2Total].filter(Boolean).join(' · ')
      : [item.supplier, item.skuId && !/^PCB-/i.test(item.skuId) ? `Batch #${item.skuId}` : null].filter(Boolean).join(' · ');

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.card}
        onPress={() => router.push(`/product/${item.id}`)}
        activeOpacity={0.85}
      >
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.thumb} contentFit="cover" />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]}>
            <MaterialIcons
              name={sourceFilter === 'value' ? 'developer-board' : 'qr-code'}
              size={ms(22)}
              color={TextMutedLight}
            />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.cardName} numberOfLines={1}>{name}</Text>
          {!!meta && <Text style={styles.cardMeta} numberOfLines={1}>{meta}</Text>}
        </View>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="delete-outline" size={ms(22)} color={TextMutedLight} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { paddingTop: insets.top + vs(10) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={ms(24)} color={TextDark} />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: s(20), paddingBottom: vs(40) }}
        showsVerticalScrollIndicator={false}
      >
        {products.length === 0 ? (
          <View style={styles.empty}>
            <MaterialIcons name="inventory-2" size={ms(48)} color={TextMutedLight} />
            <Text style={styles.emptyTitle}>No Scans Yet</Text>
            <Text style={styles.emptySub}>
              {sourceFilter === 'value'
                ? 'Scan a product with Value Scanner to see it here'
                : 'Scan a QR code with DPP Scanner to see it here'}
            </Text>
          </View>
        ) : (
          products.map(renderCard)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CreamBg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(16),
    paddingBottom: vs(12),
    gap: s(8),
  },
  backBtn: { padding: s(6) },
  title: { fontSize: ms(20), fontWeight: '800', color: TextDark },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: White,
    borderRadius: s(14),
    padding: s(12),
    marginBottom: vs(10),
    gap: s(12),
    borderWidth: 1,
    borderColor: Border,
  },
  thumb: { width: s(48), height: s(48), borderRadius: s(10), backgroundColor: '#F0EDE6' },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  cardName: { fontSize: ms(14), fontWeight: '700', color: TextDark },
  cardMeta: { fontSize: ms(11), color: TextGray, marginTop: vs(2) },
  empty: { alignItems: 'center', paddingVertical: vs(60) },
  emptyTitle: { fontSize: ms(16), fontWeight: '700', color: TextDark, marginTop: vs(12) },
  emptySub: { fontSize: ms(12), color: TextGray, marginTop: vs(6), textAlign: 'center' },
  deleteBtn: { padding: s(6) },
});
