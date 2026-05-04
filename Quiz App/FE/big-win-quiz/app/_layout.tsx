import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ title: 'Register' }} />
          <Stack.Screen name="email-verify" options={{ headerShown: false }} />
          <Stack.Screen name="eligibility" options={{ headerShown: false }} />
          <Stack.Screen name="payment-success" options={{ headerShown: false }} />
          <Stack.Screen name="dashboard" options={{ headerShown: false, title: 'Dashboard' }} />
          <Stack.Screen name="creative" options={{ headerShown: false }} />
          <Stack.Screen name="quiz" options={{ headerShown: false }} />
          <Stack.Screen name="quiz-incorrect" options={{ headerShown: false }} />
          <Stack.Screen name="quiz-timeout" options={{ headerShown: false }} />
          <Stack.Screen name="quiz-success" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
