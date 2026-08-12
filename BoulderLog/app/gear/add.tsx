import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { addAccessory } from '../../utils/storage';
import { AccessoryCategory, AccessoryCondition } from '../../types/models';
import { colors, conditionColor, conditionLabel, radius } from '../../constants/theme';

const CATEGORIES: AccessoryCategory[] = ['shoes', 'chalk', 'harness', 'other'];
const CONDITIONS: AccessoryCondition[] = ['good', 'low', 'worn_out'];

export default function AddGearScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AccessoryCategory>('shoes');
  const [condition, setCondition] = useState<AccessoryCondition>('good');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Give this item a name before saving.');
      return;
    }
    await addAccessory({ name, category, condition });
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.fieldLabel}>Name</Text>
      <TextInput
        style={styles.textInput}
        value={name}
        onChangeText={setName}
        placeholder="e.g. La Sportiva Skwama"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.fieldLabel}>Category</Text>
      <View style={styles.chipRow}>
        {CATEGORIES.map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.catChip, category === c && styles.catChipSelected]}
            onPress={() => setCategory(c)}
          >
            <Text style={[styles.catChipText, category === c && { color: '#fff' }]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.fieldLabel}>Condition</Text>
      <View style={styles.chipRow}>
        {CONDITIONS.map(c => (
          <TouchableOpacity
            key={c}
            style={[
              styles.condChip,
              { borderColor: conditionColor(c), backgroundColor: condition === c ? conditionColor(c) : colors.surface },
            ]}
            onPress={() => setCondition(c)}
          >
            <Text style={{ color: condition === c ? '#fff' : conditionColor(c), fontWeight: '700', fontSize: 12 }}>
              {conditionLabel(c)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Add Gear</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.chalk, padding: 18 },
  fieldLabel: { fontSize: 9.5, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, color: colors.textMuted, marginBottom: 6, marginTop: 4 },
  textInput: { backgroundColor: colors.surface, borderRadius: radius.md, marginBottom: 14, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: colors.wall, borderWidth: 1, borderColor: colors.border },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  catChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  catChipSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  catChipText: { fontSize: 12, fontWeight: '600', color: colors.textMuted, textTransform: 'capitalize' },
  condChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1.5 },
  saveBtn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 15, alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: '#12292D', fontWeight: '700', fontSize: 15 },
});
