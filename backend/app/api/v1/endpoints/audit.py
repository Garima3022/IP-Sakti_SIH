"""
FastAPI router for the Regulatory Audit Engine.
POST /api/v1/audit/full   — Full concurrent audit (JSON response)
POST /api/v1/audit/stream — SSE streaming version (events emitted per sub-engine)
"""
import json
import asyncio
import time
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.schemas.audit import FormulationAuditRequest, AuditMasterResponse
from app.engines.regulatory_auditor import (
    check_section_3p_synergy,
    check_cites_and_wildlife,
    evaluate_us_fda,
    evaluate_eu_ema,
    evaluate_ae_gcc,
    fetch_research_and_prior_art,
    run_full_regulatory_audit,
)

router = APIRouter(prefix="/audit", tags=["Regulatory Audit Engine"])


@router.post("/full", response_model=AuditMasterResponse)
async def full_audit(request: FormulationAuditRequest):
    """
    Execute all 6 compliance engines concurrently and return the aggregated
    AuditMasterResponse as a single JSON payload.
    """
    result = await run_full_regulatory_audit(request)
    return result


@router.post("/stream")
async def stream_audit(request: FormulationAuditRequest):
    """
    SSE streaming endpoint. Emits each sub-engine result as a Server-Sent Event
    as soon as it completes, giving the frontend real-time progress updates.
    """
    async def event_generator():
        start = time.perf_counter()

        # Emit START event
        yield f"data: {json.dumps({'type': 'AUDIT_START', 'title': request.title, 'markets': request.target_markets})}\n\n"

        # ── Engine 1: Section 3(p) ──
        try:
            sec3p = await check_section_3p_synergy(request.ingredients)
            yield f"data: {json.dumps({'type': 'SEC3P_ANALYSIS', 'payload': sec3p.model_dump()})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'ENGINE_ERROR', 'engine': 'SEC3P', 'error': str(e)})}\n\n"

        # ── Engine 2: CITES ──
        try:
            cites = await check_cites_and_wildlife(request.ingredients)
            yield f"data: {json.dumps({'type': 'CITES_CHECK', 'payload': cites.model_dump()})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'ENGINE_ERROR', 'engine': 'CITES', 'error': str(e)})}\n\n"

        # ── Engines 3/4/5: Jurisdictions (concurrent) ──
        jurisdiction_tasks = []
        labels = []
        if "US" in request.target_markets:
            jurisdiction_tasks.append(evaluate_us_fda(request))
            labels.append("US_FDA")
        if "EU" in request.target_markets:
            jurisdiction_tasks.append(evaluate_eu_ema(request))
            labels.append("EU_EMA")
        if "GCC" in request.target_markets:
            jurisdiction_tasks.append(evaluate_ae_gcc(request))
            labels.append("GCC_MOHAP")

        if jurisdiction_tasks:
            results = await asyncio.gather(*jurisdiction_tasks, return_exceptions=True)
            for label, result in zip(labels, results):
                if isinstance(result, BaseException):
                    yield f"data: {json.dumps({'type': 'ENGINE_ERROR', 'engine': label, 'error': str(result)})}\n\n"
                else:
                    yield f"data: {json.dumps({'type': f'JURISDICTION_{label}', 'payload': result.model_dump()})}\n\n"

        # ── Engine 6: Research & Prior Art ──
        try:
            research = await fetch_research_and_prior_art(request.ingredients)
            serialized = {
                "references": [r.model_dump() for r in research["references"]],
                "patents": [p.model_dump() for p in research["patents"]],
            }
            yield f"data: {json.dumps({'type': 'RESEARCH_PRIOR_ART', 'payload': serialized})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'ENGINE_ERROR', 'engine': 'RESEARCH', 'error': str(e)})}\n\n"

        # ── COMPLETE ──
        elapsed = round((time.perf_counter() - start) * 1000, 1)
        yield f"data: {json.dumps({'type': 'AUDIT_COMPLETE', 'execution_time_ms': elapsed})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
