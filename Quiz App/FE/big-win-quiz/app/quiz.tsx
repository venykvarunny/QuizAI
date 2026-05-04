import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/contexts/auth-context';
import {
  AuthApiError,
  postQuizAnswer,
  postQuizStart,
  postQuizTimeout,
  type QuizCurrentResponse,
} from '@/lib/auth-client';

/** Client-side time per question (seconds). */
const QUESTION_TIME_SEC = 15;
const WARN_LAST_SEC = 30;

export default function QuizScreen() {
  const router = useRouter();
  const { token, ready } = useAuth();
  const timeoutHandledRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [current, setCurrent] = useState<QuizCurrentResponse | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(QUESTION_TIME_SEC);
  const [selected, setSelected] = useState<string | null>(null);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    if (!ready) return;

    const load = async () => {
      if (!token) {
        setLoading(false);
        setErrorText('Please log in to start the quiz.');
        return;
      }
      setLoading(true);
      setErrorText('');
      try {
        // POST /quiz/start creates a new attempt or resumes in-progress (200/201).
        // Do not call GET /quiz/current first — it returns 404 until an attempt exists.
        const payload = await postQuizStart(token);
        if (payload.hasPassedQuiz) {
          router.replace('/dashboard');
          return;
        }
        setCurrent(payload);
        setSecondsLeft(QUESTION_TIME_SEC);
      } catch (err) {
        if (err instanceof AuthApiError) {
          setErrorText(err.message);
        } else {
          setErrorText('Failed to load quiz.');
        }
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [token, ready, router]);

  useEffect(() => {
    timeoutHandledRef.current = false;
  }, [current?.question.id]);

  useEffect(() => {
    if (!current || loading || submitting) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [current, loading, submitting]);

  useEffect(() => {
    if (!current || loading || secondsLeft > 0 || submitting || !token) return;
    if (timeoutHandledRef.current) return;
    timeoutHandledRef.current = true;

    const submitTimeout = async () => {
      try {
        await postQuizTimeout(token, {
          attemptId: current.attemptId,
          questionId: current.question.id,
        });
      } catch {
        /* ignore and continue to timeout screen */
      }
      router.replace('/quiz-timeout');
    };
    void submitTimeout();
  }, [current, secondsLeft, token, loading, submitting, router]);

  const timePercent = useMemo(() => {
    return (secondsLeft / QUESTION_TIME_SEC) * 100;
  }, [secondsLeft]);
  const warning = secondsLeft <= WARN_LAST_SEC;
  const questionProgress = useMemo(() => {
    if (!current) return 0;
    return (current.questionNumber / current.totalQuestions) * 100;
  }, [current]);

  const onNext = async () => {
    if (!selected || !current || !token) return;
    setSubmitting(true);
    setErrorText('');
    try {
      const timeTakenSec = QUESTION_TIME_SEC - secondsLeft;
      const response = await postQuizAnswer(token, {
        attemptId: current.attemptId,
        questionId: current.question.id,
        selectedOptionId: selected,
        timeTakenSec: Math.max(0, timeTakenSec),
      });

      if (response.attemptStatus === 'failed' || response.result === 'incorrect') {
        router.replace('/quiz-incorrect');
        return;
      }

      if (response.attemptStatus === 'passed') {
        router.replace('/quiz-success');
        return;
      }

      if (response.nextQuestion) {
        setCurrent({
          attemptId: current.attemptId,
          attemptNumber: response.nextQuestion.attemptNumber ?? current.attemptNumber,
          questionNumber: response.nextQuestion.questionNumber,
          totalQuestions: response.nextQuestion.totalQuestions,
          timeLimitSec: response.nextQuestion.timeLimitSec,
          question: response.nextQuestion.question,
        });
        setSelected(null);
        setSecondsLeft(QUESTION_TIME_SEC);
      }
    } catch (err) {
      if (err instanceof AuthApiError) {
        Alert.alert('Answer error', err.message, [{ text: 'OK', onPress: () => router.replace('/') }]);
      } else {
        Alert.alert('Answer error', 'Failed to submit answer.', [{ text: 'OK', onPress: () => router.replace('/') }]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#fff" />
          <Text style={styles.loadingText}>Loading quiz...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!current) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrap}>
          <Text style={styles.errorBanner}>{errorText || 'No active quiz found.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (secondsLeft <= 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrap}>
          <Text style={styles.errorBanner}>Time is up. Finalizing your attempt...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headRow}>
            <View>
              <Text style={styles.stage}>Qualification Quiz</Text>
              <Text style={styles.qNum}>
                Question {current.questionNumber} of {current.totalQuestions} · 100% pass required
              </Text>
            </View>
            <View style={[styles.timerBox, warning && styles.timerBoxWarn]}>
              <Text style={styles.timerEmoji}>⏱</Text>
              <Text style={[styles.timerValue, warning && styles.timerValueWarn]}>{secondsLeft}</Text>
              <Text style={styles.timerUnit}>sec</Text>
            </View>
          </View>

          <View style={styles.progressOuter}>
            <View style={[styles.progressFill, { width: `${questionProgress}%` }]} />
          </View>
          <View style={styles.timeOuter}>
            <View style={[styles.timeFill, { width: `${timePercent}%` }, warning && styles.timeFillWarn]} />
          </View>
          {warning ? (
            <View style={styles.warnAlert}>
              <Text style={styles.warnText}>⚠ Time is running out — answer now!</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.main}>
          <View style={styles.metaRow}>
            <Text style={styles.qType}>Multiple Choice</Text>
            <Text style={styles.monitor}>👁 Session monitored</Text>
          </View>

          {current.attemptNumber != null ? (
            <Text style={styles.attemptLine}>Attempt {current.attemptNumber}</Text>
          ) : null}

          <Text style={styles.question}>{current.question.text}</Text>

          {current.question.options.map((opt) => (
            <Pressable
              key={opt.id}
              style={[styles.option, selected === opt.id && styles.optionSelected]}
              onPress={() => setSelected(opt.id)}>
              <View style={[styles.optionLetter, selected === opt.id && styles.optionLetterSelected]}>
                <Text style={[styles.optionLetterText, selected === opt.id && styles.optionLetterTextSelected]}>
                  {opt.label}
                </Text>
              </View>
              <Text style={styles.optionText}>{opt.text}</Text>
            </Pressable>
          ))}

          <Text style={styles.hint}>{selected ? '' : 'Select an answer to continue'}</Text>

          {!!errorText ? <Text style={styles.errorBanner}>{errorText}</Text> : null}

          <Pressable
            style={[styles.nextBtn, (!selected || submitting) && styles.nextBtnDisabled]}
            onPress={onNext}
            disabled={!selected || submitting}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.nextBtnText, !selected && styles.nextBtnTextDisabled]}>
                Next Question {'->'}
              </Text>
            )}
          </Pressable>

          <Text style={styles.antiCheat}>🛡 Anti-cheat monitoring active · Do not navigate away</Text>
        </View>

        <Text style={styles.footer}>Pure skill. One prize. One winner.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#08002E' },
  scroll: { paddingBottom: 20 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 20 },
  loadingText: { color: '#fff', fontSize: 14 },
  header: {
    backgroundColor: 'rgba(8,0,46,0.95)',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  stage: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
  qNum: { fontSize: 12, color: 'rgba(255,255,255,0.45)' },
  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  timerBoxWarn: { borderColor: 'rgba(248,113,113,0.4)', backgroundColor: 'rgba(248,113,113,0.1)' },
  timerEmoji: { fontSize: 13 },
  timerValue: { fontSize: 20, fontWeight: '900', color: '#fff' },
  timerValueWarn: { color: '#F87171' },
  timerUnit: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  progressOuter: { height: 6, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', backgroundColor: '#7C3AED', borderRadius: 6 },
  timeOuter: { height: 4, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  timeFill: { height: '100%', borderRadius: 4, backgroundColor: '#4ADE80' },
  timeFillWarn: { backgroundColor: '#F87171' },
  warnAlert: {
    marginTop: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.3)',
    backgroundColor: 'rgba(248,113,113,0.15)',
  },
  warnText: { color: '#F87171', fontSize: 12, fontWeight: '700' },
  main: { paddingHorizontal: 16, paddingTop: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  qType: {
    backgroundColor: 'rgba(124,58,237,0.25)',
    color: '#C4B5FD',
    fontSize: 11,
    fontWeight: '700',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 99,
    textTransform: 'uppercase',
  },
  monitor: { fontSize: 12, color: 'rgba(255,255,255,0.35)' },
  attemptLine: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(196,181,253,0.95)',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  question: { fontSize: 15, fontWeight: '700', color: 'rgba(255,255,255,0.95)', lineHeight: 24, marginBottom: 18 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 13,
    marginBottom: 10,
  },
  optionSelected: { borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.1)' },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetterSelected: { backgroundColor: '#F59E0B' },
  optionLetterText: { color: 'rgba(255,255,255,0.5)', fontWeight: '900', fontSize: 14 },
  optionLetterTextSelected: { color: '#fff' },
  optionText: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  hint: { textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.35)', marginVertical: 8 },
  nextBtn: {
    width: '100%',
    minHeight: 52,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    marginTop: 2,
    marginBottom: 6,
  },
  nextBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.1)' },
  nextBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  nextBtnTextDisabled: { color: 'rgba(255,255,255,0.3)' },
  antiCheat: { textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 8 },
  errorBanner: {
    marginTop: 6,
    textAlign: 'center',
    color: '#fca5a5',
    fontSize: 12,
    marginBottom: 4,
  },
  footer: {
    marginTop: 12,
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
