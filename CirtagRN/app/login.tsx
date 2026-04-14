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

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Login Failed', result.error || 'Invalid credentials');
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
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>Sign in to continue</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Email</Text>
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
                placeholder="Enter your password"
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

            <TouchableOpacity style={styles.forgotButton} onPress={() => router.push('/forgot-password')}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.signInButton, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color={White} />
              ) : (
                <Text style={styles.signInText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.signUpRow}>
              <Text style={styles.signUpQuestion}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.signUpLink}>Sign Up</Text>
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
  logoSection: {
    alignItems: 'center',
    marginTop: vs(40),
  },
  logoContainer: {
    width: s(120),
    height: s(120),
    backgroundColor: White,
    borderRadius: s(20),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  logoImage: {
    width: s(80),
    height: s(80),
  },
  brandRow: {
    flexDirection: 'row',
    marginTop: vs(16),
  },
  brandRe: {
    fontSize: ms(36),
    fontWeight: '700',
    color: TextDark,
  },
  brandMat: {
    fontSize: ms(36),
    fontWeight: '700',
    color: SageAccent,
  },
  tagline: {
    fontSize: ms(11),
    fontWeight: '600',
    color: TextGray,
    letterSpacing: 2,
    marginTop: vs(4),
  },
  welcomeSection: {
    marginTop: vs(32),
  },
  welcomeTitle: {
    fontSize: ms(28),
    fontWeight: '800',
    color: TextDark,
  },
  welcomeSubtitle: {
    fontSize: ms(15),
    color: TextGray,
    marginTop: vs(4),
  },
  formSection: {
    marginTop: vs(24),
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
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: vs(12),
  },
  forgotText: {
    fontSize: ms(14),
    fontWeight: '600',
    color: SageAccent,
  },
  signInButton: {
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
  signInText: {
    fontSize: ms(16),
    fontWeight: '700',
    color: White,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vs(24),
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
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: vs(20),
  },
  signUpQuestion: {
    fontSize: ms(14),
    color: TextGray,
  },
  signUpLink: {
    fontSize: ms(14),
    fontWeight: '700',
    color: SageAccent,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: vs(32),
    paddingBottom: vs(16),
  },
  footerText: {
    fontSize: ms(12),
    color: TextMuted,
  },
});
