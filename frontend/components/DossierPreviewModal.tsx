'use client';

import React from 'react';
import { X, Printer, FileCheck } from 'lucide-react';

interface DossierPreviewModalProps {
  isOpen: boolean;
  htmlContent: string;
  onClose: () => void;
}

export const DossierPreviewModal: React.FC<DossierPreviewModalProps> = ({
  isOpen,
  htmlContent,
  onClose,
}) => {
  if (!isOpen) return null;

  function handlePrint() {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white border border-[#DCE6DC] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#DCE6DC] bg-[#E6F0E8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-[#16866A]" />
            <h2 className="text-sm font-extrabold text-[#1F3329] uppercase tracking-wider">
              DR. Ayurvedic Sathi - Official Compliance Dossier Preview
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16866A] hover:bg-[#174634] text-white font-bold text-xs rounded-lg shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
            <button onClick={onClose} className="p-1 text-[#66766C] hover:text-[#1F3329] rounded-lg hover:bg-white/60">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* HTML Frame */}
        <iframe
          srcDoc={htmlContent}
          title="Compliance Dossier Preview"
          className="w-full flex-1 bg-white"
        />
      </div>
    </div>
  );
};
