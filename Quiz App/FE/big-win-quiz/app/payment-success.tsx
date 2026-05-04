import { useRouter } from 'expo-router';
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function PaymentSuccessScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image source={require('@/assets/images/prize-hero.png')} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.main}>
          <View style={styles.successIcon}>
            <Text style={styles.successIconText}>✓</Text>
          </View>

          <View style={styles.badgeGreen}>
            <Text style={styles.badgeGreenText}>✅ Payment Confirmed</Text>
          </View>

          <Text style={styles.h1}>Payment Successful</Text>
          <Text style={styles.sub}>Your payment has been received and recorded.</Text>
          <Text style={styles.sub2}>You may now begin the qualification quiz.</Text>

          <View style={styles.receipt}>
            <Text style={styles.receiptTitle}>Payment Receipt</Text>
            <ReceiptRow label="Competition" value="The Big Skill Challenge™" />
            <ReceiptRow label="Prize" value="BMW X5 SUV" />
            <ReceiptRow label="Entry Fee Paid" value="A$2.99" />
            <ReceiptRow label="Reference" value="TBSC-2026-004521" />
            <ReceiptRow label="Trust Account" value="Confirmed ✓" noBorder />
          </View>

          <View style={styles.important}>
            <Text style={styles.importantTitle}>⚠️ Important — Before You Begin</Text>
            <NoteItem icon="⏱" text="Each question is timed — answer within the time limit" />
            <NoteItem icon="✓" text="You must answer all questions correctly — 100% pass required" />
            <NoteItem icon="❌" text="If timed out or incorrect, the attempt ends" />
            <NoteItem icon="🔄" text="You may purchase additional entries to try again (max 10 total)" last />
          </View>

          <Pressable style={styles.btnStart} onPress={() => router.push('/quiz')}>
            <Text style={styles.btnStartText}>Start Quiz {'->'}</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>Pure skill. One prize. One winner.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ReceiptRow({
  label,
  value,
  noBorder = false,
}: {
  label: string;
  value: string;
  noBorder?: boolean;
}) {
  return (
    <View style={[styles.receiptRow, noBorder && styles.receiptRowLast]}>
      <Text style={styles.receiptLabel}>{label}</Text>
      <Text style={styles.receiptValue}>{value}</Text>
    </View>
  );
}

function NoteItem({
  icon,
  text,
  last = false,
}: {
  icon: string;
  text: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.noteItem, last && styles.noteItemLast]}>
      <View style={styles.noteIconWrap}>
        <Text style={styles.noteIcon}>{icon}</Text>
      </View>
      <Text style={styles.noteText}>{text}</Text>
    </View>
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    backgroundColor: 'rgba(8,0,46,0.92)',
  },
  logo: {
    height: 24,
    width: 190,
  },
  main: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: 'center',
  },
  successIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  successIconText: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '900',
  },
  badgeGreen: {
    backgroundColor: 'rgba(74,222,128,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.35)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 14,
  },
  badgeGreenText: {
    color: '#4ADE80',
    fontSize: 13,
    fontWeight: '700',
  },
  h1: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  sub: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
    marginBottom: 6,
  },
  sub2: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 22,
  },
  receipt: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
  },
  receiptTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
    gap: 8,
  },
  receiptRowLast: {
    borderBottomWidth: 0,
  },
  receiptLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    flex: 1,
  },
  receiptValue: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  important: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    padding: 14,
    marginBottom: 20,
  },
  importantTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  noteItemLast: {
    marginBottom: 0,
  },
  noteIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(124,58,237,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  noteIcon: {
    fontSize: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 21,
  },
  btnStart: {
    width: '100%',
    borderRadius: 50,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
    paddingVertical: 16,
  },
  btnStartText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
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
