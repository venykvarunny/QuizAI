import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

/**
 * Matches prototype 08-quiz-timeout: warm dark gradient, orange accent, timer icon.
 */
export default function QuizTimeoutScreen() {
  const router = useRouter();

  const onHome = () => {
    router.replace('/dashboard');
  };

  const onLogout = () => {
    router.replace('/');
  };

  return (
    <LinearGradient colors={['#0A0500', '#1A0D00', '#1A0A1C']} locations={[0, 0.5, 1]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <View style={styles.main}>
            <LinearGradient
              colors={['#F59E0B', '#EA580C']}
              style={styles.iconWrap}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <Text style={styles.iconText} accessibilityLabel="Time expired">
                ⏱
              </Text>
            </LinearGradient>

            <Text style={styles.h1}>Time Expired</Text>
            <Text style={styles.sub}>You did not answer the question within the allowed time.</Text>
            <Text style={styles.sub2}>Your current attempt has ended.</Text>

            <View style={styles.info}>
              <Text style={styles.infoBody}>
                An email notification will be sent confirming this incomplete attempt. You may purchase another entry (max
                10 per competition) to try again. Log out and log back in to begin a new attempt.
              </Text>
            </View>

            <Pressable style={styles.btnHome} onPress={onHome}>
              <LinearGradient
                colors={['#F59E0B', '#EA580C']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.btnHomeGradient}>
                <Text style={styles.btnHomeText}>Return to Competition Home</Text>
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
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
  },
  iconText: {
    fontSize: 36,
  },
  h1: {
    fontSize: 28,
    fontWeight: '900',
    color: '#F59E0B',
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
    borderColor: 'rgba(245,158,11,0.2)',
    borderRadius: 18,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  infoBody: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 21,
    textAlign: 'left',
  },
  btnHome: {
    width: '100%',
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 10,
    minHeight: 52,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
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
