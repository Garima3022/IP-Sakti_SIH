import { Formula, Expert, StatutoryDocument } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export async function saveFormula(formula: Formula) {
  const res = await fetch(`${API_BASE}/formula/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formula),
  });
  if (!res.ok) throw new Error('Failed to save formula');
  return res.json();
}

export async function fetchFormulas() {
  const res = await fetch(`${API_BASE}/formula/list`);
  if (!res.ok) throw new Error('Failed to fetch formulas');
  return res.json();
}

export async function fetchExperts(query: string): Promise<{ query: string; target_botanical: string; experts_count: number; experts: Expert[] }> {
  const res = await fetch(`${API_BASE}/experts?query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to fetch experts');
  return res.json();
}

export async function fetchDocument(docId: string): Promise<StatutoryDocument> {
  const res = await fetch(`${API_BASE}/document/${docId}`);
  if (!res.ok) throw new Error(`Failed to fetch document ${docId}`);
  return res.json();
}

export async function fetchAllDocuments(): Promise<{ documents: StatutoryDocument[] }> {
  const res = await fetch(`${API_BASE}/document/list/all`);
  if (!res.ok) throw new Error('Failed to fetch statutory documents');
  return res.json();
}

export async function fetchDossierHTML(payload: any): Promise<string> {
  const res = await fetch(`${API_BASE}/dossier/html`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to generate dossier HTML');
  return res.text();
}

// --- RAG & Source Library API Functions ---

export async function sendRAGChat(payload: {
  message: string;
  jurisdiction?: string;
  language?: string;
  retrieval_mode?: string;
  category?: string;
  conversation_id?: string;
}) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('RAG Chat request failed');
  return res.json();
}

export async function fetchSourceLibrary() {
  const res = await fetch(`${API_BASE}/sources`);
  if (!res.ok) throw new Error('Failed to fetch source library');
  return res.json();
}

export async function fetchSourcePage(docId: string, pageNum: number) {
  const res = await fetch(`${API_BASE}/sources/${encodeURIComponent(docId)}/pages/${pageNum}`);
  if (!res.ok) throw new Error(`Failed to fetch page ${pageNum} for document ${docId}`);
  return res.json();
}

export async function fetchSourceChunks(docId: string) {
  const res = await fetch(`${API_BASE}/sources/${encodeURIComponent(docId)}/chunks`);
  if (!res.ok) throw new Error(`Failed to fetch chunks for document ${docId}`);
  return res.json();
}

export async function reindexSource(docId: string) {
  const res = await fetch(`${API_BASE}/sources/${encodeURIComponent(docId)}/reindex`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error(`Failed to reindex document ${docId}`);
  return res.json();
}

export async function removeSourceFromIndex(docId: string) {
  const res = await fetch(`${API_BASE}/sources/${encodeURIComponent(docId)}/index`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error(`Failed to remove document ${docId} from index`);
  return res.json();
}

export async function classifyFormulation(payload: any) {
  const res = await fetch(`${API_BASE}/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Classification request failed');
  return res.json();
}

export async function absAssessment(payload: any) {
  const res = await fetch(`${API_BASE}/abs-assessment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('ABS assessment request failed');
  return res.json();
}

