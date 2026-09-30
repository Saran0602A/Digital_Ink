import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useRecognitionSession } from '@/contexts/RecognitionSessionContext';
import { colors, radius, spacing } from '@/theme/tokens';

export default function RecognitionResultScreen() {
  const router = useRouter();
  const { result } = useRecognitionSession();
  const initialText = result?.candidates[0] ?? '';
  const [reviewedText, setReviewedText] = useState(initialText);
  const candidates = result?.candidates.slice(1, 4) ?? [];

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Back to handwriting"
          hitSlop={10}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons color={colors.text} name="arrow-back" size={23} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>RECOGNITION COMPLETE</Text>
          <Text style={styles.title}>Review converted text</Text>
        </View>
        <View style={styles.successIcon}>
          <Ionicons color={colors.success} name="checkmark-circle" size={25} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.summary}>
          <Ionicons color={colors.primary} name="language-outline" size={20} />
          <View>
            <Text style={styles.summaryLabel}>Recognized language</Text>
            <Text style={styles.summaryValue}>{result?.language ?? 'Selected language'}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Converted text</Text>
              <Text style={styles.cardHint}>Review and correct the result before using it</Text>
            </View>
            <Ionicons color={colors.primary} name="create-outline" size={21} />
          </View>

          <TextInput
            accessibilityLabel="Recognized clinical text"
            multiline
            onChangeText={setReviewedText}
            placeholder="No text was recognized"
            placeholderTextColor="#91A0A8"
            style={styles.textInput}
            textAlignVertical="top"
            value={reviewedText}
          />

          {candidates.length ? (
            <View style={styles.alternatives}>
              <Text style={styles.alternativeLabel}>Alternative matches</Text>
              <View style={styles.alternativeList}>
                {candidates.map((candidate, index) => (
                  <Pressable
                    key={`${candidate}-${index}`}
                    onPress={() => setReviewedText(candidate)}
                    style={styles.alternative}
                  >
                    <Text style={styles.alternativeText}>{candidate}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.privacyNote}>
          <Ionicons color={colors.success} name="shield-checkmark-outline" size={20} />
          <Text style={styles.privacyText}>
            Recognition happened on this device. This prototype does not upload or save the note.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.writeAgainButton}>
          <Ionicons color={colors.white} name="pencil-outline" size={19} />
          <Text style={styles.writeAgainText}>Back to writing</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  header: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerText: { flex: 1, marginLeft: spacing.md },
  eyebrow: { color: colors.success, fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: colors.text, fontSize: 19, fontWeight: '800', marginTop: 2 },
  successIcon: { paddingLeft: spacing.sm },
  content: { gap: spacing.lg, padding: spacing.lg, paddingBottom: spacing.xxxl },
  summary: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  summaryLabel: { color: colors.textSecondary, fontSize: 10, fontWeight: '700' },
  summaryValue: { color: colors.primaryDark, fontSize: 14, fontWeight: '800', marginTop: 2 },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  cardTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  cardHint: { color: colors.textSecondary, fontSize: 11, marginTop: 3 },
  textInput: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 17,
    lineHeight: 26,
    minHeight: 210,
    padding: spacing.lg,
  },
  alternatives: { marginTop: spacing.lg },
  alternativeLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: '700' },
  alternativeList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  alternative: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
  },
  alternativeText: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  privacyNote: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.sm },
  privacyText: { color: colors.textSecondary, flex: 1, fontSize: 12, lineHeight: 18 },
  bottomBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    padding: spacing.lg,
  },
  writeAgainButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 52,
  },
  writeAgainText: { color: colors.white, fontSize: 16, fontWeight: '800' },
});
