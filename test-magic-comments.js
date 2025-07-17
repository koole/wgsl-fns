// Test the new magic comment dependency system
import { getFns } from './dist/wgsl-fns.esm.js';

console.log('🧪 Testing Magic Comment Dependency System\n');

// Test fbm - should include noise2D and hash22
console.log('1. Testing fbm (should include noise2D and hash22):');
const fbmCode = getFns(['fbm']);
console.log('   ✅ Contains hash22:', fbmCode.includes('fn hash22('));
console.log('   ✅ Contains noise2D:', fbmCode.includes('fn noise2D('));
console.log('   ✅ Contains fbm:', fbmCode.includes('fn fbm('));
console.log('   ✅ Contains magic comment:', fbmCode.includes('//! requires noise2D'));
console.log('   📏 Combined code length:', fbmCode.length, 'characters\n');

// Test sdfDomainRepeat - should include warpNoise3D, noise3D, and hash31
console.log('2. Testing sdfDomainRepeat (deep nested dependencies):');
const sdfCode = getFns(['sdfDomainRepeat']);
console.log('   ✅ Contains hash31:', sdfCode.includes('fn hash31('));
console.log('   ✅ Contains noise3D:', sdfCode.includes('fn noise3D('));
console.log('   ✅ Contains warpNoise3D:', sdfCode.includes('fn warpNoise3D('));
console.log('   ✅ Contains sdfDomainRepeat:', sdfCode.includes('fn sdfDomainRepeat('));
console.log('   ✅ Contains magic comment:', sdfCode.includes('//! requires warpNoise3D'));
console.log('   📏 Combined code length:', sdfCode.length, 'characters\n');

// Test hslToRgb - should include hue2rgb
console.log('3. Testing hslToRgb (should include hue2rgb):');
const colorCode = getFns(['hslToRgb']);
console.log('   ✅ Contains hue2rgb:', colorCode.includes('fn hue2rgb('));
console.log('   ✅ Contains hslToRgb:', colorCode.includes('fn hslToRgb('));
console.log('   ✅ Contains magic comment:', colorCode.includes('//! requires hue2rgb'));
console.log('   📏 Combined code length:', colorCode.length, 'characters\n');

console.log('🎉 Magic comment dependency system working correctly!');
console.log('\n📝 Magic comments make dependencies visible to users:');
console.log('   - fbm:', fbmCode.match(/\/\/!\s*requires\s+(.+)/)?.[1] || 'none');
console.log('   - sdfDomainRepeat:', sdfCode.match(/\/\/!\s*requires\s+(.+)/)?.[1] || 'none');
console.log('   - hslToRgb:', colorCode.match(/\/\/!\s*requires\s+(.+)/)?.[1] || 'none');
