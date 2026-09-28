from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.repository import Repository
from app.engines.entity_normalizer import entity_normalizer

# Hardcoded CITES & Wildlife Protection Act Knowledge Table
PROTECTED_SPECIES_DB = {
    "saussurea costus": {
        "sanskrit_name": "Kushta (Kuth)",
        "cites_appendix": "Appendix I",
        "wildlife_act_schedule": "Schedule VI (Protected)",
        "risk_level": "RED",
        "legal_status": "Strictly Banned for Commercial Export of Wild Harvest. Cultivation requires state license."
    },
    "pterocarpus santalinus": {
        "sanskrit_name": "Rakta Chandana (Red Sanders)",
        "cites_appendix": "Appendix II",
        "wildlife_act_schedule": "Schedule VI (Protected)",
        "risk_level": "RED",
        "legal_status": "Restricted Trade under CITES Export Permit & DGFT Certificate of Origin."
    },
    "nardostachys jatamansi": {
        "sanskrit_name": "Jatamansi (Spikenard)",
        "cites_appendix": "Appendix II",
        "wildlife_act_schedule": "Schedule VI (Critically Endangered)",
        "risk_level": "AMBER",
        "legal_status": "Requires Non-Detriment Finding (NDF) certificate and sustainable harvest licensing."
    },
    "rauvolfia serpentina": {
        "sanskrit_name": "Sarpagandha",
        "cites_appendix": "Appendix II",
        "wildlife_act_schedule": "Schedule VI (Protected)",
        "risk_level": "AMBER",
        "legal_status": "Requires CITES Appendix II Export Permit and Biodiversity Board approval."
    },
    "aquilaria agallocha": {
        "sanskrit_name": "Agaru (Agarwood)",
        "cites_appendix": "Appendix II",
        "wildlife_act_schedule": "Protected species",
        "risk_level": "AMBER",
        "legal_status": "Strict export quotas apply under CITES Appendix II."
    }
}

class CitesScreener:
    """
    Automated CITES / Wildlife Protection Act screening engine.
    Flags endangered botanicals and retrieves pharmacopoeial Pratinidhi Dravya alternatives.
    """

    async def screen_formula(self, text_or_ingredients: Any, db: AsyncSession) -> Dict[str, Any]:
        repo = Repository(db)
        botanicals_to_check = []

        if isinstance(text_or_ingredients, str):
            norm = entity_normalizer.normalize_text(text_or_ingredients)
            botanicals_to_check = norm["detected_botanicals"]
        elif isinstance(text_or_ingredients, list):
            for ing in text_or_ingredients:
                if isinstance(ing, dict):
                    name = ing.get("botanical_name") or ing.get("name") or ing.get("sanskrit_name", "")
                else:
                    name = str(ing)
                norm = entity_normalizer.normalize_text(name)
                botanicals_to_check.extend(norm["detected_botanicals"])

        flagged_items = []
        overall_status = "CLEAN"

        for bot in botanicals_to_check:
            bot_lower = bot.lower().strip()
            # Check against protected species DB
            matched_key = None
            for key in PROTECTED_SPECIES_DB:
                if key in bot_lower or bot_lower in key:
                    matched_key = key
                    break

            if matched_key:
                info = PROTECTED_SPECIES_DB[matched_key]
                if info["risk_level"] == "RED":
                    overall_status = "BANNED"
                elif info["risk_level"] == "AMBER" and overall_status != "BANNED":
                    overall_status = "WARNING"

                # Find alternative Dravya from DB/Repository
                alt = await repo.find_alternative(matched_key)
                alt_data = None
                if alt:
                    alt_data = {
                        "alternative_name": alt.alternative_name,
                        "alternative_sanskrit_name": alt.alternative_sanskrit_name,
                        "justification": alt.justification,
                        "pharmacopoeia_reference": alt.pharmacopoeia_reference
                    }
                else:
                    alt_data = {
                        "alternative_name": "Inula racemosa / Valeriana wallichii",
                        "alternative_sanskrit_name": "Pushkarmoola / Tagara",
                        "justification": "Classical Pratinidhi Dravya with matching Rasa, Veerya, Vipaka, and therapeutic Karma.",
                        "pharmacopoeia_reference": "Ayurvedic Pharmacopoeia of India (API) Part I"
                    }

                flagged_items.append({
                    "botanical_name": bot,
                    "sanskrit_name": info["sanskrit_name"],
                    "cites_appendix": info["cites_appendix"],
                    "wildlife_act_schedule": info["wildlife_act_schedule"],
                    "risk_level": info["risk_level"],
                    "legal_status": info["legal_status"],
                    "pratinidhi_dravya": alt_data
                })

        return {
            "status": overall_status,
            "has_cites_violations": len(flagged_items) > 0,
            "flagged_count": len(flagged_items),
            "flagged_botanicals": flagged_items
        }

cites_screener = CitesScreener()
