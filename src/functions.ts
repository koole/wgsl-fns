// WGSL Function definitions organized by category

// Import functions from category files
export * from './math';
export * from './noise';
export * from './sdf';
export * from './color';
export * from './animation';
export * from './waves';

// Import individual functions for registry
import { elasticWave, smoothStep, rotate2D, exponentialRamp, logisticCurve, stepSequence } from './math';
import { hash22, noise2D, fbm, hash1D } from './noise';
import { sdfCircle, sdfBox, sdfUnion, sdfIntersection, sdfSubtraction, boxFrameSDF, cappedTorusSDF, capsuleSDF, coneSDF, cylinderSDF, ellipsoidSDF, gyroidSDF, hexagonalPrismSDF, icosahedronSDF, juliaSDF, octahedronSDF, planeSDF, pyramidSDF, rhombusSDF, roundBoxSDF, roundedConeSDF, roundedCylinderSDF, sphereSDF, tetrahedronSDF, torusSDF, triangularPrismSDF } from './sdf';
import { palette, linearToSrgb, srgbToLinear, hue2rgb, hslToRgb } from './color';
import { bezierCubic, easeIn, easeOut, easeInOut, elasticIn, elasticOut, backIn, backOut, springPhysics } from './animation';
import { triangleWave, sawtoothWave, squareWave, pulseWave, chirpWave, noiseWave } from './waves';

// Create a registry of all functions
export const wgslFns = {
  // Math functions
  elasticWave,
  smoothStep,
  rotate2D,
  exponentialRamp,
  logisticCurve,
  stepSequence,
  
  // Noise functions
  noise2D,
  hash22,
  fbm,
  hash1D,
  
  // SDF functions
  sdfCircle,
  sdfBox,
  sdfUnion,
  sdfIntersection,
  sdfSubtraction,
  boxFrameSDF,
  cappedTorusSDF,
  capsuleSDF,
  coneSDF,
  cylinderSDF,
  ellipsoidSDF,
  gyroidSDF,
  hexagonalPrismSDF,
  icosahedronSDF,
  juliaSDF,
  octahedronSDF,
  planeSDF,
  pyramidSDF,
  rhombusSDF,
  roundBoxSDF,
  roundedConeSDF,
  roundedCylinderSDF,
  sphereSDF,
  tetrahedronSDF,
  torusSDF,
  triangularPrismSDF,
  
  // Color functions
  palette,
  linearToSrgb,
  srgbToLinear,
  hue2rgb,
  hslToRgb,
  
  // Animation functions
  bezierCubic,
  easeIn,
  easeOut,
  easeInOut,
  elasticIn,
  elasticOut,
  backIn,
  backOut,
  springPhysics,
  
  // Wave functions
  triangleWave,
  sawtoothWave,
  squareWave,
  pulseWave,
  chirpWave,
  noiseWave
} as const;

export type WgslFunctionName = keyof typeof wgslFns;
