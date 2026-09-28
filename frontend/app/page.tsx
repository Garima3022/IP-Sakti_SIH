'use client';

import React, { useState } from 'react';
import { Header } from '../components/Header';
import { HeroLandingView } from '../components/HeroLandingView';
import { LeftPanel } from '../components/LeftPanel';
import { RightPanel } from '../components/RightPanel';
import { SourceLibraryView } from '../components/SourceLibraryView';
import { KnowledgeGardenView } from '../components/KnowledgeGardenView';
import { FormulationClassifierModal } from '../components/FormulationClassifierModal';
import { ABSHelperModal } from '../components/ABSHelperModal';
import { DocumentViewerModal } from '../components/DocumentViewerModal';
import { FormulaVaultDrawer } from '../components/FormulaVaultDrawer';
import { ExpertFinderModal } from '../components/ExpertFinderModal';
import { DossierPreviewModal } from '../components/DossierPreviewModal';
import { Formula, CitesCheckResult, Sec3pResult, ExportPathwayResult, SourceDocument } from '../lib/types';
import { fetchDossierHTML } from '../lib/api';

export default function DashboardPage() {
  const [currentLang, setCurrentLang] = useState('EN');
  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'sources' | 'garden'>('home');
  const [selectedGardenCategory, setSelectedGardenCategory] = useState<string>('All Sources');
  
  // Hero Search Query state
  const [heroSearchQuery, setHeroSearchQuery] = useState<string>('');
  const [heroJurisdiction, setHeroJurisdiction] = useState<'India' | 'International' | 'Both'>('India');

  // Citations & Document Viewer State
  const [activeCitation, setActiveCitation] = useState<any | null>(null);
  const [inspectingDoc, setInspectingDoc] = useState<SourceDocument | null>(null);
  const [inspectingPage, setInspectingPage] = useState<number>(1);
  const [isDocViewerOpen, setIsDocViewerOpen] = useState(false);

  // Modals & Drawers State
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isExpertsOpen, setIsExpertsOpen] = useState(false);
  const [isClassifierOpen, setIsClassifierOpen] = useState(false);
  const [isABSHelperOpen, setIsABSHelperOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [dossierHtml, setDossierHtml] = useState('');

  // Latest Analysis State
  const [latestCites, setLatestCites] = useState<CitesCheckResult | null>(null);
  const [latestSec3p, setLatestSec3p] = useState<Sec3pResult | null>(null);
  const [latestExport, setLatestExport] = useState<ExportPathwayResult | null>(null);

  const handleHeroSearch = (query: string, jurisdiction: 'India' | 'International' | 'Both') => {
    setHeroSearchQuery(query);
    setHeroJurisdiction(jurisdiction);
    setActiveTab('chat');
  };

  const handleInspectDocument = (doc: SourceDocument, pageNum: number = 1) => {
    setInspectingDoc(doc);
    setInspectingPage(pageNum);
    setIsDocViewerOpen(true);
  };

  const handleSelectGardenCategory = (category: string) => {
    setSelectedGardenCategory(category);
    setActiveTab('sources');
  };

  const handleGenerateDossier = async (formula: Formula) => {
    const payload = {
      formula: formula,
      sec3p_data: latestSec3p || {
        sec_3p_risk_level: 'MODERATE',
        sec_3p_risk_score: 65,
        synergy_evaluation: 'Poly-herbal formulation requiring unexpected synergistic index CI < 0.8.',
        actionable_recommendations: [
          'Conduct comparative in-vitro bio-assays against individual botanicals.',
          'Specify standardized extract ratios (e.g. 4:1 aqueous-ethanolic fraction).'
        ]
      },
      cites_data: latestCites || {
        status: 'WARNING',
        flagged_botanicals: [
          {
            botanical_name: 'Saussurea costus',
            sanskrit_name: 'Kushta (Kuth)',
            cites_appendix: 'Appendix I',
            wildlife_act_schedule: 'Schedule VI (Protected)',
            legal_status: 'Strict export restrictions apply to wild-harvested specimens.'
          }
        ]
      },
      export_data: latestExport || {}
    };

    try {
      const html = await fetchDossierHTML(payload);
      setDossierHtml(html);
      setIsDossierOpen(true);
    } catch (err) {
      console.error('Failed to generate dossier HTML', err);
    }
  };

  return (
    <main className="flex flex-col h-screen overflow-hidden bg-[#F5F7F2] text-[#1F3329] font-sans">
      {/* Top Navigation Header */}
      <Header
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenVault={() => setIsVaultOpen(true)}
        onOpenExperts={() => setIsExpertsOpen(true)}
      />

      {/* Main Dynamic View Workspace */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'home' && (
          <HeroLandingView
            currentLang={currentLang}
            onSearch={handleHeroSearch}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'chat' && (
          <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-hidden">
            {/* Left AI Chat Panel */}
            <div className="lg:col-span-7 h-full overflow-hidden">
              <LeftPanel
                onCitationClick={(citation) => setActiveCitation(citation)}
                activeCitation={activeCitation}
                currentLang={currentLang}
                onNavigateTab={setActiveTab}
                onOpenClassifier={() => setIsClassifierOpen(true)}
                onOpenABSHelper={() => setIsABSHelperOpen(true)}
                initialQuery={heroSearchQuery}
                initialJurisdiction={heroJurisdiction}
              />
            </div>

            {/* Right Evidence & Sources Panel */}
            <div className="lg:col-span-5 h-full overflow-hidden">
              <RightPanel
                activeCitation={activeCitation}
                onInspectDocument={handleInspectDocument}
              />
            </div>
          </div>
        )}

        {activeTab === 'sources' && (
          <SourceLibraryView
            onViewDocument={(doc) => handleInspectDocument(doc, 1)}
            selectedCategoryFilter={selectedGardenCategory}
          />
        )}

        {activeTab === 'garden' && (
          <KnowledgeGardenView
            onSelectCategory={handleSelectGardenCategory}
          />
        )}
      </div>

      {/* Modals & Drawers */}
      <DocumentViewerModal
        isOpen={isDocViewerOpen}
        document={inspectingDoc}
        initialPage={inspectingPage}
        onClose={() => setIsDocViewerOpen(false)}
      />

      <FormulationClassifierModal
        isOpen={isClassifierOpen}
        onClose={() => setIsClassifierOpen(false)}
      />

      <ABSHelperModal
        isOpen={isABSHelperOpen}
        onClose={() => setIsABSHelperOpen(false)}
      />

      <FormulaVaultDrawer
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        onSelectFormula={(f) => {}}
        onGenerateDossier={handleGenerateDossier}
      />

      <ExpertFinderModal
        isOpen={isExpertsOpen}
        onClose={() => setIsExpertsOpen(false)}
      />

      <DossierPreviewModal
        isOpen={isDossierOpen}
        htmlContent={dossierHtml}
        onClose={() => setIsDossierOpen(false)}
      />
    </main>
  );
}
