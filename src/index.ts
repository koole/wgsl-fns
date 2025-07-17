import { wgslFns, WgslFunctionName } from './functions';

/**
 * Get a combined string of multiple WGSL functions
 * @param functionNames Array of function names to include
 * @returns Combined string containing all requested functions
 */
export function getFns(functionNames: WgslFunctionName[]): string {
  const functions = functionNames.map(name => {
    const fn = wgslFns[name];
    if (!fn) {
      throw new Error(`WGSL function "${name}" not found`);
    }
    return fn;
  });
  
  return functions.join('\n\n');
}

// Export individual functions and types
export * from './functions';

// Explicit export of commonly used types for better discoverability
export type { WgslFunctionName } from './functions';

// Default export of all functions object
export default wgslFns;
