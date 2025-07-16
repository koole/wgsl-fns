<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# wgsl-fns Project Instructions

This is an npm package that exports WGSL (WebGPU Shading Language) functions as JavaScript strings.

## Project Structure
- `src/functions.ts` - Contains all WGSL function definitions as template literals
- `src/index.ts` - Main entry point with `getFns()` function and exports
- Uses Rollup.js for bundling with TypeScript support
- Outputs ES modules, CommonJS, and UMD builds

## Key Features
- Individual WGSL functions exported as backtick-quoted strings
- `getFns(functionNames)` function to combine multiple functions
- Default export `wgslFns` object with all functions
- TypeScript support with full type definitions

## Development Guidelines
- All WGSL functions should be valid WGSL syntax
- Functions should be well-documented with comments
- Use proper WGSL types (f32, vec2<f32>, etc.)
- Follow consistent naming conventions
- Test functions work in actual WGSL shaders when possible

## Build Process
- Run `npm run build` to build all output formats
- Run `npm run dev` for watch mode during development
- Built files go to `dist/` directory
