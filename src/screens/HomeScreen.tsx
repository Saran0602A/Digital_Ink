import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { INK_LANGUAGES, type InkLanguage } from '@/constants/languages';
import { useRecognitionSession } from '@/contexts/RecognitionSessionContext';
import { colors, radius, spacing } from '@/theme/tokens';

export default function HomeScreen() {
  const router = useRouter();
  const { setSelectedLanguage } = useRecognitionSession();

  const openWritingScreen = (language: InkLanguage) => {
    setSelectedLanguage(language);
    router.push('/write');
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#DDF3F5', '#F4F7FB']} style={styles.hero}>
          <View style={styles.logo}>
            <Ionicons color={colors.white} name="pulse" size={27} />
          </View>
          <Text style={styles.eyebrow}>CLINICAL INK</Text>
          <Text style={styles.title}>Turn handwriting into editable text</Text>
          <Text style={styles.subtitle}>
            Choose the language you plan to write. The full-screen writing pad will open immediately.
          </Text>
          <View style={styles.privateBadge}>
            <Ionicons color={colors.success} name="shield-checkmark" size={16} />
            <Text style={styles.privateText}>On-device recognition</Text>
          </View>
        </LinearGradient>

        <View>
          <Text style={styles.sectionTitle}>Choose writing language</Text>
          <Text style={styles.sectionHint}>Tap a language to start writing</Text>
        </View>

        <View style={styles.languageList}>
          {INK_LANGUAGES.map((language) => (
            <Pressable
              accessibilityHint="Opens the full-screen handwriting pad"
              accessibilityRole="button"
              key={language.tag}
              onPress={() => openWritingScreen(language)}
              style={({ pressed }) => [styles.languageCard, pressed && styles.pressed]}
            >
              <View style={styles.languageIcon}>
                <Ionicons color={colors.primary} name="language" size={22} />
              </View>
              <View style={styles.languageText}>
                <Text style={styles.nativeLabel}>{language.nativeLabel}</Text>
                {language.nativeLabel !== language.label ? (
                  <Text style={styles.languageLabel}>{language.label}</Text>
                ) : (
                  <Text style={styles.languageLabel}>{language.tag}</Text>
                )}
              </View>
              <Ionicons color={colors.primary} name="arrow-forward-circle" size={26} />
            </Pressable>
          ))}
        </View>

        <View style={styles.tip}>
          <Ionicons color={colors.textSecondary} name="information-circle-outline" size={19} />
          <Text style={styles.tipText}>
            The first use of a language downloads its model. After that, recognition works offline.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { gap: spacing.xl, padding: spacing.lg, paddingBottom: spacing.xxxl },
  hero: { borderRadius: radius.lg, padding: spacing.xxl },
  logo: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 52,
    justifyContent: 'center',
    marginBottom: spacing.xl,
    width: 52,
  },
  eyebrow: { color: colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: colors.text, fontSize: 27, fontWeight: '800', letterSpacing: -0.7, lineHeight: 33, marginTop: spacing.sm },
  subtitle: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: spacing.md },
  privateBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.successSoft,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  privateText: { color: colors.success, fontSize: 12, fontWeight: '700' },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  sectionHint: { color: colors.textSecondary, fontSize: 12, marginTop: spacing.xs },
  languageList: { gap: spacing.md },
  languageCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 76,
    padding: spacing.md,
  },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
  languageIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  languageText: { flex: 1, marginLeft: spacing.md },
  nativeLabel: { color: colors.text, fontSize: 16, fontWeight: '800' },
  languageLabel: { color: colors.textSecondary, fontSize: 11, marginTop: 3 },
  tip: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.sm },
  tipText: { color: colors.textSecondary, flex: 1, fontSize: 12, lineHeight: 18 },
});
