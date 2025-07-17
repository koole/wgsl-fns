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

/**
 * @wgsl
 * @name boxFrameSDF
 * @description Generates a signed distance field for a 3D box frame (hollow box).
 * @param {vec3<f32>} position 3D position to evaluate.
 * @param {vec3<f32>} size Half-extents of the box.
 * @param {f32} thickness Wall thickness of the frame.
 * @returns {f32} Signed distance to the box frame surface.
 */
export const boxFrameSDF = `fn boxFrameSDF(position: vec3<f32>, size: vec3<f32>, thickness: f32) -> f32 {
  let q = abs(position) - size;
  let w = abs(q + thickness) - thickness;
  return min(min(
    length(max(vec3<f32>(q.x, w.y, w.z), vec3<f32>(0.0))) + min(max(q.x, max(w.y, w.z)), 0.0),
    length(max(vec3<f32>(w.x, q.y, w.z), vec3<f32>(0.0))) + min(max(w.x, max(q.y, w.z)), 0.0)),
    length(max(vec3<f32>(w.x, w.y, q.z), vec3<f32>(0.0))) + min(max(w.x, max(w.y, q.z)), 0.0));
}`;

/**
 * @wgsl
 * @name cappedTorusSDF
 * @description Generates a signed distance field for a capped torus.
 * @param {vec3<f32>} position 3D position to evaluate.
 * @param {f32} majorRadius Major radius of the torus.
 * @param {f32} minorRadius Minor radius of the torus.
 * @param {f32} angle Cap angle in radians.
 * @returns {f32} Signed distance to the capped torus surface.
 */
export const cappedTorusSDF = `fn cappedTorusSDF(position: vec3<f32>, majorRadius: f32, minorRadius: f32, angle: f32) -> f32 {
  let sc = vec2<f32>(sin(angle), cos(angle));
  let q = vec3<f32>(abs(position.x), position.y, position.z);
  let k = select(
    length(q.xy), 
    dot(q.xy, sc),
    sc.y * q.x > sc.x * q.y
  );
  return sqrt(dot(q, q) + 
              majorRadius * majorRadius - 
              2.0 * majorRadius * k) - 
              minorRadius;
}`;

/**
 * @wgsl
 * @name capsuleSDF
 * @description Generates a signed distance field for a capsule (cylinder with rounded caps).
 * @param {vec3<f32>} position 3D position to evaluate.
 * @param {f32} radius Radius of the capsule.
 * @param {f32} height Height of the cylindrical portion.
 * @returns {f32} Signed distance to the capsule surface.
 */
export const capsuleSDF = `fn capsuleSDF(position: vec3<f32>, radius: f32, height: f32) -> f32 {
  let d = abs(length(position.xz)) - radius;
  let p = vec2<f32>(d, abs(position.y) - height * 0.5);
  return length(max(p, vec2<f32>(0.0))) + min(max(p.x, p.y), 0.0) - radius;
}`;

/**
 * @wgsl
 * @name coneSDF
 * @description Generates a signed distance field for a cone.
 * @param {vec3<f32>} position 3D position to evaluate.
 * @param {f32} radius Base radius of the cone.
 * @param {f32} height Height of the cone.
 * @returns {f32} Signed distance to the cone surface.
 */
export const coneSDF = `fn coneSDF(position: vec3<f32>, radius: f32, height: f32) -> f32 {
  let q = vec2<f32>(length(position.xz), position.y);
  let h = height;
  let r = radius;
  
  // Calculate distance
  let d1 = -q.y - h;
  let d2 = max(q.x * h - q.y * r, q.y * h + q.x * r);
  
  return length(max(vec2<f32>(d1, d2), vec2<f32>(0.0))) + min(max(d1, d2), 0.0);
}`;

/**
 * @wgsl
 * @name cylinderSDF
 * @description Generates a signed distance field for a cylinder.
 * @param {vec3<f32>} position 3D position to evaluate.
 * @param {f32} radius Radius of the cylinder.
 * @param {f32} height Height of the cylinder.
 * @returns {f32} Signed distance to the cylinder surface.
 */
export const cylinderSDF = `fn cylinderSDF(position: vec3<f32>, radius: f32, height: f32) -> f32 {
  let d = vec2<f32>(length(position.xz), abs(position.y)) - vec2<f32>(radius, height * 0.5);
  return min(max(d.x, d.y), 0.0) + length(max(d, vec2<f32>(0.0)));
}`;

/**
 * @wgsl
 * @name ellipsoidSDF
 * @description Generates a signed distance field for an ellipsoid.
 * @param {vec3<f32>} position 3D position to evaluate.
 * @param {vec3<f32>} radius Radii along each axis.
 * @returns {f32} Signed distance to the ellipsoid surface.
 */
export const ellipsoidSDF = `fn ellipsoidSDF(position: vec3<f32>, radius: vec3<f32>) -> f32 {
  let k0 = length(position / radius);
  let k1 = length(position / (radius * radius));
  return k0 * (k0 - 1.0) / k1;
}`;

/**
 * @wgsl
 * @name gyroidSDF
 * @description Generates a signed distance field for a gyroid surface.
 * @param {vec3<f32>} position 3D position to evaluate.
 * @param {f32} scale Scale factor for the gyroid pattern.
 * @param {f32} thickness Thickness of the gyroid surface.
 * @returns {f32} Signed distance to the gyroid surface.
 */
export const gyroidSDF = `fn gyroidSDF(position: vec3<f32>, scale: f32, thickness: f32) -> f32 {
  let p = position * scale;
  return (abs(dot(sin(p), cos(p.zxy))) - thickness) / scale;
}`;

/**
 * @wgsl
 * @name hexagonalPrismSDF
 * @description Generates a signed distance field for a hexagonal prism.
 * @param {vec3<f32>} position 3D position to evaluate.
 * @param {f32} radius Radius of the hexagon.
 * @param {f32} height Height of the prism.
 * @returns {f32} Signed distance to the hexagonal prism surface.
 */
export const hexagonalPrismSDF = `fn hexagonalPrismSDF(position: vec3<f32>, radius: f32, height: f32) -> f32 {
  // Project into 2D
  var p = abs(position);
  let k = vec3<f32>(-0.866025404, 0.5, 0.577350269);
  
  // Hexagon in xy-plane
  p = vec3<f32>(p.x + p.y * k.x, p.y * k.y, p.z);
  p = vec3<f32>(p.x - min(p.x, p.y), p.y, p.z);
  let d = vec2<f32>(length(vec2<f32>(p.x, p.y - radius * k.z)) - radius, abs(p.z) - height * 0.5);
  
  return min(max(d.x, d.y), 0.0) + length(max(d, vec2<f32>(0.0)));
}`;

/**
 * @wgsl
 * @name icosahedronSDF
 * @description Generates a signed distance field for an icosahedron.
 * @param {vec3<f32>} position 3D position to evaluate.
 * @param {f32} size Size of the icosahedron.
 * @returns {f32} Signed distance to the icosahedron surface.
 */
export const icosahedronSDF = `fn icosahedronSDF(position: vec3<f32>, size: f32) -> f32 {
  var p = position;
  let s = size;
  
  // Constants for icosahedron
  let phi = 1.618033988749895;
  let a = s;
  let b = s * phi;
  
  // Compute distance to icosahedron
  p = abs(p / s);
  let d = p.x * p.y * p.z;
  let m = max(max(p.x, p.y), p.z);
  let n = min(min(p.x, p.y), p.z);
  let mid = p.x + p.y + p.z - m - n;
  
  // Calculate the signed distance
  let q = select(mid, d, m < phi * n);
  return (length(p) - phi) * s;
}`;

/**
 * @wgsl
 * @name juliaSDF
 * @description Generates a signed distance field for a 4D Julia set fractal.
 * @param {vec3<f32>} position 3D position to evaluate.
 * @param {vec4<f32>} c Julia set parameter (quaternion).
 * @param {f32} iterations Maximum number of iterations.
 * @param {f32} bailout Bailout radius for iteration escape.
 * @returns {f32} Signed distance to the Julia set surface.
 */
export const juliaSDF = `fn juliaSDF(position: vec3<f32>, c: vec4<f32>, iterations: f32, bailout: f32) -> f32 {
  var z = vec4<f32>(position, 0.0);
  var dz = vec4<f32>(1.0, 0.0, 0.0, 0.0);
  var m = dot(z, z);
  var i = 0;
  
  // Quaternion multiplication helper
  let quatMul = fn(a: vec4<f32>, b: vec4<f32>) -> vec4<f32> {
    return vec4<f32>(
      a.x * b.x - a.y * b.y - a.z * b.z - a.w * b.w,
      a.x * b.y + a.y * b.x + a.z * b.w - a.w * b.z,
      a.x * b.z - a.y * b.w + a.z * b.x + a.w * b.y,
      a.x * b.w + a.y * b.z - a.z * b.y + a.w * b.x
    );
  };
  
  // Julia set iteration
  for (i = 0; i < i32(iterations) && m < bailout * bailout; i += 1) {
    dz = 2.0 * quatMul(z, dz);
    z = quatMul(z, z) + c;
    m = dot(z, z);
  }
  
  // Compute the distance
  let dist = 0.5 * log(m) * sqrt(m) / length(dz);
  return dist;
}`;

/**
 * @wgsl
 * @name octahedronSDF
 * @description Generates a signed distance field for an octahedron.
 * @param {vec3<f32>} position 3D position to evaluate.
 * @param {f32} size Size of the octahedron.
 * @returns {f32} Signed distance to the octahedron surface.
 */
export const octahedronSDF = `fn octahedronSDF(position: vec3<f32>, size: f32) -> f32 {
  let p = abs(position);
  let m = p.x + p.y + p.z - size;
  
  // Calculate the distance
  var q: vec3<f32>;
  if (3.0 * p.x < m) {
    q = p;
  } else if (3.0 * p.y < m) {
    q = vec3<f32>(p.x, p.z, p.y);
  } else if (3.0 * p.z < m) {
    q = vec3<f32>(p.x, p.y, p.z);
  } else {
    q = p;
  }
  
  let k = clamp(0.5 * (q.z - q.y + size), 0.0, size);
  return length(vec3<f32>(q.x, q.y - size + k, q.z - k));
}`;

/**
 * @wgsl
 * @name planeSDF
 * @description Generates a signed distance field for an infinite plane.
 * @param {vec3<f32>} position 3D position to evaluate.
 * @param {vec3<f32>} normal Normal vector of the plane (should be normalized).
 * @returns {f32} Signed distance to the plane surface.
 */
export const planeSDF = `fn planeSDF(position: vec3<f32>, normal: vec3<f32>) -> f32 {
  let n = normalize(normal);
  return dot(position, n);
}`;

/**
 * @wgsl
 * @name pyramidSDF
 * @description Generates a signed distance field for a pyramid.
 * @param {vec3<f32>} position 3D position to evaluate.
 * @param {f32} size Base size of the pyramid.
 * @param {f32} height Height of the pyramid.
 * @returns {f32} Signed distance to the pyramid surface.
 */
export const pyramidSDF = `fn pyramidSDF(position: vec3<f32>, size: f32, height: f32) -> f32 {
  // Normalize position
  var p = position;
  let h = height;
  let m2 = h * h + size * size;
  
  // Project into 2D
  let q = abs(p);
  p.y -= h;
  p.y = max(p.y, 0.0);
  
  // Distance calculation
  var d: f32;
  if (max(q.x, q.z) < size) {
    d = length(vec2<f32>(length(p.xz), p.y)) - sqrt(m2);
  } else {
    d = length(vec2<f32>(length(max(abs(p.xz) - vec2<f32>(size), vec2<f32>(0.0))), p.y));
  }
  
  // Account for position below base
  d = select(d, length(p) - sqrt(m2), p.y < 0.0);
  
  return d;
}`;

/**
 * @wgsl
 * @name rhombusSDF
 * @description Generates a signed distance field for a rhombus.
 * @param {vec3<f32>} position 3D position to evaluate.
 * @param {vec3<f32>} dimensions Dimensions of the rhombus.
 * @param {f32} sharpness Sharpness factor for the edges.
 * @returns {f32} Signed distance to the rhombus surface.
 */
export const rhombusSDF = `fn rhombusSDF(position: vec3<f32>, dimensions: vec3<f32>, sharpness: f32) -> f32 {
  var p = abs(position);
  let b = dimensions;
  let e = sharpness;
  
  // Calculate distance to rhombus
  p = p - b;
  let q = abs(p.x + p.y + p.z) + e;
  let h = max(vec3<f32>(q) - vec3<f32>(e), vec3<f32>(0.0));
  
  return min(max(p.x, max(p.y, p.z)), 0.0) + length(h);
}`;

/**
 * @wgsl
 * @name roundBoxSDF
 * @description Generates a signed distance field for a rounded box.
 * @param {vec3<f32>} position 3D position to evaluate.
 * @param {vec3<f32>} size Half-extents of the box.
 * @param {f32} radius Rounding radius for the edges.
 * @returns {f32} Signed distance to the rounded box surface.
 */
export const roundBoxSDF = `fn roundBoxSDF(position: vec3<f32>, size: vec3<f32>, radius: f32) -> f32 {
  let q = abs(position) - size;
  return length(max(q, vec3<f32>(0.0))) + 
         min(max(q.x, max(q.y, q.z)), 0.0) - 
         radius;
}`;

/**
 * @wgsl
 * @name roundedConeSDF
 * @description Generates a signed distance field for a rounded cone.
 * @param {vec3<f32>} position 3D position to evaluate.
 * @param {f32} radius1 Bottom radius of the cone.
 * @param {f32} radius2 Top radius of the cone.
 * @param {f32} height Height of the cone.
 * @param {f32} roundness Rounding factor for the edges.
 * @returns {f32} Signed distance to the rounded cone surface.
 */
export const roundedConeSDF = `fn roundedConeSDF(position: vec3<f32>, radius1: f32, radius2: f32, height: f32, roundness: f32) -> f32 {
  // Calculate distances
  let p = position;
  let r1 = radius1 - roundness;
  let r2 = radius2 - roundness;
  let h = height;
  
  // Squared distance from axis
  let q = length(p.xz);
  
  // Project into 2D space
  let k1 = (r2 - r1) / h;
  let k2 = h / (r1 - r2);
  let projected = vec2<f32>(q - r1 + r1 * (p.y / h) * (r1 - r2) / r1, p.y - h);
  let ca = p.y * k1 - q;
  let cb = p.y - r1 * k2 + q * k2;
  
  var s: f32;
  if (ca < 0.0 && projected.y < 0.0) {
    s = length(projected) - roundness;
  } else if (ca > 0.0 && cb < 0.0) {
    s = -ca - roundness;
  } else {
    s = length(vec2<f32>(max(ca, 0.0), max(projected.y, 0.0))) - roundness;
  }
  
  return s;
}`;

/**
 * @wgsl
 * @name roundedCylinderSDF
 * @description Generates a signed distance field for a rounded cylinder.
 * @param {vec3<f32>} position 3D position to evaluate.
 * @param {f32} radius Radius of the cylinder.
 * @param {f32} height Height of the cylinder.
 * @param {f32} roundness Rounding factor for the edges.
 * @returns {f32} Signed distance to the rounded cylinder surface.
 */
export const roundedCylinderSDF = `fn roundedCylinderSDF(position: vec3<f32>, radius: f32, height: f32, roundness: f32) -> f32 {
  // Calculate distances
  let radiusOffset = radius - roundness;
  let heightOffset = height * 0.5 - roundness;
  
  // Generate rounded cylinder
  let d = vec2<f32>(length(position.xz) - radiusOffset, abs(position.y) - heightOffset);
  return min(max(d.x, d.y), 0.0) + length(max(d, vec2<f32>(0.0))) - roundness;
}`;

/**
 * @wgsl
 * @name sphereSDF
 * @description Generates a signed distance field for a sphere.
 * @param {vec3<f32>} position 3D position to evaluate.
 * @param {f32} radius Radius of the sphere.
 * @returns {f32} Signed distance to the sphere surface.
 */
export const sphereSDF = `fn sphereSDF(position: vec3<f32>, radius: f32) -> f32 {
  return length(position) - radius;
}`;

/**
 * @wgsl
 * @name tetrahedronSDF
 * @description Generates a signed distance field for a tetrahedron.
 * @param {vec3<f32>} position 3D position to evaluate.
 * @param {f32} size Size of the tetrahedron.
 * @returns {f32} Signed distance to the tetrahedron surface.
 */
export const tetrahedronSDF = `fn tetrahedronSDF(position: vec3<f32>, size: f32) -> f32 {
  var p = position;
  let s = size;
  
  // Set initial values
  let signVal = sign(p.x + p.y + p.z);
  p.x = abs(p.x);
  p.y = abs(p.y);
  p.z = abs(p.z);
  
  // Calculate the distance
  if (p.x < p.y) {
    let t = p.x;
    p.x = p.y;
    p.y = t;
  }
  if (p.x < p.z) {
    let t = p.x;
    p.x = p.z;
    p.z = t;
  }
  if (p.y < p.z) {
    let t = p.y;
    p.y = p.z;
    p.z = t;
  }
  
  let k = clamp((p.x + p.z - p.y) * 0.5, 0.0, p.z);
  return signVal * (length(vec3<f32>(p.x, p.y - s, p.z - k)) - s);
}`;

/**
 * @wgsl
 * @name torusSDF
 * @description Generates a signed distance field for a torus.
 * @param {vec3<f32>} position 3D position to evaluate.
 * @param {f32} majorRadius Major radius of the torus.
 * @param {f32} minorRadius Minor radius of the torus.
 * @returns {f32} Signed distance to the torus surface.
 */
export const torusSDF = `fn torusSDF(position: vec3<f32>, majorRadius: f32, minorRadius: f32) -> f32 {
  let q = vec2<f32>(length(position.xz) - majorRadius, position.y);
  return length(q) - minorRadius;
}`;

/**
 * @wgsl
 * @name triangularPrismSDF
 * @description Generates a signed distance field for a triangular prism.
 * @param {vec3<f32>} position 3D position to evaluate.
 * @param {f32} radius Radius of the triangular base.
 * @param {f32} height Height of the prism.
 * @returns {f32} Signed distance to the triangular prism surface.
 */
export const triangularPrismSDF = `fn triangularPrismSDF(position: vec3<f32>, radius: f32, height: f32) -> f32 {
  var q = abs(position);
  
  // Triangle distance in xy-plane
  let k = sqrt(3.0);
  q.x = abs(q.x - q.y * k * 0.5);
  q.y = q.y * 0.866025404 + q.x * 0.5;
  
  // Combine with z distance
  let d1 = vec2<f32>(q.x - radius, q.y);
  let d2 = vec2<f32>(q.y - radius, q.x);
  let d = min(d1, d2);
  
  // Account for height
  let h = height * 0.5;
  let dz = q.z - h;
  let dz2 = max(dz, 0.0);
  
  return length(max(vec2<f32>(max(d.x, 0.0), dz2), vec2<f32>(0.0))) + min(max(d.x, dz), 0.0);
}`;
