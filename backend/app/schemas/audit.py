"""
Pydantic v2 schemas for the Enterprise Regulatory Audit & International Compliance Engine.
Defines typed request/response models for formulation audit pipeline.
"""
from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Literal, Optional, Any
from pydantic import BaseModel, Field


# ─── INPUT MODELS ───────────────────────────────────────────────────────────────

class IngredientInput(BaseModel):
    """Single ingredient within an Ayurvedic formulation."""
    botanical_name: str = Field(..., description="Latin binomial, e.g. 'Withania somnifera'")
    sanskrit_name: str = Field(default="", description="Sanskrit Dravya name, e.g. 'Ashwagandha'")
    percentage: float = Field(default=0.0, ge=0.0, le=100.0, description="Weight % in formulation")
    part_used: str = Field(default="Root", description="Plant part: Root, Leaf, Whole Herb, etc.")
    ic50: Optional[float] = Field(default=None, description="IC50 value in µM for Chou-Talalay synergy index, if available")


class FormulationAuditRequest(BaseModel):
    """Top-level request to run a full multi-jurisdiction regulatory audit."""
    title: str = Field(..., description="Formulation name, e.g. 'Manas Mitra Kwatha'")
    dosage_form: str = Field(default="Kwatha (Decoction)", description="Dosage form: Churna, Kwatha, Vati, Taila, Arishta, Capsule")
    target_markets: List[Literal["IN", "US", "EU", "GCC"]] = Field(
        default=["IN", "US", "EU", "GCC"],
        description="Target export jurisdictions"
    )
    ingredients: List[IngredientInput] = Field(..., min_length=1, description="List of formulation ingredients")


# ─── SUB-ENGINE OUTPUT MODELS ───────────────────────────────────────────────────

class SynergyAnalysis(BaseModel):
    """Chou-Talalay Combination Index & Section 3(p) Patent Risk."""
    combination_index: Optional[float] = Field(default=None, description="CI < 1 = synergy, CI > 1 = antagonism")
    synergy_verdict: str = Field(default="Undetermined")
    sec_3p_risk_level: Literal["LOW", "MODERATE", "HIGH"] = Field(default="MODERATE")
    sec_3p_risk_score: float = Field(default=50.0)
    novelty_score: float = Field(default=50.0)
    detected_botanicals: List[str] = Field(default_factory=list)
    is_patentable_eligible: bool = Field(default=False)
    draft_patent_claim: str = Field(default="")
    actionable_recommendations: List[str] = Field(default_factory=list)


class PratinidhiDravya(BaseModel):
    """Pharmacopoeial substitute for a CITES-restricted botanical."""
    alternative_name: str
    alternative_sanskrit_name: str
    justification: str
    pharmacopoeia_reference: str


class FlaggedBotanical(BaseModel):
    """A single CITES/Wildlife-flagged ingredient."""
    botanical_name: str
    sanskrit_name: str
    cites_appendix: str
    wildlife_act_schedule: str
    risk_level: Literal["RED", "AMBER", "GREEN"]
    legal_status: str
    pratinidhi_dravya: Optional[PratinidhiDravya] = None


class CitesStatus(BaseModel):
    """Aggregated CITES & Wildlife Protection Act screening result."""
    overall_status: Literal["CLEAN", "WARNING", "BANNED"] = Field(default="CLEAN")
    has_violations: bool = Field(default=False)
    flagged_count: int = Field(default=0)
    flagged_botanicals: List[FlaggedBotanical] = Field(default_factory=list)
    api_source: str = Field(default="LOCAL_FALLBACK", description="LIVE_API or LOCAL_FALLBACK")


class JurisdictionVerdict(BaseModel):
    """Compliance verdict for a single jurisdiction."""
    jurisdiction: str = Field(description="US, EU, GCC, or IN")
    status: Literal["APPROVED", "WARNING", "REJECTED"] = Field(default="WARNING")
    confidence_score: float = Field(default=0.7, ge=0.0, le=1.0)
    governing_laws: List[str] = Field(default_factory=list)
    statutory_clauses: List[str] = Field(default_factory=list)
    reasons: List[str] = Field(default_factory=list)
    required_actions: List[str] = Field(default_factory=list)
    checklist: List[Dict[str, Any]] = Field(default_factory=list)


class AcademicReference(BaseModel):
    """A single research paper / prior art entry."""
    title: str
    authors: List[str] = Field(default_factory=list)
    publication_year: int = Field(default=2024)
    doi: str = Field(default="")
    cited_by_count: int = Field(default=0)
    source: str = Field(default="OpenAlex")
    relevance_score: float = Field(default=0.5)


class PatentEntry(BaseModel):
    """A patent filing from WIPO / prior art."""
    title: str
    filing_number: str = Field(default="")
    applicant: str = Field(default="")
    filing_date: str = Field(default="")
    jurisdiction: str = Field(default="PCT")
    status: str = Field(default="Published")
    biopiracy_risk: Literal["LOW", "MODERATE", "HIGH"] = Field(default="LOW")


# ─── MASTER RESPONSE ────────────────────────────────────────────────────────────

class AuditMasterResponse(BaseModel):
    """
    Top-level response from the full Regulatory Audit Engine.
    Aggregates all 6 concurrent sub-engine results.
    """
    audit_id: str = Field(description="Unique audit run identifier")
    formulation_title: str
    dosage_form: str
    audit_timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")

    # Sub-engine results
    section_3p_analysis: SynergyAnalysis
    cites_status: CitesStatus
    international_clearance: Dict[str, JurisdictionVerdict] = Field(
        default_factory=dict,
        description="Keyed by jurisdiction code: US, EU, GCC"
    )
    academic_references: List[AcademicReference] = Field(default_factory=list)
    prior_art_patents: List[PatentEntry] = Field(default_factory=list)

    # Meta
    execution_time_ms: float = Field(default=0.0)
    engine_errors: List[str] = Field(default_factory=list, description="Non-fatal errors from sub-engines")
    overall_verdict: Literal["APPROVED", "WARNING", "REJECTED"] = Field(default="WARNING")
    summary: str = Field(default="")
