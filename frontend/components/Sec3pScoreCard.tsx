'use client';

import React from 'react';
import { Scale, CheckCircle, AlertCircle, Lightbulb, TrendingUp } from 'lucide-react';
import { Sec3pResult } from '../lib/types';

interface Sec3pScoreCardProps {
  sec3pData: Sec3pResult | null;
}

export const Sec3pScoreCard: React.FC<Sec3pScoreCardProps> = ({ sec3pData }) => {
  if (!sec3pData) return null;

  const riskColor = sec3pData.sec_3p_risk_level === 'LOW'
    ? 'text-emerald-400 border-emerald-500/40 bg-emerald-950/60'
    : (sec3pData.sec_3p_risk_level === 'MODERATE'
      ? 'text-amber-400 border-amber-500/40 bg-amber-950/60'
      : 'text-red-400 border-red-500/40 bg-red-950/60');

  return (
    <div className="glass-panel p-4 rounded-xl my-4 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-teal-400" />
          <h3 className="text-sm font-bold text-slate-100">Indian Patent Act §3(p) Non-Patentability Risk Assessment</h3>
        </div>
        <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${riskColor}`}>
          Risk: {sec3pData.sec_3p_risk_level}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80 text-center">
          <div className="text-xs text-slate-400 font-semibold mb-1">Section 3(p) Risk Score</div>
          <div className="text-2xl font-black text-amber-400">{sec3pData.sec_3p_risk_score} <span className="text-xs text-slate-500">/ 100</span></div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-red-500 h-full rounded-full"
              style={{ width: `${sec3pData.sec_3p_risk_score}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80 text-center">
          <div className="text-xs text-slate-400 font-semibold mb-1">Synergistic Novelty Meter</div>
          <div className="text-2xl font-black text-emerald-400">{sec3pData.novelty_score} <span className="text-xs text-slate-500">/ 100</span></div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full"
              style={{ width: `${sec3pData.novelty_score}%` }}
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 text-xs text-slate-200">
        <strong className="text-teal-300">Synergy Status: </strong>
        {sec3pData.synergy_evaluation}
      </div>

      {sec3pData.actionable_recommendations && sec3pData.actionable_recommendations.length > 0 && (
        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Actionable Steps to Overcome Section 3(p) Patent Objections:</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {sec3pData.actionable_recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
