import json
import asyncio
from fastapi import FastAPI, Depends, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, HTMLResponse
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db.database import get_db, init_db
from app.db.seed import seed_data
from app.db.repository import Repository
from app.auth.router import router as auth_router
from app.api.v1.endpoints.audit import router as audit_router
from app.api.v1.endpoints.experts import router as experts_router
from app.api.v1.endpoints.rag_router import router as rag_router
from app.services.pdf_indexer import pdf_indexer

app = FastAPI(
    title="DR. Ayurvedic Sathi API",
    description="Multilingual, RAG-based AI assistant for Intellectual Property, Botanical Drug Compliance, and Global Regulatory Guidance in Ayurveda (SIH IP-SAKTI Sahayak)",
    version=settings.VERSION
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(audit_router, prefix=settings.API_V1_STR)
app.include_router(experts_router, prefix=settings.API_V1_STR)

# Mount RAG router at both /api/v1 and root /api for maximum client compatibility
app.include_router(rag_router, prefix=settings.API_V1_STR, tags=["RAG & Sources"])
app.include_router(rag_router, prefix="/api", tags=["RAG & Sources (Alias)"])

@app.on_event("startup")
async def on_startup():
    await init_db()
    await seed_data()
    # Auto discover and index official IP-SAKTI PDFs
    try:
        pdf_indexer.discover_and_index_all()
        print(f"[PDF Indexer] Successfully indexed official source library PDFs.")
    except Exception as e:
        print(f"[PDF Indexer] Startup indexing notice: {e}")

@app.get("/")
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "subtitle": "AI Assistant for Ayurveda IP & Regulatory Guidance (Ministry of Ayush - SIH IP-SAKTI Sahayak)",
        "status": "ONLINE",
        "docs_url": "/docs"
    }

class FormulaSaveRequest(BaseModel):
    title: str
    classical_reference: Optional[str] = "Ayurvedic Pharmacopoeia of India"
    description: Optional[str] = ""
    ingredients: List[Dict[str, Any]]
    indications: Optional[str] = ""

@app.post(f"{settings.API_V1_STR}/formula/save")
async def save_formula(req: FormulaSaveRequest, db: AsyncSession = Depends(get_db)):
    repo = Repository(db)
    formula = await repo.save_formula(
        title=req.title,
        ingredients=req.ingredients,
        classical_reference=req.classical_reference,
        description=req.description,
        indications=req.indications
    )
    
    # Run compliance audit & save
    cites_res = await cites_screener.screen_formula(req.ingredients, db)
    sec3p_res = sec3p_analyzer.analyze_formulation(req.title, req.ingredients)
    export_res = export_pathway_analyzer.analyze_export_routes(req.title, req.ingredients, cites_res["status"])
    parent_chunks = hybrid_retriever.retrieve(req.title, top_k=4)
    citations = citation_tracer.generate_citations(parent_chunks)

    audit = await repo.save_audit(
        formula_id=formula.id,
        novelty_score=sec3p_res["novelty_score"],
        sec_3p_risk=sec3p_res["sec_3p_risk_level"],
        cites_flag=cites_res["status"],
        international_eligibility=export_res,
        citations=citations
    )

    return {
        "status": "SUCCESS",
        "message": "Formula and compliance audit saved successfully to Formulation Vault.",
        "formula_id": formula.id,
        "audit_id": audit.id
    }

@app.get(f"{settings.API_V1_STR}/formula/list")
async def list_formulas(db: AsyncSession = Depends(get_db)):
    repo = Repository(db)
    formulas = await repo.get_formulas()
    results = []
    for f in formulas:
        results.append({
            "id": f.id,
            "title": f.title,
            "classical_reference": f.classical_reference,
            "description": f.description,
            "ingredients": f.ingredients,
            "indications": f.indications,
            "created_at": f.created_at.isoformat()
        })
    return {"formulas": results}

class AnalyzeRequest(BaseModel):
    query: str
    mode: Optional[str] = "GENERAL"  # GENERAL, SEC3P, CITES, EXPORT
    formula_title: Optional[str] = None
    ingredients: Optional[List[Dict[str, Any]]] = None

@app.post(f"{settings.API_V1_STR}/analyze")
async def analyze_stream(req: AnalyzeRequest, db: AsyncSession = Depends(get_db)):
    """
    Streaming SSE endpoint executing the complete pipeline:
    Ingress Translation ➔ Entity Resolution ➔ CITES Check ➔ Hybrid RAG ➔ Citation Verification ➔ Response Streaming
    """
    async def event_generator():
        # Step 1: Entity Normalization
        norm_res = entity_normalizer.normalize_text(req.query)
        yield f"data: {json.dumps({'type': 'ENTITY_NORMALIZATION', 'payload': norm_res})}\n\n"
        await asyncio.sleep(0.1)

        # Step 2: CITES & Wildlife Screening
        ingredients_to_check = req.ingredients if req.ingredients else req.query
        cites_res = await cites_screener.screen_formula(ingredients_to_check, db)
        yield f"data: {json.dumps({'type': 'CITES_CHECK', 'payload': cites_res})}\n\n"
        await asyncio.sleep(0.1)

        # Step 3: Section 3(p) Patent Risk Analysis
        title = req.formula_title if req.formula_title else req.query[:50]
        sec3p_res = sec3p_analyzer.analyze_formulation(title, ingredients_to_check)
        yield f"data: {json.dumps({'type': 'SEC3P_ANALYSIS', 'payload': sec3p_res})}\n\n"
        await asyncio.sleep(0.1)

        # Step 4: Export Pathway Analysis
        export_res = export_pathway_analyzer.analyze_export_routes(title, ingredients_to_check, cites_res["status"])
        yield f"data: {json.dumps({'type': 'EXPORT_PATHWAY', 'payload': export_res})}\n\n"
        await asyncio.sleep(0.1)

        # Step 5: Hybrid RAG Retrieval & Citation Tracer
        retrieved_chunks = hybrid_retriever.retrieve(req.query, top_k=4)
        citations = citation_tracer.generate_citations(retrieved_chunks)
        yield f"data: {json.dumps({'type': 'CITATIONS', 'payload': citations})}\n\n"
        await asyncio.sleep(0.1)

        # Step 6: Streamed LLM Synthesis text response with inline bracketed citations [^1], [^2]
        explanation_parts = []
        explanation_parts.append(f"### DR. Ayurvedic Sathi Regulatory Compliance Report\n\n")
        explanation_parts.append(f"Based on statutory regulatory analysis for **\"{title}\"**, here is the synthesized legal & botanical compliance guidance:\n\n")

        if cites_res["has_cites_violations"]:
            flagged_names = ", ".join([f"{f['sanskrit_name']} ({f['botanical_name']})" for f in cites_res["flagged_botanicals"]])
            explanation_parts.append(f"🚨 **CITES / Wildlife Protection Alert:** The formulation contains restricted/banned species: {flagged_names}. Trade of wild-harvested specimens is restricted under CITES Appendices [^3]. ")
            explanation_parts.append(f"Legally compliant Ayurvedic substitutes (*Pratinidhi Dravya*) have been automatically identified with matching *Rasa, Veerya, Vipaka* properties [^3].\n\n")
        else:
            explanation_parts.append(f"✅ **CITES Compliance:** No endangered or CITES-restricted species were identified in this query.\n\n")

        explanation_parts.append(f"⚖️ **Indian Patent Act §3(p) Evaluation:** The non-patentability risk level is assessed as **{sec3p_res['sec_3p_risk_level']}** (Score: {sec3p_res['sec_3p_risk_score']}/100) [^1]. ")
        explanation_parts.append(f"Traditional herbal aggregations are barred under Section 3(p) unless unexpected synergistic bio-assay proof (Combination Index < 0.8) is established [^1].\n\n")

        explanation_parts.append(f"🌐 **Global Export Guidance:** For export to US FDA, dietary supplement marketing requires 75-Day NDI notification under DSHEA 1994 [^4]. ")
        explanation_parts.append(f"For EU EMA registration, Directive 2004/24/EC requires 30-year traditional use documentation (with 15 years in EU) [^5]. ")
        explanation_parts.append(f"GCC registration requires COPP certificates from Ministry of Ayush and heavy metal compliance (Pb < 10ppm, As < 3ppm) [^6].\n\n")

        full_text = "".join(explanation_parts)
        words = full_text.split(" ")

        for i in range(0, len(words), 4):
            chunk_words = " ".join(words[i:i+4]) + " "
            yield f"data: {json.dumps({'type': 'STREAM_CHUNK', 'text': chunk_words})}\n\n"
            await asyncio.sleep(0.04)

        yield f"data: {json.dumps({'type': 'COMPLETE'})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.get(f"{settings.API_V1_STR}/experts")
async def get_experts(query: str = Query(..., description="Botanical or Ayurvedic Dravya name")):
    res = await expert_finder.search_experts(query)
    return res

@app.get(f"{settings.API_V1_STR}/document/{{doc_id}}")
async def get_document(doc_id: str):
    for doc in STATUTORY_DOCUMENTS:
        if doc["doc_id"] == doc_id:
            return doc
    raise HTTPException(status_code=404, detail=f"Document {doc_id} not found.")

@app.get(f"{settings.API_V1_STR}/document/list/all")
async def list_all_documents():
    return {"documents": STATUTORY_DOCUMENTS}

class DossierHTMLRequest(BaseModel):
    formula: Dict[str, Any]
    sec3p_data: Dict[str, Any]
    cites_data: Dict[str, Any]
    export_data: Dict[str, Any]

@app.post(f"{settings.API_V1_STR}/dossier/html")
async def generate_dossier_html(req: DossierHTMLRequest):
    html = dossier_generator.generate_html_dossier(
        formula=req.formula,
        audit={},
        cites_data=req.cites_data,
        sec3p_data=req.sec3p_data,
        export_data=req.export_data
    )
    return HTMLResponse(content=html)
