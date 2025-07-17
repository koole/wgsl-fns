// SDF deformation and modification functions for creating complex effects

/**
 * @wgsl
 * @name sdfTwist
 * @description Applies a continuous rotation around an axis proportional to distance along that axis.
 * @param {vec3<f32>} position 3D position to transform.
 * @param {f32} angle Twist angle in radians per unit distance.
 * @param {vec3<f32>} axis Axis to twist around (should be normalized).
 * @returns {vec3<f32>} Twisted position.
 */
export const sdfTwist = `fn sdfTwist(position: vec3<f32>, angle: f32, axis: vec3<f32>) -> vec3<f32> {
  // Normalize the axis
  let axisNorm = normalize(axis);
  
  // Project position onto the twist axis
  let proj = dot(position, axisNorm);
  
  // Calculate twist angle based on projection along axis
  let twistAngle = proj * angle;
  
  // Get sin and cos of the twist angle
  let s = sin(twistAngle);
  let c = cos(twistAngle);
  
  // Calculate vector from axis (the part that will be rotated)
  let axisProj = proj * axisNorm;
  let fromAxis = position - axisProj;
  
  // Find a perpendicular vector for the rotation
  let basis1 = normalize(fromAxis);
  let basis2 = cross(axisNorm, basis1);
  
  // Rotate using the basis vectors
  let rotated = axisProj + 
                basis1 * length(fromAxis) * c + 
                basis2 * length(fromAxis) * s;
  
  return rotated;
}`;

/**
 * @wgsl
 * @name sdfBend
 * @description Bends geometry along a specified axis creating a smooth curve.
 * @param {vec3<f32>} position 3D position to transform.
 * @param {f32} angle Bend angle in radians.
 * @param {vec3<f32>} axis Axis normal to the bending plane.
 * @param {vec3<f32>} center Center of the bend.
 * @returns {vec3<f32>} Bent position.
 */
export const sdfBend = `fn sdfBend(position: vec3<f32>, angle: f32, axis: vec3<f32>, center: vec3<f32>) -> vec3<f32> {
  // Normalize the bend axis
  let axisNorm = normalize(axis);
  
  // Translate position relative to bend center
  let localPos = position - center;
  
  // Find perpendicular vectors to the bend axis to define the bend plane
  var perpVec1: vec3<f32>;
  if (abs(axisNorm.y) < 0.999) {
    perpVec1 = normalize(cross(vec3<f32>(0.0, 1.0, 0.0), axisNorm));
  } else {
    perpVec1 = normalize(cross(vec3<f32>(1.0, 0.0, 0.0), axisNorm));
  }
  let perpVec2 = normalize(cross(axisNorm, perpVec1));
  
  // Project the position onto the perpendicular vectors
  let proj1 = dot(localPos, perpVec1);
  let proj2 = dot(localPos, perpVec2);
  let axisProj = dot(localPos, axisNorm);
  
  // Calculate radius for the bend
  let radius = proj1;
  
  // Calculate the angle based on the distance along the bend direction
  let bendAngle = proj2 * angle;
  
  // Calculate the bent position using polar coordinates
  let c = cos(bendAngle);
  let s = sin(bendAngle);
  
  // Apply the transformation
  let bentPos = center + 
                axisNorm * axisProj +
                perpVec1 * (c * radius) +
                perpVec2 * (s * radius);
  
  return bentPos;
}`;

/**
 * @wgsl
 * @name sdfTaper
 * @description Applies a linear taper effect along an axis.
 * @param {vec3<f32>} position 3D position to transform.
 * @param {f32} amount Taper amount (0 = no taper, 1 = full taper).
 * @param {vec3<f32>} axis Taper axis direction.
 * @param {f32} height Height over which to apply the taper.
 * @param {f32} offset Offset along the taper axis.
 * @returns {vec3<f32>} Tapered position.
 */
export const sdfTaper = `fn sdfTaper(position: vec3<f32>, amount: f32, axis: vec3<f32>, height: f32, offset: f32) -> vec3<f32> {
  let axisNorm = normalize(axis);
  
  // Project position onto the taper axis
  let axisPos = dot(position, axisNorm) - offset;
  
  // Calculate taper factor based on position along axis
  let t = clamp(axisPos / height, 0.0, 1.0);
  let taperFactor = 1.0 - amount * t;
  
  // Apply taper to the perpendicular components
  let axisComponent = axisPos * axisNorm;
  let perpComponent = position - dot(position, axisNorm) * axisNorm;
  
  return axisComponent + perpComponent * taperFactor;
}`;

/**
 * @wgsl
 * @name sdfDisplace
 * @description Displaces SDF using noise or other displacement functions.
 * @param {vec3<f32>} position 3D position to displace.
 * @param {f32} amount Displacement amount.
 * @param {f32} frequency Displacement frequency.
 * @param {f32} seed Random seed for displacement.
 * @returns {vec3<f32>} Displaced position.
 */
export const sdfDisplace = `fn sdfDisplace(position: vec3<f32>, amount: f32, frequency: f32, seed: f32) -> vec3<f32> {
  // Simple noise function for displacement
  let hash3D = fn(p: vec3<f32>) -> vec3<f32> {
    var p3 = fract(p * vec3<f32>(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yxz + 33.33);
    return fract((p3.xxy + p3.yxx) * p3.zyx) * 2.0 - 1.0;
  };
  
  let noisePos = position * frequency + seed;
  let displacement = hash3D(noisePos) * amount;
  
  return position + displacement;
}`;

/**
 * @wgsl
 * @name sdfDomainRepeat
 * @description Creates domain repetition with optional warping for complex patterns.
 * @param {vec3<f32>} position 3D position to transform.
 * @param {vec3<f32>} cellSize Size of each repetition cell.
 * @param {f32} warpAmount Amount of warping to apply.
 * @param {f32} warpScale Scale of the warping effect.
 * @param {f32} seed Random seed for warping.
 * @returns {vec3<f32>} Domain repeated position.
 */
export const sdfDomainRepeat = `fn sdfDomainRepeat(position: vec3<f32>, cellSize: vec3<f32>, warpAmount: f32, warpScale: f32, seed: f32) -> vec3<f32> {
  // Simple 3D hash function for warping
  let hash31 = fn(p: vec3<f32>) -> f32 {
    var p3 = fract(p * vec3<f32>(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yxz + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  };
  
  // Simplex-like 3D noise function for warping
  let noise3D = fn(x: vec3<f32>) -> f32 {
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
  };
  
  // FBM (Fractal Brownian Motion) noise for domain warping
  let warpNoise = fn(x: vec3<f32>, seedVal: f32) -> vec3<f32> {
    let p = x + seedVal;
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
  };
  
  // Calculate warping for position
  let warp = warpNoise(position * warpScale, seed) * warpAmount;
  
  // Apply warping to position
  let warpedPos = position + warp;
  
  // Calculate repetition
  return warpedPos - cellSize * round(warpedPos / cellSize);
}`;

/**
 * @wgsl
 * @name sdfFiniteRepeat
 * @description Creates finite repetition with specified count along each axis.
 * @param {vec3<f32>} position 3D position to transform.
 * @param {vec3<f32>} spacing Spacing between repetitions.
 * @param {vec3<f32>} count Number of repetitions along each axis.
 * @returns {vec3<f32>} Finite repeated position.
 */
export const sdfFiniteRepeat = `fn sdfFiniteRepeat(position: vec3<f32>, spacing: vec3<f32>, count: vec3<f32>) -> vec3<f32> {
  let id = clamp(round(position / spacing), -count * 0.5, count * 0.5);
  return position - spacing * id;
}`;

/**
 * @wgsl
 * @name sdfInfiniteRepeat
 * @description Creates infinite repetition along all axes.
 * @param {vec3<f32>} position 3D position to transform.
 * @param {vec3<f32>} spacing Spacing between repetitions.
 * @returns {vec3<f32>} Infinitely repeated position.
 */
export const sdfInfiniteRepeat = `fn sdfInfiniteRepeat(position: vec3<f32>, spacing: vec3<f32>) -> vec3<f32> {
  return position - spacing * round(position / spacing);
}`;
