// ─── Asset ────────────────────────────────
export interface AssetFile {
  name: string;
  content: string;
  md5: string;
  contentType: string;
}

export interface UploadPayload {
  file: AssetFile;
  tenant: string;
}

export interface UploadResponse {
  status: 'success' | 'skipped';
  message: string;
}

export interface AssetRecord {
  id: string;
  md5_hash: string;
  filename: string;
  content_type: string;
  source_type: 'INTERNAL' | 'EXTERNAL';
  tenant_id: string;
  created_at: string;
}

// ─── GraphRAG ──────────────────────────────
export interface QueryPayload {
  entityName: string;
  tenant: string;
}

export interface StrategyReport {
  marketAssessment: unknown;
  internalAssets: unknown;
  strategy: unknown;
  feasibilityScore: number | null;
}

export interface QueryResponse {
  status: string;
  entityName: string;
  report: StrategyReport;
}

// ─── Knowledge Graph ───────────────────────
export interface Triple {
  entity_a: string;
  entity_b: string;
  relationship: string;
  source_text?: string;
  source_type?: 'INTERNAL' | 'EXTERNAL';
}

export interface GraphNode {
  name: string;
  category: number;
  size: number;
}

export interface GraphLink {
  source: string;
  target: string;
  label: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  stats: { internalCount: number; externalCount: number };
}
