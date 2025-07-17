// Animation and easing functions for smooth transitions

/**
 * @wgsl
 * @name bezierCubic
 * @description Evaluates a cubic Bezier curve and returns both value and derivative.
 * @param {f32} t Parameter along the curve (0-1).
 * @param {f32} p0 First control point.
 * @param {f32} p1 Second control point.
 * @param {f32} p2 Third control point.
 * @param {f32} p3 Fourth control point.
 * @returns {vec2<f32>} Curve value and derivative (tangent).
 */
export const bezierCubic = `fn bezierCubic(t: f32, p0: f32, p1: f32, p2: f32, p3: f32) -> vec2<f32> {
  // Clamp t to [0,1]
  let tt = clamp(t, 0.0, 1.0);
  
  // Calculate curve value using cubic Bezier formula
  // P(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
  let t1 = 1.0 - tt;
  let t1Squared = t1 * t1;
  let t1Cubed = t1Squared * t1;
  let tSquared = tt * tt;
  let tCubed = tSquared * tt;
  
  let value = t1Cubed * p0 + 
             3.0 * t1Squared * tt * p1 + 
             3.0 * t1 * tSquared * p2 + 
             tCubed * p3;
  
  // Calculate derivative for tangent information
  // P'(t) = 3(1-t)²(P₁-P₀) + 6(1-t)t(P₂-P₁) + 3t²(P₃-P₂)
  let derivative = 3.0 * t1Squared * (p1 - p0) +
                  6.0 * t1 * tt * (p2 - p1) +
                  3.0 * tSquared * (p3 - p2);
  
  return vec2<f32>(value, derivative);
}`;

/**
 * @wgsl
 * @name easeIn
 * @description Power-based ease-in function for smooth acceleration.
 * @param {f32} t Input parameter (0-1).
 * @param {f32} power Easing power (higher = more pronounced curve).
 * @returns {f32} Eased value.
 */
export const easeIn = `fn easeIn(t: f32, power: f32) -> f32 {
  return pow(clamp(t, 0.0, 1.0), power);
}`;

/**
 * @wgsl
 * @name easeOut
 * @description Power-based ease-out function for smooth deceleration.
 * @param {f32} t Input parameter (0-1).
 * @param {f32} power Easing power (higher = more pronounced curve).
 * @returns {f32} Eased value.
 */
export const easeOut = `fn easeOut(t: f32, power: f32) -> f32 {
  return 1.0 - pow(1.0 - clamp(t, 0.0, 1.0), power);
}`;

/**
 * @wgsl
 * @name easeInOut
 * @description Power-based ease-in-out function for smooth acceleration and deceleration.
 * @param {f32} t Input parameter (0-1).
 * @param {f32} power Easing power (higher = more pronounced curve).
 * @returns {f32} Eased value.
 */
export const easeInOut = `fn easeInOut(t: f32, power: f32) -> f32 {
  let tt = clamp(t, 0.0, 1.0);
  if (tt < 0.5) {
    return 0.5 * pow(2.0 * tt, power);
  } else {
    return 0.5 + 0.5 * (1.0 - pow(2.0 * (1.0 - tt), power));
  }
}`;

/**
 * @wgsl
 * @name elasticIn
 * @description Elastic ease-in function with oscillating motion.
 * @param {f32} t Input parameter (0-1).
 * @returns {f32} Eased value with elastic effect.
 */
export const elasticIn = `fn elasticIn(t: f32) -> f32 {
  let tt = clamp(t, 0.0, 1.0);
  return sin(13.0 * 3.14159 * tt) * pow(2.0, 10.0 * (tt - 1.0));
}`;

/**
 * @wgsl
 * @name elasticOut
 * @description Elastic ease-out function with oscillating motion.
 * @param {f32} t Input parameter (0-1).
 * @returns {f32} Eased value with elastic effect.
 */
export const elasticOut = `fn elasticOut(t: f32) -> f32 {
  let tt = clamp(t, 0.0, 1.0);
  return sin(-13.0 * 3.14159 * (tt + 1.0)) * pow(2.0, -10.0 * tt) + 1.0;
}`;

/**
 * @wgsl
 * @name backIn
 * @description Back ease-in function that overshoots before settling.
 * @param {f32} t Input parameter (0-1).
 * @returns {f32} Eased value with back effect.
 */
export const backIn = `fn backIn(t: f32) -> f32 {
  let s = 1.70158;
  let tt = clamp(t, 0.0, 1.0);
  return tt * tt * ((s + 1.0) * tt - s);
}`;

/**
 * @wgsl
 * @name backOut
 * @description Back ease-out function that overshoots before settling.
 * @param {f32} t Input parameter (0-1).
 * @returns {f32} Eased value with back effect.
 */
export const backOut = `fn backOut(t: f32) -> f32 {
  let s = 1.70158;
  let tt = clamp(t, 0.0, 1.0);
  let tMinus = tt - 1.0;
  return tMinus * tMinus * ((s + 1.0) * tMinus + s) + 1.0;
}`;

/**
 * @wgsl
 * @name springPhysics
 * @description Physically-based spring animation with configurable parameters.
 * @param {f32} t Time parameter.
 * @param {f32} targetPosition Target position for the spring.
 * @param {f32} initialPos Initial position.
 * @param {f32} initialVel Initial velocity.
 * @param {f32} stiffness Spring stiffness coefficient.
 * @param {f32} damping Damping coefficient.
 * @param {f32} mass Mass of the spring system.
 * @returns {vec2<f32>} Position and velocity at time t.
 */
export const springPhysics = `fn springPhysics(t: f32, targetPosition: f32, initialPos: f32, initialVel: f32, stiffness: f32, damping: f32, mass: f32) -> vec2<f32> {
  // Ensure positive values for stiffness, damping, and mass
  let k = max(0.0001, stiffness);
  let d = max(0.0, damping);
  let m = max(0.0001, mass);
  
  // Calculate the angular frequency and damping ratio
  let omega = sqrt(k / m);
  let zeta = d / (2.0 * sqrt(k * m));
  
  // Initial displacement from targetPosition position
  let x0 = initialPos - targetPosition;
  let v0 = initialVel;
  
  var position: f32 = 0.0;
  var velocity: f32 = 0.0;
  
  if (zeta < 1.0) {
    // Underdamped case
    let omega_d = omega * sqrt(1.0 - zeta * zeta);
    let A = x0;
    let B = (v0 + zeta * omega * x0) / omega_d;
    
    // Calculate exponential decay term
    let expTerm = exp(-zeta * omega * t);
    
    // Calculate position and velocity
    position = targetPosition + expTerm * (A * cos(omega_d * t) + B * sin(omega_d * t));
    velocity = expTerm * (
                -zeta * omega * A * cos(omega_d * t) - omega_d * A * sin(omega_d * t) +
                -zeta * omega * B * sin(omega_d * t) + omega_d * B * cos(omega_d * t)
               );
  } else if (zeta == 1.0) {
    // Critically damped case
    let A = x0;
    let B = v0 + omega * x0;
    
    // Calculate exponential decay term
    let expTerm = exp(-omega * t);
    
    // Calculate position and velocity
    position = targetPosition + expTerm * (A + B * t);
    velocity = expTerm * (B - omega * (A + B * t));
  } else {
    // Overdamped case
    let omega1 = -omega * (zeta + sqrt(zeta * zeta - 1.0));
    let omega2 = -omega * (zeta - sqrt(zeta * zeta - 1.0));
    
    let A = (v0 - omega2 * x0) / (omega1 - omega2);
    let B = x0 - A;
    
    // Calculate position and velocity
    position = targetPosition + A * exp(omega1 * t) + B * exp(omega2 * t);
    velocity = A * omega1 * exp(omega1 * t) + B * omega2 * exp(omega2 * t);
  }
  
  return vec2<f32>(position, velocity);
}`;
