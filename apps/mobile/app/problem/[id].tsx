import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import TallyMarks from '../../components/TallyMarks';
import { getProblems, getAccessories, updateProblem, deleteProblem } from '../../utils/storage';
import { Problem, Accessory } from '../../types/models';
import { colors, gradeColor, mono, radius } from '../../constants/theme';

export default function ProblemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [accessories, setAccessories] = useState<Accessory[]>([]);

  const loadData = useCallback(() => {
    getProblems().then(problems => setProblem(problems.find(p => p._id === id) || null));
    getAccessories().then(setAccessories);
  }, [id]);

  useFocusEffect(loadData);

  if (!problem) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: colors.textMuted }}>Problem not found.</Text>
      </View>
    );
  }

  const usedAccessories = accessories.filter(a => problem.accessoryIds?.includes(a._id));

  const toggleStatus = () => {
    const next = problem.status === 'working' ? 'sent' : 'working';
    updateProblem(problem._id, { status: next });
    setProblem({ ...problem, status: next });
  };

  const handleDelete = () => {
    Alert.alert('Delete problem', `Remove "${problem.name}"? This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteProblem(problem._id);
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{problem.name}</Text>
        <Text style={styles.title}>Problem</Text>
      </View>

      {/* Photo */}
      <View style={styles.photo}>
        {problem.imageUrl ? (
          <Image source={{ uri: problem.imageUrl }} style={StyleSheet.absoluteFill} />
        ) : null}
        <View style={[styles.gradeTab, { backgroundColor: gradeColor(problem.grade) }]}>
          <Text style={styles.gradeTabText}>{problem.grade}</Text>
        </View>
        <TouchableOpacity
          style={styles.editPillDark}
          onPress={() => router.push(`/problem/upload?id=${problem._id}`)}
        >
          <Feather name="edit-2" size={11} color="#fff" />
          <Text style={styles.editPillDarkText}>Update photo</Text>
        </TouchableOpacity>
      </View>

      {/* Meta data */}
      <View style={styles.block}>
        <View style={styles.blockHeader}>
          <Text style={styles.blockTitle}>Meta data</Text>
          <TouchableOpacity style={styles.editPill} onPress={() => router.push(`/problem/upload?id=${problem._id}`)}>
            <Feather name="edit-2" size={10} color={colors.accent} />
            <Text style={styles.editPillText}>Update</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Attempts</Text>
            <TallyMarks count={problem.attempts} />
          </View>
          <TouchableOpacity style={styles.metaItem} onPress={toggleStatus}>
            <Text style={styles.metaLabel}>Status</Text>
            <Text style={styles.metaValue}>{problem.status === 'sent' ? 'Sent ✓' : 'Working'}</Text>
          </TouchableOpacity>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Added</Text>
            <Text style={styles.metaValue}>
              {new Date(problem.dateAdded).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </Text>
          </View>
        </View>
      </View>

      {/* Comment */}
      <View style={styles.block}>
        <View style={styles.blockHeader}>
          <Text style={styles.blockTitle}>Comment</Text>
          <TouchableOpacity style={styles.editPill} onPress={() => router.push(`/problem/upload?id=${problem._id}`)}>
            <Feather name="edit-2" size={10} color={colors.accent} />
            <Text style={styles.editPillText}>Update</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.commentText}>{problem.notes || 'No comment added yet.'}</Text>
      </View>

      {/* Accessories used */}
      <View style={styles.block}>
        <View style={styles.blockHeader}>
          <Text style={styles.blockTitle}>Accessories used</Text>
          <TouchableOpacity style={styles.editPill} onPress={() => router.push(`/problem/upload?id=${problem._id}`)}>
            <Feather name="plus" size={10} color={colors.accent} />
            <Text style={styles.editPillText}>Update</Text>
          </TouchableOpacity>
        </View>
        {usedAccessories.length === 0 ? (
          <Text style={styles.commentText}>No gear tagged for this problem.</Text>
        ) : (
          <View style={styles.chipRow}>
            {usedAccessories.map(a => (
              <View key={a._id} style={styles.chip}>
                <Text style={styles.chipText}>{a.name}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Feather name="trash-2" size={14} color={colors.tapeRed} />
        <Text style={styles.deleteText}>Delete problem</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.chalk },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.chalk },
  header: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 10 },
  eyebrow: { fontFamily: mono, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: colors.textMuted },
  title: { fontSize: 22, fontWeight: '800', color: colors.wall, marginTop: 2, textTransform: 'uppercase' },
  photo: { height: 170, borderRadius: radius.lg, marginHorizontal: 18, marginBottom: 12, backgroundColor: colors.surfaceMuted, overflow: 'hidden' },
  gradeTab: { position: 'absolute', top: 10, left: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  gradeTabText: { color: '#fff', fontSize: 10, fontWeight: '700', fontFamily: mono },
  editPillDark: { position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(32,30,28,0.75)', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999 },
  editPillDarkText: { color: '#fff', fontSize: 9, fontWeight: '700', fontFamily: mono },
  block: { marginHorizontal: 18, marginBottom: 12, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: colors.border },
  blockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  blockTitle: { fontSize: 10.5, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, color: colors.textMuted },
  editPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.accentSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  editPillText: { fontFamily: mono, fontSize: 9, fontWeight: '700', color: colors.accent },
  metaGrid: { flexDirection: 'row', gap: 8 },
  metaItem: { flex: 1 },
  metaLabel: { fontSize: 8.5, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 },
  metaValue: { fontSize: 13, fontWeight: '700', color: colors.wall },
  commentText: { fontSize: 13, color: '#4A453D', lineHeight: 20 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { backgroundColor: colors.surfaceMuted, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  chipText: { fontSize: 11, fontWeight: '600', color: colors.wall },
  deleteButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginHorizontal: 18, marginTop: 8, paddingVertical: 12, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.tapeRed + '55' },
  deleteText: { color: colors.tapeRed, fontWeight: '700', fontSize: 13 },
});
