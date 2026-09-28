'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, AlertTriangle, CheckCircle2, FileText, Database } from 'lucide-react';
import { absAssessment } from '../lib/api';
import { ABSAssessmentResponse } from '../lib/types';

interface ABSHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ABSHelperModal: React.FC<ABSHelperModalProps> = ({ isOpen, onClose }) => {
  const [resourceName, setResourceName] = useState('');
  const [sourceOrigin, setSourceOrigin] = useState('India');
  const [hasTK, setHasTK] = useState(true);
  const [intendedUse, setIntendedUse] = useState('domestic_sale');
  const [isForeignEntity, setIsForeignEntity] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ABSAssessmentResponse | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceName.trim()) return;

    setLoading(true);
    try {
      const res = await absAssessment({
        biological_resource_name: resourceName,
        source_origin: sourceOrigin,
        traditional_knowledge_associated: hasTK,
        intended_commercial_use: intendedUse,
        foreign_entity_involved: isForeignEntity
      });
      setResult(res);
    } catch (err) {
      alert('Failed to run ABS assessment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F3329]/60 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-white w-full max-w-2xl border border-[#DCE6DC] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#DCE6DC] flex items-center justify-between bg-[#EDF3EB]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E6F0E8] text-[#16866A] flex items-center justify-center border border-[#DCE6DC]">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#174634]">ABS Compliance Helper</h3>
              <p className="text-[11px] text-[#66766C]">Biological Diversity (Amendment) Act 2023 & NBA Guidance</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#66766C] hover:text-[#1F3329] hover:bg-[#E6F0E8] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1F3329] uppercase tracking-wider mb-1.5">
                Biological Resource / Dravya Name *
              </label>
              <input
                type="text"
                required
                value={resourceName}
                onChange={(e) => setResourceName(e.target.value)}
                placeholder="e.g. Saussurea costus (Kuth) or Nardostachys jatamansi"
                className="w-full bg-white border border-[#DCE6DC] rounded-xl px-4 py-2.5 text-xs text-[#1F3329] placeholder-[#66766C] focus:outline-none focus:border-[#16866A]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1F3329] uppercase tracking-wider mb-1.5">
                  Intended Commercial Activity
                </label>
                <select
                  value={intendedUse}
                  onChange={(e) => setIntendedUse(e.target.value)}
                  className="w-full bg-white border border-[#DCE6DC] rounded-xl px-3 py-2.5 text-xs text-[#1F3329] focus:outline-none focus:border-[#16866A]"
                >
                  <option value="domestic_sale">Domestic Commercial Sale (India)</option>
                  <option value="export">Commercial Export Outside India</option>
                  <option value="research">Academic / Non-Commercial Research</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F3329] uppercase tracking-wider mb-1.5">
                  Entity Jurisdiction
                </label>
                <div className="pt-2">
                  <label className="flex items-center gap-2 text-xs text-[#1F3329] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isForeignEntity}
                      onChange={(e) => setIsForeignEntity(e.target.checked)}
                      className="rounded border-[#DCE6DC] text-[#16866A] focus:ring-0"
                    />
                    Foreign Company / NRIs / Joint Venture
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#16866A] hover:bg-[#174634] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Database className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>Assess ABS Compliance & NBA Requirements</span>
            </button>
          </form>

          {result && (
            <div className="bg-[#EDF3EB] border border-[#DCE6DC] rounded-xl p-4 space-y-3 animate-fade-in">
              <h4 className="text-xs font-bold text-[#174634]">Compliance Flags:</h4>
              <ul className="space-y-1.5">
                {result.compliance_flags.map((flag, idx) => (
                  <li key={idx} className="text-xs text-[#1F3329] leading-relaxed">
                    {flag}
                  </li>
                ))}
              </ul>

              <h4 className="text-xs font-bold text-[#174634] pt-2">Actionable Steps:</h4>
              <ul className="list-disc list-inside text-xs text-[#1F3329] space-y-1">
                {result.recommended_actions.map((act, idx) => (
                  <li key={idx}>{act}</li>
                ))}
              </ul>

              <p className="text-[10px] text-[#66766C] italic border-t border-[#DCE6DC] pt-2">
                *{result.disclaimer}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
