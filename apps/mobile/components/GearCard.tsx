import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, conditionColor, conditionLabel, radius, mono } from '../constants/theme';
import { Accessory, AccessoryCategory } from '../types/models';

const categoryIcon: Record<AccessoryCategory, keyof typeof Feather.glyphMap> = {
  shoes: 'triangle',
  chalk: 'square',
  harness: 'anchor',
  other: 'circle',
};

export default function GearCard({
  accessory,
  onPress,
}: {
  accessory: Accessory;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8} disabled={!onPress}>
      <View style={styles.iconWrap}>
        <Feather name={categoryIcon[accessory.category]} size={20} color="#4A453D" />
      </View>
      <Text style={styles.name} numberOfLines={2}>{accessory.name}</Text>
      <Text style={styles.cat}>{accessory.category}</Text>
      <View style={[styles.conditionTab, { backgroundColor: conditionColor(accessory.condition) }]}>
        <Text style={styles.conditionText}>{conditionLabel(accessory.condition)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export function AddGearCard({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.addCard} onPress={onPress} activeOpacity={0.7}>
      <Feather name="plus" size={18} color={colors.textMuted} />
      <Text style={styles.addText}>Add gear</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 108,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: '100%',
    height: 62,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  name: { fontSize: 10.5, fontWeight: '700', color: colors.wall, marginBottom: 2, lineHeight: 14 },
  cat: { fontSize: 9, color: colors.textMuted, fontFamily: mono, marginBottom: 6, textTransform: 'capitalize' },
  conditionTab: { alignSelf: 'flex-start', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
  conditionText: { fontSize: 8.5, fontWeight: '700', color: '#fff', fontFamily: mono },
  addCard: {
    width: 108,
    height: 128,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(32,30,28,0.22)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addText: { fontSize: 9.5, fontWeight: '700', color: colors.textMuted },
});
