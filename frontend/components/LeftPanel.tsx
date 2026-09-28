'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Scale, ShieldAlert, Globe, Search, Sparkles, Mic, MicOff, RefreshCw, 
  Database, FileText, CheckCircle2, Layers, Filter, ShieldCheck, Copy, Check, ArrowRight
} from 'lucide-react';
import { Citation, CitesCheckResult, Sec3pResult, ExportPathwayResult, RAGCitation, RAGPipelineStep, JurisdictionBreakdownMap } from '../lib/types';
import { RetrievalProgressPanel } from './RetrievalProgressPanel';
import { sendRAGChat } from '../lib/api';
import { I18n } from '../lib/i18n';

interface LeftPanelProps {
  onCitationClick: (citation: any) => void;
  activeCitation: any;
  currentLang: string;
  onNavigateTab: (tab: 'home' | 'chat' | 'sources' | 'garden') => void;
  onOpenClassifier: () => void;
  onOpenABSHelper: () => void;
  initialQuery?: string;
  initialJurisdiction?: 'India' | 'International' | 'Both';
}

const SUGGESTED_PROMPTS: Record<string, string[]> = {
  EN: [
    "Can I patent a classical Ayurvedic formulation under Section 3(p)?",
    "What are the Access and Benefit Sharing (ABS) rules for exporting biological resources?",
    "How does Rule 158-B govern licensing of classical vs proprietary Ayurvedic medicines?",
    "What is the difference between classical and proprietary Ayurvedic formulation patentability?"
  ],
  HI: [
    "क्या मैं धारा 3(p) के तहत शास्त्रीय आयुर्वेदिक योग को पेटेंट करा सकता हूँ?",
    "जैविक संसाधनों के निर्यात हेतु पहुँच और लाभ साझाकरण (ABS) के क्या नियम हैं?",
    "औषधि एवं प्रसाधन सामग्री नियम 158-B के तहत लाइसेंस नियम क्या हैं?",
    "शास्त्रीय और मालिकाना आयुर्वेदिक दवाओं की पेटेंट क्षमता में क्या अंतर है?"
  ]
};

export const LeftPanel: React.FC<LeftPanelProps> = ({
  onCitationClick,
  activeCitation,
  currentLang,
  onNavigateTab,
  onOpenClassifier,
  onOpenABSHelper,
  initialQuery = '',
  initialJurisdiction = 'India'
}) => {
  const t = I18n.get(currentLang);
  const prompts = SUGGESTED_PROMPTS[currentLang] || SUGGESTED_PROMPTS['EN'];

  const [query, setQuery] = useState(initialQuery || prompts[0]);
  const [jurisdiction, setJurisdiction] = useState<'India' | 'International' | 'Both'>(initialJurisdiction || 'India');
  const [retrievalMode, setRetrievalMode] = useState<'pdf' | 'demo'>('pdf');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [answerText, setAnswerText] = useState('');
  const [ragCitations, setRagCitations] = useState<RAGCitation[]>([]);
  const [pipelineSteps, setPipelineSteps] = useState<RAGPipelineStep[]>([]);
  const [modelUsed, setModelUsed] = useState<string>('');
  const [breakdown, setBreakdown] = useState<JurisdictionBreakdownMap | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<'India' | 'USA' | 'Europe' | 'Gulf' | 'All'>('India');

  const autoRunDoneRef = useRef(false);

  const handleRAGSubmit = async (promptText: string) => {
    if (!promptText.trim()) return;

    setLoading(true);
    setAnswerText('');
    setRagCitations([]);
    setBreakdown(null);
    setPipelineSteps([
      { step: 'Understanding Query', status: 'in_progress' },
      { step: 'Jurisdiction Filter', status: 'pending', value: jurisdiction },
      { step: 'IPR Category Detection', status: 'pending' },
      { step: 'PDF Chunk Retrieval', status: 'pending' },
      { step: 'Gemini Answer Generation', status: 'pending', value: `Language: ${currentLang}` },
      { step: 'Citation Validation', status: 'pending' }
    ]);

    try {
      const res = await sendRAGChat({
        message: promptText,
        jurisdiction: jurisdiction,
        language: currentLang,
        retrieval_mode: retrievalMode
      });

      setAnswerText(res.answer || '');
      setRagCitations(res.citations || []);
      setModelUsed(res.model_used || 'gemini-3.6-flash');
      if (res.jurisdiction_breakdown) {
        setBreakdown(res.jurisdiction_breakdown);
      }

      if (res.pipeline_steps) {
        setPipelineSteps(res.pipeline_steps);
      } else {
        setPipelineSteps([
          { step: 'Understanding Query', status: 'completed' },
          { step: 'Jurisdiction Filter', status: 'completed', value: jurisdiction },
          { step: 'IPR Category Detection', status: 'completed', value: 'Auto-detected' },
          { step: 'PDF Chunk Retrieval', status: 'completed', chunks_retrieved: (res.citations || []).length },
          { step: 'Gemini Answer Generation', status: 'completed', model: `${res.model_used} (${currentLang})` },
          { step: 'Citation Validation', status: 'completed', citations_validated: (res.citations || []).length }
        ]);
      }

      if (res.citations && res.citations.length > 0) {
        onCitationClick(res.citations[0]);
      }
    } catch (err) {
      console.error('RAG Chat error:', err);
      setAnswerText('⚠️ An error occurred while communicating with the RAG backend.');
    } finally {
      setLoading(false);
    }
  };

  // AUTO-EXECUTE if query was passed from Home or chip
  useEffect(() => {
    if (initialQuery && !autoRunDoneRef.current) {
      autoRunDoneRef.current = true;
      setQuery(initialQuery);
      handleRAGSubmit(initialQuery);
    }
  }, [initialQuery]);

  const handleCopy = () => {
    if (answerText) {
      navigator.clipboard.writeText(answerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const parseInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\[.*?\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-extrabold text-[#174634] bg-[#E6F0E8] px-1 rounded">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('[') && part.endsWith(']')) {
        return (
          <span key={i} className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16866A] bg-[#E6F0E8] px-2 py-0.5 rounded-md border border-[#DCE6DC] mx-1">
            📄 {part.slice(1, -1)}
          </span>
        );
      }
      return part;
    });
  };

  const renderFormattedAnswer = (rawText: string) => {
    if (!rawText) return null;
    const lines = rawText.split('\n');

    return (
      <div className="space-y-3 font-sans text-xs sm:text-sm leading-relaxed text-[#1F3329]">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          // Heading (# / ## / ###)
          if (trimmed.startsWith('#')) {
            const cleanHeading = trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, '');
            return (
              <h3 key={idx} className="text-sm sm:text-base font-extrabold text-[#174634] border-b border-[#DCE6DC] pb-1.5 mt-4 flex items-center gap-2">
                <span>{cleanHeading}</span>
              </h3>
            );
          }

          // Bullet points (- or * or •)
          if (/^[-*•]\s+/.test(trimmed)) {
            const content = trimmed.replace(/^[-*•]\s+/, '');
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-[#16866A] font-extrabold mt-0.5">•</span>
                <div className="flex-1">{parseInlineFormatting(content)}</div>
              </div>
            );
          }

          // Numbered list item
          if (/^\d+\.\s+/.test(trimmed)) {
            const match = trimmed.match(/^(\d+)\.\s+(.*)/);
            if (match) {
              return (
                <div key={idx} className="flex items-start gap-2 pl-2">
                  <span className="text-xs font-mono font-bold text-[#16866A] bg-[#E6F0E8] px-1.5 py-0.5 rounded border border-[#DCE6DC] mt-0.5">
                    {match[1]}
                  </span>
                  <div className="flex-1">{parseInlineFormatting(match[2])}</div>
                </div>
              );
            }
          }

          // Paragraph
          return (
            <p key={idx} className="leading-relaxed">
              {parseInlineFormatting(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white border border-[#DCE6DC] rounded-3xl overflow-hidden shadow-sm font-sans">
      
      {/* 1. TOP PROMINENT SEARCH INPUT BAR */}
      <div className="p-4 border-b border-[#DCE6DC] bg-[#EDF3EB] space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRAGSubmit(query);
          }}
          className="flex items-center gap-2 bg-white border border-[#DCE6DC] rounded-full p-2 shadow-xs focus-within:border-[#16866A]"
        >
          <Search className="w-5 h-5 text-[#16866A] ml-3 mr-1 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.askPlaceholder}
            className="flex-1 bg-transparent text-xs sm:text-sm text-[#1F3329] placeholder-[#66766C] font-medium focus:outline-none px-2 py-1.5"
          />

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-5 py-2.5 bg-[#16866A] hover:bg-[#174634] disabled:opacity-50 text-white font-extrabold text-xs rounded-full shadow-sm transition-all flex items-center gap-1.5 shrink-0 hover:scale-[1.02]"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{t.askBtn} ({currentLang})</span>
          </button>
        </form>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {/* Jurisdiction Pills */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-[#DCE6DC] text-xs font-bold shadow-xs">
            <Globe className="w-3.5 h-3.5 text-[#16866A] ml-2 mr-1" />
            {(['India', 'International', 'Both'] as const).map((j) => (
              <button
                key={j}
                onClick={() => setJurisdiction(j)}
                className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition-all ${
                  jurisdiction === j
                    ? 'bg-[#245C45] text-white shadow-xs'
                    : 'text-[#66766C] hover:text-[#1F3329]'
                }`}
              >
                {j}
              </button>
            ))}
          </div>

          {/* Quick Helper Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRetrievalMode(m => m === 'pdf' ? 'demo' : 'pdf')}
              className="px-3 py-1 rounded-full bg-white border border-[#DCE6DC] text-[11px] font-bold text-[#16866A] hover:bg-[#E6F0E8]"
            >
              Mode: {retrievalMode === 'pdf' ? '📄 PDF RAG' : '🧪 Demo'}
            </button>

            <button
              onClick={onOpenClassifier}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-[#DCE6DC] text-[11px] font-bold text-[#245C45] hover:bg-[#E6F0E8]"
            >
              <Scale className="w-3.5 h-3.5 text-[#16866A]" />
              <span>Classifier</span>
            </button>

            <button
              onClick={onOpenABSHelper}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-[#DCE6DC] text-[11px] font-bold text-[#16866A] hover:bg-[#E6F0E8]"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#16866A]" />
              <span>ABS Helper</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN ANSWER FEED */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 bg-[#F5F7F2]">
        
        {/* Suggested Query Chips */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-extrabold text-[#66766C] uppercase tracking-widest block">{t.suggestedLabel}</span>
          <div className="flex flex-wrap gap-1.5">
            {prompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(prompt);
                  handleRAGSubmit(prompt);
                }}
                className="text-xs bg-white hover:bg-[#E6F0E8] text-[#1F3329] hover:text-[#16866A] border border-[#DCE6DC] hover:border-[#16866A] rounded-full px-3 py-1 text-left transition-all shadow-xs"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* RAG Pipeline Execution Panel */}
        <RetrievalProgressPanel
          steps={pipelineSteps}
          activeJurisdiction={jurisdiction}
          retrievalMode={retrievalMode}
        />

        {/* Gemini Answer Guidance Card */}
        {(answerText || loading) && (
          <div className="bg-white p-6 rounded-3xl border border-[#DCE6DC] space-y-4 shadow-md animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#DCE6DC] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E6F0E8] text-[#16866A] flex items-center justify-center border border-[#DCE6DC]">
                  <Sparkles className={`w-4 h-4 text-[#16866A] ${loading ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-[#174634] uppercase tracking-wider">
                    {loading ? 'Synthesizing Evidence...' : t.chatHeader}
                  </h3>
                  <p className="text-[10px] text-[#16866A] font-medium">{t.chatSubtitle} ({currentLang})</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#1F3329] hover:text-[#16866A] bg-[#EDF3EB] px-2.5 py-1 rounded-full border border-[#DCE6DC]"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#16866A]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? t.copiedBtn : t.copyBtn}</span>
                </button>

                {modelUsed && (
                  <span className="text-[10px] font-mono font-bold text-[#16866A] bg-[#E6F0E8] px-2.5 py-0.5 rounded-full border border-[#DCE6DC]">
                    {modelUsed}
                  </span>
                )}
              </div>
            </div>

            {/* Answer Content */}
            <div>
              {renderFormattedAnswer(answerText)}
            </div>

            {/* Citation Badges */}
            {ragCitations.length > 0 && (
              <div className="border-t border-[#DCE6DC] pt-4 mt-6">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#66766C] block mb-2">
                  {t.citationsLabel} ({ragCitations.length}):
                </span>
                <div className="flex flex-wrap gap-2">
                  {ragCitations.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => onCitationClick(c)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E6F0E8] hover:bg-[#EDF3EB] border border-[#DCE6DC] text-xs font-bold text-[#16866A] transition-all shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#16866A]" />
                      <span>{c.source_title} (Page {c.page_number})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Country Jurisdiction Regulatory Breakdown */}
            {breakdown && (
              <div className="border-t border-[#DCE6DC] pt-5 mt-6 space-y-4 bg-[#EDF3EB] p-4 sm:p-5 rounded-2xl border border-[#DCE6DC] shadow-inner">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#E6F0E8] flex items-center justify-center border border-[#DCE6DC]">
                      <Globe className="w-3.5 h-3.5 text-[#16866A] animate-pulse" />
                    </div>
                    <h4 className="text-xs font-extrabold text-[#174634] uppercase tracking-wider">
                      {t.jurisdictionTitle}
                    </h4>
                  </div>
                  <span className="text-[10px] text-[#66766C] font-semibold">{t.jurisdictionSubtitle}</span>
                </div>

                {/* Country Toggle Buttons */}
                <div className="flex flex-wrap gap-1.5 bg-white p-1.5 rounded-xl border border-[#DCE6DC]">
                  {(['India', 'USA', 'Europe', 'Gulf', 'All'] as const).map((countryKey) => {
                    const flagMap: Record<string, string> = { India: '🇮🇳', USA: '🇺🇸', Europe: '🇪🇺', Gulf: '🇦🇪', All: '🌐' };
                    const labelMap: Record<string, string> = { India: 'India', USA: 'USA (FDA)', Europe: 'Europe (EMA)', Gulf: 'Gulf (GCC)', All: 'All Countries' };
                    return (
                      <button
                        key={countryKey}
                        onClick={() => setSelectedCountry(countryKey)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                          selectedCountry === countryKey
                            ? 'bg-[#245C45] text-white shadow-xs'
                            : 'text-[#66766C] hover:text-[#1F3329] hover:bg-[#E6F0E8]'
                        }`}
                      >
                        <span>{flagMap[countryKey]}</span>
                        <span>{labelMap[countryKey]}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Country Details Card */}
                {selectedCountry === 'All' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {Object.entries(breakdown).map(([cKey, rule]) => (
                      <div key={cKey} className="bg-white p-3.5 rounded-xl border border-[#DCE6DC] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-[#174634] flex items-center gap-1.5">
                            <span className="text-sm">{rule.flag}</span> {rule.country}
                          </span>
                          <span className="text-[10px] font-bold text-[#16866A] bg-[#E6F0E8] px-2 py-0.5 rounded-full border border-[#DCE6DC]">
                            {rule.classification}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#1F3329] font-sans leading-relaxed">{rule.rules_summary}</p>
                        <div className="text-[10px] text-[#16866A] font-medium pt-1 border-t border-[#DCE6DC]">
                          <strong className="text-[#66766C]">Authority:</strong> {rule.authority}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  breakdown[selectedCountry] && (
                    <div className="bg-white p-4 rounded-xl border border-[#DCE6DC] space-y-3 pt-1 animate-fade-in">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DCE6DC] pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{breakdown[selectedCountry].flag}</span>
                          <div>
                            <h5 className="text-xs font-extrabold text-[#174634]">{breakdown[selectedCountry].country} Regulatory Rules</h5>
                            <p className="text-[10px] font-mono text-[#16866A]">{breakdown[selectedCountry].authority}</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-[#16866A] bg-[#E6F0E8] px-3 py-1 rounded-full border border-[#DCE6DC]">
                          {breakdown[selectedCountry].classification}
                        </span>
                      </div>

                      <div className="space-y-2.5 text-xs">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#66766C] block mb-0.5">Statutory Framework</span>
                          <p className="text-[#1F3329] font-semibold">{breakdown[selectedCountry].framework}</p>
                        </div>

                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#66766C] block mb-0.5">Applicable Rule Summary</span>
                          <p className="text-[#1F3329] leading-relaxed bg-[#EDF3EB] p-2.5 rounded-lg border border-[#DCE6DC]">
                            {breakdown[selectedCountry].rules_summary}
                          </p>
                        </div>

                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#66766C] block mb-0.5">Patentability & IPR Status</span>
                          <p className="text-[#16866A] font-medium bg-[#E6F0E8] p-2 rounded-lg border border-[#DCE6DC]">
                            ⚖️ {breakdown[selectedCountry].patentability_status}
                          </p>
                        </div>

                        {breakdown[selectedCountry].key_requirements && (
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#66766C] block mb-1.5">Actionable Compliance Requirements</span>
                            <ul className="space-y-1.5">
                              {breakdown[selectedCountry].key_requirements.map((req, rIdx) => (
                                <li key={rIdx} className="flex items-start gap-2 text-[11px] text-[#1F3329] bg-[#EDF3EB] p-2 rounded-lg border border-[#DCE6DC]">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16866A] shrink-0 mt-0.5" />
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
