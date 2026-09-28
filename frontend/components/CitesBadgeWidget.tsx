'use client';

import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, Leaf, ArrowRight } from 'lucide-react';
import { CitesCheckResult } from '../lib/types';

interface CitesBadgeWidgetProps {
  citesData: CitesCheckResult | null;
}

export const CitesBadgeWidget: React.FC<CitesBadgeWidgetProps> = ({ citesData }) => {
  if (!citesData) return null;

  if (!citesData.has_cites_violations) {
    return (
      <div className="glass-panel-emerald p-4 rounded-xl my-4 border border-emerald-500/30 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-emerald-300">CITES & Wildlife Act Compliance: CLEAN</h4>
          <p className="text-xs text-emerald-200/80 mt-0.5">
            No endangered, protected, or restricted species under CITES Appendices or Indian Wildlife Protection Act 1972 were detected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel-red p-4 rounded-xl my-4 border border-red-500/40 space-y-3">
      <div className="flex items-center gap-2.5 text-red-400 font-extrabold text-sm border-b border-red-500/20 pb-2">
        <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
        <span>CITES & Wildlife Protection Act Screening Alert ({citesData.flagged_count} Flagged)</span>
      </div>

      <div className="space-y-3">
        {citesData.flagged_botanicals.map((flag, idx) => (
          <div key={idx} className="bg-slate-900/95 border border-red-500/30 rounded-lg p-3 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-red-400 uppercase tracking-wide px-2 py-0.5 rounded bg-red-950/80 border border-red-800/60 mr-2">
                  {flag.cites_appendix}
                </span>
                <span className="text-sm font-bold text-slate-100">{flag.sanskrit_name}</span>
                <span className="text-xs italic text-slate-400 ml-1.5">({flag.botanical_name})</span>
              </div>
              <span className="text-[11px] font-semibold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-700/50">
                {flag.wildlife_act_schedule}
              </span>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950/60 p-2 rounded border border-slate-800">
              <strong className="text-red-400">Legal Restriction:</strong> {flag.legal_status}
            </p>

            {/* Pratinidhi Dravya Card */}
            {flag.pratinidhi_dravya && (
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-lg p-3 mt-2 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-400">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                  <span>Recommended Pratinidhi Dravya (Ayurvedic Bio-Equivalent Substitute):</span>
                </div>
                <div className="text-sm font-bold text-emerald-200 flex items-center gap-2">
                  <span>{flag.pratinidhi_dravya.alternative_sanskrit_name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs italic text-emerald-300">({flag.pratinidhi_dravya.alternative_name})</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {flag.pratinidhi_dravya.justification}
                </p>
                <div className="text-[11px] font-semibold text-emerald-400/90 pt-0.5 italic">
                  Reference: {flag.pratinidhi_dravya.pharmacopoeia_reference}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
