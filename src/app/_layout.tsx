import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { RecognitionSessionProvider } from '@/contexts/RecognitionSessionContext';
import { colors } from '@/theme/tokens';

export default function RootLayout() {
  return (
    <RecognitionSessionProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </RecognitionSessionProvider>
  );
}
