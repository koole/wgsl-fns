// Function dependency mappings
// Each function can declare what other functions it depends on

import type { WgslFunctionName } from './functions';

/**
 * Dependency map - each key is a function name, value is array of its dependencies
 */
export const functionDependencies: Record<string, WgslFunctionName[]> = {
  // Noise functions - only direct dependencies needed
  'noise2D': ['hash22'],
  'fbm': ['noise2D'], // Will automatically include hash22 via noise2D
  'noise3D': ['hash31'],
  'warpNoise3D': ['noise3D'], // Will automatically include hash31 via noise3D
  
  // Color functions
  'hslToRgb': ['hue2rgb'],
  
  // Wave functions
  'noiseWave': ['hash1D'],
  
  // SDF modifier functions
  'sdfDisplace': ['hash3D'],
  'sdfDomainRepeat': ['warpNoise3D'], // Will automatically include noise3D and hash31
};

/**
 * Recursively resolve all dependencies for a given function
 * @param functionName The function to resolve dependencies for
 * @param resolved Set of already resolved dependencies (to prevent infinite loops)
 * @returns Array of all dependencies in dependency order
 */
export function resolveDependencies(
  functionName: WgslFunctionName, 
  resolved: Set<string> = new Set()
): WgslFunctionName[] {
  if (resolved.has(functionName)) {
    return []; // Already resolved or circular dependency
  }
  
  resolved.add(functionName);
  const deps = functionDependencies[functionName] || [];
  const allDeps: WgslFunctionName[] = [];
  
  // First, resolve dependencies of dependencies
  for (const dep of deps) {
    allDeps.push(...resolveDependencies(dep, resolved));
    if (!allDeps.includes(dep)) {
      allDeps.push(dep);
    }
  }
  
  return allDeps;
}

/**
 * Get all dependencies for multiple functions, in proper order
 * @param functionNames Array of function names
 * @returns Array of all dependencies needed, in dependency order
 */
export function resolveAllDependencies(functionNames: WgslFunctionName[]): WgslFunctionName[] {
  const allDeps = new Set<WgslFunctionName>();
  
  for (const functionName of functionNames) {
    const deps = resolveDependencies(functionName);
    deps.forEach(dep => allDeps.add(dep));
  }
  
  return Array.from(allDeps);
}
