'use client';

import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, AlertCircle, HelpCircle, FileText, Scale } from 'lucide-react';
import { classifyFormulation } from '../lib/api';
import { ClassificationResponse } from '../lib/types';

interface FormulationClassifierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormulationClassifierModal: React.FC<FormulationClassifierModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [productType, setProductType] = useState('medicine');
  const [isClassicalTextCited, setIsClassicalTextCited] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [containsBioResources, setContainsBioResources] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClassificationResponse | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const res = await classifyFormulation({
        title,
        product_type: productType,
        is_classical_text_cited: isClassicalTextCited,
        is_modified: isModified,
        contains_indian_biological_resources: containsBioResources
      });
      setResult(res);
    } catch (err) {
      alert('Failed to run classification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F3329]/60 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-white w-full max-w-2xl border border-[#DCE6DC] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#DCE6DC] flex items-center justify-between bg-[#EDF3EB]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E6F0E8] text-[#16866A] flex items-center justify-center border border-[#DCE6DC]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#174634]">Ayurvedic Formulation Classifier</h3>
              <p className="text-[11px] text-[#66766C]">Guided regulatory pathway & IP eligibility assessment</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#66766C] hover:text-[#1F3329] hover:bg-[#E6F0E8] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1F3329] uppercase tracking-wider mb-1.5">
                Formulation Name / Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mahasudarshan Kwath Poly-herbal Extract"
                className="w-full bg-white border border-[#DCE6DC] rounded-xl px-4 py-2.5 text-xs text-[#1F3329] placeholder-[#66766C] focus:outline-none focus:border-[#16866A]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1F3329] uppercase tracking-wider mb-1.5">
                  Intended Product Category
                </label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className="w-full bg-white border border-[#DCE6DC] rounded-xl px-3 py-2.5 text-xs text-[#1F3329] focus:outline-none focus:border-[#16866A]"
                >
                  <option value="medicine">Ayurvedic Medicine (ASU)</option>
                  <option value="food">Ayurveda-Aahar / Nutraceutical</option>
                  <option value="cosmetic">Cosmetic (Topical / Beauty)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F3329] uppercase tracking-wider mb-1.5">
                  Classical Reference Status
                </label>
                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 text-xs text-[#1F3329] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isClassicalTextCited}
                      onChange={(e) => setIsClassicalTextCited(e.target.checked)}
                      className="rounded border-[#DCE6DC] text-[#16866A] focus:ring-0"
                    />
                    Cited in 1st Schedule Text
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 text-xs text-[#1F3329] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isModified}
                  onChange={(e) => setIsModified(e.target.checked)}
                  className="rounded border-[#DCE6DC] text-[#16866A] focus:ring-0"
                />
                Modified Ingredients / Novel Processing
              </label>

              <label className="flex items-center gap-2 text-xs text-[#1F3329] cursor-pointer">
                <input
                  type="checkbox"
                  checked={containsBioResources}
                  onChange={(e) => setContainsBioResources(e.target.checked)}
                  className="rounded border-[#DCE6DC] text-[#16866A] focus:ring-0"
                />
                Indian Biological Resources Used
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#16866A] hover:bg-[#174634] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Scale className="w-4 h-4" />}
              <span>Classify Formulation & Regulatory Route</span>
            </button>
          </form>

          {/* Result View */}
          {result && (
            <div className="bg-[#EDF3EB] border border-[#DCE6DC] rounded-xl p-4 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#DCE6DC] pb-2">
                <span className="text-[10px] uppercase font-bold text-[#66766C]">Tentative Category</span>
                <span className="text-xs font-black text-[#16866A] bg-[#E6F0E8] px-2.5 py-1 rounded border border-[#DCE6DC]">
                  {result.tentative_category}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#174634] mb-1">Reasoning & Statutory Basis:</h4>
                <ul className="list-disc list-inside text-xs text-[#1F3329] space-y-1">
                  {result.reasoning.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#174634] mb-1">IP & Patent Considerations:</h4>
                <ul className="list-disc list-inside text-xs text-[#1F3329] space-y-1">
                  {result.ip_considerations.map((ip, i) => (
                    <li key={i}>{ip}</li>
                  ))}
                </ul>
              </div>

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
