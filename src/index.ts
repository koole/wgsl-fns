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

// Export individual functions
export * from './functions';

// Default export of all functions object
export default wgslFns;
