export interface Column {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
  isPrimary: boolean;
  isUnique: boolean;
  references: { table: string; column: string } | null;
}

export interface Table {
  name: string;
  columns: Column[];
  primaryKeys: string[];
  foreignKeys: { column: string; references: { table: string; column: string } }[];
  indexes: { columns: string[]; type: string }[];
}

export interface Relationship {
  from: string;
  fromColumn: string;
  to: string;
  toColumn: string;
  type: string;
}

export interface Issue {
  severity: 'high' | 'medium' | 'low';
  type: string;
  table?: string;
  column?: string;
  message: string;
  recommendation?: string;
}

export interface Recommendation {
  type: string;
  table: string;
  column: string;
  message: string;
  sql: string;
  benefit: string;
}

export interface NormalizationViolation {
  table: string;
  column?: string;
  normalForm: string;
  violation: string;
  explanation: string;
  suggestion: string;
  columns?: string[];
}

export interface NormalizationAnalysis {
  normalizationScore: number;
  violations: NormalizationViolation[];
  suggestions: { table: string; normalForm: string; message: string; suggestion: string }[];
}

export interface ERNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    columns: Column[];
    primaryKeys: string[];
    foreignKeys: Table['foreignKeys'];
  };
}

export interface EREdge {
  id: string;
  source: string;
  target: string;
  type: string;
  animated: boolean;
  label: string;
  markerEnd: { type: string };
  style: Record<string, string | number>;
}

export interface AnalysisResult {
  meta: {
    tablesFound: number;
    relationshipsFound: number;
    dialect: string;
    analyzedAt: string;
    aiEnhanced: boolean;
    aiError?: string | null;
  };
  healthScore: number;
  summary: {
    status: string;
    overview: string;
    topIssues: string[];
    normalizationScore: number;
    architectureNotes: string[];
    scalabilityNotes: string | null;
    bestPractices: string[];
  };
  issues: Issue[];
  recommendations: Recommendation[];
  normalization: NormalizationAnalysis;
  erDiagram: { nodes: ERNode[]; edges: EREdge[] };
  optimizedSQL: string;
  tables: Table[];
  relationships: Relationship[];
  aiInsights: {
    summary: string;
    additionalIssues: Issue[];
    architectureRecommendations: string[];
    scalabilityNotes: string;
    bestPractices: string[];
  } | null;
}

export interface ExampleSchema {
  id: string;
  name: string;
  description: string;
  sql: string;
}
