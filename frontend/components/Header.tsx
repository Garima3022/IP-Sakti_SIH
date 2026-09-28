'use client';

import React from 'react';
import { 
  Scale, Globe, Sparkles, FolderCheck, MessageSquare, Database, 
  BookOpen, Home, ShieldCheck, ArrowRight, Leaf 
} from 'lucide-react';
import { I18n } from '../lib/i18n';

interface HeaderProps {
  currentLang: string;
  onLanguageChange: (lang: string) => void;
  activeTab: 'home' | 'chat' | 'sources' | 'garden';
  onTabChange: (tab: 'home' | 'chat' | 'sources' | 'garden') => void;
  onOpenVault: () => void;
  onOpenExperts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  activeTab,
  onTabChange,
  onOpenVault,
  onOpenExperts
}) => {
  const t = I18n.get(currentLang);

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#DCE6DC] px-4 lg:px-8 py-3 flex items-center justify-between shadow-sm">
      {/* Brand Mark */}
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onTabChange('home')}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#245C45] to-[#16866A] p-0.5 shadow-sm group-hover:scale-105 transition-transform">
          <div className="w-full h-full bg-[#245C45] rounded-[10px] flex items-center justify-center text-white">
            <Scale className="w-5 h-5 text-white" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg lg:text-xl font-extrabold text-[#174634] tracking-tight">
              DR. AYURVEDIC SATHI
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#E6F0E8] text-[#16866A] border border-[#DCE6DC] shadow-xs">
              <ShieldCheck className="w-3 h-3 text-[#16866A]" />
              {t.sihTag}
            </span>
          </div>
          <p className="text-[11px] text-[#66766C] font-medium hidden sm:block">
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* Center Navigation Bar */}
      <nav className="hidden md:flex items-center gap-1.5 bg-[#EDF3EB] p-1.5 rounded-full border border-[#DCE6DC]">
        <button
          onClick={() => onTabChange('home')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeTab === 'home'
              ? 'bg-[#245C45] text-white shadow-sm'
              : 'text-[#66766C] hover:text-[#1F3329] hover:bg-[#E6F0E8]'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>{t.navHome}</span>
        </button>

        <button
          onClick={() => onTabChange('chat')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeTab === 'chat'
              ? 'bg-[#245C45] text-white shadow-sm'
              : 'text-[#66766C] hover:text-[#1F3329] hover:bg-[#E6F0E8]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#16866A]" />
          <span>{t.navChat}</span>
        </button>

        <button
          onClick={() => onTabChange('sources')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeTab === 'sources'
              ? 'bg-[#245C45] text-white shadow-sm'
              : 'text-[#66766C] hover:text-[#1F3329] hover:bg-[#E6F0E8]'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-[#16866A]" />
          <span>{t.navSources}</span>
        </button>

        <button
          onClick={() => onTabChange('garden')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeTab === 'garden'
              ? 'bg-[#245C45] text-white shadow-sm'
              : 'text-[#66766C] hover:text-[#1F3329] hover:bg-[#E6F0E8]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-[#16866A]" />
          <span>{t.navGarden}</span>
        </button>
      </nav>

      {/* Right Tools & Language */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Language Selector */}
        <div className="flex items-center bg-[#EDF3EB] border border-[#DCE6DC] rounded-lg px-2.5 py-1 text-xs text-[#1F3329] font-semibold">
          <Globe className="w-3.5 h-3.5 text-[#16866A] mr-1.5" />
          <select
            value={currentLang}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-transparent text-[#1F3329] focus:outline-none cursor-pointer pr-1"
          >
            <option value="EN" className="bg-white text-[#1F3329]">English (EN)</option>
            <option value="HI" className="bg-white text-[#1F3329]">हिंदी (Hindi)</option>
            <option value="TA" className="bg-white text-[#1F3329]">தமிழ் (Tamil)</option>
            <option value="SK" className="bg-white text-[#1F3329]">संस्कृतम् (Sanskrit)</option>
          </select>
        </div>

        {/* Experts Finder Button */}
        <button
          onClick={onOpenExperts}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EDF3EB] hover:bg-[#E6F0E8] border border-[#DCE6DC] text-xs font-bold text-[#1F3329] transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#D99A36]" />
          <span>{t.navExperts}</span>
        </button>

        {/* Formula Vault Button */}
        <button
          onClick={onOpenVault}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#16866A] hover:bg-[#174634] text-white font-extrabold text-xs shadow-sm transition-all hover:scale-[1.02]"
        >
          <FolderCheck className="w-4 h-4 text-emerald-100" />
          <span className="hidden sm:inline">{t.navVault}</span>
        </button>
      </div>
    </header>
  );
};
