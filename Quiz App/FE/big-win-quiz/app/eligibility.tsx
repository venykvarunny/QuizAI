import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const ITEMS = [
  'I confirm I am eligible to enter this competition.',
  'I understand a maximum of 10 entries is permitted per competition.',
  'I acknowledge that this is a competition of skill, not chance.',
] as const;

export default function EligibilityScreen() {
  const router = useRouter();
  const [checked, setChecked] = useState<boolean[]>(() => [false, false, false]);

  const count = useMemo(() => checked.filter(Boolean).length, [checked]);
  const allChecked = count === ITEMS.length;

  const toggle = (index: number) => {
    setChecked((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const onContinue = () => {
    if (!allChecked) return;
    router.push('/payment-success');
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

        <View style={styles.stepBar} accessibilityRole="none">
          <View style={styles.stepCol}>
            <View style={styles.stepNumDone}>
              <Text style={styles.stepNumDoneText}>✓</Text>
            </View>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepCol}>
            <View style={styles.stepNumDone}>
              <Text style={styles.stepNumDoneText}>✓</Text>
            </View>
          </View>
          <View style={styles.stepLine} />
          <View style={[styles.stepCol, styles.stepColWide]}>
            <View style={styles.stepNumActive}>
              <Text style={styles.stepNumActiveText}>3</Text>
            </View>
            <Text style={styles.stepLabel}>Eligibility</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepCol}>
            <View style={styles.stepNumFuture}>
              <Text style={styles.stepNumFutureText}>4</Text>
            </View>
          </View>
        </View>

        <View style={styles.main}>
          <Text style={styles.h1}>Entry Eligibility</Text>
          <Text style={styles.desc}>Please confirm the following before proceeding to payment.</Text>

          <View accessibilityRole="none" accessibilityLabel="Eligibility confirmations — all required">
            {ITEMS.map((label, index) => (
              <Pressable
                key={label}
                style={[styles.chkItem, checked[index] && styles.chkItemOn]}
                onPress={() => toggle(index)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: checked[index] }}>
                <View style={[styles.chkBox, checked[index] && styles.chkBoxOn]}>
                  {checked[index] ? (
                    <Text style={styles.chkTick}>✓</Text>
                  ) : null}
                </View>
                <Text style={styles.chkText}>{label}</Text>
              </Pressable>
            ))}
          </View>

          <View
            style={[styles.statusBox, allChecked ? styles.statusBoxOk : styles.statusBoxPending]}
            accessibilityLiveRegion="polite">
            <Text style={[styles.statusText, allChecked ? styles.statusTextOk : styles.statusTextPending]}>
              {allChecked
                ? '✓ All eligibility confirmations complete — proceed to payment.'
                : `☑ Please confirm all ${count} / ${ITEMS.length} items above to continue.`}
            </Text>
          </View>

          <Pressable
            style={[styles.btnPrimary, !allChecked && styles.btnPrimaryDisabled]}
            onPress={onContinue}
            disabled={!allChecked}>
            <Text style={[styles.btnPrimaryText, !allChecked && styles.btnPrimaryTextDisabled]}>
              Create Payment {'->'}
            </Text>
          </Pressable>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              <Text style={styles.infoStrong}>ℹ️ Important:</Text> Payment is processed into a designated
              competition trust account. Entries are recorded upon successful quiz completion and creative
              submission.
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
  stepBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    gap: 6,
  },
  stepCol: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    flex: 1,
  },
  stepColWide: {
    flex: 1.2,
  },
  stepLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    maxWidth: 24,
  },
  stepNumDone: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4ADE80',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumDoneText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '700',
  },
  stepNumActive: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumActiveText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
  stepNumFuture: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumFutureText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '700',
  },
  main: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  h1: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
  },
  desc: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  chkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  chkItemOn: {
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245,158,11,0.1)',
  },
  chkBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 7,
    marginTop: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chkBoxOn: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  chkTick: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },
  chkText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.85)',
    paddingTop: 2,
  },
  statusBox: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14,
  },
  statusBoxPending: {
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
  },
  statusBoxOk: {
    backgroundColor: 'rgba(74,222,128,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.3)',
  },
  statusText: {
    fontSize: 13,
    lineHeight: 20,
  },
  statusTextPending: {
    color: 'rgba(255,220,100,0.9)',
  },
  statusTextOk: {
    color: '#4ADE80',
  },
  btnPrimary: {
    width: '100%',
    backgroundColor: '#EA580C',
    borderRadius: 50,
    paddingVertical: 15,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 6,
  },
  btnPrimaryDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    shadowOpacity: 0,
    elevation: 0,
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
  btnPrimaryTextDisabled: {
    color: 'rgba(255,255,255,0.3)',
  },
  infoBox: {
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoText: {
    fontSize: 13,
    color: 'rgba(180,210,255,0.8)',
    lineHeight: 21,
  },
  infoStrong: {
    color: 'rgba(255,255,255,0.9)',
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
