'use client';

import React from 'react';
import { Globe, CheckSquare, Calendar, Building2, Layers } from 'lucide-react';
import { ExportPathwayResult } from '../lib/types';

interface ExportPathwayTimelineProps {
  exportData: ExportPathwayResult | null;
}

export const ExportPathwayTimeline: React.FC<ExportPathwayTimelineProps> = ({ exportData }) => {
  if (!exportData) return null;

  return (
    <div className="glass-panel p-4 rounded-xl my-4 border border-slate-800 space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
        <Globe className="w-5 h-5 text-emerald-400" />
        <h3 className="text-sm font-bold text-slate-100">International Regulatory Export Route Analyzer</h3>
      </div>

      {/* Target Jurisdictions Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* US FDA */}
        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-300">🇺🇸 US FDA Pathway</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              {exportData.us_fda.dietary_supplement_pathway.feasibility}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">DSHEA 1994 Dietary Supplement / Botanical Drug NDA</p>
          <ul className="text-[11px] text-slate-300 space-y-1 pt-1">
            {exportData.us_fda.dietary_supplement_pathway.requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-1">
                <span className="text-emerald-400">•</span>
                <span className="leading-tight">{req}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* EU EMA */}
        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-teal-300">🇪🇺 EU EMA Pathway</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-950 text-teal-400 border border-teal-800">
              THMPD 2004/24/EC
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">30-Year Traditional Use Rule (15 yrs within EU)</p>
          <ul className="text-[11px] text-slate-300 space-y-1 pt-1">
            {exportData.eu_ema.thmpd_pathway.requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-1">
                <span className="text-teal-400">•</span>
                <span className="leading-tight">{req}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* GCC */}
        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-300">🇦🇪 GCC (Saudi/UAE)</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
              SFDA / MOHAP
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Heavy Metal & COPP Certificate Registration</p>
          <ul className="text-[11px] text-slate-300 space-y-1 pt-1">
            {exportData.gcc.herbal_registration_pathway.requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-1">
                <span className="text-amber-400">•</span>
                <span className="leading-tight">{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Step-by-Step Regulatory Timeline */}
      <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 space-y-3">
        <div className="text-xs font-extrabold text-slate-200 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Step-by-Step Global Export Execution Roadmap</span>
        </div>

        <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
          {exportData.roadmap_steps.map((step, idx) => (
            <div key={idx} className="relative flex items-start gap-3 pl-8">
              <div className="absolute left-1.5 top-0.5 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold flex items-center justify-center ring-4 ring-slate-900">
                {idx + 1}
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300">{step.phase}</span>
                  <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {step.timeline}
                  </span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1 pt-1">
                  {step.tasks.map((task, tIdx) => (
                    <li key={tIdx} className="flex items-start gap-1.5">
                      <CheckSquare className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
