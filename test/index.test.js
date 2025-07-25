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

  test('dependency resolution should work correctly', () => {
    // Test functions that have dependencies with specific expected dependencies
    const testCases = [
      { function: 'fbm2D', expectedDeps: ['hash22', 'noise2D'] },
      { function: 'hslToRgb', expectedDeps: ['hueToRgb'] },
      { function: 'noiseWave', expectedDeps: ['hash1D'] },
      { function: 'noise3D', expectedDeps: ['hash31'] },
      { function: 'warpNoise3D', expectedDeps: ['hash31', 'noise3D'] },
      { function: 'sdfDisplace', expectedDeps: ['hash3D'] },
      { function: 'sdfDomainRepeat', expectedDeps: ['hash31', 'noise3D', 'warpNoise3D'] }
    ];
    
    for (const testCase of testCases) {
      const combinedCode = getFns([testCase.function]);
      
      // Check that the main function is included
      assert(combinedCode.includes(`fn ${testCase.function}(`), 
        `Should contain ${testCase.function} function`);
      
      // Check that all expected dependencies are included
      for (const dep of testCase.expectedDeps) {
        assert(combinedCode.includes(`fn ${dep}(`), 
          `Function "${testCase.function}" should include dependency "${dep}"`);
      }
    }
  });

  test('shared dependencies should only be included once', () => {
    // Both noise3D and warpNoise3D depend on hash31
    const combinedCode = getFns(['noise3D', 'warpNoise3D']);
    
    // Check that both functions are included
    assert(combinedCode.includes('fn noise3D('), 'Should contain noise3D function');
    assert(combinedCode.includes('fn warpNoise3D('), 'Should contain warpNoise3D function');
    assert(combinedCode.includes('fn hash31('), 'Should contain hash31 dependency');
    
    // Count occurrences of hash31 function definition
    const hash31Matches = combinedCode.match(/fn hash31\(/g);
    assert(hash31Matches, 'hash31 function should be present');
    assert.strictEqual(hash31Matches.length, 1, 'hash31 function should only appear once, not duplicated');
    
    // Verify the functions appear in the correct order (dependencies first)
    const hash31Index = combinedCode.indexOf('fn hash31(');
    const noise3DIndex = combinedCode.indexOf('fn noise3D(');
    const warpNoise3DIndex = combinedCode.indexOf('fn warpNoise3D(');
    
    assert(hash31Index < noise3DIndex, 'hash31 should appear before noise3D');
    assert(noise3DIndex < warpNoise3DIndex, 'noise3D should appear before warpNoise3D');
  });
});

describe('WGSL Compilation Tests', () => {
  let device;
  let webgpuAvailable = false;
  let webgpuGpu = null;
  
  // Check if WebGPU is available
  async function checkWebGPUAvailability() {
    // Skip WebGPU in CI environments to avoid native crashes
    if (process.env.CI || process.env.GITHUB_ACTIONS) {
      console.log('CI environment detected - skipping WebGPU tests');
      return false;
    }
    
    try {
      // Try to setup WebGPU dynamically
      const { create, globals } = await import('webgpu');
      Object.assign(globalThis, globals);
      webgpuGpu = create([]);
      
      // Check if we can get an adapter
      const adapter = await webgpuGpu.requestAdapter();
      return !!adapter;
    } catch (error) {
      console.log(`WebGPU not available: ${error.message}`);
      return false;
    }
  }
  
  // Setup WebGPU device once for all tests
  async function setupDevice() {
    if (device) return device;
    
    try {
      if (!webgpuGpu) {
        throw new Error('WebGPU not properly initialized');
      }
      
      const adapter = await webgpuGpu.requestAdapter();
      if (!adapter) {
        throw new Error('No WebGPU adapter available');
      }
      device = await adapter.requestDevice();
      return device;
    } catch (error) {
      throw new Error(`Failed to setup WebGPU device: ${error.message}`);
    }
  }

  test('all WGSL functions should compile individually (with auto-resolved dependencies)', async (t) => {
    webgpuAvailable = await checkWebGPUAvailability();
    if (!webgpuAvailable) {
      t.skip('WebGPU not available in this environment');
      return;
    }
    
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

  test('combined functions should compile together', async (t) => {
    if (!webgpuAvailable) {
      t.skip('WebGPU not available in this environment');
      return;
    }
    
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

  test('function name collision detection - all functions together', async (t) => {
    if (!webgpuAvailable) {
      t.skip('WebGPU not available in this environment');
      return;
    }
    
    const webgpuDevice = await setupDevice();
    const allFunctionNames = Object.keys(wgslFns);
    
    console.log(`Testing function name collisions with ${allFunctionNames.length} functions...`);
    
    try {
      // Test 1: All functions together should compile
      const combinedWgsl = getFns(allFunctionNames);
      
      // Try to create a compute shader with all functions
      const shaderModule = webgpuDevice.createShaderModule({
        label: 'Collision test - all functions',
        code: `
          ${combinedWgsl}
          
          @compute @workgroup_size(1)
          fn main() {
            // Empty main function to satisfy WGSL requirements
          }
        `
      });
      
      // Wait for compilation
      const compilationInfo = await shaderModule.getCompilationInfo();
      
      // Check for errors
      const errors = compilationInfo.messages.filter(msg => msg.type === 'error');
      if (errors.length > 0) {
        console.error('Compilation errors found:');
        errors.forEach(error => {
          console.error(`  Line ${error.lineNum}: ${error.message}`);
        });
        assert.fail(`Found ${errors.length} compilation errors in combined functions`);
      }
      
      console.log('✅ All functions compile together without name collisions');
      
      // Test 2: Check for duplicate function definitions by parsing the combined WGSL
      const functionDefinitions = new Set();
      const functionRegex = /fn\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
      
      let match;
      while ((match = functionRegex.exec(combinedWgsl)) !== null) {
        const funcName = match[1];
        
        // Skip built-in WGSL functions and common shader entry points
        if (['main', 'vertex_main', 'fragment_main'].includes(funcName)) {
          continue;
        }
        
        if (functionDefinitions.has(funcName)) {
          console.error(`Duplicate function definition found: ${funcName}`);
          
          // Find which functions contain this duplicate
          const containingFunctions = [];
          for (const [name, code] of Object.entries(wgslFns)) {
            if (code.includes(`fn ${funcName}(`)) {
              containingFunctions.push(name);
            }
          }
          
          assert.fail(
            `Duplicate function definition: ${funcName} ` +
            `found in functions: ${containingFunctions.join(', ')}`
          );
        }
        
        functionDefinitions.add(funcName);
      }
      
      console.log(`✅ No duplicate function definitions found (${functionDefinitions.size} unique functions)`);
      
      // Test 3: Test specific function groups that could have conflicts
      const potentiallyColliding = [
        ['simplexNoise2D', 'simplexNoise3D', 'simplexNoise4D'], // All simplex functions
        ['perlinNoise2D', 'perlinNoise3D'], // Perlin functions
        ['noise2D', 'noise3D'], // Basic noise functions
        ['hash22', 'hash31', 'hash3D'], // Hash functions
        ['pcg', 'pcg2d', 'pcg3d', 'pcg4d'], // PCG functions
      ];
      
      for (const group of potentiallyColliding) {
        const groupWgsl = getFns(group);
        
        const groupShaderModule = webgpuDevice.createShaderModule({
          label: `Collision test - group [${group.join(', ')}]`,
          code: `
            ${groupWgsl}
            
            @compute @workgroup_size(1)
            fn main() {
              // Empty main function
            }
          `
        });
        
        const groupCompilationInfo = await groupShaderModule.getCompilationInfo();
        const groupErrors = groupCompilationInfo.messages.filter(msg => msg.type === 'error');
        
        if (groupErrors.length > 0) {
          console.error(`Compilation errors in group [${group.join(', ')}]:`);
          groupErrors.forEach(error => {
            console.error(`  Line ${error.lineNum}: ${error.message}`);
          });
          assert.fail(`Found compilation errors in function group: ${group.join(', ')}`);
        }
      }
      
      console.log('✅ All function groups compile without conflicts');
      
    } catch (error) {
      assert.fail(`Collision detection test failed: ${error.message}`);
    }
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