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
import { elasticWave, smoothStep, smoothStepVec2, rotate2D, exponentialRamp, logisticCurve, stepSequence, taylorInvSqrt4 } from './math';
import { 
  hash22, noise2D, fbm2D, fbm3D, hash1D, hash31, hash3D, noise3D, warpNoise3D,
  pcg, pcg2d, pcg3d, pcg4d, xxhash32, xxhash322d, xxhash323d, xxhash324d,
  rand11Sin, rand22Sin, valueNoise1D, valueNoise2D, mod289, perm4, valueNoise3D,
  perlinNoise2D, perlinNoise3D, simplexNoise2D, simplexNoise3D, simplexNoise4D
} from './noise';
import { sdfCircle, sdfBox, sdfUnion, sdfIntersection, sdfSubtraction, sdfBoxFrame, sdfCappedTorus, sdfCapsule, sdfCone, sdfCylinder, sdfEllipsoid, sdfGyroid, sdfHexagonalPrism, sdfIcosahedron, sdfJulia, sdfOctahedron, sdfPlane, sdfPyramid, sdfRhombus, sdfRoundBox, sdfRoundedCone, sdfRoundedCylinder, sdfSphere, sdfTetrahedron, sdfTorus, sdfTriangularPrism } from './sdf';
import { palette, linearToSrgb, srgbToLinear, hueToRgb, hslToRgb } from './color';
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
  smoothStepVec2,
  rotate2D,
  exponentialRamp,
  logisticCurve,
  stepSequence,
  taylorInvSqrt4,
  
  // Noise functions
  noise2D,
  hash22,
  fbm2D,
  fbm3D,
  hash1D,
  hash31,
  hash3D,
  noise3D,
  warpNoise3D,
  pcg,
  pcg2d,
  pcg3d,
  pcg4d,
  xxhash32,
  xxhash322d,
  xxhash323d,
  xxhash324d,
  rand11Sin,
  rand22Sin,
  valueNoise1D,
  valueNoise2D,
  mod289,
  perm4,
  valueNoise3D,
  perlinNoise2D,
  perlinNoise3D,
  simplexNoise2D,
  simplexNoise3D,
  simplexNoise4D,
  
  // SDF functions
  sdfCircle,
  sdfBox,
  sdfUnion,
  sdfIntersection,
  sdfSubtraction,
  sdfBoxFrame,
  sdfCappedTorus,
  sdfCapsule,
  sdfCone,
  sdfCylinder,
  sdfEllipsoid,
  sdfGyroid,
  sdfHexagonalPrism,
  sdfIcosahedron,
  sdfJulia,
  sdfOctahedron,
  sdfPlane,
  sdfPyramid,
  sdfRhombus,
  sdfRoundBox,
  sdfRoundedCone,
  sdfRoundedCylinder,
  sdfSphere,
  sdfTetrahedron,
  sdfTorus,
  sdfTriangularPrism,
  
  // Color functions
  palette,
  linearToSrgb,
  srgbToLinear,
  hueToRgb,
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
