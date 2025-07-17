// Test for individual function export
import { test, describe } from 'node:test';
import assert from 'node:assert';
import { elasticWave } from '../dist/wgsl-fns.esm.js';

describe('Individual function export', () => {
  test('elasticWave should be exported as string', () => {
    assert(typeof elasticWave === 'string', 'elasticWave should be a string');
    assert(elasticWave.includes('fn elasticWave('), 'Should contain function definition');
    assert(elasticWave.includes('amplitude'), 'Should contain amplitude parameter');
    assert(elasticWave.includes('frequency'), 'Should contain frequency parameter');
  });
});