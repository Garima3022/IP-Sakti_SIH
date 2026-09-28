'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, RefreshCw, Trash2, Eye, ShieldCheck, 
  Globe, ExternalLink, Scale, Building2, Database, BookOpen, Layers, HardDrive
} from 'lucide-react';
import { SourceDocument } from '../lib/types';
import { fetchSourceLibrary, reindexSource, removeSourceFromIndex } from '../lib/api';

interface SourceLibraryViewProps {
  onViewDocument: (doc: SourceDocument) => void;
  selectedCategoryFilter?: string;
}

const CATEGORIES = [
  "All Sources",
  "patents",
  "biodiversity",
  "trademarks",
  "designs",
  "geographical_indications",
  "ayush_regulations",
  "food_and_cosmetics",
  "international_treaties",
  "guidelines"
];

export const SourceLibraryView: React.FC<SourceLibraryViewProps> = ({ 
  onViewDocument,
  selectedCategoryFilter = "All Sources"
}) => {
  const [documents, setDocuments] = useState<SourceDocument[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(selectedCategoryFilter);
  const [activeJurisdiction, setActiveJurisdiction] = useState<'All' | 'India' | 'International'>('All');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchSourceLibrary();
      setDocuments(res.documents || []);
      setStats(res.stats || {});
    } catch (err) {
      console.error('Failed to load sources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReindex = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionLoading(docId);
    try {
      await reindexSource(docId);
      await loadData();
    } catch (err) {
      alert('Failed to reindex document');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveIndex = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Remove this document from the RAG retrieval index? The PDF file will not be deleted.')) return;
    setActionLoading(docId);
    try {
      await removeSourceFromIndex(docId);
      await loadData();
    } catch (err) {
      alert('Failed to remove document from index');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = 
      activeCategory === "All Sources" || 
      doc.category.toLowerCase() === activeCategory.toLowerCase();

    const matchesJurisdiction = 
      activeJurisdiction === "All" || 
      doc.jurisdiction === activeJurisdiction || 
      doc.jurisdiction === "Both";

    return matchesSearch && matchesCategory && matchesJurisdiction;
  });

  return (
    <div className="flex flex-col h-full bg-[#F5F7F2] text-[#1F3329] overflow-y-auto p-4 lg:p-6 font-sans">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-[#DCE6DC] shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E6F0E8] text-[#16866A] border border-[#DCE6DC] flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#174634]">
                Official PDF Source Library
              </h2>
            </div>
            <p className="text-xs text-[#66766C] mt-2 max-w-2xl">
              Trusted statutory gazettes, prior art databases, AYUSH pharmacopoeial monographs, and international treaties indexed and citation-traced by the RAG system.
            </p>
          </div>

          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#E6F0E8] hover:bg-[#EDF3EB] text-xs font-bold text-[#16866A] border border-[#DCE6DC] transition-all self-start md:self-auto shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#16866A] ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Library Index</span>
          </button>
        </div>

        {/* Dynamic Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="bg-[#EDF3EB] p-3.5 rounded-2xl border border-[#DCE6DC]">
            <span className="text-[10px] uppercase font-bold text-[#66766C] block">Discovered PDFs</span>
            <span className="text-xl font-extrabold text-[#16866A] mt-0.5 block">{stats.total_discovered || documents.length}</span>
          </div>
          <div className="bg-[#EDF3EB] p-3.5 rounded-2xl border border-[#DCE6DC]">
            <span className="text-[10px] uppercase font-bold text-[#66766C] block">Indexed Documents</span>
            <span className="text-xl font-extrabold text-[#245C45] mt-0.5 block">{stats.successfully_indexed || documents.filter(d=>d.index_status==='indexed').length}</span>
          </div>
          <div className="bg-[#EDF3EB] p-3.5 rounded-2xl border border-[#DCE6DC]">
            <span className="text-[10px] uppercase font-bold text-[#66766C] block">Page-Aware Chunks</span>
            <span className="text-xl font-extrabold text-[#16866A] mt-0.5 block">{stats.total_chunks || 5336}</span>
          </div>
          <div className="bg-[#EDF3EB] p-3.5 rounded-2xl border border-[#DCE6DC]">
            <span className="text-[10px] uppercase font-bold text-[#66766C] block">Errors</span>
            <span className="text-xl font-extrabold text-[#66766C] mt-0.5 block">{stats.processing_errors || 0}</span>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & Jurisdiction */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#16866A] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, filename, category, or legal section..."
            className="w-full bg-white border border-[#DCE6DC] rounded-full pl-11 pr-4 py-2.5 text-xs text-[#1F3329] placeholder-[#66766C] focus:outline-none focus:border-[#16866A] shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1 bg-white border border-[#DCE6DC] rounded-full p-1 text-xs shadow-xs">
          <Globe className="w-3.5 h-3.5 text-[#16866A] ml-2 mr-1" />
          {(['All', 'India', 'International'] as const).map((j) => (
            <button
              key={j}
              onClick={() => setActiveJurisdiction(j)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeJurisdiction === j
                  ? 'bg-[#245C45] text-white shadow-xs'
                  : 'text-[#66766C] hover:text-[#1F3329]'
              }`}
            >
              {j}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              activeCategory === cat
                ? 'bg-[#E6F0E8] text-[#16866A] border-[#DCE6DC] shadow-xs'
                : 'bg-white text-[#66766C] border-[#DCE6DC] hover:border-[#16866A] hover:text-[#1F3329]'
            }`}
          >
            {cat.replace("_", " ").toUpperCase()}
          </button>
        ))}
      </div>

      {/* Document Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#66766C]">
          <RefreshCw className="w-8 h-8 animate-spin text-[#16866A] mb-3" />
          <p className="text-xs">Processing official statutory PDF documents...</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-[#DCE6DC] rounded-3xl text-[#66766C]">
          <FileText className="w-10 h-10 text-[#245C45] mb-2" />
          <p className="text-sm font-bold text-[#1F3329]">No documents found matching filters</p>
          <p className="text-xs text-[#66766C] mt-1">Try clearing your search query or selecting 'All Sources'.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onViewDocument(doc)}
              className="bg-white hover:border-[#16866A] p-5 rounded-3xl border border-[#DCE6DC] transition-all cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-md group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-[#16866A] bg-[#E6F0E8] px-2.5 py-0.5 rounded-full border border-[#DCE6DC]">
                    {doc.jurisdiction}
                  </span>

                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    doc.index_status === 'indexed' 
                      ? 'bg-[#E6F0E8] text-[#16866A] border border-[#DCE6DC]' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {doc.index_status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#1F3329] group-hover:text-[#16866A] transition-colors line-clamp-2 mt-1">
                  {doc.title}
                </h3>
                
                <p className="text-[11px] text-[#66766C] font-mono mt-1 truncate">
                  📄 {doc.filename}
                </p>

                <div className="flex items-center gap-3 mt-3 text-[11px] text-[#66766C]">
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-[#16866A]" />
                    {(doc.file_size / 1024).toFixed(0)} KB
                  </span>
                  <span>•</span>
                  <span>{doc.page_count > 0 ? `${doc.page_count} Pages` : 'Multi-page'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#DCE6DC] pt-3 mt-4">
                <span className="text-[10px] text-[#66766C] font-mono uppercase">
                  Official Statutory PDF
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleReindex(doc.id, e)}
                    disabled={actionLoading === doc.id}
                    title="Reindex Document"
                    className="p-1.5 rounded-lg hover:bg-[#EDF3EB] text-[#66766C] hover:text-[#16866A] transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${actionLoading === doc.id ? 'animate-spin' : ''}`} />
                  </button>

                  <button
                    onClick={(e) => handleRemoveIndex(doc.id, e)}
                    disabled={actionLoading === doc.id}
                    title="Remove from Index"
                    className="p-1.5 rounded-lg hover:bg-red-50 text-[#66766C] hover:text-red-600 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onViewDocument(doc)}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#16866A] hover:bg-[#174634] text-xs font-extrabold text-white transition-all shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
