// Noise and procedural generation functions

/**
 * @wgsl
 * @name hash22
 * @description Generates a 2D hash from a 2D input vector for procedural generation.
 * @param {vec2<f32>} p Input 2D vector to hash.
 * @returns {vec2<f32>} Hash result as 2D vector.
 */
export const hash22 = `fn hash22(p: vec2<f32>) -> vec2<f32> {
  var p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}`;

/**
 * @wgsl
 * @name noise2D
 * @description Generates 2D Perlin-style noise for procedural textures and patterns.
 * @param {vec2<f32>} p Input 2D coordinate.
 * @returns {f32} Noise value typically in range [-1, 1].
 */
export const noise2D = `fn noise2D(p: vec2<f32>) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(dot(hash22(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
        dot(hash22(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(hash22(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
        dot(hash22(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
}`;

/**
 * @wgsl
 * @name fbm
 * @description Fractional Brownian Motion - combines multiple octaves of noise for complex patterns.
 * @param {vec2<f32>} p Input 2D coordinate.
 * @param {i32} octaves Number of noise octaves to combine.
 * @returns {f32} Combined noise value.
 */
export const fbm = `fn fbm(p: vec2<f32>, octaves: i32) -> f32 {
  var value = 0.0;
  var amplitude = 0.5;
  var frequency = 1.0;
  for (var i = 0; i < octaves; i++) {
    value += amplitude * noise2D(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return value;
}`;
