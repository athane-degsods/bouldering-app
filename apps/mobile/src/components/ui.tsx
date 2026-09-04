import { type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { colors, radius, space, type } from '../theme';
import type { Ascent } from '../api/client';

export function Screen({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

type BtnProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function PrimaryButton({ label, onPress, disabled }: BtnProps) {
  return (
    <Pressable
      style={[styles.primaryBtn, disabled && styles.btnDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.primaryBtnText}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, disabled }: BtnProps) {
  return (
    <Pressable
      style={[styles.secondaryBtn, disabled && styles.btnDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.secondaryBtnText}>{label}</Text>
    </Pressable>
  );
}

export function DangerButton({ label, onPress, disabled }: BtnProps) {
  return (
    <Pressable
      style={[styles.dangerBtn, disabled && styles.btnDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.dangerBtnText}>{label}</Text>
    </Pressable>
  );
}

export function StatusBadge({ completed }: { completed: boolean }) {
  return (
    <View style={[styles.badge, completed ? styles.sendBadge : styles.projectBadge]}>
      <Text style={[styles.badgeText, completed ? styles.sendText : styles.projectText]}>
        {completed ? 'SEND' : 'project'}
      </Text>
    </View>
  );
}

export function GradeChip({ grade }: { grade: string }) {
  return (
    <View style={styles.gradeChip}>
      <Text style={styles.gradeText}>{grade}</Text>
    </View>
  );
}

export function Field({
  label,
  ...input
}: { label: string } & TextInputProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        {...input}
        style={[styles.input, input.multiline && styles.inputMultiline, input.style]}
      />
    </View>
  );
}

export function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.section}>{children}</Text>;
}

export function Hint({ children }: { children: ReactNode }) {
  return <Text style={styles.hint}>{children}</Text>;
}

export function ErrorText({ children }: { children?: ReactNode }) {
  if (!children) {
    return null;
  }
  return <Text style={styles.error}>{children}</Text>;
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function LoadingBlock() {
  return <ActivityIndicator color={colors.primary} style={styles.centerPad} />;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '';
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ClimbCard({ item, onPress }: { item: Ascent; onPress: () => void }) {
  const attemptsLabel = item.attempts === 1 ? '1 attempt' : `${item.attempts} attempts`;
  const hasPhoto = (item.imageKeys?.length ?? 0) > 0;
  const hasVideo = Boolean(item.videoKey);

  return (
    <Pressable style={styles.climbCard} onPress={onPress}>
      <View style={styles.climbTop}>
        <Text style={styles.climbName} numberOfLines={1}>
          {item.routeName}
        </Text>
        <GradeChip grade={item.grade} />
      </View>
      <View style={styles.climbMetaRow}>
        <StatusBadge completed={item.completed} />
        <Text style={styles.hint}>
          {attemptsLabel}
          {hasPhoto ? '  ·  photo' : ''}
          {hasVideo ? '  ·  clip' : ''}
        </Text>
        <Text style={styles.hint}>{formatDate(item.createdAt)}</Text>
      </View>
      {item.notes ? (
        <Text style={styles.climbNotes} numberOfLines={2}>
          {item.notes}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.lg,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: colors.primaryText,
    fontWeight: '600',
    fontSize: type.body,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: colors.ink,
    fontWeight: '600',
    fontSize: type.body,
  },
  dangerBtn: {
    backgroundColor: colors.dangerBg,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dangerBtnText: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: type.body,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  sendBadge: {
    backgroundColor: colors.sendBg,
  },
  projectBadge: {
    backgroundColor: colors.projectBg,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  sendText: {
    color: colors.sendText,
  },
  projectText: {
    color: colors.projectText,
  },
  gradeChip: {
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  gradeText: {
    fontWeight: '700',
    color: colors.ink,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: type.meta,
    fontWeight: '600',
    color: colors.muted,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: type.body,
    color: colors.ink,
  },
  inputMultiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  section: {
    fontSize: type.section,
    fontWeight: '700',
    color: colors.ink,
    marginTop: space.sm,
  },
  hint: {
    color: colors.muted,
    fontSize: type.meta,
  },
  error: {
    color: colors.danger,
    fontSize: type.meta,
  },
  empty: {
    padding: space.xl,
    alignItems: 'center',
    gap: space.sm,
  },
  emptyTitle: {
    fontSize: type.section,
    fontWeight: '600',
    color: colors.ink,
  },
  centerPad: {
    marginTop: 32,
  },
  climbCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.md,
    gap: 8,
  },
  climbTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: space.sm,
  },
  climbName: {
    flex: 1,
    fontSize: type.body,
    fontWeight: '700',
    color: colors.ink,
  },
  climbMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    flexWrap: 'wrap',
  },
  climbNotes: {
    color: colors.muted,
    fontSize: type.meta,
  },
});
