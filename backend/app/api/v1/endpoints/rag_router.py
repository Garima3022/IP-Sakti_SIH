import os
import shutil
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query, UploadFile, File, BackgroundTasks
from pydantic import BaseModel

from app.config import settings
from app.services.pdf_indexer import pdf_indexer
from app.rag.pdf_retriever import pdf_retriever
from app.services.gemini_service import gemini_service

router = APIRouter()

# Request Models
class ChatRequest(BaseModel):
    message: str
    jurisdiction: Optional[str] = "India"  # India, International, Both
    language: Optional[str] = "EN"  # EN, HI, TA, SK
    retrieval_mode: Optional[str] = "pdf"  # pdf, demo
    category: Optional[str] = None
    conversation_id: Optional[str] = "demo-session-001"

class ClassifyRequest(BaseModel):
    title: str
    description: Optional[str] = ""
    is_classical_text_cited: bool = False
    is_modified: bool = False
    product_type: str = "medicine"  # medicine, food, cosmetic, nutraceutical
    contains_indian_biological_resources: bool = True
    for_export: bool = False

class ABSAssessmentRequest(BaseModel):
    biological_resource_name: str
    source_origin: str = "India"
    traditional_knowledge_associated: bool = True
    intended_commercial_use: str = "domestic_sale"  # domestic_sale, export, research
    foreign_entity_involved: bool = False

# --- Endpoints ---

@router.get("/health")
async def health_check():
    stats = pdf_indexer.get_stats()
    return {
        "status": "HEALTHY",
        "service": "DR. Ayurvedic Sathi RAG Engine",
        "gemini_configured": gemini_service.configured,
        "active_model": gemini_service.active_model_name,
        "source_library": stats
    }

@router.post("/chat")
async def handle_chat(req: ChatRequest):
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="User message cannot be empty.")

    # Step 1: Retrieve chunks using PDFRetriever
    retrieved_chunks = pdf_retriever.retrieve_chunks(
        query=req.message,
        jurisdiction=req.jurisdiction or "India",
        category=req.category,
        retrieval_mode=req.retrieval_mode or "pdf",
        top_k=4
    )

    # Step 2: Generate Gemini / Evidence-backed response
    result = gemini_service.generate_answer(
        query=req.message,
        jurisdiction=req.jurisdiction or "India",
        retrieved_chunks=retrieved_chunks,
        language=req.language or "EN"
    )

    # Add Pipeline progress metadata
    result["retrieval_mode"] = req.retrieval_mode
    result["pipeline_steps"] = [
        {"step": "Query Understanding", "status": "completed"},
        {"step": "Jurisdiction Filter", "status": "completed", "value": req.jurisdiction},
        {"step": "IPR Category Routing", "status": "completed", "value": req.category or "Auto-detected"},
        {"step": "Document Retrieval", "status": "completed", "chunks_retrieved": len(retrieved_chunks)},
        {"step": "Context Construction", "status": "completed"},
        {"step": "Gemini Answer Generation", "status": "completed", "model": result.get("model_used")},
        {"step": "Citation Validation", "status": "completed", "citations_validated": len(result.get("citations", []))}
    ]

    return result

@router.post("/jurisdiction-breakdown")
async def get_jurisdiction_breakdown(req: ChatRequest):
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Query message cannot be empty.")
    
    breakdown = gemini_service.build_jurisdiction_breakdown(req.message, req.language or "EN")
    return {
        "query": req.message,
        "language": req.language or "EN",
        "breakdown": breakdown
    }

# --- Source Library Endpoints ---

@router.get("/sources")
async def list_sources():
    stats = pdf_indexer.get_stats()
    docs = pdf_indexer.get_all_documents()
    return {
        "stats": stats,
        "documents": docs
    }

@router.get("/sources/{doc_id}")
async def get_source_details(doc_id: str):
    docs = pdf_indexer.get_all_documents()
    for d in docs:
        if d["id"] == doc_id:
            return d
    raise HTTPException(status_code=404, detail=f"Source document '{doc_id}' not found.")

@router.get("/sources/{doc_id}/pages/{page_num}")
async def get_source_page(doc_id: str, page_num: int):
    page_text = pdf_indexer.get_document_page_text(doc_id, page_num)
    if page_text is None:
        raise HTTPException(status_code=404, detail=f"Page {page_num} not found for document '{doc_id}'.")
    return {
        "doc_id": doc_id,
        "page_number": page_num,
        "text": page_text
    }

@router.get("/sources/{doc_id}/chunks")
async def get_source_chunks(doc_id: str):
    chunks = pdf_indexer.get_document_chunks(doc_id)
    return {
        "doc_id": doc_id,
        "total_chunks": len(chunks),
        "chunks": chunks
    }

@router.post("/sources/upload")
async def upload_source_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    target_path = os.path.join(pdf_indexer.source_dir, file.filename)
    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    doc_id = f"doc_{os.path.basename(file.filename).replace('.pdf', '')}"
    doc_meta = pdf_indexer.index_single_pdf(doc_id, target_path, file.filename)
    return {
        "status": "SUCCESS",
        "message": f"File '{file.filename}' uploaded and indexed successfully.",
        "document": doc_meta
    }

@router.post("/sources/{doc_id}/reindex")
async def reindex_source(doc_id: str):
    updated = pdf_indexer.reindex_document(doc_id)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Document '{doc_id}' not found for reindexing.")
    return {
        "status": "SUCCESS",
        "message": f"Document '{doc_id}' reindexed successfully.",
        "document": updated
    }

@router.delete("/sources/{doc_id}/index")
async def remove_source_from_index(doc_id: str):
    success = pdf_indexer.remove_from_index(doc_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Document '{doc_id}' not found.")
    return {
        "status": "SUCCESS",
        "message": f"Document '{doc_id}' removed from retrieval index. Physical PDF preserved."
    }

# --- Classification & ABS Helpers ---

@router.post("/classify")
async def classify_formulation(req: ClassifyRequest):
    category = "Patent or Proprietary Ayurvedic Medicine"
    reasoning = []
    reg_sources = []

    if req.product_type == "cosmetic":
        category = "Cosmetic (Ayurvedic/Herbal)"
        reasoning.append("Formulation intended for topical application / beauty; governed under Drugs & Cosmetics Act Rules for Cosmetics.")
        reg_sources.append("Drugs & Cosmetics Act 1940 & Rules 1945 (Part XIII)")
    elif req.product_type == "food" or "aahar" in req.title.lower():
        category = "Ayurveda-Aahar / Nutraceutical"
        reasoning.append("Formulation complies with FSSAI Ayurveda Aahar Regulations (2022).")
        reg_sources.append("FSSAI Ayurveda Aahara Compendium 2022")
    elif req.is_classical_text_cited and not req.is_modified:
        category = "Classical Ayurvedic Medicine"
        reasoning.append("Formulation matches authoritative text in First Schedule of Drugs & Cosmetics Act.")
        reasoning.append("Exempt from clinical trials for domestic manufacturing approval (Rule 158-B).")
        reg_sources.append("Drugs & Cosmetics Act 1940 - Rule 158-B")
    elif req.is_modified:
        category = "Patent or Proprietary Ayurvedic Medicine / Phytopharmaceutical"
        reasoning.append("Formulation modifies traditional ingredients or uses novel extraction fractions.")
        reasoning.append("Requires comparative bio-assay data to overcome Indian Patents Act §3(p).")
        reg_sources.append("Indian Patents Act 1970 - Section 3(p)")
    
    return {
        "tentative_category": category,
        "reasoning": reasoning,
        "relevant_regulatory_sources": reg_sources,
        "ip_considerations": [
            "Traditional herbal combinations face non-patentability under §3(p) unless synergistic Combination Index CI < 0.8 is proved.",
            "Trademarks and Brand Names must comply with DMR (Objectionable Advertisements) Act."
        ],
        "abs_considerations": [
            "Biological resources sourced from India require National Biodiversity Authority (NBA) compliance."
        ],
        "disclaimer": "Informational tentative classification only, not a legal approval."
    }

@router.post("/abs-assessment")
async def abs_compliance_assessment(req: ABSAssessmentRequest):
    flags = []
    actions = []

    if req.foreign_entity_involved or req.intended_commercial_use == "export":
        flags.append("🚨 Mandatory NBA Approval Required: Any commercial utilization or export by/with a foreign entity requires prior approval under Section 3 / Section 6 of Biological Diversity Act 2023.")
        actions.append("Submit Form I to National Biodiversity Authority (NBA) prior to export.")
        actions.append("Calculate Access and Benefit Sharing (ABS) fee (0.1% - 0.5% of annual turnover).")
    else:
        flags.append("✅ Domestic Commercial Utilization: State Biodiversity Board (SBB) notification required under Section 7 of Biological Diversity Act.")
        actions.append("Notify concerned State Biodiversity Board (SBB).")

    if req.traditional_knowledge_associated:
        flags.append("📜 Traditional Knowledge Associated: Must ensure Benefit Sharing agreements respect local tribal / traditional knowledge holders.")

    return {
        "resource": req.biological_resource_name,
        "compliance_flags": flags,
        "recommended_actions": actions,
        "statutory_references": [
            "Biological Diversity (Amendment) Act 2023",
            "Gazette Notification of ABS Guidelines"
        ],
        "disclaimer": "Informational guidance only. Consult National Biodiversity Authority for binding approval."
    }
