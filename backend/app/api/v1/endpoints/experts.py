"""
FastAPI router for the Botanical Expert & Research Paper Finder.
GET /api/v1/botanical-experts?herb=<name>&limit=5
"""
from fastapi import APIRouter, Query

from app.schemas.expert import BotanicalExpertResponse
from app.services.expert_finder import find_botanical_experts

router = APIRouter(prefix="/botanical-experts", tags=["Botanical Expert Finder"])


@router.get("", response_model=BotanicalExpertResponse)
async def get_botanical_experts(
    herb: str = Query(
        ...,
        description="Herb name — Sanskrit (e.g. 'Ashwagandha'), Hindi, or Latin binomial (e.g. 'Withania somnifera')",
        examples=["Ashwagandha", "Curcuma longa", "Giloy", "Brahmi"],
    ),
    limit: int = Query(
        default=5,
        ge=1,
        le=15,
        description="Maximum number of expert profiles to return",
    ),
):
    """
    Resolve any botanical / Ayurvedic herb name to its scientific binomial,
    then query OpenAlex to retrieve the top global academic experts,
    their publications, citation metrics, and open-access PDF links.
    """
    return await find_botanical_experts(herb, limit)
