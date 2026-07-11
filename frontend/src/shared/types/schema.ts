/** A single table column parsed from a CREATE TABLE statement. */
export interface Column {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
  isPrimary: boolean;
  isUnique: boolean;
  references: { table: string; column: string } | null;
}

/** A parsed database table with its columns, keys, and indexes. */
export interface Table {
  name: string;
  columns: Column[];
  primaryKeys: string[];
  foreignKeys: { column: string; references: { table: string; column: string } }[];
  indexes: { columns: string[]; type: string }[];
}

/** A foreign-key relationship between two tables. */
export interface Relationship {
  from: string;
  fromColumn: string;
  to: string;
  toColumn: string;
  type: string;
}

/** A detected schema problem with severity level and optional recommendation. */
export interface Issue {
  severity: 'high' | 'medium' | 'low';
  type: string;
  table?: string;
  column?: string;
  message: string;
  recommendation?: string;
}

/** A suggested schema fix with generated SQL and expected benefit. */
export interface Recommendation {
  type: string;
  table: string;
  column: string;
  message: string;
  sql: string;
  benefit: string;
}

/** A detected normalization violation with its form (1NF/2NF/3NF) and explanation. */
export interface NormalizationViolation {
  table: string;
  column?: string;
  normalForm: string;
  violation: string;
  explanation: string;
  suggestion: string;
  columns?: string[];
}

/** Full normalization report — overall score plus per-table violations. */
export interface NormalizationAnalysis {
  normalizationScore: number;
  violations: NormalizationViolation[];
  suggestions: { table: string; normalForm: string; message: string; suggestion: string }[];
}

/** A table node in the ER diagram, positioned with its columns and keys. */
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

/** A relationship edge between two ER diagram nodes. */
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

/** The full analysis response from the backend — health score, issues, recommendations, ER diagram, and optional AI insights. */
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

/** A pre-built schema example shown on the Analyze page for quick testing. */
export interface ExampleSchema {
  id: string;
  name: string;
  description: string;
  sql: string;
}
