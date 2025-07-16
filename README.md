# wgsl-fns

A collection of WGSL (WebGPU Shading Language) functions as JavaScript strings for building WebGPU shaders.

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

## Available Functions

### Math & Utility
- `elasticWave` - Elastic wave function with decay
- `smoothStep` - Smooth step interpolation
- `rotate2D` - 2D rotation transformation

### Noise & Procedural
- `noise2D` - 2D Perlin-style noise
- `hash22` - 2D to 2D hash function
- `fbm` - Fractional Brownian Motion

### Signed Distance Functions (SDF)
- `sdfCircle` - Circle SDF
- `sdfBox` - Box SDF
- `sdfUnion` - Union of two SDFs
- `sdfIntersection` - Intersection of two SDFs
- `sdfSubtraction` - Subtraction of two SDFs

### Color & Graphics
- `palette` - Color palette generation
- `linearToSrgb` - Linear to sRGB conversion
- `srgbToLinear` - sRGB to linear conversion
- `hue2rgb` - HSL to RGB helper
- `hslToRgb` - HSL to RGB conversion

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
# Build the package
npm run build

# Watch for changes during development
npm run dev
```

## License

MIT
