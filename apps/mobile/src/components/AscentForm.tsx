import { useEffect, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  DangerButton,
  ErrorText,
  Field,
  Hint,
  PrimaryButton,
  SecondaryButton,
  SectionLabel,
} from './ui';
import { colors, radius, space } from '../theme';
import {
  presignGets,
  presignUpload,
  putToSignedUrl,
  type Ascent,
  type AscentWrite,
} from '../api/client';
import { AscentVideoPlayer } from './AscentVideoPlayer';

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
  if (mime === 'video/x-quicktime') {
    return 'video/quicktime';
  }
  if (/^(image\/(jpeg|png|webp|gif)|video\/(mp4|quicktime|webm))$/.test(mime)) {
    return mime;
  }
  return null;
}

function videoContentType(mime: string | null | undefined, fileName: string) {
  const fromMime = allowedContentType(mime);
  if (fromMime?.startsWith('video/')) {
    return fromMime;
  }
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.mp4') || lower.endsWith('.m4v')) {
    return 'video/mp4';
  }
  if (lower.endsWith('.mov') || lower.endsWith('.qt')) {
    return 'video/quicktime';
  }
  if (lower.endsWith('.webm')) {
    return 'video/webm';
  }
  return null;
}

function uploadFailMessage(kind: 'photo' | 'video', error: unknown) {
  const detail = error instanceof Error ? error.message : '';
  const where =
    Platform.OS === 'android'
      ? 'MinIO via 10.0.2.2 (not Express :4000)'
      : 'MinIO (not Express :4000)';
  return `Could not upload the ${kind}${detail ? ` (${detail})` : ''}. PUT goes to ${where}.`;
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
  const [newVideoKey, setNewVideoKey] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | undefined>();

  const savedKeySig = (initial?.imageKeys ?? []).join('|');
  const savedVideoKey = initial?.videoKey ?? '';

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

  useEffect(() => {
    if (newVideoKey) {
      return;
    }
    if (!savedVideoKey) {
      setVideoUrl(null);
      return;
    }

    let cancelled = false;
    presignGets([savedVideoKey])
      .then((items) => {
        if (!cancelled) {
          setVideoUrl(items[0]?.url ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUploadError('Could not load video.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [savedVideoKey, newVideoKey]);

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
        await putToSignedUrl(signed.url, bytes, signed.contentType, asset.uri);
        const [view] = await presignGets([signed.key]);
        uploaded.push({ key: signed.key, url: view?.url ?? signed.url });
      }
      setNewKeys((current) => [...current, ...uploaded.map((item) => item.key)]);
      setPhotoUrls((current) => [...current, ...uploaded]);
    } catch (error) {
      setUploadError(uploadFailMessage('photo', error));
    } finally {
      setUploadBusy(false);
    }
  }

  async function pickAndUploadVideo() {
    if (busy || uploadBusy) {
      return;
    }

    let uri: string;
    let fileName: string;
    let mimeType: string | null | undefined;

    if (Platform.OS === 'android') {
      // Gallery-only picker hides Downloads/Files. The emulator usually has clips there.
      const picked = await DocumentPicker.getDocumentAsync({
        type: ['video/mp4', 'video/quicktime', 'video/webm', 'video/*'],
        // Expo Go cannot uploadAsync from DocumentPicker's cache copy. Keep the
        // SAF/content URI and let putToSignedUrl copy it into this app's cache.
        copyToCacheDirectory: false,
        multiple: false,
      });
      if (picked.canceled || !picked.assets[0]) {
        return;
      }
      const asset = picked.assets[0];
      uri = asset.uri;
      fileName = asset.name || fileNameFromUri(asset.uri, 'beta.mp4');
      mimeType = asset.mimeType;
    } else {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setUploadError('Photo library permission is required to pick a beta clip.');
        return;
      }

      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsMultipleSelection: false,
        quality: 1,
      });
      if (picked.canceled || !picked.assets[0]) {
        return;
      }
      const asset = picked.assets[0];
      uri = asset.uri;
      fileName = asset.fileName ?? fileNameFromUri(asset.uri, 'beta.mp4');
      mimeType = asset.mimeType;
    }

    const contentType = videoContentType(mimeType, fileName);
    if (!contentType) {
      setUploadError('That video type is not supported. Use mp4, mov, or webm.');
      return;
    }

    setUploadBusy(true);
    setUploadError(undefined);
    try {
      const signed = await presignUpload(fileName, contentType);
      let body: Blob = new Blob();
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        if (!response.ok) {
          throw new Error('Failed to read picked file');
        }
        body = await response.blob();
      }
      await putToSignedUrl(signed.url, body, signed.contentType, uri);
      const [view] = await presignGets([signed.key]);
      setNewVideoKey(signed.key);
      setVideoUrl(view?.url ?? signed.url);
    } catch (error) {
      setUploadError(uploadFailMessage('video', error));
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
      ...(newVideoKey ? { videoKey: newVideoKey } : {}),
    });
  }

  return (
    <View style={styles.form}>
      <SectionLabel>Climb</SectionLabel>
      <Field label="Route name" value={routeName} onChangeText={setRouteName} />
      <Field label="Grade" value={grade} onChangeText={setGrade} placeholder="V5" />
      <Field
        label="Attempts"
        value={attempts}
        onChangeText={setAttempts}
        keyboardType="number-pad"
      />

      <Text style={styles.fieldLabel}>Status</Text>
      <View style={styles.toggleRow}>
        <Pressable
          style={[styles.toggle, completed && styles.toggleOn]}
          onPress={() => setCompleted(true)}
        >
          <Text style={[styles.toggleText, completed && styles.toggleTextOn]}>SEND</Text>
        </Pressable>
        <Pressable
          style={[styles.toggle, !completed && styles.toggleProjectOn]}
          onPress={() => setCompleted(false)}
        >
          <Text style={[styles.toggleText, !completed && styles.toggleProjectText]}>
            project
          </Text>
        </Pressable>
      </View>

      <Field label="Notes" value={notes} onChangeText={setNotes} multiline />

      <SectionLabel>Photos</SectionLabel>
      <SecondaryButton
        label={uploadBusy ? 'Uploading…' : 'Pick photos'}
        onPress={pickAndUpload}
        disabled={busy || uploadBusy}
      />
      {photoUrls.map((photo) => (
        <Image key={photo.key} source={{ uri: photo.url }} style={styles.photo} />
      ))}
      {newKeys.length > 0 ? (
        <Hint>{newKeys.length} new photo(s) — Save to keep them on this log.</Hint>
      ) : null}

      <SectionLabel>Beta clip</SectionLabel>
      <Hint>
        {Platform.OS === 'android'
          ? 'Opens Files so you can pick an mp4 from Downloads, not only Gallery.'
          : 'Pick an existing mp4, mov, or webm. The app does not record.'}
      </Hint>
      <SecondaryButton
        label={uploadBusy ? 'Uploading…' : 'Pick video'}
        onPress={pickAndUploadVideo}
        disabled={busy || uploadBusy}
      />
      {videoUrl ? <AscentVideoPlayer key={videoUrl} uri={videoUrl} /> : null}
      {newVideoKey ? <Hint>New clip — Save to keep it on this log.</Hint> : null}

      <ErrorText>{uploadError}</ErrorText>
      <ErrorText>{error}</ErrorText>

      <PrimaryButton
        label={busy ? 'Saving…' : submitLabel}
        onPress={submit}
        disabled={busy || uploadBusy}
      />

      {onDelete ? (
        <DangerButton label="Delete" onPress={onDelete} disabled={busy || uploadBusy} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    padding: space.lg,
    gap: space.md,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  toggle: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingVertical: 12,
    alignItems: 'center',
  },
  toggleOn: {
    backgroundColor: colors.sendBg,
    borderColor: colors.sendBg,
  },
  toggleProjectOn: {
    backgroundColor: colors.projectBg,
    borderColor: colors.projectBg,
  },
  toggleText: {
    fontWeight: '700',
    color: colors.muted,
  },
  toggleTextOn: {
    color: colors.sendText,
  },
  toggleProjectText: {
    color: colors.projectText,
  },
  photo: {
    width: '100%',
    height: 180,
    backgroundColor: colors.line,
    borderRadius: radius.md,
  },
});
