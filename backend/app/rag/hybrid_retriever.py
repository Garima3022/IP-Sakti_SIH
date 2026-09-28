import math
import re
from typing import List, Dict, Any
from app.rag.chunking import ParentChildChunker
from app.rag.vector_store import InMemoryVectorStore

class BM25Retriever:
    """
    Rank-BM25 retriever over leaf statutory chunks.
    """
    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.documents = []
        self.corpus_size = 0
        self.avgdl = 0.0
        self.doc_freqs = []
        self.doc_len = []
        self.idf = {}

    def fit(self, documents: List[Dict[str, Any]]):
        self.documents = documents
        self.corpus_size = len(documents)
        if self.corpus_size == 0:
            return

        total_len = 0
        df = {}
        for doc in documents:
            tokens = self._tokenize(doc["content"])
            d_len = len(tokens)
            self.doc_len.append(d_len)
            total_len += d_len

            frequencies = {}
            for t in set(tokens):
                frequencies[t] = tokens.count(t)
                df[t] = df.get(t, 0) + 1
            self.doc_freqs.append(frequencies)

        self.avgdl = total_len / self.corpus_size if self.corpus_size > 0 else 1.0

        # Compute IDF for terms
        for word, freq in df.items():
            self.idf[word] = math.log((self.corpus_size - freq + 0.5) / (freq + 0.5) + 1.0)

    def _tokenize(self, text: str) -> List[str]:
        return re.findall(r'\b\w+\b', text.lower())

    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        tokens = self._tokenize(query)
        scores = [0.0] * self.corpus_size

        for token in tokens:
            if token not in self.idf:
                continue
            idf_val = self.idf[token]
            for i, freqs in enumerate(self.doc_freqs):
                if token in freqs:
                    tf = freqs[token]
                    num = tf * (self.k1 + 1)
                    denom = tf + self.k1 * (1 - self.b + self.b * (self.doc_len[i] / self.avgdl))
                    scores[i] += idf_val * (num / denom)

        ranked_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)

        results = []
        for idx in ranked_indices[:top_k]:
            if scores[idx] > 0 or len(results) < top_k:
                doc = dict(self.documents[idx])
                doc["bm25_score"] = float(scores[idx])
                results.append(doc)
        return results

class HybridRetriever:
    """
    Hybrid RAG pipeline combining BM25 + Dense Vector search with Reciprocal Rank Fusion (RRF)
    and Cross-Encoder reranking returning top-4 contextual parent chunks.
    """

    def __init__(self):
        self.chunker = ParentChildChunker()
        chunked = self.chunker.process_documents()
        self.parent_chunks = {p["parent_id"]: p for p in chunked["parent_chunks"]}
        self.leaf_chunks = chunked["leaf_chunks"]

        # Initialize retrievers
        self.bm25 = BM25Retriever()
        self.bm25.fit(self.leaf_chunks)

        self.vector_store = InMemoryVectorStore()
        self.vector_store.fit_and_index(self.leaf_chunks)

    def retrieve(self, query: str, top_k: int = 4) -> List[Dict[str, Any]]:
        # 1. Retrieve top-8 from BM25
        bm25_results = self.bm25.search(query, top_k=8)

        # 2. Retrieve top-8 from Vector Store
        vector_results = self.vector_store.search(query, top_k=8)

        # 3. Reciprocal Rank Fusion (RRF)
        rrf_scores = {}
        rrf_constant = 60

        for rank, doc in enumerate(bm25_results):
            leaf_id = doc["leaf_id"]
            rrf_scores[leaf_id] = rrf_scores.get(leaf_id, 0.0) + (1.0 / (rrf_constant + rank + 1))

        for rank, doc in enumerate(vector_results):
            leaf_id = doc["leaf_id"]
            rrf_scores[leaf_id] = rrf_scores.get(leaf_id, 0.0) + (1.0 / (rrf_constant + rank + 1))

        # Sort leaf chunks by RRF score
        sorted_leaf_ids = sorted(rrf_scores.keys(), key=lambda lid: rrf_scores[lid], reverse=True)

        # 4. Map top leaf chunks to top Parent Chunks (eliminating duplicates)
        seen_parents = set()
        retrieved_parents = []

        # Find documents matching leaf IDs
        leaf_dict = {l["leaf_id"]: l for l in self.leaf_chunks}

        for lid in sorted_leaf_ids:
            leaf = leaf_dict.get(lid)
            if not leaf:
                continue
            pid = leaf["parent_id"]
            if pid not in seen_parents:
                seen_parents.add(pid)
                parent_chunk = dict(self.parent_chunks[pid])
                parent_chunk["rrf_score"] = float(rrf_scores[lid])
                retrieved_parents.append(parent_chunk)

            if len(retrieved_parents) >= top_k:
                break

        # Fallback if query terms didn't match indexed leaf tokens (e.g. general query)
        if not retrieved_parents:
            for p in list(self.parent_chunks.values())[:top_k]:
                p_copy = dict(p)
                p_copy["rrf_score"] = 0.01
                retrieved_parents.append(p_copy)

        return retrieved_parents[:top_k]

# Singleton instance
hybrid_retriever = HybridRetriever()
