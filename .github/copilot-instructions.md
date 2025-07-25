<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# wgsl-fns Project Instructions

This is an npm package that exports WGSL (WebGPU Shading Language) functions as JavaScript strings with automatic dependency resolution.

## Project Structure

### Core Files
- `src/index.ts` - Main entry point with `getFns()` function and exports
- `src/functions.ts` - Central registry of all WGSL functions and type definitions
- `src/dependencies.ts` - Function dependency mapping and resolution system

### Category Files (Organized by Function Type)
- `src/math.ts` - Mathematical utility functions (elasticWave, smoothStep, rotate2D, etc.)
- `src/noise.ts` - Noise and hash functions (noise2D, noise3D, hash22, hash31, fbm, etc.)
- `src/color.ts` - Color manipulation functions (hslToRgb, palette, linearToSrgb, etc.)
- `src/animation.ts` - Animation and easing functions (bezierCubic, easeIn, elasticOut, etc.)
- `src/waves.ts` - Wave generation functions (triangleWave, sawtoothWave, chirpWave, etc.)
- `src/sdf.ts` - Basic SDF (Signed Distance Field) shapes (sphere, box, torus, etc.)
- `src/sdf-operations.ts` - SDF boolean operations (union, subtract, intersect, smooth variants)
- `src/sdf-transforms.ts` - SDF spatial transformations (translate, rotate, scale, repetition)
- `src/sdf-modifiers.ts` - SDF deformation functions (twist, bend, taper, displace)
- `src/sdf-utils.ts` - SDF utility functions (toSolid, toStroke, smoothing variants)

### Build System
- `rollup.config.js` - Rollup configuration for ES modules, CommonJS, and UMD builds
- `tsconfig.json` - TypeScript configuration
- Uses Rollup.js for bundling with TypeScript support
- Outputs ES modules, CommonJS, and UMD builds to `dist/` directory

### Testing Infrastructure
- `test/index.test.js` - Main functionality and WebGPU compilation tests
- `test/compatibility.test.js` - Package compatibility tests (CommonJS, ES modules, TypeScript)
- `test/functions.test.js` - Individual function export tests
- Uses Node.js built-in test runner with WebGPU validation
- Comprehensive WGSL compilation testing for all 87+ functions

### Documentation & Metadata
- `scripts/generate-docs.js` - Automatic documentation generator
- `docs/wgsl-functions.json` - Generated function documentation
- `types/wgsl-docs.ts` - TypeScript definitions for documentation

## Key Features

### Automatic Dependency Resolution
- Functions declare direct dependencies using magic comments (`//! requires dep1 dep2`)
- `getFns(functionNames)` automatically includes all recursive dependencies by parsing these comments
- Smart dependency ordering prevents circular dependencies
- Dependencies are visible inline with function code for better developer experience
- Examples:
  - `getFns(['fbm'])` → includes `noise2D` + `hash22`
  - `getFns(['sdfDomainRepeat'])` → includes `warpNoise3D` + `noise3D` + `hash31`

### Function Organization
- **87+ WGSL functions** across **10 categories**
- Individual functions exported as backtick-quoted strings
- `getFns(functionNames)` function to combine multiple functions with dependencies
- Default export `wgslFns` object with all functions
- Full TypeScript support with auto-generated type definitions

### Testing & Validation
- **WebGPU compilation testing** validates all functions compile correctly
- **Dependency resolution testing** ensures all dependencies are properly included
- **Cross-platform compatibility** testing (CommonJS, ES modules, TypeScript)
- Tests automatically exit cleanly after WebGPU resource cleanup

## Development Guidelines

### Adding New Functions
1. **Create the function** in appropriate category file with JSDoc comments including `@wgsl` tag
2. **Export from category file** and add to `src/functions.ts` registry
3. **Add dependencies** using magic comments at the start of the function if it calls other WGSL functions
4. **Run tests** to ensure compilation and dependency resolution work correctly

### Function Format
```typescript
/**
 * @wgsl
 * @name functionName
 * @description Clear description of what the function does.
 * @param {type} paramName Parameter description.
 * @returns {type} Return value description.
 * @requires dependency1 dependency2 (if function has dependencies)
 */
export const functionName = `//! requires dependency1 dependency2
fn functionName_helperFunction(param: type) -> returnType {
  // Helper function prefixed with main function name
  return value;
}

fn functionName(param: type) -> returnType {
  // WGSL implementation using dependency1() and dependency2()
  return functionName_helperFunction(param);
}`;
```

### Dependency Management (Magic Comments)
- Declare **direct dependencies** using `//! requires` magic comments at the start of function code
- Add corresponding `@requires` JSDoc tags for documentation visibility
- Use space-separated dependency names: `//! requires dep1 dep2 dep3`
- Recursive dependencies are automatically resolved by parsing these comments
- Test dependency resolution with `getFns(['functionName'])`
- Dependencies are visible to users importing individual functions

### Helper Function Guidelines
- **Prefix helper functions** with the main function name to prevent naming collisions
- Use format `mainFunctionName_helperName` for all inlined helper functions
- Helper functions should only be used within their parent function
- This prevents conflicts when multiple functions use similar helper names
- Examples: `snoise2D_permute3`, `perlinNoise3_taylorInvSqrt4`, `fbm_lacunarity`

### WGSL Guidelines
- All functions should use valid WGSL syntax
- Use proper WGSL types (f32, vec2<f32>, vec3<f32>, etc.)
- Follow consistent naming conventions (camelCase for functions, snake_case for variables)
- Use `var` for mutable variables, `let` for immutable values
- Test functions work in actual WGSL shaders when possible

## Build Process
- `npm run docs` - Generate function documentation
- `npm run build` - Build all output formats (runs docs first)
- `npm run dev` - Watch mode for development
- `npm test` - Run comprehensive test suite with WebGPU validation
- Built files go to `dist/` directory with TypeScript definitions

## Architecture Notes
- **Modular design** allows easy addition of new function categories
- **Type-safe** with full TypeScript support and auto-generated definitions
- **Dependency-aware** system prevents missing function errors
- **Testing-first** approach ensures all functions compile correctly
- **Clean separation** between function definitions, dependencies, and utilities
