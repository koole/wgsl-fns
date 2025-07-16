#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { parse } = require('comment-parser');

/**
 * Documentation generator for WGSL functions
 * Parses JSDoc-style comments with custom @wgsl tags
 */

const srcDir = path.join(__dirname, '../src');
const outputFile = path.join(__dirname, '../FUNCTIONS.md');

// Categories and their corresponding files
const categories = {
  'Math & Utility': 'math.ts',
  'Noise & Procedural': 'noise.ts', 
  'Signed Distance Fields': 'sdf.ts',
  'Color & Graphics': 'color.ts'
};

function parseFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const comments = parse(content);
  
  const functions = [];
  
  comments.forEach(comment => {
    // Check if this is a WGSL function comment
    const wgslTag = comment.tags.find(tag => tag.tag === 'wgsl');
    if (!wgslTag) return;
    
    const nameTag = comment.tags.find(tag => tag.tag === 'name');
    const descTag = comment.tags.find(tag => tag.tag === 'description');
    const paramTags = comment.tags.filter(tag => tag.tag === 'param');
    const returnTag = comment.tags.find(tag => tag.tag === 'returns');
    
    if (nameTag) {
      functions.push({
        name: nameTag.name,
        description: descTag ? descTag.description : '',
        params: paramTags.map(param => ({
          name: param.name,
          type: param.type,
          description: param.description
        })),
        returns: returnTag ? {
          type: returnTag.type,
          description: returnTag.description
        } : null
      });
    }
  });
  
  return functions;
}

function generateMarkdown() {
  let markdown = '# WGSL Functions Documentation\n\n';
  markdown += 'Auto-generated documentation for all WGSL functions in this package.\n\n';
  markdown += '## Table of Contents\n\n';
  
  // Generate table of contents
  Object.keys(categories).forEach(category => {
    markdown += `- [${category}](#${category.toLowerCase().replace(/[^a-z0-9]/g, '-')})\n`;
  });
  markdown += '\n';
  
  // Generate documentation for each category
  Object.entries(categories).forEach(([category, filename]) => {
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
    
    markdown += `## ${category}\n\n`;
    
    functions.forEach(func => {
      markdown += `### \`${func.name}\`\n\n`;
      markdown += `${func.description}\n\n`;
      
      if (func.params.length > 0) {
        markdown += '**Parameters:**\n\n';
        func.params.forEach(param => {
          markdown += `- \`${param.name}\` (\`${param.type}\`) - ${param.description}\n`;
        });
        markdown += '\n';
      }
      
      if (func.returns) {
        markdown += `**Returns:** \`${func.returns.type}\` - ${func.returns.description}\n\n`;
      }
      
      markdown += '---\n\n';
    });
  });
  
  return markdown;
}

function main() {
  try {
    console.log('🔍 Scanning WGSL functions...');
    const documentation = generateMarkdown();
    
    fs.writeFileSync(outputFile, documentation);
    console.log(`✅ Documentation generated: ${outputFile}`);
    
    // Count total functions
    const totalFunctions = Object.values(categories).reduce((total, filename) => {
      const filePath = path.join(srcDir, filename);
      if (fs.existsSync(filePath)) {
        const functions = parseFile(filePath);
        return total + functions.length;
      }
      return total;
    }, 0);
    
    console.log(`📊 Total functions documented: ${totalFunctions}`);
    
  } catch (error) {
    console.error('❌ Error generating documentation:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { parseFile, generateMarkdown };
