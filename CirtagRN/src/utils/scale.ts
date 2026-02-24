import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Reference device: Samsung S22 (360dp x 780dp)
const BASE_WIDTH = 360;
const BASE_HEIGHT = 780;

/**
 * Horizontal scale — widths, horizontal padding/margin, gaps, borderRadius
 */
export const s = (size: number): number =>
  Math.round((size * width) / BASE_WIDTH);

/**
 * Vertical scale — heights, vertical padding/margin (uses SCREEN HEIGHT)
 */
export const vs = (size: number): number =>
  Math.round((size * height) / BASE_HEIGHT);

/**
 * Moderate scale — font sizes, icon sizes
 * factor=1.0 = fully proportional (same as s), keeps text proportions identical
 */
export const ms = (size: number, factor: number = 1.0): number =>
  Math.round(size + (s(size) - size) * factor);
