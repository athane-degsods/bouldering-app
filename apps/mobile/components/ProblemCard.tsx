import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, gradeColor, radius, mono } from '../constants/theme';
import { Problem } from '../types/models';

export default function ProblemCard({
  problem,
  onPress,
}: {
  problem: Problem;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.thumb}>
        {problem.imageUrl ? (
          <Image source={{ uri: problem.imageUrl }} style={StyleSheet.absoluteFill} />
        ) : null}
        <View style={[styles.gradeTab, { backgroundColor: gradeColor(problem.grade) }]}>
          <Text style={styles.gradeTabText}>{problem.grade}</Text>
        </View>
      </View>
      <Text style={styles.name} numberOfLines={1}>{problem.name}</Text>
      <Text style={styles.meta}>{problem.attempts} attempt{problem.attempts === 1 ? '' : 's'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 128,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: {
    width: '100%',
    height: 84,
    borderRadius: radius.md,
    marginBottom: 8,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  gradeTab: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  gradeTabText: { color: '#fff', fontSize: 9, fontWeight: '700', fontFamily: mono },
  name: { fontSize: 11, fontWeight: '700', color: colors.wall, marginBottom: 2 },
  meta: { fontSize: 9, color: colors.textMuted, fontFamily: mono },
});
