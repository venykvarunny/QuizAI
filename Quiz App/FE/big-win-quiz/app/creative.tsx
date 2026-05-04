import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/contexts/auth-context';
import { AuthApiError, postSentimentAnalyze } from '@/lib/auth-client';

const TOTAL_SECONDS = 120;
const REQUIRED_WORDS = 25;

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function formatTime(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function CreativeSubmissionScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const timerDoneRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (secondsLeft > 0 || timerDoneRef.current) return;
    timerDoneRef.current = true;
    router.replace('/quiz-timeout');
  }, [router, secondsLeft]);

  const words = useMemo(() => countWords(response), [response]);
  const exactlyRequired = words === REQUIRED_WORDS;
  const wordsRemaining = REQUIRED_WORDS - words;
  const progress = Math.max(0, Math.min(1, secondsLeft / TOTAL_SECONDS));
  const warning = secondsLeft <= 20;

  const statusText = useMemo(() => {
    if (words === 0) return 'Begin typing your response above.';
    if (exactlyRequired) return 'Your response is valid and ready for submission.';
    if (words > REQUIRED_WORDS) {
      const overBy = words - REQUIRED_WORDS;
      return `Too many words — reduce by ${overBy} word${overBy === 1 ? '' : 's'}. Exactly ${REQUIRED_WORDS} required.`;
    }
    return `Your answer must be exactly ${REQUIRED_WORDS} words. (${wordsRemaining} more needed)`;
  }, [exactlyRequired, words, wordsRemaining]);

  const onSubmit = async () => {
    if (!exactlyRequired || submitting) return;
    if (!token) {
      Alert.alert('Session expired', 'Please sign in again to continue.', [
        { text: 'OK', onPress: () => router.replace('/register') },
      ]);
      return;
    }

    setSubmitting(true);
    try {
      await postSentimentAnalyze(token, { text: response });
      Alert.alert('Entry submitted', 'Your creative response has been analyzed.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      const message =
        err instanceof AuthApiError ? err.message : 'Failed to submit your response. Please try again.';
      Alert.alert('Submission failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient colors={['#08002E', '#12006E', '#1A0A7C']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Creative Submission</Text>
              <Text style={styles.headerSub}>Exactly 25 words required</Text>
            </View>
            <View style={[styles.timerBox, warning && styles.timerWarn]}>
              <Text style={styles.timerIcon}>⏱</Text>
              <Text style={[styles.timerValue, warning && styles.timerValueWarn]}>{formatTime(secondsLeft)}</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress * 100}%`,
                  backgroundColor: progress > 0.5 ? '#4ADE80' : progress > 0.2 ? '#F59E0B' : '#F87171',
                },
              ]}
            />
          </View>

          {warning ? (
            <Text style={styles.warningText}>Only {secondsLeft} seconds remaining — submit now.</Text>
          ) : null}

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.promptCard}>
              <Text style={styles.promptLabel}>Your prompt</Text>
              <Text style={styles.promptText}>
                "In exactly 25 words, tell us why you should win this prize."
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.fieldLabel}>Your Response</Text>
              <Text
                style={[
                  styles.wordCount,
                  exactlyRequired && styles.wordCountValid,
                  words > REQUIRED_WORDS && styles.wordCountOver,
                ]}>
                {words} / {REQUIRED_WORDS}
              </Text>
            </View>

            <TextInput
              style={[
                styles.input,
                exactlyRequired && styles.inputValid,
                words > REQUIRED_WORDS && styles.inputOver,
              ]}
              multiline
              value={response}
              onChangeText={setResponse}
              placeholder="Type your 25-word response here..."
              placeholderTextColor="rgba(255,255,255,0.35)"
              contextMenuHidden
            />

            <Text
              style={[
                styles.status,
                exactlyRequired && styles.statusValid,
                words > REQUIRED_WORDS && styles.statusOver,
                words > 0 && words < REQUIRED_WORDS && styles.statusWarn,
              ]}>
              {statusText}
            </Text>

            <Pressable
              style={[styles.submitBtn, (!exactlyRequired || submitting) && styles.submitBtnDisabled]}
              onPress={onSubmit}
              disabled={!exactlyRequired || submitting}>
              <Text style={[styles.submitBtnText, (!exactlyRequired || submitting) && styles.submitBtnTextDisabled]}>
                {submitting ? 'Submitting...' : 'Submit Entry →'}
              </Text>
            </Pressable>

            <View style={styles.pasteWarn}>
              <Text style={styles.pasteWarnText}>
                Paste is disabled in this entry mode. Please type your response.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(8,0,46,0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerTitle: { color: 'rgba(255,255,255,0.95)', fontSize: 14, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 2 },
  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  timerWarn: {
    borderColor: 'rgba(248,113,113,0.5)',
    backgroundColor: 'rgba(248,113,113,0.12)',
  },
  timerIcon: { fontSize: 14, color: '#fff' },
  timerValue: { color: '#fff', fontSize: 20, fontWeight: '900', minWidth: 52 },
  timerValueWarn: { color: '#F87171' },
  progressTrack: {
    marginHorizontal: 16,
    marginTop: 10,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 999 },
  warningText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '800',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 2,
  },
  content: { padding: 16, paddingBottom: 24 },
  promptCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  promptLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  promptText: { color: 'rgba(255,255,255,0.85)', fontStyle: 'italic', lineHeight: 24, fontSize: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  fieldLabel: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.92)' },
  wordCount: { fontSize: 14, fontWeight: '900', color: 'rgba(255,255,255,0.55)' },
  wordCountValid: { color: '#4ADE80' },
  wordCountOver: { color: '#F87171' },
  input: {
    minHeight: 140,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: '#fff',
    fontSize: 15,
    lineHeight: 24,
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  inputValid: { borderColor: '#4ADE80' },
  inputOver: { borderColor: '#F87171' },
  status: { minHeight: 20, marginTop: 10, marginBottom: 12, color: 'rgba(255,255,255,0.6)', fontSize: 13 },
  statusValid: { color: '#4ADE80' },
  statusWarn: { color: '#F59E0B' },
  statusOver: { color: '#F87171' },
  submitBtn: {
    width: '100%',
    minHeight: 52,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    marginBottom: 10,
  },
  submitBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.14)' },
  submitBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  submitBtnTextDisabled: { color: 'rgba(255,255,255,0.35)' },
  pasteWarn: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    backgroundColor: 'rgba(245,158,11,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pasteWarnText: { color: 'rgba(255,220,100,0.85)', fontSize: 12, lineHeight: 18 },
});
