import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius, spacing } from '@/theme/tokens';

type Props = {
  canUndo: boolean;
  onUndo: () => void;
  onClear: () => void;
};

function ToolButton({
  label,
  icon,
  disabled,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.tool, disabled && styles.disabled, pressed && styles.pressed]}
    >
      <Ionicons color={colors.textSecondary} name={icon} size={17} />
      <Text style={styles.toolLabel}>{label}</Text>
    </Pressable>
  );
}

export function CanvasToolbar({ canUndo, onUndo, onClear }: Props) {
  return (
    <View style={styles.row}>
      <ToolButton disabled={!canUndo} icon="arrow-undo-outline" label="Undo" onPress={onUndo} />
      <ToolButton disabled={!canUndo} icon="trash-outline" label="Clear" onPress={onClear} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  tool: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },
  toolLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
  disabled: { opacity: 0.35 },
  pressed: { opacity: 0.7 },
});
