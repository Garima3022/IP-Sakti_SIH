'use client';

import React, { useState } from 'react';
import { Sparkles, Search, X, ExternalLink, GraduationCap, Award, BookOpen } from 'lucide-react';
import { Expert } from '../lib/types';
import { fetchExperts } from '../lib/api';

interface ExpertFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpertFinderModal: React.FC<ExpertFinderModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('Nardostachys jatamansi');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Expert[]>([]);
  const [searchedTerm, setSearchedTerm] = useState('');

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetchExperts(query);
      setResults(res.experts);
      setSearchedTerm(res.target_botanical);
    } catch (err) {
      console.error('Error searching experts', err);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white border border-[#DCE6DC] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#DCE6DC] bg-[#E6F0E8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#16866A]" />
            <h2 className="text-sm font-extrabold text-[#1F3329] uppercase tracking-wider">
              Global Academic Experts & Thesis Finder
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-[#66766C] hover:text-[#1F3329] rounded-lg hover:bg-white/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="p-4 bg-[#EDF3EB] border-b border-[#DCE6DC] flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#66766C] absolute left-3 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search botanical species or Ayurvedic term (e.g. Saussurea costus, Ashwagandha)..."
              className="w-full bg-white border border-[#DCE6DC] text-xs text-[#1F3329] rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#16866A]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 bg-[#16866A] hover:bg-[#174634] text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? 'Searching OpenAlex...' : 'Search Experts'}</span>
          </button>
        </form>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F5F7F2]">
          {searchedTerm && (
            <div className="text-xs text-[#66766C] font-semibold mb-2">
              Showing active researchers and peer-reviewed studies for <strong className="text-[#16866A]">"{searchedTerm}"</strong>:
            </div>
          )}

          {results.map((exp, idx) => (
            <div key={idx} className="bg-white border border-[#DCE6DC] rounded-xl p-4 space-y-2 hover:border-[#16866A]/40 transition-all shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-[#1F3329] flex items-center gap-2">
                    <span>{exp.name}</span>
                    <span className="text-[10px] font-bold text-[#66766C] bg-[#EDF3EB] px-2 py-0.5 rounded border border-[#DCE6DC]">
                      {exp.country}
                    </span>
                  </h4>
                  <p className="text-xs text-[#66766C] mt-0.5">{exp.institution}</p>
                </div>

                <div className="text-right">
                  <div className="text-xs font-black text-[#16866A] flex items-center gap-1 justify-end">
                    <Award className="w-3.5 h-3.5 text-[#D99A36]" />
                    <span>{exp.cited_by_count} Citations</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#F5F7F2] p-2.5 rounded-lg border border-[#DCE6DC] text-xs text-[#1F3329]">
                <strong className="text-[#174634] block mb-1">Top Publication / Thesis:</strong>
                "{exp.top_paper_title}"
              </div>

              <div className="flex justify-end pt-1">
                <a
                  href={exp.thesis_open_access_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16866A] hover:text-[#174634] bg-[#E6F0E8] border border-[#DCE6DC] px-2.5 py-1 rounded-lg"
                >
                  <span>OpenAlex Thesis / Study Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}

          {results.length === 0 && !loading && (
            <div className="text-center py-10 text-[#66766C] text-xs">
              Enter a botanical species or Ayurvedic Dravya name to discover global academic experts and thesis studies.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
