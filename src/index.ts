import { wgslFns, WgslFunctionName } from './functions';
import { resolveAllDependencies } from './dependencies';

/**
 * Get a combined string of multiple WGSL functions with their dependencies automatically included
 * @param functionNames Array of function names to include
 * @returns Combined string containing all requested functions and their dependencies in proper order
 */
export function getFns(functionNames: WgslFunctionName[]): string {
  // Resolve all dependencies first
  const dependencies = resolveAllDependencies(functionNames);
  
  // Combine dependencies with requested functions, avoiding duplicates
  const allFunctionNames = [...dependencies, ...functionNames.filter(name => !dependencies.includes(name))];

  // Deduplicate function code blocks
  const seen = new Set<string>();
  const functions: string[] = [];
  for (const name of allFunctionNames) {
    const fn = wgslFns[name];
    if (!fn) {
      throw new Error(`WGSL function "${name}" not found`);
    }
    if (!seen.has(fn)) {
      seen.add(fn);
      functions.push(fn);
    }
  }
  return functions.join('\n\n');
}

// Export individual functions and types
export * from './functions';

// Explicit export of commonly used types for better discoverability
export type { WgslFunctionName } from './functions';

// Default export of all functions object
export default wgslFns;
