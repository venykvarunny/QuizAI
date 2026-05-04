import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/contexts/auth-context';
import { AuthApiError } from '@/lib/auth-client';
import { maskEmail } from '@/lib/mask-email';

const OTP_LEN = 6;

export default function EmailVerifyScreen() {
  const router = useRouter();
  const { verifyEmail } = useAuth();
  const { email, password } = useLocalSearchParams<{ email?: string; password?: string }>();
  const emailStr = typeof email === 'string' ? email : '';
  const passwordStr = typeof password === 'string' ? password : '';
  const masked = useMemo(() => maskEmail(emailStr), [emailStr]);

  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LEN).fill(''));
  const [resent, setResent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const codeComplete = digits.every((d) => d.length === 1);

  const setDigitAt = useCallback((index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < OTP_LEN - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  const onChangeDigit = useCallback(
    (index: number, value: string) => {
      if (value.length > 1) {
        const digitsOnly = value.replace(/\D/g, '').slice(0, OTP_LEN);
        if (digitsOnly.length) {
          const spread = Array.from({ length: OTP_LEN }, (_, i) => digitsOnly[i] ?? '');
          setDigits(spread);
          const lastIdx = Math.min(digitsOnly.length - 1, OTP_LEN - 1);
          inputRefs.current[lastIdx]?.focus();
        }
        return;
      }
      setDigitAt(index, value);
    },
    [setDigitAt]
  );

  const onKeyPress = useCallback(
    (index: number, key: string) => {
      if (key === 'Backspace' && !digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [digits]
  );

  const onVerify = async () => {
    if (!codeComplete) return;
    if (!emailStr || !passwordStr) {
      Alert.alert('Missing details', 'Please register again before verifying your email.');
      router.replace('/register');
      return;
    }

    setSubmitting(true);
    try {
      const otp = digits.join('');
      await verifyEmail(emailStr, otp, passwordStr);
      router.replace('/eligibility');
    } catch (err) {
      if (err instanceof AuthApiError) {
        Alert.alert('Verification failed', err.message);
      } else {
        const message = err instanceof Error ? err.message : 'Verification failed';
        Alert.alert('Verification failed', message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onResend = () => {
    if (!resent) setResent(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable
            style={styles.backBtn}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Back">
            <Text style={styles.backBtnText}>←</Text>
          </Pressable>
          <Image source={require('@/assets/images/prize-hero.png')} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.main}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji} accessibilityLabel="Email">
              ✉️
            </Text>
          </View>

          <Text style={styles.h1}>Verify Your Email</Text>
          <Text style={styles.desc}>A verification code has been sent to your email address.</Text>
          <Text style={styles.hint}>{masked}</Text>

          <Text style={styles.otpLabel}>Enter 6-digit verification code</Text>
          <View style={styles.otpRow} accessibilityRole="none">
            {Array.from({ length: OTP_LEN }, (_, i) => (
              <TextInput
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                style={styles.otpDigit}
                value={digits[i]}
                onChangeText={(t) => onChangeDigit(i, t)}
                onKeyPress={({ nativeEvent }) => onKeyPress(i, nativeEvent.key)}
                keyboardType="number-pad"
                maxLength={i === 0 ? OTP_LEN : 1}
                textAlign="center"
                selectTextOnFocus
                accessibilityLabel={`Digit ${i + 1}`}
              />
            ))}
          </View>

          <Text style={styles.codeStatus} accessibilityLiveRegion="polite">
            {codeComplete ? '✓ Code entered — ready to verify' : ''}
          </Text>

          <Pressable
            style={[styles.btnVerify, !codeComplete && styles.btnVerifyDisabled]}
            onPress={onVerify}
            disabled={!codeComplete || submitting}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.btnVerifyText, !codeComplete && styles.btnVerifyTextDisabled]}>
                Verify {'->'}
              </Text>
            )}
          </Pressable>

          <Text style={styles.didNotReceive}>Did not receive the code?</Text>
          <Pressable onPress={onResend}>
            <Text style={styles.resend}>{resent ? '✓ Code resent' : 'Resend Code'}</Text>
          </Pressable>

          <View style={styles.warnBox}>
            <Text style={styles.warnText}>
              <Text style={styles.warnStrong}>📧 Check your spam folder</Text> if you don&apos;t see the email
              within 2 minutes. The code is valid for 10 minutes.
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>Pure skill. One prize. One winner.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#08002E',
  },
  scroll: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(8,0,46,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: '#fff',
    fontSize: 18,
  },
  logo: {
    height: 22,
    width: 180,
    flexShrink: 1,
  },
  main: {
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  iconEmoji: {
    fontSize: 32,
  },
  h1: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  desc: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 300,
    marginBottom: 6,
  },
  hint: {
    color: '#F59E0B',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 28,
  },
  otpLabel: {
    alignSelf: 'flex-start',
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 14,
  },
  otpRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 16,
    width: '100%',
  },
  otpDigit: {
    width: 46,
    height: 56,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  codeStatus: {
    fontSize: 13,
    color: '#4ADE80',
    fontWeight: '600',
    minHeight: 20,
    alignSelf: 'stretch',
    textAlign: 'left',
    marginBottom: 8,
  },
  btnVerify: {
    width: '100%',
    backgroundColor: '#EA580C',
    borderRadius: 50,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 10,
    minHeight: 52,
    justifyContent: 'center',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 6,
  },
  btnVerifyDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    shadowOpacity: 0,
    elevation: 0,
  },
  btnVerifyText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
  btnVerifyTextDisabled: {
    color: 'rgba(255,255,255,0.3)',
  },
  didNotReceive: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 14,
  },
  resend: {
    color: '#F59E0B',
    fontWeight: '700',
    fontSize: 14,
    textDecorationLine: 'underline',
    marginTop: 8,
  },
  warnBox: {
    alignSelf: 'stretch',
    marginTop: 20,
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  warnText: {
    fontSize: 13,
    color: 'rgba(255,220,100,0.9)',
    lineHeight: 20,
  },
  warnStrong: {
    fontWeight: '700',
  },
  footer: {
    marginTop: 8,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontWeight: '700',
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
});
