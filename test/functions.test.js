// Test for individual function categories
import { test, describe } from 'node:test';
import assert from 'node:assert';
import { 
  elasticWave, smoothStep, rotate2D,
  noise2D, hash22, fbm,
  sdfCircle, sdfBox, sdfUnion, sdfIntersection, sdfSubtraction,
  palette, linearToSrgb, srgbToLinear, hue2rgb, hslToRgb
} from '../dist/wgsl-fns.esm.js';

describe('Individual function exports', () => {
  describe('Math functions', () => {
    test('elasticWave should be exported as string', () => {
      assert(typeof elasticWave === 'string', 'elasticWave should be a string');
      assert(elasticWave.includes('fn elasticWave('), 'Should contain function definition');
      assert(elasticWave.includes('amplitude'), 'Should contain amplitude parameter');
      assert(elasticWave.includes('frequency'), 'Should contain frequency parameter');
    });

    test('smoothStep should be exported as string', () => {
      assert(typeof smoothStep === 'string', 'smoothStep should be a string');
      assert(smoothStep.includes('fn smoothStep('), 'Should contain function definition');
      assert(smoothStep.includes('edge0'), 'Should contain edge0 parameter');
      assert(smoothStep.includes('edge1'), 'Should contain edge1 parameter');
    });

    test('rotate2D should be exported as string', () => {
      assert(typeof rotate2D === 'string', 'rotate2D should be a string');
      assert(rotate2D.includes('fn rotate2D('), 'Should contain function definition');
      assert(rotate2D.includes('vec2'), 'Should work with 2D vectors');
    });
  });

  describe('Noise functions', () => {
    test('noise2D should be exported as string', () => {
      assert(typeof noise2D === 'string', 'noise2D should be a string');
      assert(noise2D.includes('fn noise2D('), 'Should contain function definition');
      assert(noise2D.includes('vec2<f32>'), 'Should take vec2<f32> parameter');
    });

    test('hash22 should be exported as string', () => {
      assert(typeof hash22 === 'string', 'hash22 should be a string');
      assert(hash22.includes('fn hash22('), 'Should contain function definition');
    });

    test('fbm should be exported as string', () => {
      assert(typeof fbm === 'string', 'fbm should be a string');
      assert(fbm.includes('fn fbm('), 'Should contain function definition');
    });
  });

  describe('SDF functions', () => {
    test('sdfCircle should be exported as string', () => {
      assert(typeof sdfCircle === 'string', 'sdfCircle should be a string');
      assert(sdfCircle.includes('fn sdfCircle('), 'Should contain function definition');
    });

    test('sdfBox should be exported as string', () => {
      assert(typeof sdfBox === 'string', 'sdfBox should be a string');
      assert(sdfBox.includes('fn sdfBox('), 'Should contain function definition');
    });

    test('sdfUnion should be exported as string', () => {
      assert(typeof sdfUnion === 'string', 'sdfUnion should be a string');
      assert(sdfUnion.includes('fn sdfUnion('), 'Should contain function definition');
    });

    test('sdfIntersection should be exported as string', () => {
      assert(typeof sdfIntersection === 'string', 'sdfIntersection should be a string');
      assert(sdfIntersection.includes('fn sdfIntersection('), 'Should contain function definition');
    });

    test('sdfSubtraction should be exported as string', () => {
      assert(typeof sdfSubtraction === 'string', 'sdfSubtraction should be a string');
      assert(sdfSubtraction.includes('fn sdfSubtraction('), 'Should contain function definition');
    });
  });

  describe('Color functions', () => {
    test('palette should be exported as string', () => {
      assert(typeof palette === 'string', 'palette should be a string');
      assert(palette.includes('fn palette('), 'Should contain function definition');
    });

    test('linearToSrgb should be exported as string', () => {
      assert(typeof linearToSrgb === 'string', 'linearToSrgb should be a string');
      assert(linearToSrgb.includes('fn linearToSrgb('), 'Should contain function definition');
    });

    test('srgbToLinear should be exported as string', () => {
      assert(typeof srgbToLinear === 'string', 'srgbToLinear should be a string');
      assert(srgbToLinear.includes('fn srgbToLinear('), 'Should contain function definition');
    });

    test('hue2rgb should be exported as string', () => {
      assert(typeof hue2rgb === 'string', 'hue2rgb should be a string');
      assert(hue2rgb.includes('fn hue2rgb('), 'Should contain function definition');
    });

    test('hslToRgb should be exported as string', () => {
      assert(typeof hslToRgb === 'string', 'hslToRgb should be a string');
      assert(hslToRgb.includes('fn hslToRgb('), 'Should contain function definition');
    });
  });
});