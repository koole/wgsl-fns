// TypeScript types for WGSL Functions Documentation JSON

export interface WgslParameter {
  name: string;
  type: string;
  description: string;
}

export interface WgslReturnType {
  type: string;
  description: string;
}

export interface WgslFunction {
  name: string;
  description: string;
  params: WgslParameter[];
  returns: WgslReturnType | null;
  wgslCode: string;
}

export interface WgslCategory {
  name: string;
  slug: string;
  description: string;
  functions: WgslFunction[];
}

export interface WgslDocumentationMeta {
  generatedAt: string; // ISO date string
  totalFunctions: number;
  totalCategories: number;
}

export interface WgslDocumentation {
  meta: WgslDocumentationMeta;
  categories: WgslCategory[];
}

// Utility type for extracting function names
export type WgslFunctionName = WgslFunction['name'];

// Utility type for extracting category names
export type WgslCategoryName = WgslCategory['name'];
