// SDF Boolean operations for combining multiple distance fields

/**
 * @wgsl
 * @name sdfOpUnion
 * @description Combines two SDFs using union operation (logical OR).
 * @param {f32} distanceA First signed distance field.
 * @param {f32} distanceB Second signed distance field.
 * @returns {f32} Combined signed distance field.
 */
export const sdfOpUnion = `fn sdfOpUnion(distanceA: f32, distanceB: f32) -> f32 {
  return min(distanceA, distanceB);
}`;

/**
 * @wgsl
 * @name sdfOpSubtract
 * @description Subtracts one SDF from another (A - B).
 * @param {f32} distanceA First signed distance field.
 * @param {f32} distanceB Second signed distance field to subtract.
 * @returns {f32} Subtracted signed distance field.
 */
export const sdfOpSubtract = `fn sdfOpSubtract(distanceA: f32, distanceB: f32) -> f32 {
  return max(distanceA, -distanceB);
}`;

/**
 * @wgsl
 * @name sdfOpIntersect
 * @description Intersects two SDFs (logical AND).
 * @param {f32} distanceA First signed distance field.
 * @param {f32} distanceB Second signed distance field.
 * @returns {f32} Intersected signed distance field.
 */
export const sdfOpIntersect = `fn sdfOpIntersect(distanceA: f32, distanceB: f32) -> f32 {
  return max(distanceA, distanceB);
}`;

/**
 * @wgsl
 * @name sdfSmoothUnion
 * @description Combines two SDFs using smooth union operation with configurable smoothing.
 * @param {f32} distanceA First signed distance field.
 * @param {f32} distanceB Second signed distance field.
 * @param {f32} smoothing Smoothing factor for the blend.
 * @returns {f32} Smoothly combined signed distance field.
 */
export const sdfSmoothUnion = `fn sdfSmoothUnion(distanceA: f32, distanceB: f32, smoothing: f32) -> f32 {
  let h = clamp(0.5 + 0.5 * (distanceB - distanceA) / smoothing, 0.0, 1.0);
  return mix(distanceB, distanceA, h) - smoothing * h * (1.0 - h);
}`;

/**
 * @wgsl
 * @name sdfSmoothSubtract
 * @description Subtracts one SDF from another with smooth blending.
 * @param {f32} distanceA First signed distance field.
 * @param {f32} distanceB Second signed distance field to subtract.
 * @param {f32} smoothing Smoothing factor for the blend.
 * @returns {f32} Smoothly subtracted signed distance field.
 */
export const sdfSmoothSubtract = `fn sdfSmoothSubtract(distanceA: f32, distanceB: f32, smoothing: f32) -> f32 {
  let h = clamp(0.5 - 0.5 * (distanceB + distanceA) / smoothing, 0.0, 1.0);
  return mix(distanceA, -distanceB, h) + smoothing * h * (1.0 - h);
}`;

/**
 * @wgsl
 * @name sdfSmoothIntersect
 * @description Intersects two SDFs with smooth blending.
 * @param {f32} distanceA First signed distance field.
 * @param {f32} distanceB Second signed distance field.
 * @param {f32} smoothing Smoothing factor for the blend.
 * @returns {f32} Smoothly intersected signed distance field.
 */
export const sdfSmoothIntersect = `fn sdfSmoothIntersect(distanceA: f32, distanceB: f32, smoothing: f32) -> f32 {
  let h = clamp(0.5 - 0.5 * (distanceB - distanceA) / smoothing, 0.0, 1.0);
  return mix(distanceB, distanceA, h) + smoothing * h * (1.0 - h);
}`;

/**
 * @wgsl
 * @name sdfChamferUnion
 * @description Combines two SDFs using chamfer union operation with hard edges.
 * @param {f32} distanceA First signed distance field.
 * @param {f32} distanceB Second signed distance field.
 * @param {f32} radius Chamfer radius for the edge.
 * @returns {f32} Chamfered union signed distance field.
 */
export const sdfChamferUnion = `fn sdfChamferUnion(distanceA: f32, distanceB: f32, radius: f32) -> f32 {
  return min(min(distanceA, distanceB), (distanceA - radius + distanceB) * 0.5);
}`;

/**
 * @wgsl
 * @name sdfChamferSubtract
 * @description Subtracts one SDF from another using chamfer operation.
 * @param {f32} distanceA First signed distance field.
 * @param {f32} distanceB Second signed distance field to subtract.
 * @param {f32} radius Chamfer radius for the edge.
 * @returns {f32} Chamfered subtraction signed distance field.
 */
export const sdfChamferSubtract = `fn sdfChamferSubtract(distanceA: f32, distanceB: f32, radius: f32) -> f32 {
  return max(max(distanceA, -distanceB), (distanceA + radius - distanceB) * 0.5);
}`;

/**
 * @wgsl
 * @name sdfChamferIntersect
 * @description Intersects two SDFs using chamfer operation.
 * @param {f32} distanceA First signed distance field.
 * @param {f32} distanceB Second signed distance field.
 * @param {f32} radius Chamfer radius for the edge.
 * @returns {f32} Chamfered intersection signed distance field.
 */
export const sdfChamferIntersect = `fn sdfChamferIntersect(distanceA: f32, distanceB: f32, radius: f32) -> f32 {
  return max(max(distanceA, distanceB), (distanceA + radius + distanceB) * 0.5);
}`;
