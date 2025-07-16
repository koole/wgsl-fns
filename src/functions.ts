// WGSL Function definitions as strings

export const elasticWave = `fn elasticWave(x: f32, amplitude: f32, frequency: f32, decay: f32, phase: f32) -> f32 {
  let d = max(0.001, decay);
  let decayTerm = exp(-d * x);
  let oscTerm = sin(frequency * x * 6.28318 + phase);
  return amplitude * decayTerm * oscTerm;
}`;

export const smoothStep = `fn smoothStep(edge0: f32, edge1: f32, x: f32) -> f32 {
  let t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}`;

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

export const hash22 = `fn hash22(p: vec2<f32>) -> vec2<f32> {
  var p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}`;

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

export const rotate2D = `fn rotate2D(v: vec2<f32>, angle: f32) -> vec2<f32> {
  let c = cos(angle);
  let s = sin(angle);
  return vec2(v.x * c - v.y * s, v.x * s + v.y * c);
}`;

export const sdfCircle = `fn sdfCircle(p: vec2<f32>, r: f32) -> f32 {
  return length(p) - r;
}`;

export const sdfBox = `fn sdfBox(p: vec2<f32>, b: vec2<f32>) -> f32 {
  let d = abs(p) - b;
  return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0);
}`;

export const sdfUnion = `fn sdfUnion(d1: f32, d2: f32) -> f32 {
  return min(d1, d2);
}`;

export const sdfIntersection = `fn sdfIntersection(d1: f32, d2: f32) -> f32 {
  return max(d1, d2);
}`;

export const sdfSubtraction = `fn sdfSubtraction(d1: f32, d2: f32) -> f32 {
  return max(-d1, d2);
}`;

export const palette = `fn palette(t: f32, a: vec3<f32>, b: vec3<f32>, c: vec3<f32>, d: vec3<f32>) -> vec3<f32> {
  return a + b * cos(6.28318 * (c * t + d));
}`;

export const linearToSrgb = `fn linearToSrgb(color: vec3<f32>) -> vec3<f32> {
  return pow(color, vec3(1.0 / 2.2));
}`;

export const srgbToLinear = `fn srgbToLinear(color: vec3<f32>) -> vec3<f32> {
  return pow(color, vec3(2.2));
}`;

export const hue2rgb = `fn hue2rgb(p: f32, q: f32, t: f32) -> f32 {
  var t_adj = t;
  if (t_adj < 0.0) { t_adj += 1.0; }
  if (t_adj > 1.0) { t_adj -= 1.0; }
  if (t_adj < 1.0 / 6.0) { return p + (q - p) * 6.0 * t_adj; }
  if (t_adj < 1.0 / 2.0) { return q; }
  if (t_adj < 2.0 / 3.0) { return p + (q - p) * (2.0 / 3.0 - t_adj) * 6.0; }
  return p;
}`;

export const hslToRgb = `fn hslToRgb(hsl: vec3<f32>) -> vec3<f32> {
  let h = hsl.x;
  let s = hsl.y;
  let l = hsl.z;
  
  if (s == 0.0) {
    return vec3(l); // achromatic
  }
  
  let q = select(l * (1.0 + s), l + s - l * s, l < 0.5);
  let p = 2.0 * l - q;
  
  return vec3(
    hue2rgb(p, q, h + 1.0 / 3.0),
    hue2rgb(p, q, h),
    hue2rgb(p, q, h - 1.0 / 3.0)
  );
}`;

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
