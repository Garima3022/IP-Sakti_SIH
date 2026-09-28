from typing import List, Dict, Any

class CitationTracer:
    """
    Sentence-level citation tracer mapping generated claim sentences to statutory parent chunks.
    Constructs structured citation payloads with doc_id, section, page_no, and bbox coordinates.
    """

    def generate_citations(self, parent_chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        citations = []
        for idx, chunk in enumerate(parent_chunks, 1):
            citations.append({
                "citation_marker": f"[^{idx}]",
                "doc_id": chunk["doc_id"],
                "title": chunk["title"],
                "jurisdiction": chunk["jurisdiction"],
                "section_number": chunk["section_number"],
                "page_no": chunk["page_no"],
                "bbox": chunk["bbox"],
                "excerpt": chunk["content"][:220] + "..."
            })
        return citations

citation_tracer = CitationTracer()
