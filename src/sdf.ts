// Signed Distance Field (SDF) functions for procedural geometry

/**
 * @wgsl
 * @name sdfCircle
 * @description Signed distance function for a circle.
 * @param {vec2<f32>} p Point to evaluate distance from.
 * @param {f32} r Circle radius.
 * @returns {f32} Signed distance to circle surface (negative inside, positive outside).
 */
export const sdfCircle = `fn sdfCircle(p: vec2<f32>, r: f32) -> f32 {
  return length(p) - r;
}`;

/**
 * @wgsl
 * @name sdfBox
 * @description Signed distance function for a rectangular box.
 * @param {vec2<f32>} p Point to evaluate distance from.
 * @param {vec2<f32>} b Box half-dimensions (width/2, height/2).
 * @returns {f32} Signed distance to box surface (negative inside, positive outside).
 */
export const sdfBox = `fn sdfBox(p: vec2<f32>, b: vec2<f32>) -> f32 {
  let d = abs(p) - b;
  return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0);
}`;

/**
 * @wgsl
 * @name sdfUnion
 * @description Combines two SDFs using union operation (closest surface).
 * @param {f32} d1 Distance from first shape.
 * @param {f32} d2 Distance from second shape.
 * @returns {f32} Combined distance representing union of both shapes.
 */
export const sdfUnion = `fn sdfUnion(d1: f32, d2: f32) -> f32 {
  return min(d1, d2);
}`;

/**
 * @wgsl
 * @name sdfIntersection
 * @description Combines two SDFs using intersection operation (overlapping area only).
 * @param {f32} d1 Distance from first shape.
 * @param {f32} d2 Distance from second shape.
 * @returns {f32} Combined distance representing intersection of both shapes.
 */
export const sdfIntersection = `fn sdfIntersection(d1: f32, d2: f32) -> f32 {
  return max(d1, d2);
}`;

/**
 * @wgsl
 * @name sdfSubtraction
 * @description Combines two SDFs using subtraction operation (first shape minus second).
 * @param {f32} d1 Distance from shape to subtract from.
 * @param {f32} d2 Distance from shape to subtract.
 * @returns {f32} Combined distance representing first shape with second subtracted.
 */
export const sdfSubtraction = `fn sdfSubtraction(d1: f32, d2: f32) -> f32 {
  return max(-d1, d2);
}`;
