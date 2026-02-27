import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { s, vs, ms } from '../src/utils/scale';

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const points = [
    'We collect product-related data from scans to provide accurate sustainability information.',
    'Chatbot interactions are securely processed to assist with product-related questions.',
    'We collect only the minimum data necessary to improve your experience.',
    'Your data is encrypted and securely stored.',
    'We do not sell or share your personal information without your consent.',
    'You may request access to or deletion of your data at any time.',
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios-new" size={ms(18)} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Privacy & Data Terms</Text>
        <Text style={styles.intro}>
          At CirTag, your privacy is important to us.
        </Text>
        <Text style={styles.subIntro}>
          By using this app, you acknowledge and agree to the following:
        </Text>

        {points.map((point, i) => (
          <View key={i} style={styles.pointRow}>
            <MaterialIcons name="check-circle" size={ms(18)} color="#00E676" style={styles.pointIcon} />
            <Text style={styles.pointText}>{point}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1A14',
  },
  header: {
    height: vs(48),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(12),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: {
    width: s(34),
    height: s(34),
    borderRadius: s(17),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: s(8),
  },
  headerTitle: {
    fontSize: ms(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    padding: s(20),
    paddingBottom: vs(40),
  },
  title: {
    fontSize: ms(22),
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: vs(12),
  },
  intro: {
    fontSize: ms(15),
    color: 'rgba(255,255,255,0.85)',
    lineHeight: ms(22),
    marginBottom: vs(8),
  },
  subIntro: {
    fontSize: ms(14),
    color: 'rgba(255,255,255,0.6)',
    lineHeight: ms(20),
    marginBottom: vs(20),
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: vs(14),
    gap: s(10),
  },
  pointIcon: {
    marginTop: vs(2),
  },
  pointText: {
    flex: 1,
    fontSize: ms(14),
    color: 'rgba(255,255,255,0.8)',
    lineHeight: ms(20),
  },
});
