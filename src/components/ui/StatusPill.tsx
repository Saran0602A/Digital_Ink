import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { ModelStatus } from '@/hooks/useDigitalInk';
import { colors, radius, spacing } from '@/theme/tokens';

const statusContent: Record<ModelStatus, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  checking: { label: 'Checking model', icon: 'sync' },
  downloading: { label: 'Preparing model', icon: 'cloud-download-outline' },
  ready: { label: 'Offline model ready', icon: 'checkmark-circle' },
  unavailable: { label: 'Development build needed', icon: 'construct-outline' },
  error: { label: 'Model unavailable', icon: 'alert-circle-outline' },
};

export function StatusPill({ status }: { status: ModelStatus }) {
  const content = statusContent[status];
  const isReady = status === 'ready';
  const isError = status === 'error';

  return (
    <View style={[styles.pill, isReady && styles.ready, isError && styles.error]}>
      <Ionicons
        color={isReady ? colors.success : isError ? colors.danger : colors.primary}
        name={content.icon}
        size={15}
      />
      <Text style={[styles.label, isReady && styles.readyLabel, isError && styles.errorLabel]}>
        {content.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  ready: { backgroundColor: colors.successSoft },
  error: { backgroundColor: colors.dangerSoft },
  label: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  readyLabel: { color: colors.success },
  errorLabel: { color: colors.danger },
});
