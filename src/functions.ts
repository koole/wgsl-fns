// WGSL Function definitions organized by category

// Import functions from category files
export * from './math';
export * from './noise';
export * from './sdf';
export * from './color';

// Import individual functions for registry
import { elasticWave, smoothStep, rotate2D } from './math';
import { hash22, noise2D, fbm } from './noise';
import { sdfCircle, sdfBox, sdfUnion, sdfIntersection, sdfSubtraction } from './sdf';
import { palette, linearToSrgb, srgbToLinear, hue2rgb, hslToRgb } from './color';

// Create a registry of all functions
export const wgslFns = {
  elasticWave,
  smoothStep,
  noise2D,
  hash22,
  fbm,
  rotate2D,
  sdfCircle,
  sdfBox,
  sdfUnion,
  sdfIntersection,
  sdfSubtraction,
  palette,
  linearToSrgb,
  srgbToLinear,
  hue2rgb,
  hslToRgb
} as const;

export type WgslFunctionName = keyof typeof wgslFns;
