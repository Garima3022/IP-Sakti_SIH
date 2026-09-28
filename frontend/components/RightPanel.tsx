'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, MapPin, ExternalLink, BookOpen, ShieldCheck, 
  CheckCircle2, Eye, Sparkles, Layers, Database
} from 'lucide-react';
import { SourceDocument } from '../lib/types';
import { fetchSourceLibrary } from '../lib/api';

interface RightPanelProps {
  activeCitation: any | null;
  onInspectDocument?: (doc: SourceDocument, pageNum?: number) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({ 
  activeCitation,
  onInspectDocument 
}) => {
  const [sources, setSources] = useState<SourceDocument[]>([]);

  useEffect(() => {
    async function loadSources() {
      try {
        const res = await fetchSourceLibrary();
        setSources(res.documents || []);
      } catch (err) {
        console.error('Failed to fetch sources:', err);
      }
    }
    loadSources();
  }, []);

  const matchedDoc = sources.find(
    s => s.id === activeCitation?.source_id || s.title === activeCitation?.source_title || s.filename === activeCitation?.filename
  );

  return (
    <div className="h-full flex flex-col bg-white border border-[#DCE6DC] rounded-3xl overflow-hidden shadow-sm font-sans">
      {/* Header */}
      <div className="p-4 border-b border-[#DCE6DC] bg-[#EDF3EB] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#E6F0E8] text-[#16866A] flex items-center justify-center border border-[#DCE6DC]">
            <BookOpen className="w-4 h-4 text-[#16866A]" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-[#174634] uppercase tracking-wider">
              Evidence & Sources Inspector
            </h3>
            <p className="text-[10px] text-[#66766C] font-medium">Page-Aware Statutory PDF Verification</p>
          </div>
        </div>

        <span className="text-[10px] font-extrabold uppercase bg-[#E6F0E8] text-[#16866A] px-2.5 py-0.5 rounded-full border border-[#DCE6DC]">
          Official PDF
        </span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F5F7F2]">
        {activeCitation ? (
          <div className="space-y-4">
            {/* Active Citation Card */}
            <div className="bg-white p-5 rounded-2xl border border-[#DCE6DC] space-y-3 shadow-md animate-fade-in">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-[#16866A] bg-[#E6F0E8] px-2.5 py-0.5 rounded-full border border-[#DCE6DC]">
                    {activeCitation.jurisdiction || 'India'}
                  </span>
                  <h4 className="text-sm font-bold text-[#174634] mt-2">
                    📄 {activeCitation.source_title || activeCitation.title}
                  </h4>
                </div>

                {activeCitation.relevance_score && (
                  <span className="text-xs font-extrabold text-[#16866A] bg-[#E6F0E8] px-2.5 py-1 rounded-full border border-[#DCE6DC]">
                    {(activeCitation.relevance_score * 100).toFixed(0)}% Match
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-[#66766C] font-mono border-t border-[#DCE6DC] pt-2">
                <span>Page {activeCitation.page_number || activeCitation.page_no || 1}</span>
                <span>•</span>
                <span>Ref: {activeCitation.section_reference || activeCitation.section_number || 'Section Reference'}</span>
                <span>•</span>
                <span className="text-[#16866A] uppercase font-bold">{activeCitation.verification_status || 'Official'}</span>
              </div>

              {/* Extracted Excerpt Text */}
              <div className="bg-[#EDF3EB] p-4 rounded-xl border border-[#DCE6DC] text-xs text-[#1F3329] leading-relaxed font-mono whitespace-pre-wrap selection:bg-[#245C45] selection:text-white">
                "{activeCitation.extracted_excerpt || activeCitation.excerpt || activeCitation.text}"
              </div>

              {/* Action Button */}
              {matchedDoc && onInspectDocument && (
                <button
                  onClick={() => onInspectDocument(matchedDoc, activeCitation.page_number || activeCitation.page_no || 1)}
                  className="w-full py-2.5 rounded-xl bg-[#16866A] hover:bg-[#174634] text-xs font-extrabold text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Eye className="w-4 h-4" />
                  <span>Inspect Full Page Text in PDF Library</span>
                </button>
              )}
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#DCE6DC] text-xs text-[#66766C] space-y-1.5 shadow-xs">
              <span className="font-bold text-[#1F3329] flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-[#16866A]" />
                Citation Grounding Traceability:
              </span>
              <p className="text-[11px] leading-relaxed">
                This statutory excerpt was extracted directly from the digital PDF stored in the <code className="text-[#16866A] font-mono">IP-SAKTI</code> repository.
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center py-16 text-center text-[#66766C]">
            <BookOpen className="w-10 h-10 text-[#245C45] mb-3" />
            <p className="text-xs font-bold text-[#1F3329]">No Citation Currently Selected</p>
            <p className="text-[11px] text-[#66766C] max-w-xs mt-1">
              Ask a question in the AI Research Chat to view source-grounded PDF passages, page numbers, and match scores.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
