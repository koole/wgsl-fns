#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { parse } = require('comment-parser');
const ts = require('typescript');

/**
 * Documentation generator for WGSL functions
 * Parses JSDoc-style comments with custom @wgsl tags and extracts WGSL code from exports
 */

const srcDir = path.join(__dirname, '../src');
const outputFile = path.join(__dirname, '../docs/wgsl-functions.json');

// Categories and their corresponding files
const categories = {
  'Math & Utility': 'math.ts',
  'Noise & Procedural': 'noise.ts', 
  'Signed Distance Fields': 'sdf.ts',
  'Color & Graphics': 'color.ts',
  'Animation & Easing': 'animation.ts',
  'Wave Functions': 'waves.ts',
  'SDF Operations': 'sdf-operations.ts',
  'SDF Transforms': 'sdf-transforms.ts',
  'SDF Modifiers': 'sdf-modifiers.ts',
  'SDF Utilities': 'sdf-utils.ts'
};

function parseFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const comments = parse(content);
  
  // Parse TypeScript AST to extract exported constants
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );
  
  const exports = {};
  
  // Walk the AST to find exported constants
  function visit(node) {
    if (ts.isVariableStatement(node) && 
        node.modifiers && 
        node.modifiers.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword)) {
      
      node.declarationList.declarations.forEach(declaration => {
        if (ts.isIdentifier(declaration.name) && 
            declaration.initializer && 
            ts.isTemplateExpression(declaration.initializer) || 
            ts.isNoSubstitutionTemplateLiteral(declaration.initializer)) {
          
          const name = declaration.name.text;
          const value = declaration.initializer.text || 
                       (declaration.initializer.head ? declaration.initializer.head.text : '');
          exports[name] = value;
        }
      });
    }
    
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  
  const functions = [];
  
  comments.forEach(comment => {
    // Check if this is a WGSL function comment
    const wgslTag = comment.tags.find(tag => tag.tag === 'wgsl');
    if (!wgslTag) return;
    
    const nameTag = comment.tags.find(tag => tag.tag === 'name');
    const descTag = comment.tags.find(tag => tag.tag === 'description');
    const paramTags = comment.tags.filter(tag => tag.tag === 'param');
    const returnTag = comment.tags.find(tag => tag.tag === 'returns');
    const requiresTags = comment.tags.filter(tag => tag.tag === 'requires');
    
    if (nameTag) {
      const functionName = nameTag.name;
      const wgslCode = exports[functionName] || '';
      
      // Extract dependencies from magic comments in WGSL code
      const magicCommentMatch = wgslCode.match(/^\/\/!\s*requires\s+(.+)$/m);
      const dependencies = magicCommentMatch 
        ? magicCommentMatch[1].split(/\s+/).filter(dep => dep.length > 0)
        : [];
      
      functions.push({
        name: functionName,
        description: descTag ? descTag.description : '',
        params: paramTags.map(param => ({
          name: param.name,
          type: param.type,
          description: param.description
        })),
        returns: returnTag ? {
          type: returnTag.type,
          description: returnTag.description
        } : null,
        dependencies: dependencies,
        wgslCode: wgslCode
      });
    }
  });
  
  return functions;
}

function generateJson() {
  const documentation = {
    meta: {
      generatedAt: new Date().toISOString(),
      totalFunctions: 0,
      totalCategories: Object.keys(categories).length
    },
    categories: []
  };
  
  let totalFunctions = 0;
  
  // Generate documentation for each category
  Object.entries(categories).forEach(([categoryName, filename]) => {
    const filePath = path.join(srcDir, filename);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      return;
    }
    
    const functions = parseFile(filePath);
    
    if (functions.length === 0) {
      console.warn(`No WGSL functions found in: ${filename}`);
      return;
    }
    
    totalFunctions += functions.length;
    
    documentation.categories.push({
      name: categoryName,
      slug: categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description: getCategoryDescription(categoryName),
      functions: functions
    });
  });
  
  documentation.meta.totalFunctions = totalFunctions;
  
  return documentation;
}

function getCategoryDescription(categoryName) {
  const descriptions = {
    'Math & Utility': 'Mathematical functions and general utilities for shader calculations.',
    'Noise & Procedural': 'Noise generation and procedural pattern functions for textures and effects.',
    'Signed Distance Fields': 'SDF functions for procedural geometry and ray marching techniques.',
    'Color & Graphics': 'Color space conversion and palette generation functions.'
  };
  return descriptions[categoryName] || '';
}

function main() {
  try {
    console.log('🔍 Scanning WGSL functions...');
    const documentation = generateJson();
    
    fs.writeFileSync(outputFile, JSON.stringify(documentation, null, 2));
    console.log(`✅ Documentation generated: ${outputFile}`);
    console.log(`📊 Total functions documented: ${documentation.meta.totalFunctions}`);
    console.log(`� Total categories: ${documentation.meta.totalCategories}`);
    
  } catch (error) {
    console.error('❌ Error generating documentation:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { parseFile, generateJson };
