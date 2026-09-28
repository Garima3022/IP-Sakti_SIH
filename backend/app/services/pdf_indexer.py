import os
import glob
import hashlib
import logging
from typing import List, Dict, Any, Optional
import fitz  # PyMuPDF

logger = logging.getLogger("pdf_indexer")

# Category mapping based on filename keywords
CATEGORY_MAPPINGS = [
    ("biodiversity", ["biological", "abs", "gazette_notification_of_abs"]),
    ("patents", ["patent", "guidelines for processing of patent"]),
    ("trademarks", ["trade mark", "trademark"]),
    ("designs", ["design", "designs act"]),
    ("geographical_indications", ["geographical", "gi"]),
    ("ayush_regulations", ["drugs and cosmetics", "2016drugsandcosmetics", "guidelines for ayush", "dmr_drug"]),
    ("food_and_cosmetics", ["ayurveda aahara", "food", "compendium"]),
    ("international_treaties", ["trips", "pct", "wipo"]),
    ("guidelines", ["guideline", "procedure"])
]

JURISDICTION_MAPPINGS = [
    ("International", ["trips", "pct", "wipo"]),
    ("India", ["patent law 1970", "biological diversity", "designs act", "trade mark", "ayurveda aahara", "drugs and cosmetics", "gazette", "guidelines for ayush", "dmr_drug"])
]

class PDFIndexerService:
    def __init__(self, source_dir: str):
        self.source_dir = source_dir
        self.documents: Dict[str, Dict[str, Any]] = {}
        self.chunks: List[Dict[str, Any]] = []
        self.indexing_stats = {
            "total": 0,
            "indexed": 0,
            "pending": 0,
            "errors": 0
        }

    def _determine_category(self, filename: str) -> str:
        fn_lower = filename.lower()
        for category, keywords in CATEGORY_MAPPINGS:
            if any(kw in fn_lower for kw in keywords):
                return category
        return "ayush_regulations"

    def _determine_jurisdiction(self, filename: str) -> str:
        fn_lower = filename.lower()
        for jurisdiction, keywords in JURISDICTION_MAPPINGS:
            if any(kw in fn_lower for kw in keywords):
                return jurisdiction
        return "India"

    def _compute_hash(self, filepath: str) -> str:
        hasher = hashlib.md5()
        with open(filepath, 'rb') as f:
            buf = f.read(65536)
            while len(buf) > 0:
                hasher.update(buf)
                buf = f.read(65536)
        return hasher.hexdigest()

    def discover_and_index_all(self) -> Dict[str, Any]:
        """Scans the source directory and indexes all PDF files."""
        if not os.path.exists(self.source_dir):
            logger.error(f"Source directory does not exist: {self.source_dir}")
            return self.get_stats()

        pdf_files = glob.glob(os.path.join(self.source_dir, "*.pdf"))
        self.indexing_stats["total"] = len(pdf_files)
        self.indexing_stats["indexed"] = 0
        self.indexing_stats["pending"] = 0
        self.indexing_stats["errors"] = 0

        self.documents.clear()
        self.chunks.clear()

        for idx, filepath in enumerate(pdf_files):
            filename = os.path.basename(filepath)
            doc_id = f"doc_{hashlib.md5(filename.encode()).hexdigest()[:10]}"
            
            try:
                doc_meta = self.index_single_pdf(doc_id, filepath, filename)
                if doc_meta["index_status"] == "indexed":
                    self.indexing_stats["indexed"] += 1
                else:
                    self.indexing_stats["errors"] += 1
            except Exception as e:
                logger.error(f"Failed to index {filename}: {str(e)}")
                self.indexing_stats["errors"] += 1
                self.documents[doc_id] = {
                    "id": doc_id,
                    "title": filename.replace(".pdf", "").replace("_", " ").title(),
                    "filename": filename,
                    "filepath": filepath,
                    "jurisdiction": self._determine_jurisdiction(filename),
                    "category": self._determine_category(filename),
                    "document_type": "statute",
                    "file_type": "pdf",
                    "file_size": os.path.getsize(filepath) if os.path.exists(filepath) else 0,
                    "page_count": 0,
                    "index_status": "error",
                    "verification_status": "unverified",
                    "file_hash": "",
                    "pages": {},
                    "error_message": str(e)
                }

        return self.get_stats()

    def index_single_pdf(self, doc_id: str, filepath: str, filename: str) -> Dict[str, Any]:
        file_hash = self._compute_hash(filepath)
        file_size = os.path.getsize(filepath)
        category = self._determine_category(filename)
        jurisdiction = self._determine_jurisdiction(filename)
        title = filename.replace(".pdf", "").replace("_", " ").title()

        doc_meta = {
            "id": doc_id,
            "title": title,
            "filename": filename,
            "filepath": filepath,
            "jurisdiction": jurisdiction,
            "category": category,
            "document_type": "statute/regulation",
            "file_type": "pdf",
            "file_size": file_size,
            "page_count": 0,
            "index_status": "pending",
            "verification_status": "official",
            "file_hash": file_hash,
            "pages": {}
        }

        pages_extracted = {}
        document_chunks = []

        try:
            pdf_doc = fitz.open(filepath)
            doc_meta["page_count"] = len(pdf_doc)

            chunk_counter = 1
            for page_num in range(len(pdf_doc)):
                page = pdf_doc.load_page(page_num)
                text = page.get_text("text") or ""
                clean_text = " ".join(text.split())
                actual_page_no = page_num + 1
                pages_extracted[actual_page_no] = clean_text

                # Page-aware chunking (~250 words per chunk)
                words = clean_text.split()
                chunk_size = 200
                overlap = 30
                
                if not words:
                    continue

                for i in range(0, len(words), chunk_size - overlap):
                    sub_words = words[i:i + chunk_size]
                    chunk_text = " ".join(sub_words)
                    if len(chunk_text.strip()) < 30:
                        continue

                    chunk_id = f"chunk_{doc_id}_{chunk_counter}"
                    chunk_counter += 1

                    chunk_obj = {
                        "chunk_id": chunk_id,
                        "source_id": doc_id,
                        "source_title": title,
                        "filename": filename,
                        "jurisdiction": jurisdiction,
                        "category": category,
                        "page_number": actual_page_no,
                        "section_reference": f"Page {actual_page_no}",
                        "text": chunk_text,
                        "verification_status": "official"
                    }
                    document_chunks.append(chunk_obj)

            pdf_doc.close()

            doc_meta["pages"] = pages_extracted
            doc_meta["index_status"] = "indexed" if len(document_chunks) > 0 else "empty"

            # Remove old chunks for this doc_id if any
            self.chunks = [c for c in self.chunks if c["source_id"] != doc_id]
            self.chunks.extend(document_chunks)

            self.documents[doc_id] = doc_meta
            return doc_meta

        except Exception as e:
            logger.error(f"Error reading PDF {filepath}: {e}")
            doc_meta["index_status"] = "error"
            doc_meta["error_message"] = str(e)
            self.documents[doc_id] = doc_meta
            return doc_meta

    def remove_from_index(self, doc_id: str) -> bool:
        if doc_id in self.documents:
            self.documents[doc_id]["index_status"] = "removed"
            self.chunks = [c for c in self.chunks if c["source_id"] != doc_id]
            return True
        return False

    def reindex_document(self, doc_id: str) -> Optional[Dict[str, Any]]:
        if doc_id in self.documents:
            doc_meta = self.documents[doc_id]
            return self.index_single_pdf(doc_id, doc_meta["filepath"], doc_meta["filename"])
        return None

    def get_stats(self) -> Dict[str, Any]:
        indexed_count = sum(1 for d in self.documents.values() if d.get("index_status") == "indexed")
        pending_count = sum(1 for d in self.documents.values() if d.get("index_status") == "pending")
        error_count = sum(1 for d in self.documents.values() if d.get("index_status") in ["error", "removed"])
        
        return {
            "total_discovered": len(self.documents),
            "successfully_indexed": indexed_count,
            "awaiting_processing": pending_count,
            "processing_errors": error_count,
            "total_chunks": len(self.chunks)
        }

    def get_all_documents(self) -> List[Dict[str, Any]]:
        docs = []
        for doc_id, meta in self.documents.items():
            doc_copy = {k: v for k, v in meta.items() if k != "pages"}
            docs.append(doc_copy)
        return docs

    def get_document_page_text(self, doc_id: str, page_number: int) -> Optional[str]:
        if doc_id in self.documents:
            pages = self.documents[doc_id].get("pages", {})
            return pages.get(page_number) or pages.get(str(page_number))
        return None

    def get_document_chunks(self, doc_id: str) -> List[Dict[str, Any]]:
        return [c for c in self.chunks if c["source_id"] == doc_id]

# Singleton instance initialized with PDF_SOURCE_DIR
from app.config import settings
pdf_indexer = PDFIndexerService(settings.PDF_SOURCE_DIR)
