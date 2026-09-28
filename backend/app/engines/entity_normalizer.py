import re
from typing import Dict, List, Any

# Knowledge mapping of vernacular/Sanskrit terms to standardized botanical binomials
BOTANICAL_SYNONYMS = {
    # Sanskrit & Hindi -> Botanical Binomial
    "kushta": "Saussurea costus",
    "kuth": "Saussurea costus",
    "कुठ": "Saussurea costus",
    "कुष्ठ": "Saussurea costus",
    "rakta chandana": "Pterocarpus santalinus",
    "red sanders": "Pterocarpus santalinus",
    "रक्तचंदन": "Pterocarpus santalinus",
    "சந்தனம்": "Pterocarpus santalinus",
    "jatamansi": "Nardostachys jatamansi",
    "spikenard": "Nardostachys jatamansi",
    "जटामांसी": "Nardostachys jatamansi",
    "ஜடாமாஞ்சி": "Nardostachys jatamansi",
    "sarpagandha": "Rauvolfia serpentina",
    "snakeroot": "Rauvolfia serpentina",
    "सर्पगंधा": "Rauvolfia serpentina",
    "சர்ப்பகந்தா": "Rauvolfia serpentina",
    "agaru": "Aquilaria agallocha",
    "agarwood": "Aquilaria agallocha",
    "अगुरु": "Aquilaria agallocha",
    "ashwagandha": "Withania somnifera",
    "अश्वगंधा": "Withania somnifera",
    "அமுக்கரா": "Withania somnifera",
    "guduchi": "Tinospora cordifolia",
    "giloy": "Tinospora cordifolia",
    "गिलोय": "Tinospora cordifolia",
    "tulsi": "Ocimum sanctum",
    "तुलसी": "Ocimum sanctum",
    "turmeric": "Curcuma longa",
    "haridra": "Curcuma longa",
    "हल्दी": "Curcuma longa",
    "shatavari": "Asparagus racemosus",
    "शतावरी": "Asparagus racemosus",
    "brahmi": "Bacopa monnieri",
    "ब्राह्मी": "Bacopa monnieri",
    "pushkarmoola": "Inula racemosa",
    "पुष्करमूल": "Inula racemosa",
    "tagara": "Valeriana wallichii",
    "तगर": "Valeriana wallichii",
    "manjistha": "Rubia cordifolia",
    "मंजीष्ठा": "Rubia cordifolia"
}

class EntityNormalizer:
    """
    Multilingual ingress entity normalizer parsing query text or ingredient lists
    and resolving Hindi, Tamil, and Sanskrit Dravya names to Latin botanical binomials.
    """

    def normalize_text(self, text: str) -> Dict[str, Any]:
        found_botanicals = []
        text_lower = text.lower()

        for term, botanical in BOTANICAL_SYNONYMS.items():
            if term in text_lower:
                if botanical not in found_botanicals:
                    found_botanicals.append(botanical)

        # Direct Latin binomial regex match
        binomial_matches = re.findall(r'\b[A-Z][a-z]+\s+[a-z]+\b', text)
        for binom in binomial_matches:
            if binom not in found_botanicals:
                found_botanicals.append(binom)

        return {
            "original_text": text,
            "detected_botanicals": found_botanicals
        }

entity_normalizer = EntityNormalizer()
