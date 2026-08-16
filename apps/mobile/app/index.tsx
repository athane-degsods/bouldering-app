import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import ProblemCard from '../components/ProblemCard';
import GearCard, { AddGearCard } from '../components/GearCard';
import { getProblems, getAccessories, computeStats } from '../utils/storage';
import { Problem, Accessory } from '../types/models';
import { colors, mono, radius } from '../constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);

  const loadData = useCallback(() => {
    getProblems().then(setProblems);
    getAccessories().then(setAccessories);
  }, []);

  useFocusEffect(loadData);

  const stats = computeStats(problems);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Welcome back</Text>
          <Text style={styles.title}>The Wall</Text>
        </View>

        {/* 1. STATS STRIP */}
        <View style={styles.statsStrip}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{stats.total}</Text>
            <Text style={styles.statCap}>Logged</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{stats.sendRate}%</Text>
            <Text style={styles.statCap}>Send rate</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{stats.thisWeekCount}</Text>
            <Text style={styles.statCap}>This week</Text>
          </View>
        </View>

        {/* 2. UPLOADED PROBLEMS */}
        <View style={styles.sectionLabel}>
          <Text style={styles.sectionTitle}>Uploaded problems</Text>
        </View>
        {problems.length === 0 ? (
          <Text style={styles.emptyText}>No problems logged yet — tap + to add one.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            {problems.map(p => (
              <ProblemCard key={p._id} problem={p} onPress={() => router.push(`/problem/${p._id}`)} />
            ))}
          </ScrollView>
        )}

        {/* 3. ACCESSORIES */}
        <View style={[styles.sectionLabel, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Accessories</Text>
          <TouchableOpacity onPress={() => router.push('/gear/add')}>
            <Text style={styles.seeAll}>+ Add gear</Text>
          </TouchableOpacity>
        </View>
        {accessories.length === 0 ? (
          <Text style={styles.emptyText}>No gear added yet.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            {accessories.map(a => (
              <GearCard key={a._id} accessory={a} />
            ))}
            <AddGearCard onPress={() => router.push('/gear/add')} />
          </ScrollView>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/problem/upload')}>
        <Feather name="plus" size={24} color="#12292D" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.chalk },
  header: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 4 },
  eyebrow: { fontFamily: mono, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: colors.textMuted },
  title: { fontSize: 24, fontWeight: '800', color: colors.wall, marginTop: 2 },
  statsStrip: { flexDirection: 'row', gap: 8, paddingHorizontal: 18, paddingVertical: 16 },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 12, borderWidth: 1, borderColor: colors.border },
  statNum: { fontFamily: mono, fontSize: 21, fontWeight: '700', color: colors.wall },
  statCap: { fontSize: 9, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  sectionLabel: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, marginBottom: 10 },
  sectionTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, color: '#6F6A60' },
  seeAll: { fontFamily: mono, fontSize: 10, color: colors.accent, fontWeight: '700' },
  row: { gap: 10, paddingHorizontal: 18, paddingBottom: 4 },
  emptyText: { fontSize: 12, color: colors.textMuted, paddingHorizontal: 18, marginBottom: 12 },
  fab: {
    position: 'absolute',
    right: 18, bottom: 18,
    width: 52, height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 5px 10px rgba(0, 0, 0, 0.3)`,
    elevation: 5,
  },
});
