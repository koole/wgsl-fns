// SDF spatial transformations for positioning and orienting distance fields

/**
 * @wgsl
 * @name sdfTranslate
 * @description Translates an SDF by moving its position.
 * @param {vec3<f32>} position 3D position to transform.
 * @param {vec3<f32>} offset Translation offset.
 * @returns {vec3<f32>} Translated position.
 */
export const sdfTranslate = `fn sdfTranslate(position: vec3<f32>, offset: vec3<f32>) -> vec3<f32> {
  return position - offset;
}`;

/**
 * @wgsl
 * @name sdfScale
 * @description Scales an SDF uniformly or non-uniformly.
 * @param {vec3<f32>} position 3D position to transform.
 * @param {vec3<f32>} scale Scale factors for each axis.
 * @returns {vec3<f32>} Scaled position.
 */
export const sdfScale = `fn sdfScale(position: vec3<f32>, scale: vec3<f32>) -> vec3<f32> {
  return position / scale;
}`;

/**
 * @wgsl
 * @name sdfRotate
 * @description Rotates an SDF around a pivot point with Euler angles.
 * @param {vec3<f32>} position 3D position to transform.
 * @param {vec3<f32>} angles Rotation angles in radians (x, y, z).
 * @param {vec3<f32>} pivot Point to rotate around.
 * @returns {vec3<f32>} Rotated position.
 */
export const sdfRotate = `fn sdfRotate(position: vec3<f32>, angles: vec3<f32>, pivot: vec3<f32>) -> vec3<f32> {
  // First translate to origin relative to pivot point
  let centered = position - pivot;
  
  // Create rotation matrices (inverse rotation = negative angles)
  let cx = cos(-angles.x);
  let sx = sin(-angles.x);
  let cy = cos(-angles.y);
  let sy = sin(-angles.y);
  let cz = cos(-angles.z);
  let sz = sin(-angles.z);
  
  // Rotate around X axis
  let rx = vec3<f32>(
    centered.x,
    centered.y * cx - centered.z * sx,
    centered.y * sx + centered.z * cx
  );
  
  // Rotate around Y axis
  let ry = vec3<f32>(
    rx.x * cy + rx.z * sy,
    rx.y,
    -rx.x * sy + rx.z * cy
  );
  
  // Rotate around Z axis
  let rz = vec3<f32>(
    ry.x * cz - ry.y * sz,
    ry.x * sz + ry.y * cz,
    ry.z
  );
  
  // Translate back from pivot point
  return rz + pivot;
}`;

/**
 * @wgsl
 * @name sdfMirror
 * @description Mirrors an SDF across a plane defined by a normal vector.
 * @param {vec3<f32>} position 3D position to transform.
 * @param {vec3<f32>} normal Normal vector of the mirror plane.
 * @param {f32} offset Distance offset of the mirror plane.
 * @returns {vec3<f32>} Mirrored position.
 */
export const sdfMirror = `fn sdfMirror(position: vec3<f32>, normal: vec3<f32>, offset: f32) -> vec3<f32> {
  let n = normalize(normal);
  let d = dot(position, n) - offset;
  return position - 2.0 * max(0.0, d) * n;
}`;

/**
 * @wgsl
 * @name sdfPolarRepeat
 * @description Creates polar repetition around an axis.
 * @param {vec3<f32>} position 3D position to transform.
 * @param {f32} count Number of repetitions around the circle.
 * @param {vec3<f32>} axis Axis to repeat around (should be normalized).
 * @returns {vec3<f32>} Polar repeated position.
 */
export const sdfPolarRepeat = `fn sdfPolarRepeat(position: vec3<f32>, count: f32, axis: vec3<f32>) -> vec3<f32> {
  let n = normalize(axis);
  
  // Project position onto axis
  let axisProj = dot(position, n) * n;
  let radial = position - axisProj;
  
  // Get angle in the plane perpendicular to axis
  let radius = length(radial);
  if (radius < 0.001) {
    return position;
  }
  
  let angle = atan2(radial.y, radial.x);
  let sectorAngle = 6.28318530718 / count;
  let snappedAngle = round(angle / sectorAngle) * sectorAngle;
  
  // Reconstruct position with snapped angle
  let newRadial = radius * vec2<f32>(cos(snappedAngle), sin(snappedAngle));
  
  // This assumes axis is along Z - for general axis, need proper basis vectors
  return axisProj + vec3<f32>(newRadial.x, newRadial.y, 0.0);
}`;

/**
 * @wgsl
 * @name sdfCylindricalRepeat
 * @description Creates cylindrical coordinate repetition.
 * @param {vec3<f32>} position 3D position to transform.
 * @param {f32} angleRepeat Angular repetition count.
 * @param {f32} heightRepeat Height repetition interval.
 * @param {vec3<f32>} axis Cylindrical axis (should be normalized).
 * @returns {vec3<f32>} Cylindrically repeated position.
 */
export const sdfCylindricalRepeat = `fn sdfCylindricalRepeat(position: vec3<f32>, angleRepeat: f32, heightRepeat: f32, axis: vec3<f32>) -> vec3<f32> {
  let n = normalize(axis);
  
  // Project onto axis for height
  let h = dot(position, n);
  let radial = position - h * n;
  
  // Repeat in height
  let newH = h - heightRepeat * round(h / heightRepeat);
  
  // Repeat in angle
  let radius = length(radial);
  if (radius < 0.001) {
    return newH * n;
  }
  
  let angle = atan2(radial.y, radial.x);
  let sectorAngle = 6.28318530718 / angleRepeat;
  let newAngle = angle - sectorAngle * round(angle / sectorAngle);
  
  let newRadial = radius * vec2<f32>(cos(newAngle), sin(newAngle));
  
  // This assumes axis is along Z - for general axis, need proper basis vectors
  return newH * n + vec3<f32>(newRadial.x, newRadial.y, 0.0);
}`;

/**
 * @wgsl
 * @name sdfSphericalRepeat
 * @description Creates spherical coordinate repetition.
 * @param {vec3<f32>} position 3D position to transform.
 * @param {f32} phiRepeat Azimuthal angle repetition count.
 * @param {f32} thetaRepeat Polar angle repetition count.
 * @returns {vec3<f32>} Spherically repeated position.
 */
export const sdfSphericalRepeat = `fn sdfSphericalRepeat(position: vec3<f32>, phiRepeat: f32, thetaRepeat: f32) -> vec3<f32> {
  let radius = length(position);
  if (radius < 0.001) {
    return position;
  }
  
  // Convert to spherical coordinates
  let theta = acos(clamp(position.z / radius, -1.0, 1.0));
  let phi = atan2(position.y, position.x);
  
  // Repeat in spherical coordinates
  let phiSector = 6.28318530718 / phiRepeat;
  let thetaSector = 3.14159265359 / thetaRepeat;
  
  let newPhi = phi - phiSector * round(phi / phiSector);
  let newTheta = theta - thetaSector * round(theta / thetaSector);
  
  // Convert back to Cartesian
  let sinTheta = sin(newTheta);
  return radius * vec3<f32>(
    sinTheta * cos(newPhi),
    sinTheta * sin(newPhi),
    cos(newTheta)
  );
}`;
