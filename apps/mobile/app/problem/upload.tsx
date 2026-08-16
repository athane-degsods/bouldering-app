import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  addProblem,
  updateProblem,
  getProblems,
  getAccessories,
} from '../../utils/storage';
import { Accessory } from '../../types/models';
import { colors, gradeColor, mono, radius } from '../../constants/theme';

const GRADES = ['V1', 'V3', 'V5', 'V7+'];

export default function UploadScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;
  const router = useRouter();
  const navigation = useNavigation();

  const [imageUri, setImageUri] = useState<string | undefined>();
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('V5');
  const [attempts, setAttempts] = useState(1);
  const [notes, setNotes] = useState('');
  const [selectedAccessoryIds, setSelectedAccessoryIds] = useState<string[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    navigation.setOptions({ title: isEditing ? 'Update Problem' : 'Upload' });
    getAccessories().then(setAccessories);

    if (isEditing) {
      getProblems().then(problems => {
        const existing = problems.find(p => p._id === id);
        if (existing) {
          setImageUri(existing.imageUrl);
          setName(existing.name);
          setGrade(existing.grade);
          setAttempts(existing.attempts);
          setNotes(existing.notes || '');
          setSelectedAccessoryIds(existing.accessoryIds || []);
        }
        setLoading(false);
      });
    }
  }, [id]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera permission needed', 'Enable camera access to photograph a problem.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const toggleAccessory = (accId: string) => {
    setSelectedAccessoryIds(prev =>
      prev.includes(accId) ? prev.filter(x => x !== accId) : [...prev, accId]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Give this problem a name before saving.');
      return;
    }

    const payload = {
      name,
      grade,
      imageUrl: imageUri,
      attempts,
      status: 'working' as const,
      notes,
      accessoryIds: selectedAccessoryIds,
    };

    if (isEditing) {
      await updateProblem(id as string, payload);
    } else {
      await addProblem(payload);
    }
    router.back();
  };

  if (loading) return null;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <TouchableOpacity style={styles.captureBox} onPress={pickImage} activeOpacity={0.85}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={styles.captureEmpty}>
              <Feather name="camera" size={22} color={colors.textMuted} />
              <Text style={styles.captureEmptyText}>Tap to capture</Text>
            </View>
          )}
          {imageUri ? (
            <View style={styles.retakeBtn}>
              <Feather name="refresh-cw" size={10} color="#fff" />
              <Text style={styles.retakeBtnText}>Retake</Text>
            </View>
          ) : null}
        </TouchableOpacity>

        <Text style={styles.fieldLabel}>Name</Text>
        <TextInput
          style={styles.textInput}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Crimp Corner"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.fieldLabel}>Grade</Text>
        <View style={styles.gradePicker}>
          {GRADES.map(g => (
            <TouchableOpacity
              key={g}
              style={[
                styles.gradeChip,
                { backgroundColor: gradeColor(g), opacity: grade === g ? 1 : 0.35 },
              ]}
              onPress={() => setGrade(g)}
            >
              <Text style={styles.gradeChipText}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.fieldLabel}>Attempts</Text>
        <View style={styles.stepperRow}>
          <TouchableOpacity
            style={styles.stepperBtn}
            onPress={() => setAttempts(a => Math.max(0, a - 1))}
          >
            <Feather name="minus" size={16} color={colors.wall} />
          </TouchableOpacity>
          <Text style={styles.stepperValue}>{attempts}</Text>
          <TouchableOpacity style={styles.stepperBtn} onPress={() => setAttempts(a => a + 1)}>
            <Feather name="plus" size={16} color={colors.wall} />
          </TouchableOpacity>
        </View>

        <Text style={styles.fieldLabel}>Comment</Text>
        <TextInput
          style={[styles.textInput, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Crux is the left-hand crimp at move three..."
          placeholderTextColor={colors.textMuted}
          multiline
        />

        <Text style={styles.fieldLabel}>Accessories</Text>
        <View style={styles.chipRow}>
          {accessories.map(a => {
            const selected = selectedAccessoryIds.includes(a._id);
            return (
              <TouchableOpacity
                key={a._id}
                style={[styles.accessoryChip, selected ? styles.accessoryChipSelected : styles.accessoryChipUnselected]}
                onPress={() => toggleAccessory(a._id)}
              >
                <Text style={[styles.accessoryChipText, { color: selected ? '#fff' : colors.textMuted }]}>
                  {a.name}
                </Text>
              </TouchableOpacity>
            );
          })}
          {accessories.length === 0 ? (
            <Text style={{ fontSize: 11, color: colors.textMuted }}>
              No gear added yet — add some from the Home screen first.
            </Text>
          ) : null}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{isEditing ? 'Save Changes' : 'Save Problem'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.chalk },
  captureBox: {
    height: 150,
    borderRadius: radius.lg,
    marginHorizontal: 18,
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  captureEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  captureEmptyText: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  retakeBtn: { position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(32,30,28,0.75)', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999 },
  retakeBtnText: { color: '#fff', fontSize: 9, fontWeight: '700', fontFamily: mono },
  fieldLabel: { fontSize: 9.5, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, color: colors.textMuted, marginHorizontal: 18, marginBottom: 6, marginTop: 4 },
  textInput: { backgroundColor: colors.surface, borderRadius: radius.md, marginHorizontal: 18, marginBottom: 14, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: colors.wall, borderWidth: 1, borderColor: colors.border },
  notesInput: { minHeight: 70, textAlignVertical: 'top' },
  gradePicker: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginHorizontal: 18, marginBottom: 14 },
  gradeChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
  gradeChipText: { fontFamily: mono, fontSize: 12, fontWeight: '700', color: '#fff' },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginHorizontal: 18, marginBottom: 14 },
  stepperBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  stepperValue: { fontFamily: mono, fontSize: 16, fontWeight: '700', color: colors.wall, minWidth: 20, textAlign: 'center' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginHorizontal: 18, marginBottom: 18 },
  accessoryChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1.5 },
  accessoryChipSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  accessoryChipUnselected: { backgroundColor: colors.surface, borderColor: colors.border },
  accessoryChipText: { fontSize: 12, fontWeight: '600' },
  saveBtn: { backgroundColor: colors.accent, borderRadius: radius.md, marginHorizontal: 18, paddingVertical: 15, alignItems: 'center' },
  saveBtnText: { color: '#12292D', fontWeight: '700', fontSize: 15 },
});
