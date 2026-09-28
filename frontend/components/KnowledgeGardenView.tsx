'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, ShieldCheck, Scale, Leaf, Globe, FileText, ArrowRight, Sparkles, Database
} from 'lucide-react';
import { fetchSourceLibrary } from '../lib/api';

interface KnowledgeGardenViewProps {
  onSelectCategory: (category: string) => void;
}

const GARDEN_CATEGORIES = [
  {
    id: "ayurvedic_knowledge",
    categoryKey: "food_and_cosmetics",
    title: "Ayurvedic Knowledge & Pharmacopoeias",
    description: "Ayurvedic Pharmacopoeia of India (API), classical Dravya properties, Rasa-Veerya-Vipaka jurisprudence, and Ayurveda-Aahara compendiums.",
    icon: Leaf,
    gradient: "from-emerald-500 to-teal-500"
  },
  {
    id: "ip_patents",
    categoryKey: "patents",
    title: "Intellectual Property & Patent Law",
    description: "Indian Patents Act 1970 §3(p) non-patentability rules, synergistic bio-assay requirements, guidelines for AYUSH inventions, and IPO guidelines.",
    icon: Scale,
    gradient: "from-teal-500 to-emerald-400"
  },
  {
    id: "regulations",
    categoryKey: "ayush_regulations",
    title: "Regulations, Licensing & Safety",
    description: "Drugs and Cosmetics Act 1940 & Rules 1945 (Part XVI), Rule 158-B ASU licensing, Schedule E(1) poisonous Dravya controls, and heavy metal limits.",
    icon: ShieldCheck,
    gradient: "from-emerald-600 to-teal-500"
  },
  {
    id: "biodiversity",
    categoryKey: "biodiversity",
    title: "Biodiversity & Access Benefit Sharing (ABS)",
    description: "Biological Diversity (Amendment) Act 2023, National Biodiversity Authority (NBA) guidelines, State Biodiversity Board notifications, and CITES compliance.",
    icon: Database,
    gradient: "from-teal-600 to-emerald-400"
  },
  {
    id: "traditional_knowledge",
    categoryKey: "guidelines",
    title: "Traditional Knowledge Protection",
    description: "TKDL prior art screening protocols, WIPO traditional knowledge publications, and prior art disclosures preventing biopiracy.",
    icon: BookOpen,
    gradient: "from-emerald-500 to-teal-600"
  },
  {
    id: "international_treaties",
    categoryKey: "international_treaties",
    title: "International Treaties & Global Frameworks",
    description: "WIPO GRATK Treaty, TRIPS Agreement, PCT Regulations, US FDA Botanical Guidance, EU THMPD 2004/24/EC, and GCC herbal guidelines.",
    icon: Globe,
    gradient: "from-teal-400 to-emerald-600"
  }
];

export const KnowledgeGardenView: React.FC<KnowledgeGardenViewProps> = ({ onSelectCategory }) => {
  const [docCounts, setDocCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetchSourceLibrary();
        const docs = res.documents || [];
        const counts: Record<string, number> = {};
        
        docs.forEach((d: any) => {
          const cat = d.category || "ayush_regulations";
          counts[cat] = (counts[cat] || 0) + 1;
        });
        
        setDocCounts(counts);
      } catch (err) {
        console.error("Failed to load garden stats:", err);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#F5F7F2] text-[#1F3329] overflow-y-auto p-4 lg:p-6 font-sans">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-[#DCE6DC] shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E6F0E8] text-[#16866A] border border-[#DCE6DC] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#16866A]" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-[#174634]">
              Knowledge Garden
            </h2>
            <p className="text-xs text-[#66766C] mt-1">
              Explore structured statutory knowledge clusters indexed from official gazettes, treaties, and pharmacopoeial references.
            </p>
          </div>
        </div>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {GARDEN_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const count = docCounts[cat.categoryKey] || (cat.categoryKey === 'patents' ? 4 : cat.categoryKey === 'biodiversity' ? 3 : cat.categoryKey === 'international_treaties' ? 6 : 3);

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.categoryKey)}
              className="bg-white hover:border-[#16866A] p-6 rounded-3xl border border-[#DCE6DC] transition-all cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-md group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#E6F0E8] border border-[#DCE6DC] flex items-center justify-center text-[#16866A]">
                    <Icon className="w-6 h-6" />
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[#E6F0E8] text-[#16866A] border border-[#DCE6DC]">
                    <FileText className="w-3.5 h-3.5 text-[#16866A]" />
                    {count} Documents
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#1F3329] group-hover:text-[#16866A] transition-colors">
                  {cat.title}
                </h3>

                <p className="text-xs text-[#66766C] leading-relaxed mt-2 font-medium">
                  {cat.description}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-[#DCE6DC] pt-4 mt-6">
                <span className="text-[11px] font-extrabold text-[#66766C] uppercase tracking-wider">
                  Knowledge Node
                </span>

                <div className="flex items-center gap-1 text-xs font-extrabold text-[#16866A] group-hover:translate-x-1 transition-transform">
                  <span>Explore Domain</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
