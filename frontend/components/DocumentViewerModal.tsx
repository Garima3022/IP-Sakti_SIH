'use client';

import React, { useState, useEffect } from 'react';
import { X, FileText, ChevronLeft, ChevronRight, Layers, RefreshCw, Eye, CheckCircle2 } from 'lucide-react';
import { SourceDocument, SourceChunk } from '../lib/types';
import { fetchSourcePage, fetchSourceChunks } from '../lib/api';

interface DocumentViewerModalProps {
  isOpen: boolean;
  document: SourceDocument | null;
  initialPage?: number;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  document: doc,
  initialPage = 1,
  onClose
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageText, setPageText] = useState<string>('');
  const [chunks, setChunks] = useState<SourceChunk[]>([]);
  const [activeTab, setActiveTab] = useState<'page' | 'chunks'>('page');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialPage) {
      setCurrentPage(initialPage);
    }
  }, [initialPage]);

  useEffect(() => {
    if (!doc || !isOpen) return;

    async function loadContent() {
      setLoading(true);
      try {
        if (activeTab === 'page') {
          const res = await fetchSourcePage(doc!.id, currentPage);
          setPageText(res.text || 'No extractable text found on this page.');
        } else {
          const res = await fetchSourceChunks(doc!.id);
          setChunks(res.chunks || []);
        }
      } catch (err) {
        setPageText('Page text unavailable.');
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, [doc, isOpen, currentPage, activeTab]);

  if (!isOpen || !doc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-4xl bg-white border border-[#DCE6DC] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#DCE6DC] flex items-center justify-between bg-[#E6F0E8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#16866A]/10 text-[#16866A] flex items-center justify-center border border-[#16866A]/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#1F3329]">{doc.title}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#E6F0E8] text-[#16866A] border border-[#DCE6DC]">
                  {doc.jurisdiction}
                </span>
              </div>
              <p className="text-xs text-[#66766C] font-mono mt-0.5">{doc.filename}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#66766C] hover:text-[#1F3329] hover:bg-white/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Tabs & Navigation Bar */}
        <div className="px-6 py-3 border-b border-[#DCE6DC] bg-[#EDF3EB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('page')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'page'
                  ? 'bg-[#16866A] text-white shadow-sm'
                  : 'text-[#66766C] hover:text-[#1F3329] bg-white border border-[#DCE6DC]'
              }`}
            >
              Extracted Page Text
            </button>
            <button
              onClick={() => setActiveTab('chunks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'chunks'
                  ? 'bg-[#16866A] text-white shadow-sm'
                  : 'text-[#66766C] hover:text-[#1F3329] bg-white border border-[#DCE6DC]'
              }`}
            >
              Indexed RAG Chunks
            </button>
          </div>

          {activeTab === 'page' && (
            <div className="flex items-center gap-3">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1 rounded-lg bg-white border border-[#DCE6DC] text-[#1F3329] disabled:opacity-40 hover:bg-[#E6F0E8]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-[#1F3329]">
                Page {currentPage} of {doc.page_count || 1}
              </span>
              <button
                disabled={doc.page_count ? currentPage >= doc.page_count : false}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-1 rounded-lg bg-white border border-[#DCE6DC] text-[#1F3329] disabled:opacity-40 hover:bg-[#E6F0E8]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Document Content Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#F5F7F2] font-mono text-xs text-[#1F3329] leading-relaxed">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#66766C] font-sans">
              <RefreshCw className="w-6 h-6 animate-spin text-[#16866A] mb-2" />
              <p className="text-xs">Loading extracted content...</p>
            </div>
          ) : activeTab === 'page' ? (
            <div className="whitespace-pre-wrap selection:bg-[#E6F0E8] selection:text-[#174634]">
              {pageText}
            </div>
          ) : (
            <div className="space-y-4 font-sans">
              {chunks.length === 0 ? (
                <p className="text-[#66766C] italic">No indexed chunks for this document.</p>
              ) : (
                chunks.map((chk, i) => (
                  <div key={i} className="bg-white border border-[#DCE6DC] p-4 rounded-xl space-y-2 shadow-sm">
                    <div className="flex items-center justify-between text-[11px] text-[#66766C]">
                      <span className="font-bold text-[#16866A]">Chunk #{i + 1}</span>
                      <span>Page {chk.page_number}</span>
                    </div>
                    <p className="text-xs text-[#1F3329] leading-relaxed bg-[#F5F7F2] p-3 rounded border border-[#DCE6DC] font-mono">
                      {chk.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
