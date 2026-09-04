import { VideoView, useVideoPlayer } from 'expo-video';
import { StyleSheet } from 'react-native';
import { colors, radius } from '../theme';

type Props = {
  uri: string;
};

/** Plays a signed MinIO/S3 GET URL. Mount with key={uri} when the url changes. */
export function AscentVideoPlayer({ uri }: Props) {
  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = false;
  });

  return (
    <VideoView
      player={player}
      style={styles.video}
      nativeControls
      contentFit="contain"
      fullscreenOptions={{ enable: true }}
    />
  );
}

const styles = StyleSheet.create({
  video: {
    width: '100%',
    height: 220,
    backgroundColor: colors.overlay,
    borderRadius: radius.md,
    marginBottom: 8,
  },
});
