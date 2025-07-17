// Noise and procedural generation functions

/**
 * @wgsl
 * @name hash22
 * @description Generates a 2D hash from a 2D input vector for procedural generation.
 * @param {vec2<f32>} p Input 2D vector to hash.
 * @returns {vec2<f32>} Hash result as 2D vector.
 */
export const hash22 = `fn hash22(p: vec2<f32>) -> vec2<f32> {
  var p3 = fract(vec3<f32>(p.xyx) * vec3<f32>(0.1031, 0.1030, 0.0973));
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
    mix(dot(hash22(i + vec2<f32>(0.0, 0.0)), f - vec2<f32>(0.0, 0.0)),
        dot(hash22(i + vec2<f32>(1.0, 0.0)), f - vec2<f32>(1.0, 0.0)), u.x),
    mix(dot(hash22(i + vec2<f32>(0.0, 1.0)), f - vec2<f32>(0.0, 1.0)),
        dot(hash22(i + vec2<f32>(1.0, 1.0)), f - vec2<f32>(1.0, 1.0)), u.x), u.y);
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

/**
 * @wgsl
 * @name hash1D
 * @description Generates a 1D hash value from an input value for noise generation.
 * @param {f32} p Input value to hash.
 * @returns {f32} Hashed value between 0 and 1.
 */
export const hash1D = `fn hash1D(p: f32) -> f32 {
  // Convert to integer and apply bit manipulation
  let x = bitcast<u32>(p + 123.456789);
  var h = x;
  
  // Wang hash function
  h = (h ^ 61u) ^ (h >> 16u);
  h = h + (h << 3u);
  h = h ^ (h >> 4u);
  h = h * 0x27d4eb2du;
  h = h ^ (h >> 15u);
  
  // Convert back to float and normalize
  return f32(h) / 4294967296.0;
}`;

/**
 * @wgsl
 * @name hash31
 * @description Generates a 1D hash value from a 3D input vector.
 * @param {vec3<f32>} p Input 3D vector to hash.
 * @returns {f32} Hashed value between 0 and 1.
 */
export const hash31 = `fn hash31(p: vec3<f32>) -> f32 {
  var p3 = fract(p * vec3<f32>(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yxz + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}`;

/**
 * @wgsl
 * @name hash3D
 * @description Generates a 3D hash vector from a 3D input for displacement effects.
 * @param {vec3<f32>} p Input 3D vector to hash.
 * @returns {vec3<f32>} Hash result as 3D vector with values between -1 and 1.
 */
export const hash3D = `fn hash3D(p: vec3<f32>) -> vec3<f32> {
  var p3 = fract(p * vec3<f32>(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yxz + 33.33);
  return fract((p3.xxy + p3.yxx) * p3.zyx) * 2.0 - 1.0;
}`;

/**
 * @wgsl
 * @name noise3D
 * @description Generates 3D noise using trilinear interpolation.
 * @param {vec3<f32>} x Input 3D position for noise generation.
 * @returns {f32} Noise value between 0 and 1.
 */
export const noise3D = `fn noise3D(x: vec3<f32>) -> f32 {
  let p = floor(x);
  let f = fract(x);
  
  return mix(
    mix(
      mix(hash31(p), 
          hash31(p + vec3<f32>(1.0, 0.0, 0.0)), 
          f.x),
      mix(hash31(p + vec3<f32>(0.0, 1.0, 0.0)), 
          hash31(p + vec3<f32>(1.0, 1.0, 0.0)), 
          f.x),
      f.y),
    mix(
      mix(hash31(p + vec3<f32>(0.0, 0.0, 1.0)), 
          hash31(p + vec3<f32>(1.0, 0.0, 1.0)), 
          f.x),
      mix(hash31(p + vec3<f32>(0.0, 1.0, 1.0)), 
          hash31(p + vec3<f32>(1.0, 1.0, 1.0)), 
          f.x),
      f.y),
    f.z);
}`;

/**
 * @wgsl
 * @name warpNoise3D
 * @description Generates 3D warping noise using fractal Brownian motion.
 * @param {vec3<f32>} x Input 3D position.
 * @param {f32} seedVal Random seed for variation.
 * @returns {vec3<f32>} 3D warp vector with values between -1 and 1.
 */
export const warpNoise3D = `fn warpNoise3D(x: vec3<f32>, seedVal: f32) -> vec3<f32> {
  var p = x + seedVal;
  var nx = 0.0;
  var ny = 0.0;
  var nz = 0.0;
  var w = 0.5;
  
  for (var i = 0; i < 3; i++) {
    nx += w * noise3D(p);
    ny += w * noise3D(p + vec3<f32>(13.5, 41.3, 17.8));
    nz += w * noise3D(p + vec3<f32>(31.2, 23.7, 11.9));
    p *= 2.0;
    w *= 0.5;
  }
  
  return vec3<f32>(nx, ny, nz) * 2.0 - 1.0;
}`;
