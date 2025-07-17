// Color manipulation and conversion functions

/**
 * @wgsl
 * @name palette
 * @description Generates colors using cosine-based palette function for smooth color gradients.
 * @param {f32} t Input parameter (typically 0-1) for palette lookup.
 * @param {vec3<f32>} a Offset values for RGB channels.
 * @param {vec3<f32>} b Amplitude values for RGB channels.
 * @param {vec3<f32>} c Frequency values for RGB channels.
 * @param {vec3<f32>} d Phase values for RGB channels.
 * @returns {vec3<f32>} Generated RGB color.
 */
export const palette = `fn palette(t: f32, a: vec3<f32>, b: vec3<f32>, c: vec3<f32>, d: vec3<f32>) -> vec3<f32> {
  return a + b * cos(6.28318 * (c * t + d));
}`;

/**
 * @wgsl
 * @name linearToSrgb
 * @description Converts linear RGB color values to sRGB color space.
 * @param {vec3<f32>} color Linear RGB color values.
 * @returns {vec3<f32>} sRGB color values.
 */
export const linearToSrgb = `fn linearToSrgb(color: vec3<f32>) -> vec3<f32> {
  return pow(color, vec3(1.0 / 2.2));
}`;

/**
 * @wgsl
 * @name srgbToLinear
 * @description Converts sRGB color values to linear RGB color space.
 * @param {vec3<f32>} color sRGB color values.
 * @returns {vec3<f32>} Linear RGB color values.
 */
export const srgbToLinear = `fn srgbToLinear(color: vec3<f32>) -> vec3<f32> {
  return pow(color, vec3(2.2));
}`;

/**
 * @wgsl
 * @name hue2rgb
 * @description Helper function for HSL to RGB conversion - converts hue component to RGB.
 * @param {f32} p First HSL conversion parameter.
 * @param {f32} q Second HSL conversion parameter.
 * @param {f32} t Hue value (adjusted).
 * @returns {f32} RGB component value.
 */
export const hue2rgb = `fn hue2rgb(p: f32, q: f32, t: f32) -> f32 {
  var t_adj = t;
  if (t_adj < 0.0) { t_adj += 1.0; }
  if (t_adj > 1.0) { t_adj -= 1.0; }
  if (t_adj < 1.0 / 6.0) { return p + (q - p) * 6.0 * t_adj; }
  if (t_adj < 1.0 / 2.0) { return q; }
  if (t_adj < 2.0 / 3.0) { return p + (q - p) * (2.0 / 3.0 - t_adj) * 6.0; }
  return p;
}`;

/**
 * @wgsl
 * @name hslToRgb
 * @description Converts HSL (Hue, Saturation, Lightness) color to RGB.
 * @param {vec3<f32>} hsl HSL color values (hue: 0-1, saturation: 0-1, lightness: 0-1).
 * @returns {vec3<f32>} RGB color values.
 * @requires hue2rgb
 */
export const hslToRgb = `//! requires hue2rgb
fn hslToRgb(hsl: vec3<f32>) -> vec3<f32> {
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
