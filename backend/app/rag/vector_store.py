import math
import re
from typing import List, Dict, Any

class InMemoryVectorStore:
    """
    High-performance in-memory Dense Vector & Term Similarity Index fallback.
    Computes TF-IDF dense cosine similarities across chunk embeddings.
    """

    def __init__(self):
        self.documents = []
        self.vocabulary = {}
        self.doc_vectors = []

    def fit_and_index(self, documents: List[Dict[str, Any]]):
        self.documents = documents
        all_words = set()

        for doc in documents:
            words = self._tokenize(doc["content"])
            all_words.update(words)

        self.vocabulary = {word: i for i, word in enumerate(sorted(all_words))}

        # Calculate TF-IDF vectors
        self.doc_vectors = []
        doc_count = len(documents)

        # Word document frequencies
        df = {}
        for word in self.vocabulary:
            df[word] = sum(1 for doc in documents if word in self._tokenize(doc["content"]))

        for doc in documents:
            vec = [0.0] * len(self.vocabulary)
            tokens = self._tokenize(doc["content"])
            tf = {}
            for t in tokens:
                tf[t] = tf.get(t, 0) + 1

            for t, count in tf.items():
                if t in self.vocabulary:
                    idx = self.vocabulary[t]
                    idf = math.log((doc_count + 1) / (df[t] + 1)) + 1
                    vec[idx] = count * idf

            # Normalize vector
            norm = math.sqrt(sum(x * x for x in vec))
            if norm > 0:
                vec = [x / norm for x in vec]

            self.doc_vectors.append(vec)

    def _tokenize(self, text: str) -> List[str]:
        return re.findall(r'\b\w+\b', text.lower())

    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        if not self.documents:
            return []

        tokens = self._tokenize(query)
        doc_count = len(self.documents)

        # Query vector
        q_vec = [0.0] * len(self.vocabulary)
        tf = {}
        for t in tokens:
            tf[t] = tf.get(t, 0) + 1

        for t, count in tf.items():
            if t in self.vocabulary:
                idx = self.vocabulary[t]
                idf = 1.5
                q_vec[idx] = count * idf

        q_norm = math.sqrt(sum(x * x for x in q_vec))
        if q_norm > 0:
            q_vec = [x / q_norm for x in q_vec]

        # Compute cosine similarity
        results = []
        for i, doc_vec in enumerate(self.doc_vectors):
            score = sum(qv * dv for qv, dv in zip(q_vec, doc_vec))
            results.append((score, self.documents[i]))

        # Sort descending
        results.sort(key=lambda x: x[0], reverse=True)

        hits = []
        for score, doc in results[:top_k]:
            hit = dict(doc)
            hit["vector_score"] = float(score)
            hits.append(hit)

        return hits
