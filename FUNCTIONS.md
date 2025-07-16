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

---

### `smoothStep`

interpolation between two values with smooth acceleration and deceleration.

**Parameters:**

- `edge0` (`f32`) - Lower edge of interpolation range.
- `edge1` (`f32`) - Upper edge of interpolation range.
- `x` (`f32`) - Input value to interpolate.

**Returns:** `f32` - interpolated value between 0 and 1.

---

### `rotate2D`

a 2D vector by a given angle.

**Parameters:**

- `v` (`vec2<f32>`) - Input 2D vector to rotate.
- `angle` (`f32`) - Rotation angle in radians.

**Returns:** `vec2<f32>` - 2D vector.

---

## Noise & Procedural

### `hash22`

a 2D hash from a 2D input vector for procedural generation.

**Parameters:**

- `p` (`vec2<f32>`) - Input 2D vector to hash.

**Returns:** `vec2<f32>` - result as 2D vector.

---

### `noise2D`

2D Perlin-style noise for procedural textures and patterns.

**Parameters:**

- `p` (`vec2<f32>`) - Input 2D coordinate.

**Returns:** `f32` - value typically in range [-1, 1].

---

### `fbm`

Brownian Motion - combines multiple octaves of noise for complex patterns.

**Parameters:**

- `p` (`vec2<f32>`) - Input 2D coordinate.
- `octaves` (`i32`) - Number of noise octaves to combine.

**Returns:** `f32` - noise value.

---

## Signed Distance Fields

### `sdfCircle`

distance function for a circle.

**Parameters:**

- `p` (`vec2<f32>`) - Point to evaluate distance from.
- `r` (`f32`) - Circle radius.

**Returns:** `f32` - distance to circle surface (negative inside, positive outside).

---

### `sdfBox`

distance function for a rectangular box.

**Parameters:**

- `p` (`vec2<f32>`) - Point to evaluate distance from.
- `b` (`vec2<f32>`) - Box half-dimensions (width/2, height/2).

**Returns:** `f32` - distance to box surface (negative inside, positive outside).

---

### `sdfUnion`

two SDFs using union operation (closest surface).

**Parameters:**

- `d1` (`f32`) - Distance from first shape.
- `d2` (`f32`) - Distance from second shape.

**Returns:** `f32` - distance representing union of both shapes.

---

### `sdfIntersection`

two SDFs using intersection operation (overlapping area only).

**Parameters:**

- `d1` (`f32`) - Distance from first shape.
- `d2` (`f32`) - Distance from second shape.

**Returns:** `f32` - distance representing intersection of both shapes.

---

### `sdfSubtraction`

two SDFs using subtraction operation (first shape minus second).

**Parameters:**

- `d1` (`f32`) - Distance from shape to subtract from.
- `d2` (`f32`) - Distance from shape to subtract.

**Returns:** `f32` - distance representing first shape with second subtracted.

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

---

### `linearToSrgb`

linear RGB color values to sRGB color space.

**Parameters:**

- `color` (`vec3<f32>`) - Linear RGB color values.

**Returns:** `vec3<f32>` - color values.

---

### `srgbToLinear`

sRGB color values to linear RGB color space.

**Parameters:**

- `color` (`vec3<f32>`) - sRGB color values.

**Returns:** `vec3<f32>` - RGB color values.

---

### `hue2rgb`

function for HSL to RGB conversion - converts hue component to RGB.

**Parameters:**

- `p` (`f32`) - First HSL conversion parameter.
- `q` (`f32`) - Second HSL conversion parameter.
- `t` (`f32`) - Hue value (adjusted).

**Returns:** `f32` - component value.

---

### `hslToRgb`

HSL (Hue, Saturation, Lightness) color to RGB.

**Parameters:**

- `hsl` (`vec3<f32>`) - HSL color values (hue: 0-1, saturation: 0-1, lightness: 0-1).

**Returns:** `vec3<f32>` - color values.

---

