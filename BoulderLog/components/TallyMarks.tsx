import React from 'react';
import { View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { colors } from '../constants/theme';

/** Renders attempts as chalk tally marks (groups of 5) — the mockup's signature visual for attempt counts. */
export default function TallyMarks({ count }: { count: number }) {
  const groups = Math.floor(count / 5);
  const remainder = count % 5;

  if (count === 0) {
    return <View />;
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
      {Array.from({ length: groups }).map((_, i) => (
        <Svg key={`g${i}`} width={34} height={20} viewBox="0 0 34 20">
          <Line x1="3" y1="3" x2="3" y2="17" stroke={colors.wall} strokeWidth={2.4} strokeLinecap="round" />
          <Line x1="10" y1="3" x2="10" y2="17" stroke={colors.wall} strokeWidth={2.4} strokeLinecap="round" />
          <Line x1="17" y1="3" x2="17" y2="17" stroke={colors.wall} strokeWidth={2.4} strokeLinecap="round" />
          <Line x1="24" y1="3" x2="24" y2="17" stroke={colors.wall} strokeWidth={2.4} strokeLinecap="round" />
          <Line x1="1" y1="17" x2="27" y2="3" stroke={colors.wall} strokeWidth={2.4} strokeLinecap="round" />
        </Svg>
      ))}
      {Array.from({ length: remainder }).map((_, i) => (
        <Svg key={`r${i}`} width={10} height={20} viewBox="0 0 10 20">
          <Line x1="3" y1="3" x2="3" y2="17" stroke={colors.wall} strokeWidth={2.4} strokeLinecap="round" />
        </Svg>
      ))}
    </View>
  );
}
