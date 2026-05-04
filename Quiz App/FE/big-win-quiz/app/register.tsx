import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function alertApiError(title: string, err: unknown) {
  if (err instanceof AuthApiError) {
    Alert.alert(title, err.message);
    return;
  }
  const message = err instanceof Error ? err.message : 'Something went wrong. Try again.';
  Alert.alert(title, message);
}

export default function RegisterScreen() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState<'register' | 'login'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isAdult, setIsAdult] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submittingRegister, setSubmittingRegister] = useState(false);
  const [submittingLogin, setSubmittingLogin] = useState(false);
  const [registerEmailApiError, setRegisterEmailApiError] = useState('');
  const [loginEmailApiError, setLoginEmailApiError] = useState('');
  const registerEmailTrimmed = email.trim();
  const loginEmailTrimmed = loginEmail.trim();
  const registerEmailValid = EMAIL_REGEX.test(registerEmailTrimmed);
  const loginEmailValid = EMAIL_REGEX.test(loginEmailTrimmed);

  const canCreate = useMemo(() => {
    return registerEmailValid && password.length >= 8 && isAdult && acceptTerms;
  }, [registerEmailValid, password, isAdult, acceptTerms]);

  const canLogin = useMemo(() => {
    return loginEmailValid && loginPassword.trim().length > 0;
  }, [loginEmailValid, loginPassword]);

  const onCreateAccount = async () => {
    setRegisterEmailApiError('');
    if (!canCreate) {
      Alert.alert('Incomplete details', 'Fill all fields and accept required confirmations.');
      return;
    }
    if (password.length > 128) {
      Alert.alert('Invalid password', 'Password must be at most 128 characters.');
      return;
    }
    setSubmittingRegister(true);
    try {
      await signUp(registerEmailTrimmed, password);
      router.replace({
        pathname: '/email-verify',
        params: { email: registerEmailTrimmed, password },
      });
    } catch (err) {
      if (err instanceof AuthApiError) {
        setRegisterEmailApiError(err.message);
      } else {
        alertApiError('Could not create account', err);
      }
    } finally {
      setSubmittingRegister(false);
    }
  };

  const onLogin = async () => {
    setLoginEmailApiError('');
    if (!canLogin) {
      Alert.alert('Missing details', 'Please enter email and password.');
      return;
    }
    setSubmittingLogin(true);
    try {
      await signIn(loginEmailTrimmed, loginPassword);
      router.replace('/dashboard');
    } catch (err) {
      if (err instanceof AuthApiError) {
        setLoginEmailApiError(err.message);
      } else {
        alertApiError('Login failed', err);
      }
    } finally {
      setSubmittingLogin(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image source={require('@/assets/images/prize-hero.png')} style={styles.logo} resizeMode="contain" />
        </View>

        <Text style={styles.title}>{tab === 'register' ? 'Create Account' : 'Log In'}</Text>
        <Text style={styles.subtitle}>
          {tab === 'register'
            ? 'Join The Big Skill Challenge to enter'
            : 'Welcome back - log in to continue'}
        </Text>

        <View style={styles.tabs}>
          <Pressable
            style={[styles.tabButton, tab === 'register' && styles.tabButtonActive]}
            onPress={() => setTab('register')}>
            <Text style={[styles.tabText, tab === 'register' && styles.tabTextActive]}>Create Account</Text>
          </Pressable>
          <Pressable style={[styles.tabButton, tab === 'login' && styles.tabButtonActive]} onPress={() => setTab('login')}>
            <Text style={[styles.tabText, tab === 'login' && styles.tabTextActive]}>Log In</Text>
          </Pressable>
        </View>

        {tab === 'register' ? (
          <View>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (registerEmailApiError) setRegisterEmailApiError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {!!registerEmailTrimmed && !registerEmailValid ? (
              <Text style={styles.errorText}>Enter a valid email address.</Text>
            ) : null}
            {!!registerEmailApiError ? <Text style={styles.errorText}>{registerEmailApiError}</Text> : null}

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a password (min 8 characters)"
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <View style={styles.separator}>
              <Text style={styles.separatorText}>Confirmations required</Text>
            </View>

            <Pressable style={styles.checkRow} onPress={() => setIsAdult((prev) => !prev)}>
              <View style={[styles.checkBox, isAdult && styles.checkBoxOn]}>
                {isAdult ? <Text style={styles.checkTick}>✓</Text> : null}
              </View>
              <Text style={styles.checkText}>I confirm I am 18 years or older</Text>
            </Pressable>

            <Pressable style={styles.checkRow} onPress={() => setAcceptTerms((prev) => !prev)}>
              <View style={[styles.checkBox, acceptTerms && styles.checkBoxOn]}>
                {acceptTerms ? <Text style={styles.checkTick}>✓</Text> : null}
              </View>
              <Text style={styles.checkText}>I agree to the Terms and Conditions and Competition Rules</Text>
            </Pressable>

            <Pressable
              style={[
                styles.primaryButton,
                (!canCreate || submittingRegister) && styles.primaryButtonDisabled,
              ]}
              onPress={onCreateAccount}
              disabled={!canCreate || submittingRegister}>
              {submittingRegister ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.primaryButtonText, !canCreate && styles.primaryButtonTextDisabled]}>
                  Create Account {'->'}
                </Text>
              )}
            </Pressable>

            <Pressable onPress={() => setTab('login')}>
              <Text style={styles.helperLink}>Already have an account? Log in here.</Text>
            </Pressable>
          </View>
        ) : (
          <View>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={loginEmail}
              onChangeText={(value) => {
                setLoginEmail(value);
                if (loginEmailApiError) setLoginEmailApiError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {!!loginEmailTrimmed && !loginEmailValid ? (
              <Text style={styles.errorText}>Enter a valid email address.</Text>
            ) : null}
            {!!loginEmailApiError ? <Text style={styles.errorText}>{loginEmailApiError}</Text> : null}

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={loginPassword}
              onChangeText={(value) => {
                setLoginPassword(value);
                if (loginEmailApiError) setLoginEmailApiError('');
              }}
              secureTextEntry
            />

            <Pressable
              style={[styles.primaryButton, (!canLogin || submittingLogin) && styles.primaryButtonDisabled]}
              onPress={onLogin}
              disabled={!canLogin || submittingLogin}>
              {submittingLogin ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.primaryButtonText, !canLogin && styles.primaryButtonTextDisabled]}>
                  Log In {'->'}
                </Text>
              )}
            </Pressable>

            <Pressable onPress={() => setTab('register')}>
              <Text style={styles.helperLink}>Don&apos;t have an account? Create one.</Text>
            </Pressable>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </View>
        )}

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
  container: {
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  logo: {
    width: 180,
    height: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 6,
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 24,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 4,
    gap: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#F59E0B',
  },
  tabText: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '700',
    fontSize: 14,
  },
  tabTextActive: {
    color: '#fff',
  },
  label: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: '#fff',
    marginBottom: 14,
  },
  separator: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    paddingTop: 14,
    marginTop: 4,
    marginBottom: 4,
  },
  separatorText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontWeight: '700',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
  },
  checkBox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 6,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxOn: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  checkTick: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },
  checkText: {
    flex: 1,
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    lineHeight: 20,
  },
  primaryButton: {
    marginTop: 12,
    width: '100%',
    borderRadius: 50,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#EA580C',
  },
  primaryButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  primaryButtonTextDisabled: {
    color: 'rgba(255,255,255,0.35)',
  },
  helperLink: {
    marginTop: 12,
    textAlign: 'center',
    color: '#F59E0B',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  forgotText: {
    marginTop: 8,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.38)',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 12,
    marginTop: -6,
    marginBottom: 10,
  },
  footer: {
    marginTop: 22,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontWeight: '700',
  },
});
