import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/contexts/auth-context';

export default function QuizIncorrectScreen() {
  const router = useRouter();
  const { signOut } = useAuth();

  const onDashboard = () => {
    router.replace('/dashboard');
  };

  const onLogout = async () => {
    try {
      await signOut();
    } catch {
      /* ignore */
    }
    router.replace('/');
  };

  return (
    <LinearGradient colors={['#0E0005', '#2D0010', '#1A0A1C']} locations={[0, 0.5, 1]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <View style={styles.main}>
            <LinearGradient colors={['#DC2626', '#991B1B']} style={styles.errIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.errIconText}>✗</Text>
            </LinearGradient>

            <Text style={styles.h1}>Incorrect Answer</Text>
            <Text style={styles.sub}>Unfortunately, your last answer was incorrect.</Text>
            <Text style={styles.sub2}>A perfect score is required to proceed.</Text>

            <View style={styles.info}>
              <Text style={styles.infoTitle}>What happens next:</Text>
              <InfoItem text="Your current attempt has ended" />
              <InfoItem text="You may purchase another entry to try again" />
              <InfoItem text="Maximum 10 entries per competition" />
              <InfoItem text="Log out and log back in to make payment for another attempt" last />
            </View>

            <Pressable style={styles.btnHome} onPress={onDashboard}>
              <LinearGradient
                colors={['#F59E0B', '#EA580C']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.btnHomeGradient}>
                <Text style={styles.btnHomeText}>Go to Dashboard</Text>
              </LinearGradient>
            </Pressable>

            <Pressable style={styles.btnLogout} onPress={onLogout}>
              <Text style={styles.btnLogoutText}>Log Out</Text>
            </Pressable>
          </View>

          <Text style={styles.footer}>Pure skill. One prize. One winner.</Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function InfoItem({ text, last = false }: { text: string; last?: boolean }) {
  return (
    <View style={[styles.infoItem, last && styles.infoItemLast]}>
      <Text style={styles.infoBullet}>•</Text>
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  main: {
    alignItems: 'center',
    width: '100%',
  },
  errIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  errIconText: {
    fontSize: 36,
    color: '#fff',
    fontWeight: '900',
  },
  h1: {
    fontSize: 28,
    fontWeight: '900',
    color: '#F87171',
    marginBottom: 12,
    textAlign: 'center',
  },
  sub: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 15,
    lineHeight: 25,
    marginBottom: 8,
    textAlign: 'center',
    maxWidth: 300,
  },
  sub2: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 24,
    textAlign: 'center',
    maxWidth: 320,
  },
  info: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.2)',
    borderRadius: 18,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    color: 'rgba(255,255,255,0.85)',
  },
  infoItem: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  infoItemLast: {
    marginBottom: 0,
  },
  infoBullet: {
    color: '#F87171',
    fontSize: 13,
    lineHeight: 20,
    flexShrink: 0,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 20,
  },
  btnHome: {
    width: '100%',
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 10,
    minHeight: 52,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  btnHomeGradient: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  btnHomeText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
  btnLogout: {
    width: '100%',
    backgroundColor: 'rgba(248,113,113,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(248,113,113,0.3)',
    borderRadius: 50,
    paddingVertical: 13,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLogoutText: {
    color: '#F87171',
    fontWeight: '700',
    fontSize: 15,
  },
  footer: {
    marginTop: 28,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    width: '100%',
  },
});
