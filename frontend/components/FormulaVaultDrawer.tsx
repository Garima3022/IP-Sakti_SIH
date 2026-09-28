'use client';

import React, { useState, useEffect } from 'react';
import { FolderCheck, X, Plus, FileText, Printer, CheckCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { Formula } from '../lib/types';
import { fetchFormulas, saveFormula } from '../lib/api';

interface FormulaVaultDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFormula: (formula: Formula) => void;
  onGenerateDossier: (formula: Formula) => void;
}

export const FormulaVaultDrawer: React.FC<FormulaVaultDrawerProps> = ({
  isOpen,
  onClose,
  onSelectFormula,
  onGenerateDossier,
}) => {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newRef, setNewRef] = useState('Bhavaprakasha Nighantu');
  const [newIndications, setNewIndications] = useState('Nidranasha, Manas Roga, Shotha');
  const [newIngredientsText, setNewIngredientsText] = useState(
    'Saussurea costus (Kushta) 30%, Nardostachys jatamansi (Jatamansi) 30%, Withania somnifera (Ashwagandha) 40%'
  );

  useEffect(() => {
    if (isOpen) {
      loadFormulas();
    }
  }, [isOpen]);

  async function loadFormulas() {
    try {
      const res = await fetchFormulas();
      if (res.formulas) {
        setFormulas(res.formulas);
      }
    } catch (err) {
      console.error('Failed to load formulas', err);
    }
  }

  async function handleSaveNewFormula(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    // Parse ingredients text into structured format
    const ingParts = newIngredientsText.split(',');
    const parsedIngs = ingParts.map((p) => {
      const trimmed = p.trim();
      return {
        name: trimmed,
        sanskrit_name: trimmed.split('(')[0]?.trim() || trimmed,
        botanical_name: trimmed.includes('(') ? trimmed.split('(')[1]?.replace(')', '').trim() : trimmed,
        percentage: 33,
        part_used: 'Root / Rhizome'
      };
    });

    const payload: Formula = {
      title: newTitle,
      classical_reference: newRef,
      indications: newIndications,
      ingredients: parsedIngs,
      description: 'Custom formulation saved in DR. Ayurvedic Sathi Vault.'
    };

    try {
      await saveFormula(payload);
      setNewTitle('');
      setShowAddModal(false);
      loadFormulas();
    } catch (err) {
      console.error('Error saving formula', err);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex justify-end">
      <div className="w-full max-w-md bg-white border-l border-[#DCE6DC] h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-[#DCE6DC] flex items-center justify-between bg-[#E6F0E8]">
          <div className="flex items-center gap-2">
            <FolderCheck className="w-5 h-5 text-[#16866A]" />
            <h2 className="text-sm font-extrabold text-[#1F3329] uppercase tracking-wider">Formulation Vault</h2>
          </div>
          <button onClick={onClose} className="p-1 text-[#66766C] hover:text-[#1F3329] rounded-lg hover:bg-white/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F5F7F2]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#66766C]">Saved Formulations ({formulas.length})</span>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 text-xs font-bold text-[#16866A] hover:text-[#174634] bg-[#E6F0E8] border border-[#DCE6DC] px-2.5 py-1 rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Formulation</span>
            </button>
          </div>

          {/* Add Formula Form */}
          {showAddModal && (
            <form onSubmit={handleSaveNewFormula} className="bg-white p-4 rounded-xl border border-[#DCE6DC] space-y-3 shadow-sm">
              <h3 className="text-xs font-extrabold text-[#16866A] uppercase">Save New Ayurvedic Formula</h3>
              <div>
                <label className="text-[11px] font-semibold text-[#66766C] block mb-1">Formulation Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manas Mitra Kwatha"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#F5F7F2] border border-[#DCE6DC] text-xs text-[#1F3329] rounded p-2 focus:outline-none focus:border-[#16866A]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#66766C] block mb-1">Classical Reference</label>
                <input
                  type="text"
                  value={newRef}
                  onChange={(e) => setNewRef(e.target.value)}
                  className="w-full bg-[#F5F7F2] border border-[#DCE6DC] text-xs text-[#1F3329] rounded p-2 focus:outline-none focus:border-[#16866A]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#66766C] block mb-1">Ingredients (Comma separated)</label>
                <textarea
                  rows={3}
                  value={newIngredientsText}
                  onChange={(e) => setNewIngredientsText(e.target.value)}
                  className="w-full bg-[#F5F7F2] border border-[#DCE6DC] text-xs text-[#1F3329] rounded p-2 focus:outline-none focus:border-[#16866A]"
                />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1 text-xs font-semibold text-[#66766C] hover:text-[#1F3329]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-[#16866A] hover:bg-[#174634] text-white font-bold text-xs rounded"
                >
                  Save Formula
                </button>
              </div>
            </form>
          )}

          {/* Formulas List */}
          <div className="space-y-3">
            {formulas.map((f) => (
              <div key={f.id} className="bg-white border border-[#DCE6DC] rounded-xl p-3.5 space-y-2 hover:border-[#16866A]/40 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#1F3329]">{f.title}</h4>
                    <span className="text-[11px] text-[#16866A] font-semibold">{f.classical_reference}</span>
                  </div>
                  <span className="text-[10px] text-[#66766C] font-mono">
                    {f.created_at ? new Date(f.created_at).toLocaleDateString() : 'Recent'}
                  </span>
                </div>

                <div className="text-xs text-[#1F3329]">
                  <strong>Indications:</strong> {f.indications || 'General Balance'}
                </div>

                {/* Ingredients Pills */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {f.ingredients.map((ing, i) => (
                    <span key={i} className="text-[10px] bg-[#EDF3EB] text-[#1F3329] px-2 py-0.5 rounded border border-[#DCE6DC]">
                      {ing.sanskrit_name || ing.name}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-[#DCE6DC]">
                  <button
                    onClick={() => {
                      onSelectFormula(f);
                      onClose();
                    }}
                    className="text-xs font-bold text-[#16866A] hover:text-[#174634] flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run Compliance Audit</span>
                  </button>

                  <button
                    onClick={() => onGenerateDossier(f)}
                    className="text-xs font-bold text-[#245C45] hover:text-[#174634] flex items-center gap-1 bg-[#E6F0E8] border border-[#DCE6DC] px-2.5 py-1 rounded"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Print Dossier</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
