// WGSL Function definitions organized by category

// Import functions from category files
export * from './math';
export * from './noise';
export * from './sdf';
export * from './color';
export * from './animation';
export * from './waves';
export * from './sdf-operations';
export * from './sdf-transforms';
export * from './sdf-modifiers';
export * from './sdf-utils';

// Import individual functions for registry
import { elasticWave, smoothStep, rotate2D, exponentialRamp, logisticCurve, stepSequence } from './math';
import { hash22, noise2D, fbm, hash1D, hash31, hash3D, noise3D, warpNoise3D } from './noise';
import { sdfCircle, sdfBox, sdfUnion, sdfIntersection, sdfSubtraction, boxFrameSDF, cappedTorusSDF, capsuleSDF, coneSDF, cylinderSDF, ellipsoidSDF, gyroidSDF, hexagonalPrismSDF, icosahedronSDF, juliaSDF, octahedronSDF, planeSDF, pyramidSDF, rhombusSDF, roundBoxSDF, roundedConeSDF, roundedCylinderSDF, sphereSDF, tetrahedronSDF, torusSDF, triangularPrismSDF } from './sdf';
import { palette, linearToSrgb, srgbToLinear, hue2rgb, hslToRgb } from './color';
import { bezierCubic, easeIn, easeOut, easeInOut, elasticIn, elasticOut, backIn, backOut, springPhysics } from './animation';
import { triangleWave, sawtoothWave, squareWave, pulseWave, chirpWave, noiseWave } from './waves';
import { sdfOpUnion, sdfOpSubtract, sdfOpIntersect, sdfSmoothUnion, sdfSmoothSubtract, sdfSmoothIntersect, sdfChamferUnion, sdfChamferSubtract, sdfChamferIntersect } from './sdf-operations';
import { sdfTranslate, sdfScale, sdfRotate, sdfMirror, sdfPolarRepeat, sdfCylindricalRepeat, sdfSphericalRepeat } from './sdf-transforms';
import { sdfTwist, sdfBend, sdfTaper, sdfDisplace, sdfDomainRepeat, sdfFiniteRepeat, sdfInfiniteRepeat } from './sdf-modifiers';
import { sdfToSolid, sdfToStroke, sdfToSmoothSolid, sdfToSmoothStroke } from './sdf-utils';

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
  hash31,
  hash3D,
  noise3D,
  warpNoise3D,
  
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
  noiseWave,
  
  // SDF Operations
  sdfOpUnion,
  sdfOpSubtract,
  sdfOpIntersect,
  sdfSmoothUnion,
  sdfSmoothSubtract,
  sdfSmoothIntersect,
  sdfChamferUnion,
  sdfChamferSubtract,
  sdfChamferIntersect,
  
  // SDF Transforms
  sdfTranslate,
  sdfScale,
  sdfRotate,
  sdfMirror,
  sdfPolarRepeat,
  sdfCylindricalRepeat,
  sdfSphericalRepeat,
  
  // SDF Modifiers
  sdfTwist,
  sdfBend,
  sdfTaper,
  sdfDisplace,
  sdfDomainRepeat,
  sdfFiniteRepeat,
  sdfInfiniteRepeat,
  
  // SDF Utilities
  sdfToSolid,
  sdfToStroke,
  sdfToSmoothSolid,
  sdfToSmoothStroke
} as const;

export type WgslFunctionName = keyof typeof wgslFns;
