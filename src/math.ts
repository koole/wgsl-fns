// Mathematical utility functions

/**
 * @wgsl
 * @name elasticWave
 * @description Generates an elastic wave with exponential decay and sinusoidal oscillation.
 * @param {f32} x Input position along the wave.
 * @param {f32} amplitude Wave amplitude multiplier.
 * @param {f32} frequency Wave frequency.
 * @param {f32} decay Exponential decay factor.
 * @param {f32} phase Phase offset for the wave.
 * @returns {f32} Computed wave value.
 */
export const elasticWave = `fn elasticWave(x: f32, amplitude: f32, frequency: f32, decay: f32, phase: f32) -> f32 {
  let d = max(0.001, decay);
  let decayTerm = exp(-d * x);
  let oscTerm = sin(frequency * x * 6.28318 + phase);
  return amplitude * decayTerm * oscTerm;
}`;

/**
 * @wgsl
 * @name smoothStep
 * @description Hermite interpolation between two values with smooth acceleration and deceleration.
 * @param {f32} edge0 Lower edge of interpolation range.
 * @param {f32} edge1 Upper edge of interpolation range.
 * @param {f32} x Input value to interpolate.
 * @returns {f32} Smoothly interpolated value between 0 and 1.
 */
export const smoothStep = `fn smoothStep(edge0: f32, edge1: f32, x: f32) -> f32 {
  let t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}`;

/**
 * @wgsl
 * @name rotate2D
 * @description Rotates a 2D vector by a given angle.
 * @param {vec2<f32>} v Input 2D vector to rotate.
 * @param {f32} angle Rotation angle in radians.
 * @returns {vec2<f32>} Rotated 2D vector.
 */
export const rotate2D = `fn rotate2D(v: vec2<f32>, angle: f32) -> vec2<f32> {
  let c = cos(angle);
  let s = sin(angle);
  return vec2(v.x * c - v.y * s, v.x * s + v.y * c);
}`;
