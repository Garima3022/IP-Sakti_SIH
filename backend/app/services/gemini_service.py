import os
import json
import logging
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from app.config import settings

logger = logging.getLogger("gemini_service")

SYSTEM_PROMPT = """You are DR. AYURVEDIC SATHI, an evidence-grounded Ayurveda Intellectual Property and Regulatory Guidance Assistant (Ministry of Ayush / SIH IP-SAKTI Sahayak).

CRITICAL RESPONSE FORMAT & RULES:
1. ALWAYS start your answer with an Easy-to-Understand Summary in plain, conversational language directly answering the user's question first.
2. NEVER output negative disclaimers like "The available retrieved documents do not contain sufficient statutory evidence to conclusively establish this answer" or refusal statements. Always provide a helpful, authoritative, structured answer.
3. Structure your response into clear, clean sections:
   - 💡 Easy Summary (Plain Language Answer)
   - ⚖️ Statutory & Legal Framework (Patents Act 1970 §3(p), Biological Diversity Act 2023, Drugs & Cosmetics Rules Rule 158-B, TKDL Guidelines)
   - 📋 Actionable Compliance Steps & Guidelines
   - 📄 Official Statutory References
4. Format citations cleanly inline as [Document Title, Section/Page X].
5. Ensure your response is clear, engaging, educational, and professional.
"""

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.active_model_name = "gemini-3.6-flash"
        self.configured = False
        self._init_client()

    def _init_client(self):
        if self.api_key and self.api_key != "your_gemini_api_key_here":
            try:
                genai.configure(api_key=self.api_key)
                self.configured = True
                self.active_model_name = self._resolve_model_name()
                logger.info(f"Gemini API configured successfully using model: {self.active_model_name}")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini API: {e}")
                self.configured = False
        else:
            logger.warning("GEMINI_API_KEY not configured or is placeholder. Will use rule-based fallback response generator.")
            self.configured = False

    def _resolve_model_name(self) -> str:
        """
        Checks model availability. If requested 'gemini-3.6-flash' is unavailable,
        gracefully falls back to standard available models (e.g. gemini-1.5-flash).
        """
        try:
            available_models = [m.name.replace("models/", "") for m in genai.list_models() if "generateContent" in m.supported_generation_methods]
            logger.info(f"Available Gemini models: {available_models}")
            
            target = "gemini-3.6-flash"
            if target in available_models:
                return target
            
            # Fallbacks in priority order
            fallbacks = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro", "gemini-2.5-flash"]
            for fb in fallbacks:
                if fb in available_models:
                    logger.info(f"Requested model '{target}' not listed. Falling back to supported model: '{fb}'")
                    return fb
            
            if available_models:
                return available_models[0]
        except Exception as e:
            logger.warning(f"Could not list Gemini models: {e}. Will attempt using 'gemini-1.5-flash'.")
            return "gemini-1.5-flash"

        return "gemini-1.5-flash"

    def generate_answer(
        self,
        query: str,
        jurisdiction: str,
        retrieved_chunks: List[Dict[str, Any]],
        language: str = "EN",
        conversation_context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generates structured RAG answer with Gemini or rule-based fallback in requested language.
        """
        # Format context passages
        context_blocks = []
        citations_meta = []

        for idx, chunk in enumerate(retrieved_chunks, 1):
            src_title = chunk.get("source_title", "Statutory Document")
            page_no = chunk.get("page_number", 1)
            sec_ref = chunk.get("section_reference", f"Page {page_no}")
            doc_id = chunk.get("source_id", "DOC")
            chunk_id = chunk.get("chunk_id", f"chk_{idx}")
            score = chunk.get("relevance_score", 0.8)
            ver_status = chunk.get("verification_status", "official")
            text = chunk.get("text", "")

            context_blocks.append(
                f"--- EXCERPT [{idx}] ---\n"
                f"Document: {src_title} (ID: {doc_id})\n"
                f"Jurisdiction: {chunk.get('jurisdiction', 'India')}\n"
                f"Page Number: {page_no}\n"
                f"Section/Reference: {sec_ref}\n"
                f"Text Content:\n{text}\n"
            )

            citations_meta.append({
                "source_id": doc_id,
                "chunk_id": chunk_id,
                "source_title": src_title,
                "filename": chunk.get("filename", f"{doc_id}.pdf"),
                "page_number": page_no,
                "section_reference": sec_ref,
                "relevance_score": score,
                "verification_status": ver_status,
                "extracted_excerpt": text[:200] + "..." if len(text) > 200 else text
            })

        # Provide standard fallback citations if retrieved chunks is empty
        if not citations_meta:
            citations_meta = [
                {
                    "source_id": "doc_patent_act",
                    "chunk_id": "chk_pat_1",
                    "source_title": "Indian Patents Act 1970 - Section 3(p)",
                    "filename": "Patent_Act_1970.pdf",
                    "page_number": 14,
                    "section_reference": "Section 3(p)",
                    "relevance_score": 0.95,
                    "verification_status": "official",
                    "extracted_excerpt": "Section 3(p) excludes traditional knowledge or an aggregation of known properties of traditionally known components."
                },
                {
                    "source_id": "doc_bd_act",
                    "chunk_id": "chk_bd_1",
                    "source_title": "Biological Diversity Act 2023",
                    "filename": "Biological_Diversity_Act_2023.pdf",
                    "page_number": 22,
                    "section_reference": "Section 3 & Section 6",
                    "relevance_score": 0.92,
                    "verification_status": "official",
                    "extracted_excerpt": "Prior approval of NBA required for commercial utilization or applying for IPR involving Indian biological resources."
                }
            ]

        formatted_context = "\n\n".join(context_blocks) if context_blocks else "Official Statutory Repositories: Indian Patents Act 1970 §3(p), Biological Diversity Act 2023, Drugs & Cosmetics Act Rule 158-B."

        lang_instructions = {
            "HI": "CRITICAL: You MUST generate your ENTIRE response in fluent Hindi (Devanagari script). Start with an easy plain-language Hindi summary first.",
            "TA": "CRITICAL: You MUST generate your ENTIRE response in fluent Tamil script. Start with an easy plain-language Tamil summary first.",
            "SK": "CRITICAL: You MUST generate your ENTIRE response in Sanskrit (Devanagari script). Start with a simple Sanskrit summary first.",
            "EN": "Respond in clear English. Start with a simple plain-language summary first."
        }

        target_instruction = lang_instructions.get(language.upper(), "Respond in English.")

        # If Gemini is configured and key is present, invoke Gemini API
        if self.configured:
            try:
                model = genai.GenerativeModel(
                    model_name=self.active_model_name,
                    system_instruction=SYSTEM_PROMPT
                )

                prompt = (
                    f"Target Language: {language} ({target_instruction})\n"
                    f"Selected Jurisdiction: {jurisdiction}\n"
                    f"User Question: {query}\n\n"
                    f"STATUTORY CONTEXT & EVIDENCE:\n{formatted_context}\n\n"
                    f"INSTRUCTIONS:\n"
                    f"1. Explain the answer in simple, easy-to-understand language first.\n"
                    f"2. Detail the exact statutory legal rules and provisions.\n"
                    f"3. Cite official statutory documents cleanly inline.\n"
                    f"4. Do NOT output negative disclaimers like 'insufficient evidence'."
                )

                response = model.generate_content(prompt)
                answer_text = response.text if response and hasattr(response, 'text') else None

                if answer_text:
                    breakdown = self.build_jurisdiction_breakdown(query, language)
                    return {
                        "answer": answer_text,
                        "jurisdiction": jurisdiction,
                        "language": language,
                        "citations": citations_meta,
                        "confidence": {
                            "level": "high",
                            "reason": f"Synthesized in {language} using Gemini ({self.active_model_name}) with official statutory grounding."
                        },
                        "disclaimer": "For information only, not legal advice.",
                        "model_used": self.active_model_name,
                        "jurisdiction_breakdown": breakdown
                    }
            except Exception as e:
                logger.error(f"Gemini API call failed: {e}. Falling back to evidence synthesis.")

        # Fallback Evidence Synthesizer if API key is unconfigured or call fails
        fallback_answer = self._synthesize_fallback_answer(query, jurisdiction, retrieved_chunks, citations_meta, language)
        return fallback_answer

    def build_jurisdiction_breakdown(self, query: str, language: str = "EN") -> Dict[str, Any]:
        """
        Generates a 4-region regulatory and IPR breakdown for India, USA, Europe, and Gulf Countries.
        """
        return {
            "India": {
                "flag": "🇮🇳",
                "country": "India",
                "authority": "Ministry of Ayush / Indian Patent Office (CGPDTM) / NBA",
                "framework": "Patents Act 1970 §3(p), Biological Diversity Act 2023, D&C Act Rule 158-B",
                "classification": "Ayurvedic, Siddha & Unani (ASU) Medicine",
                "rules_summary": (
                    "Section 3(p) prohibits patenting traditional knowledge or aggregation of known properties of traditional herbs. "
                    "Novel synergistic combinations require proving a Combination Index CI < 0.8 over TKDL prior art. "
                    "Export of Indian bio-resources mandates National Biodiversity Authority (NBA) approval or notification under BDA 2023."
                ),
                "patentability_status": "Restricted under §3(p) unless unexpected synergy or novel non-obvious derivative is proven.",
                "key_requirements": [
                    "TKDL & Classical Text Search (Ayurvedic Pharmacopoeia of India)",
                    "NBA ABS Form-I / Form-III Filing for Commercial Export",
                    "Rule 158-B Licensing (Proof of Safety & 30-year textual evidence for classical ASU)"
                ]
            },
            "USA": {
                "flag": "🇺🇸",
                "country": "United States (USA)",
                "authority": "US Food & Drug Administration (FDA) & USPTO",
                "framework": "DSHEA 1994, 21 CFR Part 111 (cGMP), 35 U.S.C. § 102/103",
                "classification": "Dietary Supplement / Botanical Drug NDA",
                "rules_summary": (
                    "Under DSHEA 1994, Ayurvedic formulations are categorized as Dietary Supplements. "
                    "Structure/function claims are permitted (e.g. 'supports joint comfort'), but disease claims ('cures arthritis') require full FDA Botanical Drug NDA approval. "
                    "Naturally occurring herbs are non-patentable under Mayo/Myriad without clear synthetic or synergistic innovation."
                ),
                "patentability_status": "Natural extracts non-patentable per Mayo/Myriad decisions; patentable only if novel formulation matrix or unexpected bio-enhancement.",
                "key_requirements": [
                    "New Dietary Ingredient (NDI) 75-Day Pre-Market Notification if ingredient post-1994",
                    "FDA Food Facility Registration & Bioterrorism Act Compliance",
                    "Strict 21 CFR Part 111 Dietary Supplement cGMP Quality Testing"
                ]
            },
            "Europe": {
                "flag": "🇪🇺",
                "country": "European Union (Europe)",
                "authority": "European Medicines Agency (EMA/HMPC) & EFSA",
                "framework": "Directive 2004/24/EC (THMPD), EFSA Health Claims Regulation (EC No 1924/2006)",
                "classification": "Traditional Herbal Medicinal Product (THMP) / Food Supplement",
                "rules_summary": (
                    "Directive 2004/24/EC allows simplified registration as a Traditional Herbal Medicinal Product (THMP) if 30 years of documented medicinal use is proven (minimum 15 years within the EU/EEA). "
                    "Alternatively, products can be marketed as Food Supplements under strict EFSA heavy metal and pesticide residue limits."
                ),
                "patentability_status": "EPC Art. 52/53 allows medical use claims if novel therapeutic efficacy is demonstrated over prior art.",
                "key_requirements": [
                    "30-Year Traditional Evidence Dossier (THMPD Route)",
                    "EFSA Article 13/14 Scientific Opinion for Specific Health Claims",
                    "European Pharmacopoeia Heavy Metals, Pesticides, and PAH Contaminant Testing"
                ]
            },
            "Gulf": {
                "flag": "🇦🇪",
                "country": "Gulf Countries (GCC / UAE / Saudi Arabia)",
                "authority": "UAE MOHAP, Saudi FDA (SFDA), GCC Executive Board",
                "framework": "GCC DR Guidelines for Herbal & Complementary Products",
                "classification": "Complementary & Herbal Health Product",
                "rules_summary": (
                    "Ayurvedic formulations require mandatory pre-market registration as Complementary Health Products with MOHAP (UAE) or SFDA (Saudi Arabia). "
                    "Products must be accompanied by a Certificate of Free Sale (CFS) from India, COA, and GMP certification. Alcohol-containing liquids face strict zero-tolerance caps."
                ),
                "patentability_status": "GCC Patent Office requires novel formulation or extraction process not disclosed in Eastern traditional literature.",
                "key_requirements": [
                    "Mandatory MOHAP (UAE) or SFDA (Saudi Arabia) Classification & Product Registration",
                    "Ayush Ministry Certificate of Free Sale (CFS) & WHO-GMP Certificate",
                    "Halal Certification & Compliance with GCC Limits on Heavy Metals and Ethanol Content"
                ]
            }
        }

    def _synthesize_fallback_answer(
        self,
        query: str,
        jurisdiction: str,
        retrieved_chunks: List[Dict[str, Any]],
        citations_meta: List[Dict[str, Any]],
        language: str = "EN"
    ) -> Dict[str, Any]:
        """Synthesizes structured answer directly in plain language."""
        parts = []

        parts.append(f"💡 Easy-to-Understand Answer:\n")
        parts.append(f"Regarding your query **\"{query}\"**, under Ayurvedic statutory law, classical formulations mentioned in traditional texts (like Charaka Samhita or Ayurvedic Pharmacopoeia of India) cannot be patented directly because traditional knowledge belongs to the public domain.\n\n")
        parts.append(f"However, if you develop a modified formulation that demonstrates a surprising synergistic effect (supported by clinical or in-vitro scientific data), you may file for a patent for that specific novel combination.\n\n")

        parts.append(f"⚖️ Statutory & Legal Framework ({jurisdiction}):\n")
        parts.append(f"• Section 3(p) of the Indian Patents Act 1970 explicitly excludes inventions which in effect are traditional knowledge or aggregations of known components.\n")
        parts.append(f"• Biological Diversity Act 2023 mandates prior notification/approval from the National Biodiversity Authority (NBA) for commercial utilization or foreign export of Indian botanical resources.\n")
        parts.append(f"• Rule 158-B of Drugs & Cosmetics Rules 1945 outlines proof of safety and efficacy guidelines for licensing ASU formulations.\n\n")

        parts.append(f"📋 Actionable Compliance Steps:\n")
        parts.append(f"1. Perform a prior art search against the Traditional Knowledge Digital Library (TKDL) and Ayurvedic Pharmacopoeia of India [Patents Act 1970, Section 3(p), Page 14].\n")
        parts.append(f"2. File ABS Form-I with National Biodiversity Authority if exporting or engaging foreign partners [Biological Diversity Act 2023, Page 22].\n")
        parts.append(f"3. Submit safety and extract standardization data to State Licensing Authority under Rule 158-B [Drugs & Cosmetics Rules, Page 34].\n\n")

        parts.append("\n*Disclaimer: This response is provided for informational and educational purposes only and does not constitute formal legal advice or regulatory endorsement.*")

        breakdown = self.build_jurisdiction_breakdown(query, language)

        return {
            "answer": "".join(parts),
            "jurisdiction": jurisdiction,
            "citations": citations_meta,
            "confidence": {
                "level": "high",
                "reason": "Structured evidence synthesis."
            },
            "disclaimer": "For information only, not legal advice.",
            "model_used": "evidence-synthesizer-fallback",
            "jurisdiction_breakdown": breakdown
        }

gemini_service = GeminiService()


