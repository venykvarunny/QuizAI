import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '@/contexts/auth-context';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

type Prize = {
  id: string;
  tag: string;
  name: string;
  value: string;
  status: string;
  image: any;
};

const PRIZES: Prize[] = [
  {
    id: '1',
    tag: 'This Competition',
    name: 'BMW X5 SUV',
    value: 'Value ~A$65,000',
    status: 'Current Prize',
    image: require('@/assets/images/bmw-x5.jpg'),
  },
  {
    id: '2',
    tag: 'Next Competition',
    name: 'Luxury Caravan',
    value: 'Value ~A$120,000',
    status: 'Coming Soon',
    image: require('@/assets/images/caravan.jpg'),
  },
  {
    id: '3',
    tag: 'Upcoming Competition',
    name: '48ft Superyacht',
    value: 'Value ~A$1.2 Million',
    status: 'Coming Soon',
    image: require('@/assets/images/boat.jpg'),
  },
];

export default function LandingScreen() {
  const router = useRouter();
  const { token, ready } = useAuth();
  const listRef = useRef<FlatList<Prize>>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [endTime] = useState(() => Date.now() + ((89 * 24 + 18) * 60 * 60 + 15) * 1000);
  const [timeLeft, setTimeLeft] = useState(endTime - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(Math.max(0, endTime - Date.now()));
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  useEffect(() => {
    const autoPlay = setInterval(() => {
      const next = (activeSlide + 1) % PRIZES.length;
      listRef.current?.scrollToIndex({ index: next, animated: true });
      setActiveSlide(next);
    }, 4000);

    return () => clearInterval(autoPlay);
  }, [activeSlide]);

  const countdown = useMemo(() => {
    const total = Math.max(0, timeLeft);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((total / (1000 * 60)) % 60);
    const secs = Math.floor((total / 1000) % 60);
    const pad = (n: number) => String(n).padStart(2, '0');

    return {
      days: pad(days),
      hours: pad(hours),
      mins: pad(mins),
      secs: pad(secs),
    };
  }, [timeLeft]);

  const onMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / CARD_WIDTH);
    setActiveSlide(index);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image source={require('@/assets/images/prize-hero.png')} style={styles.logo} resizeMode="contain" />
          {ready && token ? (
            <Pressable style={styles.signInBtn} onPress={() => router.push('/dashboard')}>
              <Text style={styles.signInText}>Dashboard</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.signInBtn} onPress={() => router.push('/register')}>
              <Text style={styles.signInText}>Sign In</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.badgeWrap}>
          <View style={styles.badgeCircle}>
            <Text style={styles.badgeText}>BIG</Text>
            <Text style={styles.badgeText}>WIN</Text>
          </View>
        </View>

        <Text style={styles.title}>The Big Skill Challenge</Text>
        <Text style={styles.subtitle}>Answer the prompt · Win the prize · Pure skill</Text>

        <FlatList
          ref={listRef}
          data={PRIZES}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          snapToAlignment="center"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumEnd}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <Image source={item.image} style={styles.slideImage} />
              <View style={styles.slideStatus}>
                <Text style={styles.slideStatusText}>{item.status}</Text>
              </View>
              <View style={styles.slideOverlay}>
                <Text style={styles.slideTag}>{item.tag}</Text>
                <Text style={styles.slideName}>{item.name}</Text>
                <Text style={styles.slideValue}>{item.value}</Text>
              </View>
            </View>
          )}
        />

        <View style={styles.dotsRow}>
          {PRIZES.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => {
                listRef.current?.scrollToIndex({ index, animated: true });
                setActiveSlide(index);
              }}
              style={[styles.dot, activeSlide === index && styles.dotActive]}
            />
          ))}
        </View>

        <Pressable
          style={styles.cta}
          onPress={() => {
            if (ready && token) {
              router.push('/dashboard');
              return;
            }
            router.push('/register');
          }}>
          <Text style={styles.ctaText}>ENTER NOW - A$2.99</Text>
        </Pressable>
        <Text style={styles.finePrint}>A$2.99 per entry · Max 10 entries per participant · Skill-based</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How it Works</Text>
          <View style={styles.card}>
            {[
              'Register & Pay',
              'Complete the Qualification Quiz',
              'Submit Your 25-Word Entry',
              'Independent Judging',
            ].map((step, index) => (
              <View key={step} style={[styles.stepRow, index === 3 && styles.stepRowLast]}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI-Assisted. Independently Verified.</Text>
          <View style={styles.featureGrid}>
            {['Deterministic', 'Trust', 'Sealed', 'Verified'].map((item) => (
              <View key={item} style={styles.featureCard}>
                <Text style={styles.featureTitle}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.countdownCard}>
          <Text style={styles.countdownLabel}>Competition closes in:</Text>
          <View style={styles.countdownRow}>
            {[
              { label: 'Days', value: countdown.days },
              { label: 'Hrs', value: countdown.hours },
              { label: 'Min', value: countdown.mins },
              { label: 'Sec', value: countdown.secs },
            ].map((box) => (
              <View key={box.label} style={styles.countdownBox}>
                <Text style={styles.countdownValue}>{box.value}</Text>
                <Text style={styles.countdownUnit}>{box.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.legalRow}>
          {['T&Cs', 'Competition Rules', 'FAQ', 'Privacy'].map((item) => (
            <Text key={item} style={styles.legalText}>
              {item}
            </Text>
          ))}
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
  content: {
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0d0d22',
  },
  logo: {
    width: 170,
    height: 30,
  },
  signInBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  signInText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  badgeWrap: {
    alignItems: 'center',
    marginTop: 18,
  },
  badgeCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#1A0A00',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 30,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 16,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  slide: {
    width: CARD_WIDTH,
    height: 220,
    borderRadius: 18,
    marginHorizontal: 16,
    overflow: 'hidden',
    backgroundColor: '#1a1a30',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  slideStatus: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#EA580C',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  slideStatusText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  slideOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  slideTag: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  slideName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  slideValue: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 14,
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#F59E0B',
  },
  cta: {
    marginHorizontal: 16,
    backgroundColor: '#EA580C',
    borderRadius: 40,
    minHeight: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  finePrint: {
    marginTop: 6,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    marginBottom: 14,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 10,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  stepRowLast: {
    borderBottomWidth: 0,
  },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },
  stepText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },
  featureCard: {
    width: '49%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 14,
    alignItems: 'center',
  },
  featureTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  countdownCard: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 12,
    marginBottom: 14,
  },
  countdownLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginBottom: 6,
  },
  countdownRow: {
    flexDirection: 'row',
    gap: 8,
  },
  countdownBox: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: 'rgba(124,58,237,0.24)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.4)',
    alignItems: 'center',
    paddingVertical: 8,
  },
  countdownValue: {
    color: '#C4B5FD',
    fontSize: 20,
    fontWeight: '900',
  },
  countdownUnit: {
    color: 'rgba(196,181,253,0.7)',
    textTransform: 'uppercase',
    fontSize: 9,
    fontWeight: '600',
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  legalText: {
    color: 'rgba(255,255,255,0.38)',
    fontSize: 11,
    textDecorationLine: 'underline',
  },
  footer: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '700',
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
});
