// SDF utility functions for converting distance fields to other formats

/**
 * @wgsl
 * @name sdfToSolid
 * @description Converts a signed distance field to a solid boolean value.
 * @param {f32} signedDistance Signed distance field value.
 * @param {f32} threshold Threshold for solid determination.
 * @returns {f32} 1.0 if solid, 0.0 if not (as f32 for compatibility).
 */
export const sdfToSolid = `fn sdfToSolid(signedDistance: f32, threshold: f32) -> f32 {
  return select(0.0, 1.0, signedDistance <= threshold);
}`;

/**
 * @wgsl
 * @name sdfToStroke
 * @description Converts a signed distance field to a stroke/outline.
 * @param {f32} signedDistance Signed distance field value.
 * @param {f32} thickness Stroke thickness.
 * @param {f32} center Center distance for the stroke.
 * @returns {f32} 1.0 if within stroke, 0.0 if not.
 */
export const sdfToStroke = `fn sdfToStroke(signedDistance: f32, thickness: f32, center: f32) -> f32 {
  return select(0.0, 1.0, abs(signedDistance - center) <= thickness * 0.5);
}`;

/**
 * @wgsl
 * @name sdfToSmoothSolid
 * @description Converts a signed distance field to a smooth solid with anti-aliasing.
 * @param {f32} signedDistance Signed distance field value.
 * @param {f32} threshold Threshold for solid determination.
 * @param {f32} smoothing Smoothing factor for anti-aliasing.
 * @returns {f32} Smooth value between 0.0 and 1.0.
 */
export const sdfToSmoothSolid = `fn sdfToSmoothSolid(signedDistance: f32, threshold: f32, smoothing: f32) -> f32 {
  return 1.0 - smoothstep(threshold - smoothing, threshold + smoothing, signedDistance);
}`;

/**
 * @wgsl
 * @name sdfToSmoothStroke
 * @description Converts a signed distance field to a smooth stroke with anti-aliasing.
 * @param {f32} signedDistance Signed distance field value.
 * @param {f32} thickness Stroke thickness.
 * @param {f32} center Center distance for the stroke.
 * @param {f32} smoothing Smoothing factor for anti-aliasing.
 * @returns {f32} Smooth stroke value between 0.0 and 1.0.
 */
export const sdfToSmoothStroke = `fn sdfToSmoothStroke(signedDistance: f32, thickness: f32, center: f32, smoothing: f32) -> f32 {
  let distance = abs(signedDistance - center);
  return 1.0 - smoothstep(thickness * 0.5 - smoothing, thickness * 0.5 + smoothing, distance);
}`;
