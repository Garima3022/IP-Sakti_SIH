'use client';

import React from 'react';
import { CheckCircle2, Circle, Loader2, Sparkles, Database, Shield, FileText } from 'lucide-react';
import { RAGPipelineStep } from '../lib/types';

interface RetrievalProgressPanelProps {
  steps: RAGPipelineStep[];
  activeJurisdiction: string;
  retrievalMode: string;
}

export const RetrievalProgressPanel: React.FC<RetrievalProgressPanelProps> = ({
  steps,
  activeJurisdiction,
  retrievalMode
}) => {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="bg-white p-4 rounded-xl border border-[#DCE6DC] mb-4 shadow-xs animate-fade-in font-sans">
      <div className="flex items-center justify-between mb-3 border-b border-[#DCE6DC] pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#16866A]" />
          <h4 className="text-xs font-bold text-[#174634]">RAG Retrieval Pipeline Execution</h4>
        </div>
        
        <div className="flex items-center gap-2 text-[10px]">
          <span className="px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-[#E6F0E8] text-[#16866A] border border-[#DCE6DC]">
            {activeJurisdiction}
          </span>
          <span className="px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-[#EDF3EB] text-[#245C45] border border-[#DCE6DC]">
            Mode: {retrievalMode.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {steps.map((st, i) => (
          <div key={i} className="flex items-center gap-2 bg-[#EDF3EB] p-2 rounded-lg border border-[#DCE6DC]">
            {st.status === 'completed' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16866A] shrink-0" />
            ) : st.status === 'in_progress' ? (
              <Loader2 className="w-3.5 h-3.5 text-[#D99A36] animate-spin shrink-0" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-[#66766C] shrink-0" />
            )}

            <div className="overflow-hidden">
              <span className="text-[11px] font-semibold text-[#1F3329] block truncate">{st.step}</span>
              {st.value && <span className="text-[9px] text-[#66766C] block truncate">{st.value}</span>}
              {st.chunks_retrieved !== undefined && (
                <span className="text-[9px] text-[#16866A] font-bold block">{st.chunks_retrieved} Chunks Matched</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
