from typing import Dict, List, Any

class ExportPathwayAnalyzer:
    """
    International Regulatory Export Route Analyzer for Ayurvedic & Botanical Formulations.
    Evaluates regulatory compliance roadmaps across India, US FDA, EU EMA, and GCC.
    """

    def analyze_export_routes(self, formulation_title: str, ingredients: List[Any], cites_status: str) -> Dict[str, Any]:
        has_cites_issue = cites_status in ["WARNING", "BANNED"]

        # US FDA Pathway
        us_fda = {
            "country": "United States (US FDA)",
            "dietary_supplement_pathway": {
                "feasibility": "HIGH" if not has_cites_issue else "MODERATE (Requires CITES Permit)",
                "governing_law": "DSHEA 1994 (21 CFR Part 111)",
                "requirements": [
                    "Structure/Function claims only (No disease prevention or treatment claims).",
                    "New Dietary Ingredient (NDI) notification 75 days prior if ingredient introduced post-1994.",
                    "Compliance with Dietary Supplement cGMP (21 CFR 111) & Heavy Metal limits."
                ]
            },
            "botanical_drug_nda_pathway": {
                "feasibility": "MODERATE - High Clinical Investment Required",
                "governing_law": "US FDA Guidance for Industry: Botanical Drug Development (2016)",
                "requirements": [
                    "Submit IND (Investigational New Drug) application with raw material fingerprinting.",
                    "Batch-to-batch consistency testing (HPLC / LC-MS chemical profiling).",
                    "Controlled Phase II/III clinical trials for specific therapeutic indication."
                ]
            }
        }

        # EU EMA Pathway
        eu_ema = {
            "country": "European Union (EU EMA)",
            "thmpd_pathway": {
                "feasibility": "HIGH (If 15-yr EU evidence exists)" if not has_cites_issue else "REQUIRES CITES & EU HERBAL MONOGRAPH",
                "governing_law": "Directive 2004/24/EC (THMPD Article 16a)",
                "requirements": [
                    "30-Year Traditional Use Proof (Minimum 15 years documented use within EU member states).",
                    "Compliance with EU Pharmacopoeia limits on Heavy Metals, Pesticides, and Aflatoxins.",
                    "Simplified registration without mandatory phase III clinical trial data."
                ]
            },
            "well_established_use_pathway": {
                "feasibility": "MODERATE",
                "governing_law": "Directive 2001/83/EC Article 10a",
                "requirements": [
                    "10+ years of established scientific literature demonstrating efficacy within the EU.",
                    "Detailed non-clinical and clinical bibliographical dossier."
                ]
            }
        }

        # GCC Pathway
        gcc = {
            "country": "GCC Countries (Saudi SFDA / UAE MOHAP)",
            "herbal_registration_pathway": {
                "feasibility": "HIGH" if not has_cites_issue else "CONDITIONAL ON LAB CLEARANCE",
                "governing_law": "GCC Guidelines for Registration of Herbal & Traditional Medicines (2021)",
                "requirements": [
                    "Certificate of Pharmaceutical Product (COPP) issued by Ministry of Ayush / CDSCO.",
                    "Strict heavy metal limits: Lead < 10 ppm, Arsenic < 3 ppm, Mercury < 1 ppm, Cadmium < 0.3 ppm.",
                    "Free from synthetic adulterants, steroids, and microbial contamination.",
                    "Halal certification for capsule shells and excipients."
                ]
            }
        }

        # Step-by-step Execution Roadmap
        roadmap_steps = [
            {
                "phase": "Phase 1: Phytochemical & Quality Standardization",
                "timeline": "Months 1 - 3",
                "tasks": [
                    "Establish botanical raw material identity (HPTLC fingerprinting & DNA barcoding).",
                    "Screen for Heavy Metals, Pesticide Residues, and Aflatoxins per WHO/ICH guidelines."
                ]
            },
            {
                "phase": "Phase 2: Domestic Approval & Licensing",
                "timeline": "Months 3 - 6",
                "tasks": [
                    "Obtain Manufacturing License under D&C Act Rule 158-B from State Licensing Authority.",
                    "Apply for COPP (Certificate of Pharmaceutical Product) from AYUSH / CDSCO."
                ]
            },
            {
                "phase": "Phase 3: Target Country Filing & Registration",
                "timeline": "Months 6 - 12",
                "tasks": [
                    "US FDA: File 75-Day NDI notification or IND for Botanical Drug route.",
                    "EU EMA: Submit THMPD dossier with 30-year traditional use dossier.",
                    "GCC: Submit SFDA/MOHAP dossier with COPP & Halal certificates."
                ]
            }
        ]

        return {
            "formulation_title": formulation_title,
            "cites_compliance_status": cites_status,
            "us_fda": us_fda,
            "eu_ema": eu_ema,
            "gcc": gcc,
            "roadmap_steps": roadmap_steps
        }

export_pathway_analyzer = ExportPathwayAnalyzer()
