# WGSL Functions Documentation

Auto-generated documentation for all WGSL functions in this package.

## Table of Contents

- [Math & Utility](#math---utility)
- [Noise & Procedural](#noise---procedural)
- [Signed Distance Fields](#signed-distance-fields)
- [Color & Graphics](#color---graphics)

## Math & Utility

### `elasticWave`

an elastic wave with exponential decay and sinusoidal oscillation.

**Parameters:**

- `x` (`f32`) - Input position along the wave.
- `amplitude` (`f32`) - Wave amplitude multiplier.
- `frequency` (`f32`) - Wave frequency.
- `decay` (`f32`) - Exponential decay factor.
- `phase` (`f32`) - Phase offset for the wave.

**Returns:** `f32` - wave value.

**WGSL Code:**

```wgsl
fn elasticWave(x: f32, amplitude: f32, frequency: f32, decay: f32, phase: f32) -> f32 {
  let d = max(0.001, decay);
  let decayTerm = exp(-d * x);
  let oscTerm = sin(frequency * x * 6.28318 + phase);
  return amplitude * decayTerm * oscTerm;
}
```

---

### `smoothStep`

interpolation between two values with smooth acceleration and deceleration.

**Parameters:**

- `edge0` (`f32`) - Lower edge of interpolation range.
- `edge1` (`f32`) - Upper edge of interpolation range.
- `x` (`f32`) - Input value to interpolate.

**Returns:** `f32` - interpolated value between 0 and 1.

**WGSL Code:**

```wgsl
fn smoothStep(edge0: f32, edge1: f32, x: f32) -> f32 {
  let t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}
```

---

### `rotate2D`

a 2D vector by a given angle.

**Parameters:**

- `v` (`vec2<f32>`) - Input 2D vector to rotate.
- `angle` (`f32`) - Rotation angle in radians.

**Returns:** `vec2<f32>` - 2D vector.

**WGSL Code:**

```wgsl
fn rotate2D(v: vec2<f32>, angle: f32) -> vec2<f32> {
  let c = cos(angle);
  let s = sin(angle);
  return vec2(v.x * c - v.y * s, v.x * s + v.y * c);
}
```

---

## Noise & Procedural

### `hash22`

a 2D hash from a 2D input vector for procedural generation.

**Parameters:**

- `p` (`vec2<f32>`) - Input 2D vector to hash.

**Returns:** `vec2<f32>` - result as 2D vector.

**WGSL Code:**

```wgsl
fn hash22(p: vec2<f32>) -> vec2<f32> {
  var p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}
```

---

### `noise2D`

2D Perlin-style noise for procedural textures and patterns.

**Parameters:**

- `p` (`vec2<f32>`) - Input 2D coordinate.

**Returns:** `f32` - value typically in range [-1, 1].

**WGSL Code:**

```wgsl
fn noise2D(p: vec2<f32>) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(dot(hash22(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
        dot(hash22(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(hash22(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
        dot(hash22(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
}
```

---

### `fbm`

Brownian Motion - combines multiple octaves of noise for complex patterns.

**Parameters:**

- `p` (`vec2<f32>`) - Input 2D coordinate.
- `octaves` (`i32`) - Number of noise octaves to combine.

**Returns:** `f32` - noise value.

**WGSL Code:**

```wgsl
fn fbm(p: vec2<f32>, octaves: i32) -> f32 {
  var value = 0.0;
  var amplitude = 0.5;
  var frequency = 1.0;
  for (var i = 0; i < octaves; i++) {
    value += amplitude * noise2D(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return value;
}
```

---

## Signed Distance Fields

### `sdfCircle`

distance function for a circle.

**Parameters:**

- `p` (`vec2<f32>`) - Point to evaluate distance from.
- `r` (`f32`) - Circle radius.

**Returns:** `f32` - distance to circle surface (negative inside, positive outside).

**WGSL Code:**

```wgsl
fn sdfCircle(p: vec2<f32>, r: f32) -> f32 {
  return length(p) - r;
}
```

---

### `sdfBox`

distance function for a rectangular box.

**Parameters:**

- `p` (`vec2<f32>`) - Point to evaluate distance from.
- `b` (`vec2<f32>`) - Box half-dimensions (width/2, height/2).

**Returns:** `f32` - distance to box surface (negative inside, positive outside).

**WGSL Code:**

```wgsl
fn sdfBox(p: vec2<f32>, b: vec2<f32>) -> f32 {
  let d = abs(p) - b;
  return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0);
}
```

---

### `sdfUnion`

two SDFs using union operation (closest surface).

**Parameters:**

- `d1` (`f32`) - Distance from first shape.
- `d2` (`f32`) - Distance from second shape.

**Returns:** `f32` - distance representing union of both shapes.

**WGSL Code:**

```wgsl
fn sdfUnion(d1: f32, d2: f32) -> f32 {
  return min(d1, d2);
}
```

---

### `sdfIntersection`

two SDFs using intersection operation (overlapping area only).

**Parameters:**

- `d1` (`f32`) - Distance from first shape.
- `d2` (`f32`) - Distance from second shape.

**Returns:** `f32` - distance representing intersection of both shapes.

**WGSL Code:**

```wgsl
fn sdfIntersection(d1: f32, d2: f32) -> f32 {
  return max(d1, d2);
}
```

---

### `sdfSubtraction`

two SDFs using subtraction operation (first shape minus second).

**Parameters:**

- `d1` (`f32`) - Distance from shape to subtract from.
- `d2` (`f32`) - Distance from shape to subtract.

**Returns:** `f32` - distance representing first shape with second subtracted.

**WGSL Code:**

```wgsl
fn sdfSubtraction(d1: f32, d2: f32) -> f32 {
  return max(-d1, d2);
}
```

---

## Color & Graphics

### `palette`

colors using cosine-based palette function for smooth color gradients.

**Parameters:**

- `t` (`f32`) - Input parameter (typically 0-1) for palette lookup.
- `a` (`vec3<f32>`) - Offset values for RGB channels.
- `b` (`vec3<f32>`) - Amplitude values for RGB channels.
- `c` (`vec3<f32>`) - Frequency values for RGB channels.
- `d` (`vec3<f32>`) - Phase values for RGB channels.

**Returns:** `vec3<f32>` - RGB color.

**WGSL Code:**

```wgsl
fn palette(t: f32, a: vec3<f32>, b: vec3<f32>, c: vec3<f32>, d: vec3<f32>) -> vec3<f32> {
  return a + b * cos(6.28318 * (c * t + d));
}
```

---

### `linearToSrgb`

linear RGB color values to sRGB color space.

**Parameters:**

- `color` (`vec3<f32>`) - Linear RGB color values.

**Returns:** `vec3<f32>` - color values.

**WGSL Code:**

```wgsl
fn linearToSrgb(color: vec3<f32>) -> vec3<f32> {
  return pow(color, vec3(1.0 / 2.2));
}
```

---

### `srgbToLinear`

sRGB color values to linear RGB color space.

**Parameters:**

- `color` (`vec3<f32>`) - sRGB color values.

**Returns:** `vec3<f32>` - RGB color values.

**WGSL Code:**

```wgsl
fn srgbToLinear(color: vec3<f32>) -> vec3<f32> {
  return pow(color, vec3(2.2));
}
```

---

### `hue2rgb`

function for HSL to RGB conversion - converts hue component to RGB.

**Parameters:**

- `p` (`f32`) - First HSL conversion parameter.
- `q` (`f32`) - Second HSL conversion parameter.
- `t` (`f32`) - Hue value (adjusted).

**Returns:** `f32` - component value.

**WGSL Code:**

```wgsl
fn hue2rgb(p: f32, q: f32, t: f32) -> f32 {
  var t_adj = t;
  if (t_adj < 0.0) { t_adj += 1.0; }
  if (t_adj > 1.0) { t_adj -= 1.0; }
  if (t_adj < 1.0 / 6.0) { return p + (q - p) * 6.0 * t_adj; }
  if (t_adj < 1.0 / 2.0) { return q; }
  if (t_adj < 2.0 / 3.0) { return p + (q - p) * (2.0 / 3.0 - t_adj) * 6.0; }
  return p;
}
```

---

### `hslToRgb`

HSL (Hue, Saturation, Lightness) color to RGB.

**Parameters:**

- `hsl` (`vec3<f32>`) - HSL color values (hue: 0-1, saturation: 0-1, lightness: 0-1).

**Returns:** `vec3<f32>` - color values.

**WGSL Code:**

```wgsl
fn hslToRgb(hsl: vec3<f32>) -> vec3<f32> {
  let h = hsl.x;
  let s = hsl.y;
  let l = hsl.z;
  
  if (s == 0.0) {
    return vec3(l); // achromatic
  }
  
  let q = select(l * (1.0 + s), l + s - l * s, l < 0.5);
  let p = 2.0 * l - q;
  
  return vec3(
    hue2rgb(p, q, h + 1.0 / 3.0),
    hue2rgb(p, q, h),
    hue2rgb(p, q, h - 1.0 / 3.0)
  );
}
```

---

