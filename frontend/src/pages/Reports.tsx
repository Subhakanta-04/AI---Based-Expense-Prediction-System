import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer
} from 'lucide-react';
import { api } from '../services/api';

export const Reports: React.FC = () => {
  const [reportMarkdown, setReportMarkdown] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        const res = await api.getReportMarkdown();
        setReportMarkdown(res.report_markdown);
      } catch (err) {
        console.error("Failed to load report", err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, []);

  const handleDownload = () => {
    const blob = new Blob([reportMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'FYTE_Technical_Report.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-zinc-800 border-t-white animate-spin" />
        <p className="text-xs font-mono-code text-zinc-400">Loading technical project specification...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-heading flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-zinc-300" />
            Project Technical Specification & Documentation
          </h2>
          <p className="text-xs text-zinc-400">
            Exhaustive 15-section technical submission and architectural reference document.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            Export Markdown
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-zinc-200 text-black transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Report Document Paper Canvas */}
      <div className="glass-card rounded-xl p-6 sm:p-10 border border-zinc-800 text-zinc-300 leading-relaxed font-sans shadow-sm">
        <div className="prose prose-invert max-w-none prose-headings:font-heading prose-headings:text-white prose-h1:text-xl prose-h2:text-lg prose-h2:border-b prose-h2:border-zinc-800 prose-h2:pb-2 prose-h2:mt-8 prose-h3:text-sm prose-table:text-xs prose-th:bg-zinc-900 prose-th:py-2 prose-th:px-3 prose-td:py-2 prose-td:px-3 prose-td:border-zinc-800">
          <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm leading-relaxed text-zinc-300">
            {reportMarkdown}
          </div>
        </div>
      </div>
    </div>
  );
};
