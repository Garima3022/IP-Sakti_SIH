from typing import Dict, List, Any
from app.engines.entity_normalizer import entity_normalizer

class Sec3pAnalyzer:
    """
    Indian Patent Act §3(p) Non-Patentability Risk & Synergy Analyzer.
    Evaluates traditional knowledge aggregation vs non-obvious synergistic efficacy.
    """

    def analyze_formulation(self, title: str, text_or_ingredients: Any) -> Dict[str, Any]:
        detected_herbs = []
        if isinstance(text_or_ingredients, str):
            norm = entity_normalizer.normalize_text(text_or_ingredients)
            detected_herbs = norm["detected_botanicals"]
        elif isinstance(text_or_ingredients, list):
            for ing in text_or_ingredients:
                if isinstance(ing, dict):
                    name = ing.get("botanical_name") or ing.get("name") or ing.get("sanskrit_name", "")
                else:
                    name = str(ing)
                norm = entity_normalizer.normalize_text(name)
                detected_herbs.extend(norm["detected_botanicals"])

        herb_count = len(detected_herbs)

        # Baseline evaluation
        if herb_count == 0:
            risk_score = 45.0
            risk_level = "MODERATE"
            synergy_status = "Undetermined - No specific classical botanicals identified."
        elif herb_count == 1:
            risk_score = 85.0
            risk_level = "HIGH"
            synergy_status = "High Section 3(p) Risk - Single traditional plant extract without novel modification is deemed traditional knowledge."
        elif herb_count in [2, 3]:
            risk_score = 65.0
            risk_level = "MODERATE"
            synergy_status = "Moderate Risk - Aggregation of known herbs. Must provide unexpected synergistic index (Combination Index < 0.8)."
        else:
            # Multi-herbal combination requires detailed synergy ratio proof
            risk_score = 55.0
            risk_level = "MODERATE"
            synergy_status = "Poly-herbal formulation. Synergistic interaction proof required to establish non-obviousness over classical references."

        # Check for synergy keywords in title/text
        text_full = f"{title} {str(text_or_ingredients)}".lower()
        has_ratio = "ratio" in text_full or "%" in text_full or "fraction" in text_full or "nanoparticle" in text_full
        has_synergy_claim = "synerg" in text_full or "inhibition" in text_full or "enhancement" in text_full

        if has_ratio and has_synergy_claim:
            risk_score = max(15.0, risk_score - 35.0)
            if risk_score < 30.0:
                risk_level = "LOW"

        actionable_recommendations = [
            "Conduct in-vitro / in-vivo comparative bio-assays comparing the combination against individual herbal components alone.",
            "Calculate Combination Index (CI < 1.0) or Isobologram analysis to empirically prove true pharmacological synergy.",
            "Specify standardized extract ratios (e.g. 4:1 aqueous-ethanolic fraction) rather than raw crude powder mixtures.",
            "Establish TKDL (Traditional Knowledge Digital Library) clearance report demonstrating absence of identical classical indication in Charaka/Sushruta/Sahasrayogam."
        ]

        return {
            "title": title,
            "detected_botanicals": detected_herbs,
            "sec_3p_risk_level": risk_level,
            "sec_3p_risk_score": round(risk_score, 1),
            "novelty_score": round(100.0 - risk_score, 1),
            "synergy_evaluation": synergy_status,
            "is_patentable_eligible": risk_level in ["LOW", "MODERATE"],
            "actionable_recommendations": actionable_recommendations
        }

sec3p_analyzer = Sec3pAnalyzer()
