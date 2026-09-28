export interface Citation {
  citation_marker: string;
  doc_id: string;
  title: string;
  jurisdiction: string;
  section_number: string;
  page_no: number;
  bbox: number[];
  excerpt: string;
}

export interface PratinidhiDravya {
  alternative_name: string;
  alternative_sanskrit_name: string;
  justification: string;
  pharmacopoeia_reference: string;
}

export interface FlaggedBotanical {
  botanical_name: string;
  sanskrit_name: string;
  cites_appendix: string;
  wildlife_act_schedule: string;
  risk_level: 'RED' | 'AMBER' | 'GREEN';
  legal_status: string;
  pratinidhi_dravya?: PratinidhiDravya;
}

export interface CitesCheckResult {
  status: 'CLEAN' | 'WARNING' | 'BANNED';
  has_cites_violations: boolean;
  flagged_count: number;
  flagged_botanicals: FlaggedBotanical[];
}

export interface Sec3pResult {
  title: string;
  detected_botanicals: string[];
  sec_3p_risk_level: 'LOW' | 'MODERATE' | 'HIGH';
  sec_3p_risk_score: number;
  novelty_score: number;
  synergy_evaluation: string;
  is_patentable_eligible: boolean;
  actionable_recommendations: string[];
}

export interface ExportPathwayResult {
  formulation_title: string;
  cites_compliance_status: string;
  us_fda: {
    country: string;
    dietary_supplement_pathway: {
      feasibility: string;
      governing_law: string;
      requirements: string[];
    };
    botanical_drug_nda_pathway: {
      feasibility: string;
      governing_law: string;
      requirements: string[];
    };
  };
  eu_ema: {
    country: string;
    thmpd_pathway: {
      feasibility: string;
      governing_law: string;
      requirements: string[];
    };
    well_established_use_pathway: {
      feasibility: string;
      governing_law: string;
      requirements: string[];
    };
  };
  gcc: {
    country: string;
    herbal_registration_pathway: {
      feasibility: string;
      governing_law: string;
      requirements: string[];
    };
  };
  roadmap_steps: {
    phase: string;
    timeline: string;
    tasks: string[];
  }[];
}

export interface Expert {
  name: string;
  institution: string;
  country: string;
  works_count: number;
  cited_by_count: number;
  top_paper_title: string;
  thesis_open_access_url: string;
  relevance_score: number;
}

export interface Formula {
  id?: number;
  title: string;
  classical_reference?: string;
  description?: string;
  ingredients: {
    name: string;
    sanskrit_name?: string;
    botanical_name?: string;
    percentage: number;
    part_used?: string;
  }[];
  indications?: string;
  created_at?: string;
}

export interface StatutoryDocument {
  doc_id: string;
  title: string;
  jurisdiction: string;
  year: number;
  sections: {
    section_number: string;
    page_no: number;
    bbox: number[];
    content: string;
  }[];
}

export interface SourceDocument {
  id: string;
  title: string;
  filename: string;
  filepath?: string;
  jurisdiction: string;
  category: string;
  document_type: string;
  file_type: string;
  file_size: number;
  page_count: number;
  index_status: 'indexed' | 'pending' | 'error' | 'removed';
  verification_status: 'official' | 'unverified';
  file_hash: string;
  error_message?: string;
}

export interface SourceChunk {
  chunk_id: string;
  source_id: string;
  source_title: string;
  filename: string;
  jurisdiction: string;
  category: string;
  page_number: number;
  section_reference?: string;
  text: string;
  relevance_score?: number;
  verification_status?: string;
}

export interface RAGCitation {
  source_id: string;
  chunk_id: string;
  source_title: string;
  filename: string;
  page_number: number;
  section_reference?: string;
  relevance_score: number;
  verification_status: string;
  extracted_excerpt: string;
}

export interface RAGPipelineStep {
  step: string;
  status: 'completed' | 'in_progress' | 'pending';
  value?: string;
  chunks_retrieved?: number;
  citations_validated?: number;
  model?: string;
}

export interface JurisdictionRule {
  flag: string;
  country: string;
  authority: string;
  framework: string;
  classification: string;
  rules_summary: string;
  patentability_status: string;
  key_requirements: string[];
}

export type JurisdictionBreakdownMap = Record<string, JurisdictionRule>;

export interface RAGChatResponse {
  answer: string;
  jurisdiction: string;
  citations: RAGCitation[];
  confidence: {
    level: string;
    reason: string;
  };
  disclaimer: string;
  model_used?: string;
  retrieval_mode?: string;
  pipeline_steps?: RAGPipelineStep[];
  jurisdiction_breakdown?: JurisdictionBreakdownMap;
}

export interface ClassificationResponse {
  tentative_category: string;
  reasoning: string[];
  relevant_regulatory_sources: string[];
  ip_considerations: string[];
  abs_considerations: string[];
  disclaimer: string;
}

export interface ABSAssessmentResponse {
  resource: string;
  compliance_flags: string[];
  recommended_actions: string[];
  statutory_references: string[];
  disclaimer: string;
}

