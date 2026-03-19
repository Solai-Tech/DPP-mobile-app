import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import GradientBackground from '../../src/components/GradientBackground';
import { useUserProfile } from '../../src/hooks/useUserProfile';
import { useProducts } from '../../src/hooks/useProducts';
import { s, vs, ms } from '../../src/utils/scale';
import {
  Accent,
  AccentDim,
  CardDark,
  TextPrimary,
  TextSecondary,
  TextMuted,
} from '../../src/theme/colors';

interface MenuItemProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  subtitle?: string;
  onPress?: () => void;
}

function MenuItem({ icon, label, subtitle, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity style={menuStyles.item} onPress={onPress} activeOpacity={0.7}>
      <View style={menuStyles.iconCircle}>
        <MaterialIcons name={icon} size={ms(20)} color={Accent} />
      </View>
      <View style={menuStyles.textCol}>
        <Text style={menuStyles.label}>{label}</Text>
        {subtitle ? <Text style={menuStyles.subtitle}>{subtitle}</Text> : null}
      </View>
      <MaterialIcons name="chevron-right" size={ms(20)} color={TextMuted} />
    </TouchableOpacity>
  );
}

const menuStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CardDark,
    borderRadius: s(14),
    padding: s(14),
  },
  iconCircle: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: AccentDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(12),
  },
  textCol: {
    flex: 1,
  },
  label: {
    fontSize: ms(14),
    fontWeight: '600',
    color: TextPrimary,
  },
  subtitle: {
    fontSize: ms(12),
    color: TextSecondary,
    marginTop: vs(1),
  },
});

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, updateProfile } = useUserProfile();
  const { products } = useProducts();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editPhone, setEditPhone] = useState(profile.phone);

  const handleSaveProfile = () => {
    updateProfile({ name: editName, email: editEmail, phone: editPhone });
    setIsEditing(false);
    Alert.alert('Saved', 'Profile updated successfully');
  };

  return (
    <GradientBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingTop: insets.top + vs(12), paddingBottom: vs(32) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: vs(20) }} />

        {/* Avatar + Info — hide when editing */}
        {!isEditing && (
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <MaterialIcons name="person" size={ms(36)} color={Accent} />
            </View>
            {profile.name ? <Text style={styles.name}>{profile.name}</Text> : null}
            <Text style={styles.role}>Sustainability</Text>
            <Text style={styles.company}>CirTag Industries</Text>
            {profile.email ? (
              <View style={styles.contactRow}>
                <MaterialIcons name="email" size={ms(14)} color={TextSecondary} />
                <Text style={styles.contactText}>{profile.email}</Text>
              </View>
            ) : null}
            {profile.phone ? (
              <View style={styles.contactRow}>
                <MaterialIcons name="phone" size={ms(14)} color={TextSecondary} />
                <Text style={styles.contactText}>{profile.phone}</Text>
              </View>
            ) : null}

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{products.length}</Text>
                <Text style={styles.statLabel}>Products</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{products.length}</Text>
                <Text style={styles.statLabel}>Scans</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                setEditName(profile.name);
                setEditEmail(profile.email);
                setEditPhone(profile.phone);
                setIsEditing(true);
              }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="edit" size={ms(16)} color={Accent} />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Edit Form — shown at top when editing */}
        {isEditing && (
          <View style={styles.editCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: vs(8) }}>
              <Text style={{ fontSize: ms(18), fontWeight: '700', color: TextPrimary }}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setIsEditing(false)} activeOpacity={0.7}>
                <MaterialIcons name="close" size={ms(22)} color={TextSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.editLabel}>Name</Text>
            <TextInput
              style={styles.editInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Your name"
              placeholderTextColor={TextMuted}
            />
            <Text style={styles.editLabel}>Email</Text>
            <TextInput
              style={styles.editInput}
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder="your@email.com"
              placeholderTextColor={TextMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={styles.editLabel}>Phone</Text>
            <TextInput
              style={styles.editInput}
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="+46 70 123 4567"
              placeholderTextColor={TextMuted}
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile} activeOpacity={0.85}>
              <MaterialIcons name="check" size={ms(18)} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Profile</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: vs(20) }} />

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <MenuItem icon="settings" label="Settings" subtitle="App preferences" onPress={() => router.push('/settings')} />
          <MenuItem icon="notifications" label="Notifications" subtitle="Manage alerts" onPress={() => router.push('/notifications')} />
          <MenuItem icon="security" label="Privacy & Security" subtitle="Privacy & Data Terms" onPress={() => router.push('/privacy')} />
          <MenuItem
            icon="info-outline"
            label="About CirTag"
            subtitle="Version 1.0.0"
            onPress={() =>
              router.push(
                `/webview?url=${encodeURIComponent('https://solai.se/dppx/')}&title=${encodeURIComponent('About CirTag')}`
              )
            }
          />
        </View>

        <View style={{ height: vs(24) }} />
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(20),
    gap: s(10),
  },
  headerTitle: {
    fontSize: ms(18),
    fontWeight: '700',
    color: TextPrimary,
  },
  profileCard: {
    backgroundColor: CardDark,
    borderRadius: s(20),
    marginHorizontal: s(20),
    padding: s(24),
    alignItems: 'center',
  },
  avatar: {
    width: s(72),
    height: s(72),
    borderRadius: s(36),
    backgroundColor: AccentDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  name: {
    fontSize: ms(20),
    fontWeight: '700',
    color: TextPrimary,
  },
  role: {
    fontSize: ms(14),
    color: Accent,
    fontWeight: '500',
    marginTop: vs(2),
  },
  company: {
    fontSize: ms(13),
    color: TextSecondary,
    marginTop: vs(2),
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: vs(20),
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: s(24),
  },
  statValue: {
    fontSize: ms(20),
    fontWeight: '800',
    color: TextPrimary,
  },
  statLabel: {
    fontSize: ms(12),
    color: TextSecondary,
    marginTop: vs(2),
  },
  statDivider: {
    width: 1,
    height: vs(30),
    backgroundColor: 'rgba(44,62,45,0.12)',
  },
  menuSection: {
    paddingHorizontal: s(20),
    gap: s(8),
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    marginTop: vs(4),
  },
  contactText: {
    fontSize: ms(13),
    color: TextSecondary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    marginTop: vs(16),
    paddingHorizontal: s(16),
    paddingVertical: vs(8),
    borderRadius: s(10),
    backgroundColor: AccentDim,
  },
  editButtonText: {
    fontSize: ms(13),
    fontWeight: '600',
    color: Accent,
  },
  editCard: {
    backgroundColor: CardDark,
    borderRadius: s(16),
    marginHorizontal: s(20),
    marginTop: vs(12),
    padding: s(20),
  },
  editLabel: {
    fontSize: ms(12),
    fontWeight: '600',
    color: TextSecondary,
    marginBottom: vs(6),
    marginTop: vs(10),
  },
  editInput: {
    backgroundColor: 'rgba(44,62,45,0.04)',
    borderRadius: s(10),
    paddingHorizontal: s(14),
    paddingVertical: vs(10),
    fontSize: ms(15),
    color: TextPrimary,
    borderWidth: 1,
    borderColor: 'rgba(44,62,45,0.1)',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(8),
    backgroundColor: Accent,
    borderRadius: s(12),
    paddingVertical: vs(14),
    marginTop: vs(16),
  },
  saveButtonText: {
    fontSize: ms(14),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(196,90,90,0.08)',
    borderRadius: s(14),
    marginHorizontal: s(20),
    paddingVertical: vs(14),
    gap: s(8),
  },
  signOutText: {
    fontSize: ms(14),
    fontWeight: '700',
    color: '#C45A5A',
  },
});
