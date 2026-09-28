"""
Botanical Expert & Research Paper Finder Service.
Queries the live OpenAlex API to discover global academic experts,
their publications, citation metrics, and open-access PDFs for any
Ayurvedic botanical or herb name.

Uses the polite pool (mailto header) for unrestricted rate limits.
Implements in-memory TTL cache (24h) to avoid redundant API calls.
"""
import asyncio
import time
import re
from collections import Counter
from typing import Any, Dict, List, Optional, Tuple

import httpx

from app.config import settings
from app.schemas.expert import (
    BotanicalExpertResponse,
    ExpertProfile,
    ResearchPaper,
)

# ─── BOTANICAL NAME RESOLUTION TABLE ────────────────────────────────────────────
# Sanskrit / Hindi / common names → Latin binomials
_HERB_MAP: Dict[str, str] = {
    "ashwagandha": "Withania somnifera",
    "अश्वगंधा": "Withania somnifera",
    "winter cherry": "Withania somnifera",
    "turmeric": "Curcuma longa",
    "haridra": "Curcuma longa",
    "हल्दी": "Curcuma longa",
    "haldi": "Curcuma longa",
    "giloy": "Tinospora cordifolia",
    "guduchi": "Tinospora cordifolia",
    "गिलोय": "Tinospora cordifolia",
    "tulsi": "Ocimum sanctum",
    "holy basil": "Ocimum sanctum",
    "तुलसी": "Ocimum sanctum",
    "brahmi": "Bacopa monnieri",
    "ब्राह्मी": "Bacopa monnieri",
    "shatavari": "Asparagus racemosus",
    "शतावरी": "Asparagus racemosus",
    "kushta": "Saussurea costus",
    "kuth": "Saussurea costus",
    "jatamansi": "Nardostachys jatamansi",
    "spikenard": "Nardostachys jatamansi",
    "sarpagandha": "Rauvolfia serpentina",
    "snakeroot": "Rauvolfia serpentina",
    "amalaki": "Phyllanthus emblica",
    "amla": "Phyllanthus emblica",
    "आंवला": "Phyllanthus emblica",
    "neem": "Azadirachta indica",
    "nimba": "Azadirachta indica",
    "guggulu": "Commiphora mukul",
    "shallaki": "Boswellia serrata",
    "manjistha": "Rubia cordifolia",
    "arjuna": "Terminalia arjuna",
    "haritaki": "Terminalia chebula",
    "bibhitaki": "Terminalia bellirica",
    "pippali": "Piper longum",
    "pushkarmoola": "Inula racemosa",
    "tagara": "Valeriana wallichii",
    "agaru": "Aquilaria agallocha",
    "red sanders": "Pterocarpus santalinus",
    "rakta chandana": "Pterocarpus santalinus",
    "mulethi": "Glycyrrhiza glabra",
    "yashtimadhu": "Glycyrrhiza glabra",
    "licorice": "Glycyrrhiza glabra",
    "shankhpushpi": "Convolvulus pluricaulis",
    "vacha": "Acorus calamus",
    "katuki": "Picrorhiza kurroa",
    "kalmegh": "Andrographis paniculata",
    "chirayata": "Swertia chirayita",
    "bhringraj": "Eclipta prostrata",
    "moringa": "Moringa oleifera",
    "ginger": "Zingiber officinale",
    "shunthi": "Zingiber officinale",
    "black pepper": "Piper nigrum",
    "maricha": "Piper nigrum",
}

# ─── IN-MEMORY CACHE (TTL = 24 hours) ───────────────────────────────────────────
_CACHE: Dict[str, Tuple[float, BotanicalExpertResponse]] = {}
_CACHE_TTL = 86400  # 24 hours


# ─── HTTP CLIENT CONFIG ─────────────────────────────────────────────────────────
_BASE = settings.OPENALEX_BASE_URL
_TIMEOUT = httpx.Timeout(8.0, connect=5.0)
_HEADERS = {
    "Accept": "application/json",
    "User-Agent": "DR-Ayurvedic-Sathi/1.0 (mailto:ayurvedicsathi@project.local)",
}


def resolve_herb_entity(herb_name: str) -> str:
    """
    Resolve a Sanskrit / Hindi / common herb name to its scientific binomial.
    If the input already looks like a binomial (two capitalized words), return as-is.
    """
    cleaned = herb_name.strip()

    # Already a Latin binomial? (e.g. "Withania somnifera")
    if re.match(r'^[A-Z][a-z]+\s+[a-z]+', cleaned):
        return cleaned

    # Lookup in the map (case-insensitive)
    key = cleaned.lower()
    if key in _HERB_MAP:
        return _HERB_MAP[key]

    # Partial match
    for term, binomial in _HERB_MAP.items():
        if term in key or key in term:
            return binomial

    # Return as-is if no match found (user may have typed the binomial in lowercase)
    return cleaned.title()


async def _fetch_json(client: httpx.AsyncClient, url: str, params: Dict[str, Any]) -> Optional[Dict]:
    """Safe JSON fetch with error handling."""
    try:
        resp = await client.get(url, params=params)
        if resp.status_code == 200:
            return resp.json()
    except Exception:
        pass
    return None


async def _fetch_author_details(
    client: httpx.AsyncClient, author_id: str, scientific_name: str
) -> Optional[ExpertProfile]:
    """
    Fetch detailed author profile from OpenAlex /authors/{id},
    then fetch their top 3 papers related to the botanical.
    """
    # Fetch author metadata
    author_data = await _fetch_json(client, f"{_BASE}/authors/{author_id}", {})
    if not author_data:
        return None

    display_name = author_data.get("display_name", "Unknown Researcher")

    # Get institution from last_known_institutions
    institution = None
    country_code = None
    last_insts = author_data.get("last_known_institutions") or author_data.get("last_known_institution")
    if isinstance(last_insts, list) and last_insts:
        institution = last_insts[0].get("display_name")
        country_code = last_insts[0].get("country_code")
    elif isinstance(last_insts, dict):
        institution = last_insts.get("display_name")
        country_code = last_insts.get("country_code")

    # Affiliations fallback
    if not institution:
        affiliations = author_data.get("affiliations", [])
        if affiliations:
            inst = affiliations[0].get("institution", {})
            institution = inst.get("display_name")
            country_code = inst.get("country_code")

    h_index = None
    summary_stats = author_data.get("summary_stats", {})
    if summary_stats:
        h_index = summary_stats.get("h_index")

    orcid = author_data.get("orcid")
    profile_url = author_data.get("id", "")

    # ── Fetch top 3 papers for this author related to the botanical ──
    papers_data = await _fetch_json(client, f"{_BASE}/works", {
        "filter": f"authorships.author.id:{author_id},default.search:{scientific_name}",
        "sort": "cited_by_count:desc",
        "per_page": 3,
        "select": "title,publication_year,primary_location,cited_by_count,doi,open_access,best_oa_location",
    })

    papers: List[ResearchPaper] = []
    if papers_data:
        for w in papers_data.get("results", []):
            journal = None
            primary_loc = w.get("primary_location") or {}
            source = primary_loc.get("source") or {}
            journal = source.get("display_name")

            oa_pdf = None
            best_oa = w.get("best_oa_location") or {}
            oa_pdf = best_oa.get("pdf_url") or best_oa.get("landing_page_url")
            if not oa_pdf:
                oa_info = w.get("open_access", {})
                oa_pdf = oa_info.get("oa_url")

            papers.append(ResearchPaper(
                title=w.get("title", "Untitled"),
                publication_year=w.get("publication_year"),
                journal=journal,
                cited_by_count=w.get("cited_by_count", 0),
                doi=w.get("doi"),
                open_access_pdf_url=oa_pdf,
            ))

    return ExpertProfile(
        author_id=author_id,
        display_name=display_name,
        institution=institution,
        country_code=country_code,
        h_index=h_index,
        total_citations=author_data.get("cited_by_count", 0),
        works_count=author_data.get("works_count", 0),
        orcid=orcid,
        profile_url=profile_url,
        relevant_papers=papers,
    )


async def fetch_botanical_experts(
    scientific_name: str, limit: int = 5
) -> Tuple[int, List[ExpertProfile]]:
    """
    Query OpenAlex for the most-cited works on a botanical,
    then aggregate the top recurring first/principal investigators
    and fetch their full profiles + relevant papers.
    """
    total_publications = 0
    author_counter: Counter = Counter()
    author_id_map: Dict[str, str] = {}  # display_name → author_id

    async with httpx.AsyncClient(timeout=_TIMEOUT, headers=_HEADERS) as client:
        # ── Step 1: Fetch top-cited works for this botanical ──
        works_data = await _fetch_json(client, f"{_BASE}/works", {
            "filter": f"default.search:{scientific_name}",
            "sort": "cited_by_count:desc",
            "per_page": 25,
            "select": "authorships,cited_by_count",
        })

        if not works_data:
            return 0, []

        total_publications = works_data.get("meta", {}).get("count", 0)

        # ── Step 2: Count first/corresponding authors ──
        for work in works_data.get("results", []):
            authorships = work.get("authorships", [])
            if not authorships:
                continue

            # Weight first author and corresponding author more
            for i, auth in enumerate(authorships[:3]):
                author = auth.get("author", {})
                author_id = author.get("id", "")
                display_name = author.get("display_name", "")
                if not author_id or not display_name:
                    continue

                # Extract just the ID part (e.g., "https://openalex.org/A123" → "A123")
                short_id = author_id.split("/")[-1] if "/" in author_id else author_id
                weight = 3 if i == 0 else 1  # First author gets 3x weight
                author_counter[short_id] += weight
                author_id_map[short_id] = display_name

        if not author_counter:
            return total_publications, []

        # ── Step 3: Fetch detailed profiles for top authors (concurrently) ──
        top_author_ids = [aid for aid, _ in author_counter.most_common(limit)]

        tasks = [
            _fetch_author_details(client, aid, scientific_name)
            for aid in top_author_ids
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        experts: List[ExpertProfile] = []
        for r in results:
            if isinstance(r, ExpertProfile):
                experts.append(r)

        # Sort by total citations descending
        experts.sort(key=lambda e: e.total_citations, reverse=True)

    return total_publications, experts


async def find_botanical_experts(
    herb_name: str, limit: int = 5
) -> BotanicalExpertResponse:
    """
    Main entry point. Resolves the herb name, checks cache, queries OpenAlex.
    """
    scientific_name = resolve_herb_entity(herb_name)
    cache_key = scientific_name.lower()

    # ── Check cache ──
    if cache_key in _CACHE:
        cached_time, cached_response = _CACHE[cache_key]
        if time.time() - cached_time < _CACHE_TTL:
            return cached_response

    # ── Live query ──
    try:
        total_pubs, experts = await fetch_botanical_experts(scientific_name, limit)
        response = BotanicalExpertResponse(
            query=herb_name,
            botanical_name=scientific_name,
            total_publications_indexed=total_pubs,
            top_experts=experts,
            api_source="OpenAlex (Live)" if experts else "OpenAlex (No Results)",
        )
    except Exception:
        response = BotanicalExpertResponse(
            query=herb_name,
            botanical_name=scientific_name,
            total_publications_indexed=0,
            top_experts=[],
            api_source="OpenAlex (Error — Offline Fallback)",
        )

    # ── Store in cache ──
    _CACHE[cache_key] = (time.time(), response)
    return response
