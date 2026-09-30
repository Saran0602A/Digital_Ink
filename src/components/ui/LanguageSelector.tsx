import { ScrollView, Pressable, StyleSheet, Text } from 'react-native';

import type { InkLanguage } from '@/constants/languages';
import { colors, radius, spacing } from '@/theme/tokens';

type Props = {
  languages: InkLanguage[];
  selectedTag: string;
  onSelect: (language: InkLanguage) => void;
};

export function LanguageSelector({ languages, selectedTag, onSelect }: Props) {
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {languages.map((language) => {
        const selected = language.tag === selectedTag;
        return (
          <Pressable
            accessibilityRole="button"
            key={language.tag}
            onPress={() => onSelect(language)}
            style={[styles.option, selected && styles.selectedOption]}
          >
            <Text style={[styles.nativeLabel, selected && styles.selectedLabel]}>
              {language.nativeLabel}
            </Text>
            {language.nativeLabel !== language.label ? (
              <Text style={[styles.label, selected && styles.selectedLabel]}>{language.label}</Text>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.sm, paddingRight: spacing.lg },
  option: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 54,
    minWidth: 92,
    paddingHorizontal: spacing.md,
  },
  selectedOption: { backgroundColor: colors.primary, borderColor: colors.primary },
  nativeLabel: { color: colors.text, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  label: { color: colors.textSecondary, fontSize: 10, marginTop: 1, textAlign: 'center' },
  selectedLabel: { color: colors.white },
});
