import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { CanvasToolbar } from '@/components/ink/CanvasToolbar';
import { InkCanvas } from '@/components/ink/InkCanvas';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useRecognitionSession } from '@/contexts/RecognitionSessionContext';
import { useDigitalInk } from '@/hooks/useDigitalInk';
import { useInkCanvas } from '@/hooks/useInkCanvas';
import { colors, radius, spacing } from '@/theme/tokens';

export default function HandwritingScreen() {
  const router = useRouter();
  const session = useRecognitionSession();
  const language = session.selectedLanguage;
  const canvas = useInkCanvas();
  const digitalInk = useDigitalInk(language.tag);

  const handleClear = () => {
    canvas.clear();
    digitalInk.clearError();
  };

  const handleRecognize = async () => {
    try {
      const result = await digitalInk.recognize({
        ink: { strokes: canvas.strokes },
        languageTag: language.tag,
        writingArea: canvas.writingArea,
      });

      canvas.clear();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      session.setResult({ candidates: result.candidates, language: language.label });
      router.push('/result');
    } catch (caught) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = caught instanceof Error ? caught.message : 'Recognition failed. Please try again.';
      Alert.alert('Unable to convert handwriting', message);
    }
  };

  const modelIsLoading =
    digitalInk.modelStatus === 'checking' || digitalInk.modelStatus === 'downloading';

  const returnHome = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/');
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityLabel="Back to home"
          hitSlop={10}
          onPress={returnHome}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Ionicons color={colors.text} name="arrow-back" size={24} />
        </Pressable>
      </View>

      <InkCanvas
        onAreaChange={canvas.setWritingArea}
        onStrokeEnd={canvas.addStroke}
        strokes={canvas.strokes}
        style={styles.canvas}
      />

      <View style={styles.bottomBar}>
        <CanvasToolbar canUndo={canvas.hasInk} onClear={handleClear} onUndo={canvas.undo} />
        <PrimaryButton
          disabled={!canvas.hasInk || digitalInk.modelStatus !== 'ready'}
          label={modelIsLoading ? 'Preparing…' : 'Convert'}
          loading={digitalInk.isRecognizing || modelIsLoading}
          onPress={handleRecognize}
          style={styles.convertButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.surface, flex: 1 },
  topBar: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  pressed: { opacity: 0.65 },
  canvas: { borderRadius: 0, borderWidth: 0, minHeight: 0 },
  bottomBar: {
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  convertButton: { flex: 1, marginTop: spacing.md },
});
