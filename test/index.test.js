// Test for the main wgsl-fns functionality
import { test, describe } from 'node:test';
import assert from 'node:assert';
import { create, globals } from 'webgpu';
import { getFns, wgslFns } from '../dist/wgsl-fns.esm.js';

// Setup WebGPU for compilation testing
Object.assign(globalThis, globals);
const navigator = { gpu: create([]) };

// Ensure cleanup when the process exits
process.on('exit', () => {
  delete globalThis.navigator;
});

// Handle termination signals
process.on('SIGINT', () => {
  delete globalThis.navigator;
  process.exit(0);
});

process.on('SIGTERM', () => {
  delete globalThis.navigator;
  process.exit(0);
});

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

  test('all functions in wgslFns should be non-empty strings', () => {
    for (const [name, fn] of Object.entries(wgslFns)) {
      assert(typeof fn === 'string', `Function ${name} should be a string`);
      assert(fn.length > 0, `Function ${name} should not be empty`);
      assert(fn.includes('fn '), `Function ${name} should contain WGSL function definition`);
    }
  });

  test('all functions should have basic WGSL syntax', () => {
    for (const [name, fn] of Object.entries(wgslFns)) {
      // Basic WGSL function syntax validation (may have magic comments at start)
      assert(fn.match(/(?:^\/\/!\s*requires\s+.+\n)?fn\s+\w+\s*\(/), `Function ${name} should start with valid WGSL function declaration (optionally preceded by magic comment)`);
      assert(fn.includes('{'), `Function ${name} should contain opening brace`);
      assert(fn.includes('}'), `Function ${name} should contain closing brace`);
      
      // Check balanced braces
      const openBraces = (fn.match(/\{/g) || []).length;
      const closeBraces = (fn.match(/\}/g) || []).length;
      assert.strictEqual(openBraces, closeBraces, `Function ${name} should have balanced braces`);
    }
  });
});

describe('WGSL Compilation Tests', () => {
  let device;
  
  // Setup WebGPU device once for all tests
  async function setupDevice() {
    if (device) return device;
    
    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        throw new Error('No WebGPU adapter available');
      }
      device = await adapter.requestDevice();
      return device;
    } catch (error) {
      throw new Error(`Failed to setup WebGPU device: ${error.message}`);
    }
  }

  test('all WGSL functions should compile individually (with auto-resolved dependencies)', async () => {
    const webgpuDevice = await setupDevice();
    const failedFunctions = [];
    
    console.log(`Testing compilation of ${Object.keys(wgslFns).length} WGSL functions...`);
    
    for (const functionName of Object.keys(wgslFns)) {
      try {
        // Use getFns to automatically include dependencies
        const functionCode = getFns([functionName]);
        
        // Create a minimal compute shader that includes the function(s)
        const shaderCode = `
          ${functionCode}
          
          @compute @workgroup_size(1)
          fn main() {
            // Just compile the function, don't call it
          }
        `;
        
        // Try to create the shader module
        const shaderModule = webgpuDevice.createShaderModule({
          label: `Test shader for ${functionName}`,
          code: shaderCode
        });
        
        // Check for compilation errors
        const compilationInfo = await shaderModule.getCompilationInfo();
        const errors = compilationInfo.messages.filter(msg => msg.type === 'error');
        
        if (errors.length > 0) {
          const errorMessages = errors.map(err => `Line ${err.lineNum}: ${err.message}`).join('\n');
          failedFunctions.push({
            name: functionName,
            errors: errorMessages,
            code: functionCode
          });
        }
        
      } catch (error) {
        failedFunctions.push({
          name: functionName,
          errors: error.message,
          code: getFns([functionName])
        });
      }
    }
    
    // Report all failures at once
    if (failedFunctions.length > 0) {
      const failureReport = failedFunctions.map(failure => 
        `\n❌ Function "${failure.name}" failed to compile:\n${failure.errors}\n\nCode:\n${failure.code}\n${'='.repeat(80)}`
      ).join('\n');
      
      assert.fail(`${failedFunctions.length} function(s) failed to compile:${failureReport}`);
    }
    
    console.log(`✅ All ${Object.keys(wgslFns).length} functions compiled successfully!`);
  });

  test('combined functions should compile together', async () => {
    const webgpuDevice = await setupDevice();
    const functionNames = Object.keys(wgslFns);
    
    // Test combining multiple functions
    const testCombinations = [
      functionNames.slice(0, 5), // First 5 functions
      functionNames.slice(-5),   // Last 5 functions
      functionNames.filter(name => name.includes('sdf')).slice(0, 5), // 5 SDF functions
    ].filter(combo => combo.length > 0);
    
    for (const combination of testCombinations) {
      try {
        const combinedCode = getFns(combination);
        
        const shaderCode = `
          ${combinedCode}
          
          @compute @workgroup_size(1)
          fn main() {
            // Just compile the functions, don't call them
          }
        `;
        
        const shaderModule = webgpuDevice.createShaderModule({
          label: `Test shader for combined functions: ${combination.join(', ')}`,
          code: shaderCode
        });
        
        const compilationInfo = await shaderModule.getCompilationInfo();
        const errors = compilationInfo.messages.filter(msg => msg.type === 'error');
        
        if (errors.length > 0) {
          const errorMessages = errors.map(err => `Line ${err.lineNum}: ${err.message}`).join('\n');
          assert.fail(`Combined functions [${combination.join(', ')}] failed to compile:\n${errorMessages}\n\nCode:\n${combinedCode}`);
        }
        
      } catch (error) {
        assert.fail(`Failed to test combination [${combination.join(', ')}]: ${error.message}`);
      }
    }
    
    console.log(`✅ All function combinations compiled successfully!`);
  });

  test('dependency resolution should work correctly', async () => {
    const webgpuDevice = await setupDevice();
    
    // Test functions that have dependencies with specific expected dependencies
    const testCases = [
      { function: 'fbm', expectedDeps: ['hash22', 'noise2D'] },
      { function: 'hslToRgb', expectedDeps: ['hue2rgb'] },
      { function: 'noiseWave', expectedDeps: ['hash1D'] },
      { function: 'noise3D', expectedDeps: ['hash31'] },
      { function: 'warpNoise3D', expectedDeps: ['hash31', 'noise3D'] },
      { function: 'sdfDisplace', expectedDeps: ['hash3D'] },
      { function: 'sdfDomainRepeat', expectedDeps: ['hash31', 'noise3D', 'warpNoise3D'] }
    ];
    
    for (const testCase of testCases) {
      try {
        const combinedCode = getFns([testCase.function]);
        
        // Check that the main function is included
        assert(combinedCode.includes(`fn ${testCase.function}(`), 
          `Should contain ${testCase.function} function`);
        
        // Check that all expected dependencies are included
        for (const dep of testCase.expectedDeps) {
          assert(combinedCode.includes(`fn ${dep}(`), 
            `Function "${testCase.function}" should include dependency "${dep}"`);
        }
        
        // Test compilation
        const shaderCode = `
          ${combinedCode}
          
          @compute @workgroup_size(1)
          fn main() {
            // Just compile the functions, don't call them
          }
        `;
        
        const shaderModule = webgpuDevice.createShaderModule({
          label: `Test shader for ${testCase.function} with dependencies`,
          code: shaderCode
        });
        
        const compilationInfo = await shaderModule.getCompilationInfo();
        const errors = compilationInfo.messages.filter(msg => msg.type === 'error');
        
        if (errors.length > 0) {
          const errorMessages = errors.map(err => `Line ${err.lineNum}: ${err.message}`).join('\n');
          assert.fail(`Function "${testCase.function}" with dependencies should compile without errors. Errors: ${errorMessages}`);
        }
        
      } catch (error) {
        assert.fail(`Failed to test function "${testCase.function}" with dependencies: ${error.message}`);
      }
    }
    
    console.log(`✅ All functions with dependencies compiled successfully!`);
  });

  // Clean up after all tests complete
  test('cleanup WebGPU resources', async () => {
    if (device) {
      device.destroy();
      device = null;
    }
    // Remove the global navigator reference to allow Node.js to exit
    delete globalThis.navigator;
    
    // Use setImmediate to ensure all cleanup is complete before exiting
    setImmediate(() => {
      process.exit(0);
    });
  });
});