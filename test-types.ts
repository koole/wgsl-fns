// TypeScript test to check type accessibility using the types file directly
import { WgslFunctionName, getFns } from './dist/index';

// This should work if WgslFunctionName is properly exported
const testNames: WgslFunctionName[] = ['elasticWave', 'noise2D'];

console.log('Type test passed! WgslFunctionName is accessible');
console.log('Test function names:', testNames);