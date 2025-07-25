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
 * @requires hash22
 */
export const noise2D = `//! requires hash22
fn noise2D(p: vec2<f32>) -> f32 {
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
 * @name fbm2D
 * @description Fractional Brownian Motion - combines multiple octaves of noise for complex patterns.
 * @param {vec2<f32>} p Input 2D coordinate.
 * @param {i32} octaves Number of noise octaves to combine.
 * @returns {f32} Combined noise value.
 * @requires noise2D
 */
export const fbm2D = `//! requires noise2D
fn fbm2D(p: vec2<f32>, octaves: i32) -> f32 {
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
 * @name fbm3D
 * @description Fractional Brownian Motion - combines multiple octaves of noise for complex patterns.
 * @param {vec3<f32>} p Input 3D coordinate.
 * @param {i32} octaves Number of noise octaves to combine.
 * @returns {f32} Combined noise value.
 * @requires noise3D
 */
export const fbm3D = `//! requires noise3D
  fn fbm3D(x: vec3f, seed: f32) -> f32 {
    var p = x + seed;
    var f = 0.0;
    var w = 0.5;
    for (var i = 0; i < 5; i++) {
      f += w * noise3D(p);
      p *= 2.0;
      w *= 0.5;
    }
    return f;
  }
`;

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
 * @requires hash31
 */
export const noise3D = `//! requires hash31
fn noise3D(x: vec3<f32>) -> f32 {
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
 * @requires noise3D
 */
export const warpNoise3D = `//! requires noise3D
fn warpNoise3D(x: vec3<f32>, seedVal: f32) -> vec3<f32> {
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

/**
 * @wgsl
 * @name pcg
 * @description Good and fast integer hash using PCG algorithm.
 * @param {u32} n Input unsigned integer to hash.
 * @returns {u32} Hashed unsigned integer value.
 */
// https://www.pcg-random.org/
export const pcg = `fn pcg(n: u32) -> u32 {
    var h = n * 747796405u + 2891336453u;
    h = ((h >> ((h >> 28u) + 4u)) ^ h) * 277803737u;
    return (h >> 22u) ^ h;
}`;

/**
 * @wgsl
 * @name pcg2d
 * @description 2D PCG hash function for fast procedural generation.
 * @param {vec2<u32>} p Input 2D unsigned integer vector to hash.
 * @returns {vec2<u32>} Hashed 2D unsigned integer vector.
 */
// https://www.pcg-random.org/
export const pcg2d = `fn pcg2d(p: vec2u) -> vec2u {
    var v = p * 1664525u + 1013904223u;
    v.x += v.y * 1664525u; v.y += v.x * 1664525u;
    v ^= v >> vec2u(16u);
    v.x += v.y * 1664525u; v.y += v.x * 1664525u;
    v ^= v >> vec2u(16u);
    return v;
}`;

/**
 * @wgsl
 * @name pcg3d
 * @description 3D PCG hash function for volumetric procedural generation.
 * @param {vec3<u32>} p Input 3D unsigned integer vector to hash.
 * @returns {vec3<u32>} Hashed 3D unsigned integer vector.
 */
// http://www.jcgt.org/published/0009/03/02/
export const pcg3d = `fn pcg3d(p: vec3u) -> vec3u {
    var v = p * 1664525u + 1013904223u;
    v.x += v.y*v.z; v.y += v.z*v.x; v.z += v.x*v.y;
    v ^= v >> vec3u(16u);
    v.x += v.y*v.z; v.y += v.z*v.x; v.z += v.x*v.y;
    return v;
}`;

/**
 * @wgsl
 * @name pcg4d
 * @description 4D PCG hash function for advanced procedural generation.
 * @param {vec4<u32>} p Input 4D unsigned integer vector to hash.
 * @returns {vec4<u32>} Hashed 4D unsigned integer vector.
 */
// http://www.jcgt.org/published/0009/03/02/
export const pcg4d = `fn pcg4d(p: vec4u) -> vec4u {
    var v = p * 1664525u + 1013904223u;
    v.x += v.y*v.w; v.y += v.z*v.x; v.z += v.x*v.y; v.w += v.y*v.z;
    v ^= v >> vec4u(16u);
    v.x += v.y*v.w; v.y += v.z*v.x; v.z += v.x*v.y; v.w += v.y*v.z;
    return v;
}`;

/**
 * @wgsl
 * @name xxhash32
 * @description Strong integer hash using xxHash algorithm.
 * @param {u32} n Input unsigned integer to hash.
 * @returns {u32} Hashed unsigned integer value.
 */
// https://github.com/Cyan4973/xxHash
// https://www.shadertoy.com/view/Xt3cDn
export const xxhash32 = `fn xxhash32(n: u32) -> u32 {
    var h32 = n + 374761393u;
    h32 = 668265263u * ((h32 << 17) | (h32 >> (32 - 17)));
    h32 = 2246822519u * (h32 ^ (h32 >> 15));
    h32 = 3266489917u * (h32 ^ (h32 >> 13));
    return h32^(h32 >> 16);
}`;

/**
 * @wgsl
 * @name xxhash322d
 * @description 2D xxHash for strong integer hashing in 2D.
 * @param {vec2<u32>} p Input 2D unsigned integer vector to hash.
 * @returns {u32} Hashed unsigned integer value.
 */
// https://github.com/Cyan4973/xxHash
// https://www.shadertoy.com/view/Xt3cDn
export const xxhash322d = `fn xxhash322d(p: vec2u) -> u32 {
    let p2 = 2246822519u; let p3 = 3266489917u;
    let p4 = 668265263u; let p5 = 374761393u;
    var h32 = p.y + p5 + p.x * p3;
    h32 = p4 * ((h32 << 17) | (h32 >> (32 - 17)));
    h32 = p2 * (h32^(h32 >> 15));
    h32 = p3 * (h32^(h32 >> 13));
    return h32^(h32 >> 16);
}`;

/**
 * @wgsl
 * @name xxhash323d
 * @description 3D xxHash for strong integer hashing in 3D.
 * @param {vec3<u32>} p Input 3D unsigned integer vector to hash.
 * @returns {u32} Hashed unsigned integer value.
 */
// https://github.com/Cyan4973/xxHash
// https://www.shadertoy.com/view/Xt3cDn
export const xxhash323d = `fn xxhash323d(p: vec3u) -> u32 {
    let p2 = 2246822519u; let p3 = 3266489917u;
    let p4 = 668265263u; let p5 = 374761393u;
    var h32 =  p.z + p5 + p.x*p3;
    h32 = p4 * ((h32 << 17) | (h32 >> (32 - 17)));
    h32 += p.y * p3;
    h32 = p4 * ((h32 << 17) | (h32 >> (32 - 17)));
    h32 = p2 * (h32^(h32 >> 15));
    h32 = p3 * (h32^(h32 >> 13));
    return h32^(h32 >> 16);
}`;

/**
 * @wgsl
 * @name xxhash324d
 * @description 4D xxHash for strong integer hashing in 4D.
 * @param {vec4<u32>} p Input 4D unsigned integer vector to hash.
 * @returns {u32} Hashed unsigned integer value.
 */
// https://github.com/Cyan4973/xxHash
// https://www.shadertoy.com/view/Xt3cDn
export const xxhash324d = `fn xxhash324d(p: vec4u) -> u32 {
    let p2 = 2246822519u; let p3 = 3266489917u;
    let p4 = 668265263u; let p5 = 374761393u;
    var h32 = p.w + p5 + p.x * p3;
    h32 = p4 * ((h32 << 17) | (h32 >> (32 - 17)));
    h32 += p.y * p3;
    h32 = p4 * ((h32 << 17) | (h32 >> (32 - 17)));
    h32 += p.z  * p3;
    h32 = p4 * ((h32 << 17) | (h32 >> (32 - 17)));
    h32 = p2 * (h32^(h32 >> 15));
    h32 = p3 * (h32^(h32 >> 13));
    return h32 ^ (h32 >> 16);
}`;



/**
 * @wgsl
 * @name rand11Sin
 * @description Random float from 1D input using sine (platform dependent).
 * @param {f32} n Input float value.
 * @returns {f32} Random float between 0 and 1.
 */
// On generating random numbers, with help of y= [(a+x)sin(bx)] mod 1", W.J.J. Rey, 22nd European Meeting of Statisticians 1998
export const rand11Sin = `fn rand11(n: f32) -> f32 { 
    return fract(sin(n) * 43758.5453123); 
}`;

/**
 * @wgsl
 * @name rand22Sin
 * @description Random float from 2D input using sine (platform dependent).
 * @param {vec2<f32>} n Input 2D vector.
 * @returns {f32} Random float between 0 and 1.
 */
// On generating random numbers, with help of y= [(a+x)sin(bx)] mod 1", W.J.J. Rey, 22nd European Meeting of Statisticians 1998
export const rand22Sin = `fn rand22(n: vec2f) -> f32 { 
    return fract(sin(dot(n, vec2f(12.9898, 4.1414))) * 43758.5453); 
}`;

/**
 * @wgsl
 * @name valueNoise1D
 * @description Simple 1D value noise using random interpolation.
 * @param {f32} p Input 1D coordinate.
 * @returns {f32} Noise value between 0 and 1.
 * @requires rand11Sin
 */
// WTFPL License
export const valueNoise1D = `//! requires rand11Sin
fn noise(p: f32) -> f32 {
    let fl = floor(p);
    return mix(rand11(fl), rand11(fl + 1.), fract(p));
}`;

/**
 * @wgsl
 * @name valueNoise2D
 * @description Simple 2D value noise using smooth interpolation.
 * @param {vec2<f32>} n Input 2D coordinate.
 * @returns {f32} Noise value between 0 and 1.
 * @requires rand22Sin smoothStepVec2
 */
// WTFPL License
export const valueNoise2D = `//! requires rand22Sin smoothStepVec2
fn noise2(n: vec2f) -> f32 {
    let d = vec2f(0., 1.);
    let b = floor(n);
    let f = smoothStepVec2(vec2f(0.), vec2f(1.), fract(n));
    return mix(mix(rand22(b), rand22(b + d.yx), f.x), mix(rand22(b + d.xy), rand22(b + d.yy), f.x), f.y);
}`;

/**
 * @wgsl
 * @name mod289
 * @description Modulo 289 operation for Perlin noise.
 * @param {vec4<f32>} x Input 4D vector.
 * @returns {vec4<f32>} Result of x mod 289.
 */
// MIT License. © Stefan Gustavson, Munrocket
export const mod289 = `fn mod289(x: vec4f) -> vec4f { 
    return x - floor(x * (1. / 289.)) * 289.; 
}`;

/**
 * @wgsl
 * @name perm4
 * @description Permutation function for Perlin noise.
 * @param {vec4<f32>} x Input 4D vector.
 * @returns {vec4<f32>} Permuted 4D vector.
 * @requires mod289
 */
// MIT License. © Stefan Gustavson, Munrocket
export const perm4 = `//! requires mod289
fn perm4(x: vec4f) -> vec4f { 
    return mod289(((x * 34.) + 1.) * x); 
}`;

/**
 * @wgsl
 * @name valueNoise3D
 * @description 3D value noise using permutation tables.
 * @param {vec3<f32>} p Input 3D coordinate.
 * @returns {f32} Noise value between 0 and 1.
 * @requires perm4
 */
// MIT License. © Stefan Gustavson, Munrocket
export const valueNoise3D = `//! requires perm4
fn noise3(p: vec3f) -> f32 {
    let a = floor(p);
    var d: vec3f = p - a;
    d = d * d * (3. - 2. * d);

    let b = a.xxyy + vec4f(0., 1., 0., 1.);
    let k1 = perm4(b.xyxy);
    let k2 = perm4(k1.xyxy + b.zzww);

    let c = k2 + a.zzzz;
    let k3 = perm4(c);
    let k4 = perm4(c + 1.);

    let o1 = fract(k3 * (1. / 41.));
    let o2 = fract(k4 * (1. / 41.));

    let o3 = o2 * d.z + o1 * (1. - d.z);
    let o4 = o3.yw * d.x + o3.xz * (1. - d.x);

    return o4.y * d.y + o4.x * (1. - d.y);
}`;

/**
 * @wgsl
 * @name perlinNoise2D
 * @description 2D Perlin noise implementation.
 * @param {vec2<f32>} P Input 2D coordinate.
 * @returns {f32} Perlin noise value.
 */
// MIT License. © Stefan Gustavson, Munrocket
export const perlinNoise2D = `fn perlinNoise2_permute4(x: vec4f) -> vec4f { 
    return ((x * 34. + 1.) * x) % vec4f(289.); 
}

fn perlinNoise2_fade2(t: vec2f) -> vec2f { 
    return t * t * t * (t * (t * 6. - 15.) + 10.); 
}

fn perlinNoise2(P: vec2f) -> f32 {
    var Pi: vec4f = floor(P.xyxy) + vec4f(0., 0., 1., 1.);
    let Pf = fract(P.xyxy) - vec4f(0., 0., 1., 1.);
    Pi = Pi % vec4f(289.); // To avoid truncation effects in permutation
    let ix = Pi.xzxz;
    let iy = Pi.yyww;
    let fx = Pf.xzxz;
    let fy = Pf.yyww;
    let i = perlinNoise2_permute4(perlinNoise2_permute4(ix) + iy);
    var gx: vec4f = 2. * fract(i * 0.0243902439) - 1.; // 1/41 = 0.024...
    let gy = abs(gx) - 0.5;
    let tx = floor(gx + 0.5);
    gx = gx - tx;
    var g00: vec2f = vec2f(gx.x, gy.x);
    var g10: vec2f = vec2f(gx.y, gy.y);
    var g01: vec2f = vec2f(gx.z, gy.z);
    var g11: vec2f = vec2f(gx.w, gy.w);
    let norm = 1.79284291400159 - 0.85373472095314 *
        vec4f(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
    g00 = g00 * norm.x;
    g01 = g01 * norm.y;
    g10 = g10 * norm.z;
    g11 = g11 * norm.w;
    let n00 = dot(g00, vec2f(fx.x, fy.x));
    let n10 = dot(g10, vec2f(fx.y, fy.y));
    let n01 = dot(g01, vec2f(fx.z, fy.z));
    let n11 = dot(g11, vec2f(fx.w, fy.w));
    let fade_xy = perlinNoise2_fade2(Pf.xy);
    let n_x = mix(vec2f(n00, n01), vec2f(n10, n11), vec2f(fade_xy.x));
    let n_xy = mix(n_x.x, n_x.y, fade_xy.y);
    return 2.3 * n_xy;
}`;

/**
 * @wgsl
 * @name perlinNoise3D
 * @description 3D Perlin noise implementation.
 * @param {vec3<f32>} P Input 3D coordinate.
 * @returns {f32} Perlin noise value.
 * @requires taylorInvSqrt4
 */
// MIT License. © Stefan Gustavson, Munrocket
export const perlinNoise3D = `//! requires taylorInvSqrt4
fn perlinNoise3_permute4(x: vec4f) -> vec4f { 
    return ((x * 34. + 1.) * x) % vec4f(289.); 
}

fn perlinNoise3_fade3(t: vec3f) -> vec3f { 
    return t * t * t * (t * (t * 6. - 15.) + 10.); 
}

fn perlinNoise3(P: vec3f) -> f32 {
    var Pi0 : vec3f = floor(P); // Integer part for indexing
    var Pi1 : vec3f = Pi0 + vec3f(1.); // Integer part + 1
    Pi0 = Pi0 % vec3f(289.);
    Pi1 = Pi1 % vec3f(289.);
    let Pf0 = fract(P); // Fractional part for interpolation
    let Pf1 = Pf0 - vec3f(1.); // Fractional part - 1.
    let ix = vec4f(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    let iy = vec4f(Pi0.yy, Pi1.yy);
    let iz0 = Pi0.zzzz;
    let iz1 = Pi1.zzzz;

    let ixy = perlinNoise3_permute4(perlinNoise3_permute4(ix) + iy);
    let ixy0 = perlinNoise3_permute4(ixy + iz0);
    let ixy1 = perlinNoise3_permute4(ixy + iz1);

    var gx0: vec4f = ixy0 / 7.;
    var gy0: vec4f = fract(floor(gx0) / 7.) - 0.5;
    gx0 = fract(gx0);
    var gz0: vec4f = vec4f(0.5) - abs(gx0) - abs(gy0);
    var sz0: vec4f = step(gz0, vec4f(0.));
    gx0 = gx0 + sz0 * (step(vec4f(0.), gx0) - 0.5);
    gy0 = gy0 + sz0 * (step(vec4f(0.), gy0) - 0.5);

    var gx1: vec4f = ixy1 / 7.;
    var gy1: vec4f = fract(floor(gx1) / 7.) - 0.5;
    gx1 = fract(gx1);
    var gz1: vec4f = vec4f(0.5) - abs(gx1) - abs(gy1);
    var sz1: vec4f = step(gz1, vec4f(0.));
    gx1 = gx1 - sz1 * (step(vec4f(0.), gx1) - 0.5);
    gy1 = gy1 - sz1 * (step(vec4f(0.), gy1) - 0.5);

    var g000: vec3f = vec3f(gx0.x, gy0.x, gz0.x);
    var g100: vec3f = vec3f(gx0.y, gy0.y, gz0.y);
    var g010: vec3f = vec3f(gx0.z, gy0.z, gz0.z);
    var g110: vec3f = vec3f(gx0.w, gy0.w, gz0.w);
    var g001: vec3f = vec3f(gx1.x, gy1.x, gz1.x);
    var g101: vec3f = vec3f(gx1.y, gy1.y, gz1.y);
    var g011: vec3f = vec3f(gx1.z, gy1.z, gz1.z);
    var g111: vec3f = vec3f(gx1.w, gy1.w, gz1.w);

    let norm0 = taylorInvSqrt4(
        vec4f(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 = g000 * norm0.x;
    g010 = g010 * norm0.y;
    g100 = g100 * norm0.z;
    g110 = g110 * norm0.w;
    let norm1 = taylorInvSqrt4(
        vec4f(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 = g001 * norm1.x;
    g011 = g011 * norm1.y;
    g101 = g101 * norm1.z;
    g111 = g111 * norm1.w;

    let n000 = dot(g000, Pf0);
    let n100 = dot(g100, vec3f(Pf1.x, Pf0.yz));
    let n010 = dot(g010, vec3f(Pf0.x, Pf1.y, Pf0.z));
    let n110 = dot(g110, vec3f(Pf1.xy, Pf0.z));
    let n001 = dot(g001, vec3f(Pf0.xy, Pf1.z));
    let n101 = dot(g101, vec3f(Pf1.x, Pf0.y, Pf1.z));
    let n011 = dot(g011, vec3f(Pf0.x, Pf1.yz));
    let n111 = dot(g111, Pf1);

    var fade_xyz: vec3f = perlinNoise3_fade3(Pf0);
    let temp = vec4f(f32(fade_xyz.z)); // simplify after chrome bug fix
    let n_z = mix(vec4f(n000, n100, n010, n110), vec4f(n001, n101, n011, n111), temp);
    let n_yz = mix(n_z.xy, n_z.zw, vec2f(f32(fade_xyz.y))); // simplify after chrome bug fix
    let n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 2.2 * n_xyz;
}`;

/**
 * @wgsl
 * @name simplexNoise2D
 * @description 2D simplex noise implementation for efficient 2D procedural generation.
 * @param {vec2<f32>} v Input 2D coordinate.
 * @returns {f32} Simplex noise value typically in range [-1, 1].
 */
export const simplexNoise2D = `fn snoise2D_permute3(x: vec3<f32>) -> vec3<f32> {
    return ((x * 34.0 + 1.0) * x) % vec3<f32>(289.0);
}

fn snoise2D(v: vec2<f32>) -> f32 {
    let C = vec4<f32>(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    var i = floor(v + dot(v, C.yy));
    let x0 = v - i + dot(i, C.xx);
    
    var i1: vec2<f32>;
    if (x0.x > x0.y) {
        i1 = vec2<f32>(1.0, 0.0);
    } else {
        i1 = vec2<f32>(0.0, 1.0);
    }
    
    var x12 = x0.xyxy + C.xxzz;
    x12 = vec4<f32>(x12.xy - i1, x12.zw);
    
    i = i % vec2<f32>(289.0);
    let p = snoise2D_permute3(snoise2D_permute3(i.y + vec3<f32>(0.0, i1.y, 1.0)) + i.x + vec3<f32>(0.0, i1.x, 1.0));
    
    var m = max(0.5 - vec3<f32>(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), vec3<f32>(0.0));
    m = m * m;
    m = m * m;
    
    let x = 2.0 * fract(p * C.www) - 1.0;
    let h = abs(x) - 0.5;
    let ox = floor(x + 0.5);
    let a0 = x - ox;
    
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    
    var g: vec3<f32>;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.y = a0.y * x12.x + h.y * x12.y;
    g.z = a0.z * x12.z + h.z * x12.w;
    
    return 130.0 * dot(m, g);
}`;

/**
 * @wgsl
 * @name simplexNoise3D
 * @description 3D simplex noise implementation for volumetric procedural generation.
 * @param {vec3<f32>} v Input 3D coordinate.
 * @returns {f32} Simplex noise value typically in range [-1, 1].
 */
export const simplexNoise3D = `fn snoise3D_permute4(x: vec4<f32>) -> vec4<f32> {
    return ((x * 34.0 + 1.0) * x) % vec4<f32>(289.0);
}

fn snoise3D_taylorInvSqrt4(r: vec4<f32>) -> vec4<f32> {
    return 1.79284291400159 - 0.85373472095314 * r;
}

fn snoise3D(v: vec3<f32>) -> f32 {
    let C = vec2<f32>(1.0 / 6.0, 1.0 / 3.0);
    let D = vec4<f32>(0.0, 0.5, 1.0, 2.0);
    
    // First corner
    var i = floor(v + dot(v, C.yyy));
    let x0 = v - i + dot(i, C.xxx);
    
    // Other corners
    let g = step(x0.yzx, x0.xyz);
    let l = 1.0 - g;
    let i1 = min(g.xyz, l.zxy);
    let i2 = max(g.xyz, l.zxy);
    
    // x0 = x0 - 0. + 0.0 * C
    let x1 = x0 - i1 + 1.0 * C.xxx;
    let x2 = x0 - i2 + 2.0 * C.xxx;
    let x3 = x0 - 1.0 + 3.0 * C.xxx;
    
    // Permutations
    i = i % vec3<f32>(289.0);
    let p = snoise3D_permute4(snoise3D_permute4(snoise3D_permute4(
        i.z + vec4<f32>(0.0, i1.z, i2.z, 1.0)) +
        i.y + vec4<f32>(0.0, i1.y, i2.y, 1.0)) +
        i.x + vec4<f32>(0.0, i1.x, i2.x, 1.0));
    
    // Gradients
    // (N*N points uniformly over a square, mapped onto an octahedron.)
    let n_ = 1.0 / 7.0; // N=7
    let ns = n_ * D.wyz - D.xzx;
    
    let j = p - 49.0 * floor(p * ns.z * ns.z); // mod(p,N*N)
    
    let x_ = floor(j * ns.z);
    let y_ = floor(j - 7.0 * x_); // mod(j,N)
    
    let x = x_ * ns.x + ns.yyyy;
    let y = y_ * ns.x + ns.yyyy;
    let h = 1.0 - abs(x) - abs(y);
    
    let b0 = vec4<f32>(x.xy, y.xy);
    let b1 = vec4<f32>(x.zw, y.zw);
    
    let s0 = floor(b0) * 2.0 + 1.0;
    let s1 = floor(b1) * 2.0 + 1.0;
    let sh = -step(h, vec4<f32>(0.0));
    
    let a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    let a1 = b1.xzyw + s1.xzyw * sh.zzww;
    
    var p0 = vec3<f32>(a0.xy, h.x);
    var p1 = vec3<f32>(a0.zw, h.y);
    var p2 = vec3<f32>(a1.xy, h.z);
    var p3 = vec3<f32>(a1.zw, h.w);
    
    // Normalise gradients
    let norm = snoise3D_taylorInvSqrt4(vec4<f32>(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    // Mix final noise value
    var m = max(0.6 - vec4<f32>(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), vec4<f32>(0.0));
    m = m * m;
    return 42.0 * dot(m * m, vec4<f32>(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}`;

/**
 * @wgsl
 * @name simplexNoise4D
 * @description 4D simplex noise implementation for high-quality procedural generation.
 * @param {vec4<f32>} v Input 4D coordinate.
 * @returns {f32} Simplex noise value typically in range [-1, 1].
 * @requires mod289 taylorInvSqrt4
 */
export const simplexNoise4D = `//! requires mod289 taylorInvSqrt4
fn snoise_permute4(x: vec4<f32>) -> vec4<f32> {
    return mod289(((x * 34.0) + 10.0) * x);
}

fn snoise_mod289f(x: f32) -> f32 {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

fn snoise_permute(x: f32) -> f32 {
    return snoise_mod289f(((x * 34.0) + 10.0) * x);
}

fn snoise_taylorInvSqrt(r: f32) -> f32 {
    return 1.79284291400159 - 0.85373472095314 * r;
}

fn snoise_grad4(j: f32, ip: vec4<f32>) -> vec4<f32> {
    let ones = vec4(1.0, 1.0, 1.0, -1.0);

    var p: vec4<f32>;
    var s: vec4<f32>;

    p = vec4(floor(fract(vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0, p.w);
    p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
    s = select(vec4(0.0), vec4(1.0), p < vec4(0.0));
    p = vec4(p.xyz + (s.xyz * 2.0 - 1.0) * s.www, p.w);

    return p;
}

fn snoise(v: vec4<f32>) -> f32 {
    let C: vec4<f32> = vec4(
        0.138196601125011, // (5 - sqrt(5))/20  G4
        0.276393202250021, // 2 * G4
        0.414589803375032, // 3 * G4
        -0.447213595499958 // -1 + 4 * G4
    );

    // (sqrt(5) - 1)/4 = F4, used once below
    let F4: f32 = 0.309016994374947451;

    // First corner
    var i: vec4<f32> = floor(v + dot(v, vec4(F4)));
    var x0: vec4<f32> = v - i + dot(i, C.xxxx);

    // Other corners

    // Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
    var i0: vec4<f32>;
    var isX: vec3<f32> = step(x0.yzw, x0.xxx);
    var isYZ: vec3<f32> = step(x0.zww, x0.yyz);

    //  i0.x = dot( isX, vec3( 1.0 ) );
    i0.x = isX.x + isX.y + isX.z;
    var minusX = 1.0 - isX;
    i0.y = minusX.x;
    i0.z = minusX.y;
    i0.w = minusX.z;

    //  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
    i0.y += isYZ.x + isYZ.y;
    var minusY = 1.0 - isYZ;
    i0.z += minusY.x;
    i0.w += minusY.y;
    i0.z += isYZ.z;
    i0.w += minusY.z;

    // i0 now contains the unique values 0,1,2,3 in each channel
    var i3: vec4<f32> = vec4<f32>(clamp(i0, vec4(0.0), vec4(1.0)));
    var i2: vec4<f32> = clamp(i0 - vec4(1.0), vec4(0.0), vec4(1.0));
    var i1: vec4<f32> = clamp(i0 - vec4(2.0), vec4(0.0), vec4(1.0));

    //  x0 = x0 - 0.0 + 0.0 * C.xxxx
    //  x1 = x0 - i1  + 1.0 * C.xxxx
    //  x2 = x0 - i2  + 2.0 * C.xxxx
    //  x3 = x0 - i3  + 3.0 * C.xxxx
    //  x4 = x0 - 1.0 + 4.0 * C.xxxx
    var x1: vec4<f32> = x0 - i1 + C.xxxx;
    var x2: vec4<f32> = x0 - i2 + C.yyyy;
    var x3: vec4<f32> = x0 - i3 + C.zzzz;
    var x4: vec4<f32> = x0 + C.wwww;

    // Permutations
    i = mod289(i);
    var j0: f32 = snoise_permute(snoise_permute(snoise_permute(snoise_permute(i.w) + i.z) + i.y) + i.x);
    var j1: vec4<f32> = snoise_permute4(snoise_permute4(snoise_permute4(snoise_permute4(i.w + vec4(i1.w, i2.w, i3.w, 1.0)) + i.z + vec4(i1.z, i2.z, i3.z, 1.0)) + i.y + vec4(i1.y, i2.y, i3.y, 1.0)) + i.x + vec4(i1.x, i2.x, i3.x, 1.0));

    // Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope
    // 7*7*6 = 294, which is close to the ring size 17*17 = 289.
    var ip: vec4<f32> = vec4(1.0 / 294.0, 1.0 / 49.0, 1.0 / 7.0, 0.0);

    var p0: vec4<f32> = snoise_grad4(j0, ip);
    var p1: vec4<f32> = snoise_grad4(j1.x, ip);
    var p2: vec4<f32> = snoise_grad4(j1.y, ip);
    var p3: vec4<f32> = snoise_grad4(j1.z, ip);
    var p4: vec4<f32> = snoise_grad4(j1.w, ip);

    // Normalise gradients
    var norm: vec4<f32> = taylorInvSqrt4(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    p4 *= snoise_taylorInvSqrt(dot(p4, p4));

    // Mix contributions from the five corners
    var m0: vec3<f32> = max(0.6 - vec3(dot(x0, x0), dot(x1, x1), dot(x2, x2)), vec3(0.0));
    var m1: vec2<f32> = max(0.6 - vec2(dot(x3, x3), dot(x4, x4)), vec2(0.0));
    m0 = m0 * m0;
    m1 = m1 * m1;
    return 49.0 * (dot(m0 * m0, vec3(dot(p0, x0), dot(p1, x1), dot(p2, x2))) + dot(m1 * m1, vec2(dot(p3, x3), dot(p4, x4))));
}`;