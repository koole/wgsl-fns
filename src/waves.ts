// Wave generation functions for oscillations and periodic patterns

/**
 * @wgsl
 * @name triangleWave
 * @description Generates a triangle wave with configurable frequency and amplitude.
 * @param {f32} x Input position.
 * @param {f32} frequency Wave frequency.
 * @param {f32} amplitude Wave amplitude.
 * @param {f32} phase Phase offset.
 * @returns {f32} Triangle wave value.
 */
export const triangleWave = `fn triangleWave(x: f32, frequency: f32, amplitude: f32, phase: f32) -> f32 {
  let t = x * frequency + phase;
  let tt = fract(t);
  let result = abs(2.0 * tt - 1.0);
  return (1.0 - result) * amplitude;
}`;

/**
 * @wgsl
 * @name sawtoothWave
 * @description Generates a sawtooth wave with linear ramp.
 * @param {f32} x Input position.
 * @param {f32} frequency Wave frequency.
 * @param {f32} amplitude Wave amplitude.
 * @param {f32} phase Phase offset.
 * @returns {f32} Sawtooth wave value.
 */
export const sawtoothWave = `fn sawtoothWave(x: f32, frequency: f32, amplitude: f32, phase: f32) -> f32 {
  let t = x * frequency + phase;
  let tt = fract(t);
  return tt * amplitude;
}`;

/**
 * @wgsl
 * @name squareWave
 * @description Generates a square wave with configurable duty cycle.
 * @param {f32} x Input position.
 * @param {f32} frequency Wave frequency.
 * @param {f32} amplitude Wave amplitude.
 * @param {f32} phase Phase offset.
 * @param {f32} dutyCycle Duty cycle (0-1) for wave on/off ratio.
 * @returns {f32} Square wave value.
 */
export const squareWave = `fn squareWave(x: f32, frequency: f32, amplitude: f32, phase: f32, dutyCycle: f32) -> f32 {
  let t = x * frequency + phase;
  let tt = fract(t);
  return select(0.0, amplitude, tt < dutyCycle);
}`;

/**
 * @wgsl
 * @name pulseWave
 * @description Generates a pulse wave with smooth falloff edges.
 * @param {f32} x Input position.
 * @param {f32} frequency Wave frequency.
 * @param {f32} amplitude Wave amplitude.
 * @param {f32} phase Phase offset.
 * @param {f32} width Pulse width (0-1).
 * @param {f32} falloff Smooth falloff duration.
 * @returns {f32} Pulse wave value.
 */
export const pulseWave = `fn pulseWave(x: f32, frequency: f32, amplitude: f32, phase: f32, width: f32, falloff: f32) -> f32 {
  let t = x * frequency + phase;
  let tt = fract(t);
  
  // Create a pulse with smooth edges
  var pulse = 0.0;
  
  // If tt is within the width, pulse is 1.0
  if (tt < width) {
    pulse = 1.0;
  } else if (tt < width + falloff) {
    // Smooth falloff
    pulse = 1.0 - (tt - width) / falloff;
  }
  
  return pulse * amplitude;
}`;

/**
 * @wgsl
 * @name chirpWave
 * @description Generates a chirp wave with linearly changing frequency.
 * @param {f32} x Input position.
 * @param {f32} startFrequency Starting frequency.
 * @param {f32} endFrequency Ending frequency.
 * @param {f32} amplitude Wave amplitude.
 * @param {f32} period Period over which frequency changes.
 * @returns {f32} Chirp wave value.
 */
export const chirpWave = `fn chirpWave(x: f32, startFrequency: f32, endFrequency: f32, amplitude: f32, period: f32) -> f32 {
  // Calculate the time within the current period
  let t = fract(x / period);
  
  // Calculate the frequency at the current time (linear interpolation)
  let freq = mix(startFrequency, endFrequency, t);
  
  // Calculate the phase which increases with changing frequency
  let k = (endFrequency - startFrequency) / period;
  let phase = 2.0 * 3.14159 * (startFrequency * t + 0.5 * k * t * t);
  
  // Return the sine wave with the calculated phase
  return sin(phase) * amplitude;
}`;

/**
 * @wgsl
 * @name noiseWave
 * @description Generates a wave using interpolated noise for organic variation.
 * @param {f32} x Input position.
 * @param {f32} frequency Wave frequency.
 * @param {f32} amplitude Wave amplitude.
 * @param {f32} seed Random seed for noise generation.
 * @returns {f32} Noise-based wave value.
 * @requires hash1D
 */
export const noiseWave = `//! requires hash1D
fn noiseWave(x: f32, frequency: f32, amplitude: f32, seed: f32) -> f32 {
  // Create interpolated noise
  let t = x * frequency;
  let floorT = floor(t);
  let fractT = fract(t);
  
  // Get four noise values and interpolate between them
  let n0 = hash1D(floorT + seed);
  let n1 = hash1D(floorT + 1.0 + seed);
  
  // Smooth interpolation
  let u = fractT * fractT * (3.0 - 2.0 * fractT); // Smoothstep
  
  return mix(n0, n1, u) * amplitude;
}`;
