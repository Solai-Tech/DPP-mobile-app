import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useAuth } from '../src/context/AuthContext';
import { s, vs, ms } from '../src/utils/scale';

const CreamBg = '#F7F5F0';
const White = '#FFFFFF';
const SageAccent = '#5A8C5A';
const TextDark = '#2C3E2D';
const TextGray = 'rgba(44,62,45,0.65)';
const TextMuted = 'rgba(44,62,45,0.4)';
const Border = 'rgba(44,62,45,0.15)';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    if (!password) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    const result = await register(email, password, name);
    setIsLoading(false);

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Registration Failed', result.error || 'Could not create account');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back-ios-new" size={ms(18)} color={TextDark} />
          </TouchableOpacity>

          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/remat_logo.png')}
                style={styles.logoImage}
                contentFit="contain"
              />
            </View>
            <View style={styles.brandRow}>
              <Text style={styles.brandRe}>Re</Text>
              <Text style={styles.brandMat}>Mat</Text>
            </View>
            <Text style={styles.tagline}>DIGITAL PRODUCT PASSPORT PLATFORM</Text>
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Create Account</Text>
            <Text style={styles.welcomeSubtitle}>Sign up to get started</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="person-outline" size={ms(20)} color={TextMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={TextMuted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <Text style={[styles.inputLabel, { marginTop: vs(16) }]}>Email</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="mail-outline" size={ms(20)} color={TextMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={TextMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Text style={[styles.inputLabel, { marginTop: vs(16) }]}>Password</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock-outline" size={ms(20)} color={TextMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor={TextMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={ms(20)}
                  color={TextMuted}
                />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { marginTop: vs(16) }]}>Confirm Password</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock-outline" size={ms(20)} color={TextMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor={TextMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
              >
                <MaterialIcons
                  name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                  size={ms(20)}
                  color={TextMuted}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.signUpButton, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color={White} />
              ) : (
                <Text style={styles.signUpText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.signInRow}>
              <Text style={styles.signInQuestion}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Powered by SolAI Services</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CreamBg,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: s(24),
    paddingBottom: vs(24),
  },
  backButton: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: White,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: vs(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: vs(16),
  },
  logoContainer: {
    width: s(100),
    height: s(100),
    backgroundColor: White,
    borderRadius: s(18),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  logoImage: {
    width: s(65),
    height: s(65),
  },
  brandRow: {
    flexDirection: 'row',
    marginTop: vs(12),
  },
  brandRe: {
    fontSize: ms(30),
    fontWeight: '700',
    color: TextDark,
  },
  brandMat: {
    fontSize: ms(30),
    fontWeight: '700',
    color: SageAccent,
  },
  tagline: {
    fontSize: ms(10),
    fontWeight: '600',
    color: TextGray,
    letterSpacing: 2,
    marginTop: vs(2),
  },
  welcomeSection: {
    marginTop: vs(24),
  },
  welcomeTitle: {
    fontSize: ms(26),
    fontWeight: '800',
    color: TextDark,
  },
  welcomeSubtitle: {
    fontSize: ms(14),
    color: TextGray,
    marginTop: vs(4),
  },
  formSection: {
    marginTop: vs(20),
  },
  inputLabel: {
    fontSize: ms(14),
    fontWeight: '600',
    color: TextDark,
    marginBottom: vs(8),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: White,
    borderRadius: s(14),
    borderWidth: 1,
    borderColor: Border,
    paddingHorizontal: s(14),
  },
  inputIcon: {
    marginRight: s(10),
  },
  input: {
    flex: 1,
    paddingVertical: vs(14),
    fontSize: ms(15),
    color: TextDark,
  },
  eyeButton: {
    padding: s(4),
  },
  signUpButton: {
    backgroundColor: SageAccent,
    borderRadius: s(14),
    paddingVertical: vs(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vs(24),
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  signUpText: {
    fontSize: ms(16),
    fontWeight: '700',
    color: White,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vs(20),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Border,
  },
  dividerText: {
    fontSize: ms(14),
    color: TextMuted,
    marginHorizontal: s(16),
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: vs(16),
  },
  signInQuestion: {
    fontSize: ms(14),
    color: TextGray,
  },
  signInLink: {
    fontSize: ms(14),
    fontWeight: '700',
    color: SageAccent,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: vs(24),
    paddingBottom: vs(16),
  },
  footerText: {
    fontSize: ms(12),
    color: TextMuted,
  },
});
