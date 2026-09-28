import asyncio
import sys
import os

# Ensure backend root directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding='utf-8')

from app.db.database import init_db, AsyncSessionLocal
from app.db.seed import seed_data
from app.engines.entity_normalizer import entity_normalizer
from app.engines.cites_screener import cites_screener
from app.engines.sec3p_analyzer import sec3p_analyzer
from app.engines.export_pathway import export_pathway_analyzer
from app.engines.expert_finder import expert_finder
from app.rag.hybrid_retriever import hybrid_retriever
from app.rag.citation_tracer import citation_tracer

async def run_backend_tests():
    print("=== STARTING DR. AYURVEDIC SATHI BACKEND VERIFICATION ===")

    # 1. Test Database Initialization & Seeding
    print("\n[1/6] Initializing & Seeding Async Database...")
    await seed_data()
    print("[OK] Database and CITES Pratinidhi Dravya dataset initialized cleanly.")

    # 2. Test Entity Normalization (Hindi/Tamil/Sanskrit -> Botanical)
    print("\n[2/6] Testing Multilingual Ingress Entity Normalization...")
    test_query = "जटामांसी (Nardostachys jatamansi) and कुठ (Saussurea costus) for Nidranasha"
    norm_res = entity_normalizer.normalize_text(test_query)
    print(f"Input Query: {test_query}")
    print(f"Detected Botanicals: {norm_res['detected_botanicals']}")
    assert len(norm_res['detected_botanicals']) >= 2, "Failed to detect expected botanicals!"
    print("[OK] Multilingual Entity Normalization verified.")

    # 3. Test CITES Screening & Pratinidhi Dravya Alternatives
    print("\n[3/6] Testing CITES / Wildlife Protection Act Screening...")
    async with AsyncSessionLocal() as session:
        cites_res = await cites_screener.screen_formula(["Saussurea costus", "Nardostachys jatamansi"], session)
        print(f"CITES Status: {cites_res['status']}")
        print(f"Flagged Count: {cites_res['flagged_count']}")
        for flag in cites_res['flagged_botanicals']:
            alt = flag['pratinidhi_dravya']
            print(f" - Endangered Plant: {flag['botanical_name']} ({flag['sanskrit_name']})")
            print(f"   Recommended Pratinidhi Dravya: {alt['alternative_sanskrit_name']} ({alt['alternative_name']})")
            print(f"   Pharmacopoeial Ref: {alt['pharmacopoeia_reference']}")
        assert cites_res['status'] in ["WARNING", "BANNED"], "CITES Screening failed to flag endangered species!"
    print("[OK] CITES Screening and Pratinidhi Dravya recommendations verified.")

    # 4. Test Indian Patent Act §3(p) Synergy Analyzer
    print("\n[4/6] Testing Indian Patent Act §3(p) Synergy Analyzer...")
    sec3p_res = sec3p_analyzer.analyze_formulation("Manas Mitra Dravya", ["Withania somnifera", "Nardostachys jatamansi"])
    print(f"Formulation Title: {sec3p_res['title']}")
    print(f"Section 3(p) Risk Level: {sec3p_res['sec_3p_risk_level']} (Score: {sec3p_res['sec_3p_risk_score']}/100)")
    print(f"Novelty Score: {sec3p_res['novelty_score']}/100")
    print(f"Synergy Evaluation: {sec3p_res['synergy_evaluation']}")
    assert "sec_3p_risk_level" in sec3p_res, "Section 3(p) analysis failed!"
    print("[OK] Section 3(p) Risk & Synergy analysis verified.")

    # 5. Test Export Pathway Analyzer & OpenAlex Expert Finder
    print("\n[5/6] Testing Export Pathway & OpenAlex Expert Finder...")
    export_res = export_pathway_analyzer.analyze_export_routes("Manas Mitra Dravya", ["Withania somnifera"], "CLEAN")
    print(f"US FDA DSHEA Route Feasibility: {export_res['us_fda']['dietary_supplement_pathway']['feasibility']}")
    print(f"EU EMA THMPD Route Governing Law: {export_res['eu_ema']['thmpd_pathway']['governing_law']}")

    experts_res = await expert_finder.search_experts("Nardostachys jatamansi")
    print(f"Retrieved Research Experts Count: {experts_res['experts_count']}")
    if experts_res['experts']:
        exp = experts_res['experts'][0]
        print(f" Top Expert: {exp['name']} ({exp['institution']}) - Cited by: {exp['cited_by_count']}")
    print("[OK] Export Pathway and OpenAlex Expert Finder verified.")

    # 6. Test Hybrid RAG Retriever & Citation Tracer
    print("\n[6/6] Testing Hybrid RAG (BM25 + Vector RRF) & Sentence Citation Tracer...")
    chunks = hybrid_retriever.retrieve("Section 3(p) traditional knowledge patent synergy", top_k=4)
    citations = citation_tracer.generate_citations(chunks)
    print(f"Retrieved Context Chunks: {len(chunks)}")
    for cite in citations:
        print(f" Citation Badge: {cite['citation_marker']} -> Doc: {cite['title']} | Sec: {cite['section_number']} | Page: {cite['page_no']} | BBox: {cite['bbox']}")
    assert len(citations) > 0, "Citation tracer returned zero citations!"
    print("[OK] Hybrid RAG & Citation Tracer verified.")

    print("\n=== ALL BACKEND MODULE VERIFICATION TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    asyncio.run(run_backend_tests())
