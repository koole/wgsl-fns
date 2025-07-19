# wgsl-fns

A collection of WGSL (WebGPU Shading Language) functions as JavaScript strings for building WebGPU shaders. Includes mathematical utilities (`elasticWave`, `smoothStep`), noise generation (`noise2D`, `fbm`), signed distance fields (`sdfCircle`, `sdfBox`), and color manipulation functions (`palette`, `hslToRgb`).

## Available Functions

For a complete list of all available functions with detailed documentation, parameters, and examples, see **[the documentation website](https://dekoolecentrale.nl/wgsl-fns)**.

## Installation

```bash
npm install wgsl-fns
```

## Usage

### Import individual functions

```javascript
import { elasticWave, smoothStep, noise2D } from 'wgsl-fns';

console.log(elasticWave);
// Output: fn elasticWave(x: f32, amplitude: f32, frequency: f32, decay: f32, phase: f32) -> f32 { ... }
```

### Get multiple functions as a single string

```javascript
import { getFns } from 'wgsl-fns';

const shaderCode = getFns(['elasticWave', 'smoothStep', 'noise2D']);
console.log(shaderCode);
// Output: Combined string with all three functions
```

### Automatic Dependency Resolution

Some functions depend on other functions (e.g., `fbm` depends on `noise2D` and `hash22`). The `getFns()` function automatically includes all required dependencies:

```javascript
import { getFns } from 'wgsl-fns';

// This automatically includes noise2D and hash22 dependencies
const shaderCode = getFns(['fbm']);
console.log(shaderCode);
// Output: Contains hash22, noise2D, and fbm functions in correct order
```

### TypeScript Support

The package includes full TypeScript support with type definitions. Import the `WgslFunctionName` type for type-safe function selection:

```typescript
import type { WgslFunctionName } from 'wgsl-fns';
import { getFns } from 'wgsl-fns';

// Type-safe function selection
const mathFunctions: WgslFunctionName[] = ['elasticWave', 'smoothStep', 'rotate2D'];
const shaderCode = getFns(mathFunctions);

// TypeScript will provide autocomplete and catch typos
const invalidFunction: WgslFunctionName[] = ['typoFunction']; // ❌ TypeScript error
```

### Use the default export

```javascript
import wgslFns from 'wgsl-fns';

console.log(wgslFns.elasticWave);
console.log(Object.keys(wgslFns)); // List all available functions
```

## API Reference

### `getFns(functionNames: WgslFunctionName[]): string`

Returns a combined string containing all requested WGSL functions.

**Parameters:**
- `functionNames`: Array of function names to include (TypeScript users get autocomplete and type safety)

**Returns:**
- Combined string with all functions separated by double newlines

### Exported Types

#### `WgslFunctionName`

A union type of all available function names for type-safe function selection:

```typescript
import type { WgslFunctionName } from 'wgsl-fns';

// Valid function names include:
// 'elasticWave', 'smoothStep', 'noise2D', 'fbm', 'sdfCircle', 'sdfBox', 
// 'palette', 'hslToRgb', 'rotate2D', 'rotate3D', 'clamp01', 'remap', etc.
```

**Example:**
```typescript
import { getFns } from 'wgsl-fns';
import type { WgslFunctionName } from 'wgsl-fns';

// Type-safe function selection
const requiredFunctions: WgslFunctionName[] = ['elasticWave', 'smoothStep'];

const shader = `
@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4<f32> {
    // Your vertex shader code here
    return vec4<f32>(0.0);
}

@fragment  
fn fs_main() -> @location(0) vec4<f32> {
    // Your fragment shader code here
    let wave = elasticWave(1.0, 0.5, 2.0, 0.1, 0.0);
    return vec4<f32>(wave, wave, wave, 1.0);
}

${getFns(requiredFunctions)}
`;
```

## Development

```bash
# Install dependencies
npm install

# Generate documentation
npm run docs

# Build the package
npm run build

# Watch for changes during development
npm run dev

# Run tests
npm test

# Run tests with build (CI command)
npm run test:ci
```

Documentation is automatically generated from JSDoc comments in the source files. See [the website](https://dekoolecentrale.nl/wgsl-fns) for the complete auto-generated documentation.

## Contributing

### Adding New Functions

To add a new WGSL function to the library:

1. **Create the function** in the appropriate category file (e.g., `src/math.ts`, `src/noise.ts`)
2. **Add JSDoc documentation** with `@wgsl` tag, parameters, and return type
3. **Declare dependencies** using magic comments if the function calls other WGSL functions:

```typescript
/**
 * @wgsl
 * @name myFunction
 * @description What the function does
 * @param {f32} x Input parameter
 * @returns {f32} Output value
 * @requires dependency1 dependency2
 */
export const myFunction = `//! requires dependency1 dependency2
fn myFunction_helper(x: f32) -> f32 {
  // Helper function prefixed with main function name
  return x * 2.0;
}

fn myFunction(x: f32) -> f32 {
  return dependency1(x) + myFunction_helper(dependency2(x));
}`;
```

4. **Export from category file** and add to `src/functions.ts` registry
5. **Run tests** to ensure compilation: `npm test`

**Important**: If your function uses helper functions that are only used within that function, prefix them with the main function name (e.g., `myFunction_helper`) to prevent naming collisions with other functions in the library.

The build system automatically generates documentation and type definitions.

## Testing

The package includes comprehensive tests for:
- Individual function exports
- `getFns()` functionality and error handling
- WGSL syntax validation
- Package compatibility (CommonJS, ES modules, TypeScript)

Tests run automatically on pull requests via GitHub Actions.

## Release Flow

This project uses automated deployment triggered by GitHub releases:

### Creating a Release

```bash
# Update version in package.json and create git tag
npm version 1.0.0

# Push the version commit and tag
git push origin main --follow-tags

# Publish the package to npm
npm publish
```

## License

MIT
