// Test for CommonJS compatibility and TypeScript types
import { test, describe } from 'node:test';
import assert from 'node:assert';

describe('Package compatibility', () => {
  test('CommonJS import should work', async () => {
    const pkg = await import('../dist/wgsl-fns.cjs.js');
    
    assert(typeof pkg.getFns === 'function', 'getFns should be available via CommonJS');
    assert(typeof pkg.elasticWave === 'string', 'Individual functions should be available via CommonJS');
    assert(typeof pkg.default === 'object', 'Default export should be available via CommonJS');
    
    // Test functionality
    const result = pkg.getFns(['elasticWave']);
    assert(result.includes('fn elasticWave('), 'CommonJS getFns should work');
  });

  test('ES Module import should work', async () => {
    const pkg = await import('../dist/wgsl-fns.esm.js');
    
    assert(typeof pkg.getFns === 'function', 'getFns should be available via ES modules');
    assert(typeof pkg.elasticWave === 'string', 'Individual functions should be available via ES modules');
    assert(typeof pkg.default === 'object', 'Default export should be available via ES modules');
    
    // Test functionality
    const result = pkg.getFns(['elasticWave']);
    assert(result.includes('fn elasticWave('), 'ES Module getFns should work');
  });

  test('TypeScript definitions should exist', async () => {
    // Import TypeScript definitions to verify they exist and are valid
    const fs = await import('node:fs');
    const path = await import('node:path');
    
    const distPath = new URL('../dist', import.meta.url);
    const typeFiles = [
      'index.d.ts',
      'functions.d.ts',
      'math.d.ts',
      'noise.d.ts',
      'sdf.d.ts',
      'color.d.ts'
    ];
    
    for (const typeFile of typeFiles) {
      const filePath = path.join(distPath.pathname, typeFile);
      assert(fs.existsSync(filePath), `TypeScript definition file ${typeFile} should exist`);
      
      const content = fs.readFileSync(filePath, 'utf8');
      assert(content.length > 0, `TypeScript definition file ${typeFile} should not be empty`);
    }
  });
});