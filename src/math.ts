// Mathematical utility functions

/**
 * @wgsl
 * @name elasticWave
 * @description Generates an elastic wave with exponential decay and sinusoidal oscillation.
 * @param {f32} x Input position along the wave.
 * @param {f32} amplitude Wave amplitude multiplier.
 * @param {f32} frequency Wave frequency.
 * @param {f32} decay Exponential decay factor.
 * @param {f32} phase Phase offset for the wave.
 * @returns {f32} Computed wave value.
 */
export const elasticWave = `fn elasticWave(x: f32, amplitude: f32, frequency: f32, decay: f32, phase: f32) -> f32 {
  let d = max(0.001, decay);
  let decayTerm = exp(-d * x);
  let oscTerm = sin(frequency * x * 6.28318 + phase);
  return amplitude * decayTerm * oscTerm;
}`;

/**
 * @wgsl
 * @name smoothStep
 * @description Hermite interpolation between two values with smooth acceleration and deceleration.
 * @param {f32} edge0 Lower edge of interpolation range.
 * @param {f32} edge1 Upper edge of interpolation range.
 * @param {f32} x Input value to interpolate.
 * @returns {f32} Smoothly interpolated value between 0 and 1.
 */
export const smoothStep = `fn smoothStep(edge0: f32, edge1: f32, x: f32) -> f32 {
  let t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}`;

/**
 * @wgsl
 * @name rotate2D
 * @description Rotates a 2D vector by a given angle.
 * @param {vec2<f32>} v Input 2D vector to rotate.
 * @param {f32} angle Rotation angle in radians.
 * @returns {vec2<f32>} Rotated 2D vector.
 */
export const rotate2D = `fn rotate2D(v: vec2<f32>, angle: f32) -> vec2<f32> {
  let c = cos(angle);
  let s = sin(angle);
  return vec2(v.x * c - v.y * s, v.x * s + v.y * c);
}`;

/**
 * @wgsl
 * @name exponentialRamp
 * @description Generates an exponential ramp function with derivative.
 * @param {f32} x Input value.
 * @param {f32} base Exponential base.
 * @param {f32} scale Scale factor.
 * @param {f32} offset Vertical offset.
 * @returns {vec2<f32>} Function value and derivative.
 */
export const exponentialRamp = `fn exponentialRamp(x: f32, base: f32, scale: f32, offset: f32) -> vec2<f32> {
  // Ensure base is positive and not 1 (which would make it linear)
  let b = select(base, 2.71828, abs(base - 1.0) < 0.001);
  
  // Calculate the exponential function
  let result = scale * pow(b, x) + offset;
  
  // Calculate the derivative
  let derivative = scale * pow(b, x) * log(b);
  
  return vec2<f32>(result, derivative);
}`;

/**
 * @wgsl
 * @name logisticCurve
 * @description Generates a logistic (S-curve) function with derivative.
 * @param {f32} x Input value.
 * @param {f32} midpoint Curve midpoint (inflection point).
 * @param {f32} steepness Curve steepness factor.
 * @param {f32} min Minimum output value.
 * @param {f32} max Maximum output value.
 * @returns {vec2<f32>} Function value and derivative.
 */
export const logisticCurve = `fn logisticCurve(x: f32, midpoint: f32, steepness: f32, minValue: f32, maxValue: f32) -> vec2<f32> {
  // Scale factor for steepness
  let k = max(0.001, steepness);
  
  // Shift x relative to midpoint
  let z = -k * (x - midpoint);
  
  // Calculate the exponent
  let expTerm = exp(z);
  
  // Calculate the logistic function value
  let logistic = 1.0 / (1.0 + expTerm);
  
  // Scale to min-max range
  let range = maxValue - minValue;
  let value = minValue + range * logistic;
  
  // Calculate the derivative
  let derivative = range * k * expTerm / ((1.0 + expTerm) * (1.0 + expTerm));
  
  return vec2<f32>(value, derivative);
}`;

/**
 * @wgsl
 * @name stepSequence
 * @description Generates a stepped sequence with optional smoothing between steps.
 * @param {f32} x Input value.
 * @param {f32} steps Number of steps in the sequence.
 * @param {f32} smoothing Smoothing factor between steps (0-1).
 * @param {f32} minValue Minimum output value.
 * @param {f32} maxValue Maximum output value.
 * @returns {vec2<f32>} Function value and current step index.
 */
export const stepSequence = `fn stepSequence(x: f32, steps: f32, smoothing: f32, minValue: f32, maxValue: f32) -> vec2<f32> {
  // Ensure at least 1 step and positive smoothing
  let numSteps = max(1.0, floor(steps));
  let smoothFactor = max(0.0, smoothing);
  
  // Normalize x to 0-1 range
  let normalizedX = fract(x);
  
  // Calculate the size of each step
  let stepSize = 1.0 / numSteps;
  
  // Calculate the current step (0 to numSteps-1)
  let currentStep = floor(normalizedX * numSteps);
  let nextStep = fract(currentStep + 1.0);
  
  // Calculate progress within the current step
  let stepProgress = fract(normalizedX * numSteps);
  
  // Calculate the progress values for current and next steps
  let currentStepValue = currentStep / (numSteps - 1.0);
  
  // Prepare next step value, handle the last step case
  var nextStepValue: f32 = 0.0;
  if (currentStep >= numSteps - 1.0) {
    nextStepValue = 1.0;
  } else {
    nextStepValue = nextStep / (numSteps - 1.0);
  }
  
  // Apply smoothing between steps if needed
  var result: f32 = 0.0;
  
  if (smoothFactor > 0.0 && stepProgress > (1.0 - smoothFactor) && numSteps > 1.0) {
    // Calculate smoothing factor
    let t = (stepProgress - (1.0 - smoothFactor)) / smoothFactor;
    
    // Smoothstep for better transition
    let smoothT = t * t * (3.0 - 2.0 * t);
    
    // Interpolate between current and next step
    result = mix(currentStepValue, nextStepValue, smoothT);
  } else {
    result = currentStepValue;
  }
  
  // Scale to min-max range
  let range = maxValue - minValue;
  let finalResult = minValue + result * range;
  
  return vec2<f32>(finalResult, currentStep);
}`;
