import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  presignGets,
  presignUpload,
  putToSignedUrl,
  type Ascent,
  type AscentWrite,
} from '../api/client';

type Props = {
  initial?: Ascent;
  submitLabel: string;
  busy?: boolean;
  error?: string;
  onSubmit: (body: AscentWrite) => void;
  onDelete?: () => void;
};

function allowedContentType(mime: string | null | undefined) {
  if (!mime || mime === 'image/jpg') {
    return 'image/jpeg';
  }
  if (/^(image\/(jpeg|png|webp|gif)|video\/mp4)$/.test(mime)) {
    return mime;
  }
  return null;
}

function fileNameFromUri(uri: string, fallback: string) {
  const last = uri.replace(/\\/g, '/').split('/').pop();
  return last && last.length > 0 ? last : fallback;
}

async function bytesFromAsset(asset: ImagePicker.ImagePickerAsset) {
  if (asset.file) {
    return asset.file;
  }
  const response = await fetch(asset.uri);
  if (!response.ok) {
    throw new Error('Failed to read picked file');
  }
  return response.blob();
}

export function AscentForm({ initial, submitLabel, busy, error, onSubmit, onDelete }: Props) {
  const [routeName, setRouteName] = useState(initial?.routeName ?? '');
  const [grade, setGrade] = useState(initial?.grade ?? '');
  const [attempts, setAttempts] = useState(String(initial?.attempts ?? 0));
  const [completed, setCompleted] = useState(initial?.completed ?? false);
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [newKeys, setNewKeys] = useState<string[]>([]);
  const [photoUrls, setPhotoUrls] = useState<{ key: string; url: string }[]>([]);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | undefined>();

  const savedKeySig = (initial?.imageKeys ?? []).join('|');

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

  useEffect(() => {
    const keys = savedKeySig.length === 0 ? [] : savedKeySig.split('|');
    if (keys.length === 0) {
      setPhotoUrls([]);
      return;
    }

    let cancelled = false;
    presignGets(keys)
      .then((items) => {
        if (!cancelled) {
          setPhotoUrls(items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUploadError('Could not load photos.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [savedKeySig]);

  async function pickAndUpload() {
    if (busy || uploadBusy) {
      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (picked.canceled || picked.assets.length === 0) {
      return;
    }

    setUploadBusy(true);
    setUploadError(undefined);
    try {
      const uploaded: { key: string; url: string }[] = [];
      for (const asset of picked.assets) {
        const contentType = allowedContentType(asset.mimeType);
        if (!contentType) {
          throw new Error('unsupported');
        }
        const signed = await presignUpload(
          asset.fileName ?? fileNameFromUri(asset.uri, 'climb.jpg'),
          contentType,
        );
        const bytes = await bytesFromAsset(asset);
        await putToSignedUrl(signed.url, bytes, signed.contentType);
        const [view] = await presignGets([signed.key]);
        uploaded.push({ key: signed.key, url: view?.url ?? signed.url });
      }
      setNewKeys((current) => [...current, ...uploaded.map((item) => item.key)]);
      setPhotoUrls((current) => [...current, ...uploaded]);
    } catch {
      setUploadError(
        'Could not PUT the photo. In DevTools Network, look for localhost:9000 (MinIO), not :4000 (Express).',
      );
    } finally {
      setUploadBusy(false);
    }
  }

  function submit() {
    if (busy) {
      return;
    }
    const n = Number.parseInt(attempts, 10);
    const imageKeys = [...(initial?.imageKeys ?? []), ...newKeys];
    onSubmit({
      routeName: routeName.trim(),
      grade: grade.trim(),
      attempts: Number.isNaN(n) ? 0 : n,
      completed,
      notes: notes.trim() || undefined,
      ...(imageKeys.length > 0 || newKeys.length > 0 ? { imageKeys } : {}),
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

      <Text>Photos</Text>
      <Pressable style={styles.btn} onPress={pickAndUpload} disabled={busy || uploadBusy}>
        <Text>{uploadBusy ? 'Uploading…' : 'Pick photos'}</Text>
      </Pressable>
      {photoUrls.map((photo) => (
        <Image key={photo.key} source={{ uri: photo.url }} style={styles.photo} />
      ))}
      {newKeys.length > 0 ? (
        <Text>{newKeys.length} new photo(s) — Save to keep them on this log.</Text>
      ) : null}
      {uploadError ? <Text style={styles.error}>{uploadError}</Text> : null}

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
  photo: {
    width: '100%',
    height: 180,
    backgroundColor: '#ddd',
    marginBottom: 8,
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
