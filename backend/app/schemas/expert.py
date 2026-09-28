"""
Pydantic v2 schemas for the Botanical Expert & Research Paper Finder.
"""
from pydantic import BaseModel, Field
from typing import List, Optional


class ResearchPaper(BaseModel):
    """A single published research paper."""
    title: str
    publication_year: Optional[int] = None
    journal: Optional[str] = None
    cited_by_count: int = 0
    doi: Optional[str] = None
    open_access_pdf_url: Optional[str] = None


class ExpertProfile(BaseModel):
    """An academic researcher / expert profile."""
    author_id: str = Field(description="OpenAlex author ID (e.g. A5023888391)")
    display_name: str
    institution: Optional[str] = None
    country_code: Optional[str] = None
    h_index: Optional[int] = None
    total_citations: int = 0
    works_count: int = 0
    orcid: Optional[str] = None
    profile_url: Optional[str] = None
    relevant_papers: List[ResearchPaper] = Field(default_factory=list)


class BotanicalExpertResponse(BaseModel):
    """Top-level response from the Botanical Expert Finder."""
    query: str = Field(description="Original user input (e.g. 'Ashwagandha')")
    botanical_name: str = Field(description="Resolved scientific binomial")
    total_publications_indexed: int = Field(default=0, description="Total works matching this botanical on OpenAlex")
    top_experts: List[ExpertProfile] = Field(default_factory=list)
    api_source: str = Field(default="OpenAlex (Live)", description="Whether data is live or cached")
