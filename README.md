# DR. Ayurvedic Sathi (SIH Problem Statement: IP-SAKTI Sahayak)

🌿 **DR. Ayurvedic Sathi** is an end-to-end, multilingual RAG-driven AI platform built for Ayurvedic formulations, Intellectual Property compliance (Indian Patent Act §3(p)), CITES/Wildlife Protection Act botanical screening, international regulatory export roadmaps (US FDA, EU EMA THMPD, GCC), and global research scholar discovery.

---

## 🌟 Key Features

1. **Multilingual Ingress & Entity Normalization:**
   - Supports English, Hindi (हिंदी), Tamil (தமிழ்), and Sanskrit terminology (*Nirdeshana, Dravya, Pratinidhi Dravya, Rasa, Veerya, Vipaka*).
   - Normalizes vernacular plant names (e.g., *Jatamansi, Chandana, Sarpagandha, Kuth*) into Latin botanical binomials (*Nardostachys jatamansi, Pterocarpus santalinus, Rauvolfia serpentina, Saussurea costus*).

2. **Automated CITES & Wildlife Protection Act Screening:**
   - Screens input formulation ingredients against CITES Appendices I & II and Indian Wildlife Protection Act 1972 (Schedule VI).
   - Flags endangered species (RED/AMBER alerts).
   - Recommends classical Ayurvedic bio-equivalent substitutes (*Pratinidhi Dravya*) with matching *Rasa, Veerya, Vipaka, Karma* properties from the Ayurvedic Pharmacopoeia of India (API).

3. **Indian Patent Act §3(p) Non-Patentability Risk Analyzer:**
   - Evaluates traditional knowledge aggregation vs. synergistic non-obviousness.
   - Computes Section 3(p) Risk Score (0-100) and Synergistic Novelty Index.
   - Provides actionable steps to establish true empirical synergy (Combination Index < 0.8) and overcome patent objections.

4. **Sentence-Level Statutory RAG & Interactive Inspector:**
   - Hybrid BM25 + Dense Vector Search with Reciprocal Rank Fusion (RRF).
   - Sentence-level source citations `[^1]` mapped to exact statutory document titles, page numbers, and bounding-box coordinates `[x0, y0, x1, y1]`.
   - Clicking a citation badge in the chat UI automatically focuses the statutory document viewer and highlights source text.

5. **International Regulatory Export Route Analyzer:**
   - Evaluates export pathways across:
     - **US FDA:** Dietary Supplement DSHEA 1994 / Botanical Drug NDA Guidance (2016).
     - **EU EMA:** THMPD Directive 2004/24/EC (30-year traditional use rule).
     - **GCC:** Heavy Metal & COPP registration (Saudi SFDA / UAE MOHAP).

6. **Global Expert & Thesis Finder:**
   - Integrates with OpenAlex API to retrieve active academic researchers, publication counts, citations, and open-access thesis links for target botanicals.

7. **Encrypted Formulation Vault & Branded Dossier PDF Exporter:**
   - Save custom formulations and compliance audit logs.
   - Generate official "DR. Ayurvedic Sathi Compliance Dossier" printable reports.

---

## 🛠️ Architecture & Tech Stack

- **Backend:** FastAPI (Python 3.14), Pydantic v2, Async SQLAlchemy (Asyncpg / Aiosqlite), Rank-BM25, In-Memory & Qdrant Dense Vector Store.
- **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS, Lucide Icons.
- **Storage:** SQLite / PostgreSQL (Formulas, Users, Compliance Audits, Botanical Alternatives).

---

## 🚀 Quick Launch

### 1. Launch FastAPI Backend
```bash
python backend/run.py
```
*API docs available at: `http://127.0.0.1:8000/docs`*

### 2. Launch Next.js Frontend
```bash
cd frontend
npm run dev
```
*Frontend available at: `http://localhost:3000`*

### Or Run One-Click Windows Script:
```' cmd
start.bat
```
