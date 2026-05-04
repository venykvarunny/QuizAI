import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function QuizSuccessScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#08002E', '#12006E', '#1A0A7C']} locations={[0, 0.5, 1]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} bounces={false}>
          <View style={styles.header}>
            <Image source={require('@/assets/images/prize-hero.png')} style={styles.logo} resizeMode="contain" />
          </View>

          <View style={styles.main}>
            <LinearGradient colors={['#4ADE80', '#16A34A']} style={styles.icon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.iconText}>✓</Text>
            </LinearGradient>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>🎓 Quiz Passed!</Text>
            </View>

            <Text style={styles.h1}>Quiz Successful!</Text>
            <Text style={styles.sub}>
              Congratulations - you have passed the qualification quiz. You may now continue from your dashboard.
            </Text>

            <View style={styles.promptCard}>
              <Text style={styles.promptLabel}>Your prompt</Text>
              <Text style={styles.promptText}>"In exactly 25 words, tell us why you should win this prize."</Text>
              <Text style={styles.timerNote}>⏱ You have 120 seconds to complete your submission</Text>
            </View>

            <Pressable style={styles.btn} onPress={() => router.replace('/dashboard')}>
              <LinearGradient
                colors={['#F59E0B', '#EA580C']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.btnGradient}>
                <Text style={styles.btnText}>Continue to Dashboard →</Text>
              </LinearGradient>
            </Pressable>
            <Text style={styles.hint}>No timer starts on this screen</Text>
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
  scroll: { flexGrow: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(8,0,46,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  logo: { height: 24, width: 180 },
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
  },
  icon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  iconText: { color: '#fff', fontSize: 34, fontWeight: '900' },
  badge: {
    backgroundColor: 'rgba(74,222,128,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.35)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 14,
  },
  badgeText: { color: '#4ADE80', fontSize: 13, fontWeight: '700' },
  h1: { fontSize: 26, fontWeight: '900', color: '#fff', marginBottom: 10, textAlign: 'center' },
  sub: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 320,
    textAlign: 'center',
  },
  promptCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    padding: 14,
    marginBottom: 22,
  },
  promptLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  promptText: {
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.85)',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  timerNote: {
    fontSize: 13,
    color: '#F59E0B',
    fontWeight: '700',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  btn: {
    width: '100%',
    borderRadius: 50,
    overflow: 'hidden',
    minHeight: 54,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  btnGradient: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  hint: { textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 10 },
  footer: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    paddingVertical: 10,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
