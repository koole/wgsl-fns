// Example usage of wgsl-fns
const { getFns, elasticWave, wgslFns } = require('./dist/wgsl-fns.cjs.js');

console.log('=== Individual Function Example ===');
console.log('elasticWave function:');
console.log(elasticWave);

console.log('\n=== getFns Example ===');
console.log('Getting multiple functions:');
const combinedFunctions = getFns(['elasticWave', 'smoothStep']);
console.log(combinedFunctions);

console.log('\n=== Default Export Example ===');
console.log('Available functions:', Object.keys(wgslFns));
console.log('\nAccessing via default export:');
console.log(wgslFns.noise2D);

console.log('\n=== Build completed successfully! ===');
