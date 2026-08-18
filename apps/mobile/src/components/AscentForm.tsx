import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Ascent, AscentWrite } from '../api/client';

type Props = {
  initial?: Ascent;
  submitLabel: string;
  busy?: boolean;
  error?: string;
  onSubmit: (body: AscentWrite) => void;
  onDelete?: () => void;
};

export function AscentForm({ initial, submitLabel, busy, error, onSubmit, onDelete }: Props) {
  const [routeName, setRouteName] = useState(initial?.routeName ?? '');
  const [grade, setGrade] = useState(initial?.grade ?? '');
  const [attempts, setAttempts] = useState(String(initial?.attempts ?? 0));
  const [completed, setCompleted] = useState(initial?.completed ?? false);
  const [notes, setNotes] = useState(initial?.notes ?? '');

  useEffect(() => {
    if (!initial) {
      return;
    }
    setRouteName(initial.routeName);
    setGrade(initial.grade);
    setAttempts(String(initial.attempts));
    setCompleted(initial.completed);
    setNotes(initial.notes ?? '');
  }, [initial]);

  function submit() {
    if (busy) {
      return;
    }
    const n = Number.parseInt(attempts, 10);
    onSubmit({
      routeName: routeName.trim(),
      grade: grade.trim(),
      attempts: Number.isNaN(n) ? 0 : n,
      completed,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <View style={styles.form}>
      <Text>Route name</Text>
      <TextInput style={styles.input} value={routeName} onChangeText={setRouteName} />

      <Text>Grade</Text>
      <TextInput style={styles.input} value={grade} onChangeText={setGrade} placeholder="V5" />

      <Text>Attempts</Text>
      <TextInput
        style={styles.input}
        value={attempts}
        onChangeText={setAttempts}
        keyboardType="number-pad"
      />

      <Text>Status</Text>
      <Pressable style={styles.input} onPress={() => setCompleted((v) => !v)}>
        <Text>{completed ? 'SEND' : 'project'}</Text>
      </Pressable>

      <Text>Notes</Text>
      <TextInput
        style={[styles.input, styles.notes]}
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.btn} onPress={submit} disabled={busy}>
        <Text>{busy ? 'Saving…' : submitLabel}</Text>
      </Pressable>

      {onDelete ? (
        <Pressable style={styles.btn} onPress={onDelete} disabled={busy}>
          <Text>Delete</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    padding: 16,
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 8,
    marginBottom: 8,
  },
  notes: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  btn: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  error: {
    color: '#900',
  },
});
