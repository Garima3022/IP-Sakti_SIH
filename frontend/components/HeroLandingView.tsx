'use client';

import React, { useState } from 'react';
import { 
  Search, ArrowRight, Sparkles, Globe, ShieldCheck, Scale, 
  Leaf, Database, BookOpen, FileText, CheckCircle2, Zap 
} from 'lucide-react';
import { I18n } from '../lib/i18n';

interface HeroLandingViewProps {
  currentLang: string;
  onSearch: (query: string, jurisdiction: 'India' | 'International' | 'Both') => void;
  onNavigateTab: (tab: 'chat' | 'sources' | 'garden') => void;
}

const POPULAR_QUERIES: Record<string, { label: string; query: string }[]> = {
  EN: [
    { label: "Patent §3(p) Rules", query: "Can a classical Ayurvedic formulation be patented under Section 3(p)?" },
    { label: "TKDL Prior Art", query: "What is the role of Traditional Knowledge Digital Library (TKDL) in patent examination?" },
    { label: "Rule 158-B ASU", query: "What are the Drugs & Cosmetics Act Rule 158-B licensing rules for ASU medicines?" },
    { label: "ABS Export Compliance", query: "What are Access and Benefit Sharing rules under Biological Diversity Act 2023?" }
  ],
  HI: [
    { label: "धारा 3(p) पेटेंट नियम", query: "क्या शास्त्रीय आयुर्वेदिक योग को धारा 3(p) के तहत पेटेंट कराया जा सकता है?" },
    { label: "TKDL पूर्व कला", query: "पेटेंट परीक्षण में पारंपरिक ज्ञान डिजिटल लाइब्रेरी (TKDL) की क्या भूमिका है?" },
    { label: "नियम 158-B लाइसेंस", query: "औषधि एवं प्रसाधन सामग्री नियम 158-B के तहत लाइसेंस नियम क्या हैं?" },
    { label: "ABS जैविक विविधता", query: "जैविक विविधता अधिनियम 2023 के तहत पहुँच और लाभ साझाकरण नियम क्या हैं?" }
  ]
};

export const HeroLandingView: React.FC<HeroLandingViewProps> = ({ currentLang, onSearch, onNavigateTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [jurisdiction, setJurisdiction] = useState<'India' | 'International' | 'Both'>('India');
  const t = I18n.get(currentLang);
  const chips = POPULAR_QUERIES[currentLang] || POPULAR_QUERIES['EN'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery, jurisdiction);
    }
  };

  return (
    <div 
      className="relative min-h-[calc(100vh-65px)] bg-cover bg-center bg-no-repeat text-[#1F3329] flex flex-col justify-between overflow-y-auto font-sans"
      style={{ backgroundImage: "url('/ayurvedic_hero_bg.png')" }}
    >
      {/* Light Gradient Overlay to Ensure Pristine Contrast across the Full Page */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F5F7F2]/75 via-[#F5F7F2]/65 to-[#F5F7F2]/85 pointer-events-none z-0" />

      {/* Main Hero Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-12 lg:py-16 text-center flex flex-col items-center">
        
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          {/* Animated Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-[#DCE6DC] text-[#16866A] text-xs font-extrabold uppercase tracking-widest shadow-sm mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#16866A] animate-pulse" />
            <span>{t.heroBadge}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#174634] max-w-4xl leading-tight drop-shadow-xs">
            {t.heroTitle1}{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#245C45] via-[#16866A] to-[#245C45]">
              {t.heroTitle2}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-[#1F3329] max-w-2xl mt-5 leading-relaxed font-semibold">
            {t.heroSubtitle}
          </p>

          {/* Prominent Instant Search Container */}
          <div className="w-full max-w-3xl mt-10">
            
            {/* Jurisdiction Pills */}
            <div className="flex justify-center mb-3">
              <div className="inline-flex items-center gap-1 bg-white/90 p-1 rounded-full border border-[#DCE6DC] text-xs font-bold shadow-sm backdrop-blur-md">
                {(['India', 'International', 'Both'] as const).map((j) => (
                  <button
                    key={j}
                    type="button"
                    onClick={() => setJurisdiction(j)}
                    className={`px-4 py-1.5 rounded-full transition-all ${
                      jurisdiction === j
                        ? 'bg-[#245C45] text-white shadow-sm font-extrabold'
                        : 'text-[#66766C] hover:text-[#1F3329]'
                    }`}
                  >
                    {j === 'India' ? '🇮🇳 India' : j === 'International' ? '🌐 International' : '🔀 Both'}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar Form */}
            <form onSubmit={handleSubmit} className="relative flex items-center bg-white/95 border border-[#DCE6DC] rounded-full p-2 shadow-xl backdrop-blur-md transition-all focus-within:border-[#16866A] focus-within:ring-2 focus-within:ring-[#16866A]/20">
              <Search className="w-5 h-5 text-[#16866A] ml-4 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-transparent text-sm text-[#1F3329] placeholder-[#66766C] font-medium focus:outline-none px-2 py-2"
              />
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#16866A] hover:bg-[#174634] text-white text-xs font-extrabold shadow-md transition-all shrink-0 hover:scale-[1.02]"
              >
                <span>{t.analyzeBtn}</span>
                <ArrowRight className="w-4 h-4 text-emerald-100" />
              </button>
            </form>

            {/* Instant Query Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <span className="text-xs text-[#174634] font-bold">{t.popularLabel}</span>
              {chips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => onSearch(chip.query, jurisdiction)}
                  className="text-xs bg-white/90 hover:bg-[#E6F0E8] text-[#1F3329] hover:text-[#16866A] border border-[#DCE6DC] hover:border-[#16866A] rounded-full px-3 py-1 font-semibold transition-all shadow-xs backdrop-blur-sm"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics & Feature Grid Banner */}
      <div className="relative z-10 border-t border-[#DCE6DC]/80 bg-white/65 backdrop-blur-md py-8 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div 
            onClick={() => onNavigateTab('sources')}
            className="bg-white/90 p-5 rounded-2xl border border-[#DCE6DC] hover:border-[#16866A] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#E6F0E8] text-[#16866A] flex items-center justify-center border border-[#DCE6DC]">
                  <Database className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase bg-[#E6F0E8] text-[#16866A] px-2 py-0.5 rounded border border-[#DCE6DC]">
                  22 PDFs
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#1F3329] group-hover:text-[#16866A] transition-colors">Official PDF Library</h4>
              <p className="text-xs text-[#66766C] mt-1">5,336 page-aware statutory chunks extracted and indexed.</p>
            </div>
            <div className="text-[11px] font-bold text-[#16866A] flex items-center gap-1 mt-4">
              <span>Browse Library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div 
            onClick={() => onNavigateTab('chat')}
            className="bg-white/90 p-5 rounded-2xl border border-[#DCE6DC] hover:border-[#16866A] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#E6F0E8] text-[#245C45] flex items-center justify-center border border-[#DCE6DC]">
                  <Scale className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase bg-[#E6F0E8] text-[#245C45] px-2 py-0.5 rounded border border-[#DCE6DC]">
                  §3(p) Screener
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#1F3329] group-hover:text-[#16866A] transition-colors">Patent §3(p) Analysis</h4>
              <p className="text-xs text-[#66766C] mt-1">Screen traditional knowledge non-patentability & synergy data.</p>
            </div>
            <div className="text-[11px] font-bold text-[#245C45] flex items-center gap-1 mt-4">
              <span>Run Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div 
            onClick={() => onNavigateTab('garden')}
            className="bg-white/90 p-5 rounded-2xl border border-[#DCE6DC] hover:border-[#16866A] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#E6F0E8] text-[#16866A] flex items-center justify-center border border-[#DCE6DC]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase bg-[#E6F0E8] text-[#16866A] px-2 py-0.5 rounded border border-[#DCE6DC]">
                  6 Domains
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#1F3329] group-hover:text-[#16866A] transition-colors">Knowledge Garden</h4>
              <p className="text-xs text-[#66766C] mt-1">Explore statutory clusters across patents, ABS, WIPO & AYUSH.</p>
            </div>
            <div className="text-[11px] font-bold text-[#16866A] flex items-center gap-1 mt-4">
              <span>Explore Garden</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div 
            onClick={() => onNavigateTab('chat')}
            className="bg-white/90 p-5 rounded-2xl border border-[#DCE6DC] hover:border-[#16866A] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#F5E9D2] text-[#D99A36] flex items-center justify-center border border-[#DCE6DC]">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase bg-[#F5E9D2] text-[#D99A36] px-2 py-0.5 rounded border border-[#DCE6DC]">
                  Gemini 3.6
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#1F3329] group-hover:text-[#16866A] transition-colors">Page-Cited Answers</h4>
              <p className="text-xs text-[#66766C] mt-1">Generates evidence-first answers with exact PDF page citations.</p>
            </div>
            <div className="text-[11px] font-bold text-[#D99A36] flex items-center gap-1 mt-4">
              <span>Start Chat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
