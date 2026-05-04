import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAuth } from '@/contexts/auth-context';
import { AuthApiError, getDashboard, type DashboardResponse } from '@/lib/auth-client';

function StatRow({ label, value, noBorder }: { label: string; value: string; noBorder?: boolean }) {
  return (
    <View style={[styles.statRow, noBorder && styles.statRowLast]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function statusLabel(s: DashboardResponse['quiz']['lastAttemptStatus']): string {
  switch (s) {
    case 'passed':
      return 'Passed';
    case 'failed':
      return 'Failed';
    case 'in_progress':
      return 'In progress';
    default:
      return '—';
  }
}

export default function DashboardScreen() {
  const router = useRouter();
  const { token, ready, signOut } = useAuth();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    setErrorText('');
    try {
      const d = await getDashboard(token);
      setData(d);
    } catch (err) {
      const msg = err instanceof AuthApiError ? err.message : 'Could not load dashboard.';
      setErrorText(msg);
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (!ready) return;
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    void load();
  }, [ready, token, load]);

  const onRefresh = () => {
    if (!token) return;
    setRefreshing(true);
    void load();
  };

  if (!ready || (loading && !data)) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color="#C4B5FD" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!token) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorBanner}>Sign in to view your dashboard.</Text>
          <Pressable style={styles.primaryBtn} onPress={() => router.replace('/register')}>
            <Text style={styles.primaryBtnText}>Sign in</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const displayName = data?.user.name?.trim() || null;
  const displayEmail = data?.user.email?.trim() || '';
  const hasPassedQuiz = Boolean(data?.quiz.hasPassedQuiz);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C4B5FD" />
        }>
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
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Your account</Text>
          </View>
          <Text style={styles.h1}>Dashboard</Text>
          <Text style={styles.sub}>Profile and qualification quiz summary.</Text>

          {!!errorText ? <Text style={styles.errorBanner}>{errorText}</Text> : null}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Profile</Text>
            <StatRow label="Name" value={displayName || '—'} />
            <StatRow label="Email" value={displayEmail || '—'} noBorder />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Qualification quiz</Text>
            <StatRow
              label="Quiz attempted"
              value={data ? (data.quiz.hasAttemptedQuiz ? 'Yes' : 'No') : '—'}
            />
            <StatRow
              label="Passed quiz"
              value={data ? (data.quiz.hasPassedQuiz ? 'Yes' : 'No') : '—'}
            />
            <StatRow label="Number of attempts" value={data ? String(data.quiz.attemptCount) : '—'} />
            <StatRow
              label="Best score"
              value={
                data?.quiz.bestScorePercent != null ? `${data.quiz.bestScorePercent}%` : '—'
              }
            />
            <StatRow label="Last attempt" value={data ? statusLabel(data.quiz.lastAttemptStatus) : '—'} noBorder />
          </View>

          {hasPassedQuiz ? (
            <Pressable style={styles.primaryBtn} onPress={() => router.push('/creative')}>
              <Text style={styles.primaryBtnText}>Sample Next Action</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.primaryBtn} onPress={() => router.push('/quiz')}>
              <Text style={styles.primaryBtnText}>Go to quiz</Text>
            </Pressable>
          )}

          <Pressable
            style={styles.signOutBtn}
            onPress={async () => {
              await signOut();
              router.replace('/');
            }}>
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>Pure skill. One prize. One winner.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#08002E' },
  scroll: { paddingBottom: 24 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 14,
  },
  loadingText: { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 8 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(8,0,46,0.92)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  logo: { height: 24, width: 170 },
  main: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(124,58,237,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.45)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 12,
  },
  badgeText: { color: '#C4B5FD', fontSize: 12, fontWeight: '800' },
  h1: { fontSize: 26, fontWeight: '900', color: '#fff', marginBottom: 6 },
  sub: { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 18, lineHeight: 22 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
    gap: 12,
  },
  statRowLast: { borderBottomWidth: 0 },
  statLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 14, flex: 1 },
  statValue: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
  },
  errorBanner: { color: '#fca5a5', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  primaryBtn: {
    width: '100%',
    borderRadius: 50,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    marginTop: 4,
    marginBottom: 10,
  },
  primaryBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  signOutBtn: { alignItems: 'center', paddingVertical: 14 },
  signOutText: { color: 'rgba(255,255,255,0.45)', fontSize: 14, fontWeight: '700' },
  footer: {
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
