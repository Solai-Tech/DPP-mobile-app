import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { Primary } from '../theme/colors';
import { s, vs, ms } from '../utils/scale';

const FRAME_SIZE = s(200);
const CORNER_LEN = s(40);
const STROKE_W = s(4);

export default function ScanFrame() {
  const scanY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanY, {
          toValue: FRAME_SIZE,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scanY, {
          toValue: 0,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scanY]);

  return (
    <View style={styles.container}>
      <Svg width={FRAME_SIZE} height={FRAME_SIZE} style={StyleSheet.absoluteFill}>
        {/* Top-left */}
        <Line x1={0} y1={CORNER_LEN} x2={0} y2={0} stroke={Primary} strokeWidth={STROKE_W} strokeLinecap="round" />
        <Line x1={CORNER_LEN} y1={0} x2={0} y2={0} stroke={Primary} strokeWidth={STROKE_W} strokeLinecap="round" />
        {/* Top-right */}
        <Line x1={FRAME_SIZE} y1={0} x2={FRAME_SIZE - CORNER_LEN} y2={0} stroke={Primary} strokeWidth={STROKE_W} strokeLinecap="round" />
        <Line x1={FRAME_SIZE} y1={0} x2={FRAME_SIZE} y2={CORNER_LEN} stroke={Primary} strokeWidth={STROKE_W} strokeLinecap="round" />
        {/* Bottom-left */}
        <Line x1={0} y1={FRAME_SIZE} x2={0} y2={FRAME_SIZE - CORNER_LEN} stroke={Primary} strokeWidth={STROKE_W} strokeLinecap="round" />
        <Line x1={0} y1={FRAME_SIZE} x2={CORNER_LEN} y2={FRAME_SIZE} stroke={Primary} strokeWidth={STROKE_W} strokeLinecap="round" />
        {/* Bottom-right */}
        <Line x1={FRAME_SIZE} y1={FRAME_SIZE} x2={FRAME_SIZE - CORNER_LEN} y2={FRAME_SIZE} stroke={Primary} strokeWidth={STROKE_W} strokeLinecap="round" />
        <Line x1={FRAME_SIZE} y1={FRAME_SIZE} x2={FRAME_SIZE} y2={FRAME_SIZE - CORNER_LEN} stroke={Primary} strokeWidth={STROKE_W} strokeLinecap="round" />
      </Svg>
      {/* Animated scan line */}
      <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanY }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
  },
  scanLine: {
    position: 'absolute',
    left: s(10),
    right: s(10),
    height: vs(3),
    borderRadius: s(1.5),
    backgroundColor: Primary,
    opacity: 0.8,
  },
});
