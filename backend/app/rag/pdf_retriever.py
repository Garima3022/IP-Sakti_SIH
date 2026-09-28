import re
import math
import logging
from typing import List, Dict, Any, Optional
from app.services.pdf_indexer import pdf_indexer
from app.rag.hybrid_retriever import hybrid_retriever

logger = logging.getLogger("pdf_retriever")

class PDFRetriever:
    """
    Retrieval engine filtering and ranking page-aware PDF chunks extracted from statutory PDFs.
    """

    def _tokenize(self, text: str) -> List[str]:
        return re.findall(r'\b\w+\b', text.lower())

    def retrieve_chunks(
        self,
        query: str,
        jurisdiction: str = "India",
        category: Optional[str] = None,
        retrieval_mode: str = "pdf",
        top_k: int = 4
    ) -> List[Dict[str, Any]]:
        """
        Retrieves top_k chunks based on query matching and jurisdiction filter.
        """
        if retrieval_mode == "demo":
            # Fallback to hybrid retriever over statutory_data demo records
            parent_chunks = hybrid_retriever.retrieve(query, top_k=top_k)
            formatted = []
            for p in parent_chunks:
                formatted.append({
                    "chunk_id": p.get("parent_id"),
                    "source_id": p.get("doc_id"),
                    "source_title": p.get("title"),
                    "filename": f"{p.get('doc_id')}.pdf",
                    "jurisdiction": p.get("jurisdiction", "India"),
                    "category": "ayush_regulations",
                    "page_number": p.get("page_no", 1),
                    "section_reference": p.get("section_number", "Section Reference"),
                    "text": p.get("content", ""),
                    "relevance_score": round(p.get("rrf_score", 0.85), 3),
                    "verification_status": "demo_record"
                })
            return formatted

        # PDF Mode: retrieve from actual indexed chunks
        all_chunks = pdf_indexer.chunks
        if not all_chunks:
            # If index is empty, trigger discovery once
            pdf_indexer.discover_and_index_all()
            all_chunks = pdf_indexer.chunks

        # Filter active documents only
        active_docs = {d["id"]: d for d in pdf_indexer.get_all_documents() if d.get("index_status") == "indexed"}
        filtered_chunks = [c for c in all_chunks if c["source_id"] in active_docs]

        # Filter by Jurisdiction
        if jurisdiction in ["India", "International"]:
            filtered_chunks = [
                c for c in filtered_chunks
                if c.get("jurisdiction", "India") == jurisdiction or c.get("jurisdiction") == "Both"
            ]

        # Filter by Category if provided
        if category and category != "All Sources":
            filtered_chunks = [
                c for c in filtered_chunks
                if c.get("category", "") == category
            ]

        if not filtered_chunks:
            logger.warning(f"No indexed chunks matched filters: jurisdiction={jurisdiction}, category={category}")
            # Fallback: if empty, return all available chunks for query scoring
            filtered_chunks = [c for c in all_chunks if c["source_id"] in active_docs]

        query_tokens = set(self._tokenize(query))
        scored_chunks = []

        for chunk in filtered_chunks:
            chunk_tokens = self._tokenize(chunk["text"])
            if not chunk_tokens:
                continue

            # Calculate BM25 / Keyword Overlap score
            matches = sum(1 for t in chunk_tokens if t in query_tokens)
            title_matches = sum(2 for t in self._tokenize(chunk.get("source_title", "")) if t in query_tokens)
            
            score = (matches + title_matches) / math.sqrt(len(chunk_tokens) + 10)
            
            # Boost exact keyword matches
            query_lower = query.lower()
            if "patent" in query_lower and "patent" in chunk["text"].lower():
                score += 0.5
            if "abs" in query_lower or "biodiversity" in query_lower:
                if "biological" in chunk["text"].lower() or "abs" in chunk["text"].lower():
                    score += 0.5
            if "trademark" in query_lower and "trade mark" in chunk["text"].lower():
                score += 0.5
            if "design" in query_lower and "design" in chunk["text"].lower():
                score += 0.5

            chunk_copy = dict(chunk)
            chunk_copy["relevance_score"] = round(float(score), 3)
            scored_chunks.append(chunk_copy)

        # Sort by relevance score descending
        scored_chunks.sort(key=lambda x: x["relevance_score"], reverse=True)

        # Return top_k
        top_results = scored_chunks[:top_k]
        
        # Normalize scores to 0.70 - 0.99 range for clear visual display
        if top_results:
            max_s = max(r["relevance_score"] for r in top_results) or 1.0
            for r in top_results:
                r["relevance_score"] = round(0.70 + (r["relevance_score"] / max_s) * 0.28, 2)

        return top_results

pdf_retriever = PDFRetriever()
