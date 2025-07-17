// Function dependency mappings
// Dependencies are now parsed from magic comments in function code

import type { WgslFunctionName } from './functions';
import { wgslFns } from './functions';

/**
 * Parse dependencies from a WGSL function string using magic comments
 * @param functionCode The WGSL function code string
 * @returns Array of dependency function names
 */
function parseDependencies(functionCode: string): WgslFunctionName[] {
  const magicCommentMatch = functionCode.match(/^\/\/!\s*requires\s+(.+)$/m);
  if (!magicCommentMatch) {
    return [];
  }
  
  // Split by spaces and filter out empty strings
  return magicCommentMatch[1]
    .split(/\s+/)
    .filter(dep => dep.length > 0) as WgslFunctionName[];
}

/**
 * Get direct dependencies for a function by parsing its magic comment
 * @param functionName The function name to get dependencies for
 * @returns Array of direct dependency function names
 */
function getDirectDependencies(functionName: WgslFunctionName): WgslFunctionName[] {
  const functionCode = wgslFns[functionName];
  if (!functionCode) {
    return [];
  }
  
  return parseDependencies(functionCode);
}

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
  const deps = getDirectDependencies(functionName);
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
