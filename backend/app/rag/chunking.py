from typing import List, Dict, Any
from app.rag.statutory_data import STATUTORY_DOCUMENTS

class ParentChildChunker:
    """
    Hierarchical chunker parsing statutory regulatory documents into:
    - Parent Chunks (complete statutory section context ~1000 tokens)
    - Leaf Chunks (granular search chunks ~200 tokens)
    """

    def __init__(self, target_leaf_tokens: int = 200, parent_token_limit: int = 1000):
        self.target_leaf_tokens = target_leaf_tokens
        self.parent_token_limit = parent_token_limit

    def process_documents(self) -> Dict[str, Any]:
        parent_chunks = []
        leaf_chunks = []

        chunk_id_counter = 1

        for doc in STATUTORY_DOCUMENTS:
            doc_id = doc["doc_id"]
            doc_title = doc["title"]
            jurisdiction = doc["jurisdiction"]

            for sec in doc["sections"]:
                section_num = sec["section_number"]
                page_no = sec["page_no"]
                bbox = sec["bbox"]
                full_text = sec["content"]

                # Parent Chunk
                parent_id = f"parent_{doc_id}_{section_num.replace(' ', '_')}"
                parent_data = {
                    "parent_id": parent_id,
                    "doc_id": doc_id,
                    "title": doc_title,
                    "jurisdiction": jurisdiction,
                    "section_number": section_num,
                    "page_no": page_no,
                    "bbox": bbox,
                    "content": full_text
                }
                parent_chunks.append(parent_data)

                # Leaf Chunks split by sentence/words (~200 tokens)
                words = full_text.split()
                chunk_size = 50  # ~200 tokens assuming 4 chars/token or 50 words per leaf
                for i in range(0, len(words), chunk_size):
                    sub_words = words[i:i + chunk_size]
                    leaf_text = " ".join(sub_words)
                    leaf_id = f"leaf_{chunk_id_counter}"
                    chunk_id_counter += 1

                    leaf_chunks.append({
                        "leaf_id": leaf_id,
                        "parent_id": parent_id,
                        "doc_id": doc_id,
                        "title": doc_title,
                        "jurisdiction": jurisdiction,
                        "section_number": section_num,
                        "page_no": page_no,
                        "bbox": bbox,
                        "content": leaf_text
                    })

        return {
            "parent_chunks": parent_chunks,
            "leaf_chunks": leaf_chunks
        }
