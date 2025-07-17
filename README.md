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

### Use the default export

```javascript
import wgslFns from 'wgsl-fns';

console.log(wgslFns.elasticWave);
console.log(Object.keys(wgslFns)); // List all available functions
```

## API Reference

### `getFns(functionNames: string[]): string`

Returns a combined string containing all requested WGSL functions.

**Parameters:**
- `functionNames`: Array of function names to include

**Returns:**
- Combined string with all functions separated by double newlines

**Example:**
```javascript
import { getFns } from 'wgsl-fns';

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

${getFns(['elasticWave', 'smoothStep'])}
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
