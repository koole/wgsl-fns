import { test } from 'node:test';
import assert from 'node:assert';
import { getFns, wgslFns } from '../dist/wgsl-fns.esm.js';

test('Function name collision detection', async () => {
  const allFunctionNames = Object.keys(wgslFns);
  
  console.log(`Testing function name collisions with ${allFunctionNames.length} functions...`);
  
  // Create WebGPU device for compilation testing
  let device;
  try {
    const adapter = await navigator.gpu?.requestAdapter();
    if (!adapter) {
      throw new Error('WebGPU not available');
    }
    device = await adapter.requestDevice();
  } catch (error) {
    console.warn('WebGPU not available, skipping collision test:', error.message);
    return;
  }

  try {
    // Test 1: All functions together should compile
    const combinedWgsl = getFns(allFunctionNames);
    
    // Try to create a compute shader with all functions
    const shaderModule = device.createShaderModule({
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
    
    // Test 2: Test common problematic function names
    const potentiallyColliding = [
      ['simplexNoise2D', 'simplexNoise3D', 'simplexNoise4D'], // All simplex functions
      ['perlinNoise2D', 'perlinNoise3D'], // Perlin functions
      ['noise2D', 'noise3D'], // Basic noise functions
      ['hash22', 'hash31', 'hash3D'], // Hash functions
      ['pcg', 'pcg2d', 'pcg3d', 'pcg4d'], // PCG functions
    ];
    
    for (const group of potentiallyColliding) {
      const groupWgsl = getFns(group);
      
      const groupShaderModule = device.createShaderModule({
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
    
    // Test 3: Check for duplicate function definitions by parsing the combined WGSL
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
    
  } finally {
    // Clean up WebGPU device
    if (device) {
      device.destroy();
    }
  }
});
