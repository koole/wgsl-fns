// Test for the main wgsl-fns functionality
import { test, describe } from 'node:test';
import assert from 'node:assert';
import { getFns, wgslFns } from '../dist/wgsl-fns.esm.js';

describe('wgsl-fns main functionality', () => {
  test('getFns should return combined functions for valid function names', () => {
    const result = getFns(['elasticWave', 'smoothStep']);
    
    // Should contain both functions
    assert(result.includes('fn elasticWave('), 'Should contain elasticWave function');
    assert(result.includes('fn smoothStep('), 'Should contain smoothStep function');
    
    // Should be separated by double newlines
    assert(result.includes('\n\n'), 'Functions should be separated by double newlines');
    
    // Should be non-empty strings
    assert(typeof result === 'string', 'Result should be a string');
    assert(result.length > 0, 'Result should not be empty');
  });

  test('getFns should return single function for single function name', () => {
    const result = getFns(['elasticWave']);
    
    assert(result.includes('fn elasticWave('), 'Should contain elasticWave function');
    assert(!result.includes('fn smoothStep('), 'Should not contain other functions');
    assert(typeof result === 'string', 'Result should be a string');
  });

  test('getFns should throw error for invalid function name', () => {
    assert.throws(
      () => getFns(['nonExistentFunction']),
      /WGSL function "nonExistentFunction" not found/,
      'Should throw error for non-existent function'
    );
  });

  test('getFns should throw error for mixed valid and invalid function names', () => {
    assert.throws(
      () => getFns(['elasticWave', 'nonExistentFunction']),
      /WGSL function "nonExistentFunction" not found/,
      'Should throw error when any function name is invalid'
    );
  });

  test('getFns should handle empty array', () => {
    const result = getFns([]);
    assert.strictEqual(result, '', 'Empty array should return empty string');
  });

  test('default export should contain all expected functions', () => {
    const expectedFunctions = [
      'elasticWave', 'smoothStep', 'noise2D', 'hash22', 'fbm', 'rotate2D',
      'sdfCircle', 'sdfBox', 'sdfUnion', 'sdfIntersection', 'sdfSubtraction',
      'palette', 'linearToSrgb', 'srgbToLinear', 'hue2rgb', 'hslToRgb'
    ];

    const actualFunctions = Object.keys(wgslFns);
    
    for (const expectedFn of expectedFunctions) {
      assert(actualFunctions.includes(expectedFn), `Should contain function: ${expectedFn}`);
    }
    
    assert.strictEqual(actualFunctions.length, expectedFunctions.length, 
      `Should have exactly ${expectedFunctions.length} functions`);
  });

  test('all functions in wgslFns should be non-empty strings', () => {
    for (const [name, fn] of Object.entries(wgslFns)) {
      assert(typeof fn === 'string', `Function ${name} should be a string`);
      assert(fn.length > 0, `Function ${name} should not be empty`);
      assert(fn.includes('fn '), `Function ${name} should contain WGSL function definition`);
    }
  });

  test('all functions should have basic WGSL syntax', () => {
    for (const [name, fn] of Object.entries(wgslFns)) {
      // Basic WGSL function syntax validation
      assert(fn.match(/^fn\s+\w+\s*\(/), `Function ${name} should start with valid WGSL function declaration`);
      assert(fn.includes('{'), `Function ${name} should contain opening brace`);
      assert(fn.includes('}'), `Function ${name} should contain closing brace`);
      
      // Check balanced braces
      const openBraces = (fn.match(/\{/g) || []).length;
      const closeBraces = (fn.match(/\}/g) || []).length;
      assert.strictEqual(openBraces, closeBraces, `Function ${name} should have balanced braces`);
    }
  });
});