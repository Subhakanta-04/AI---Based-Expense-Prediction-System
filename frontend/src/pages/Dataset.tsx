import React, { useState, useEffect } from 'react';
import { 
  Database, 
  UploadCloud, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Table as TableIcon,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { api } from '../services/api';
import { DatasetInfo } from '../types';

interface ExpenseRecord {
  Date: string;
  Category: string;
  Amount: number;
  Payment_Method: string;
  Description: string;
  [key: string]: any;
}

export const Dataset: React.FC = () => {
  const [info, setInfo] = useState<DatasetInfo | null>(null);
  const [rows, setRows] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ success: boolean; message: string } | null>(null);
  
  // Filtering and sorting states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortField, setSortField] = useState<'Date' | 'Amount'>('Date');
  const [sortAsc, setSortAsc] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [meta, preview] = await Promise.all([
        api.getDatasetInfo(),
        api.getDatasetPreview(200)
      ]);
      setInfo(meta);
      setRows(preview.rows || []);
    } catch (err) {
      console.error("Failed to load dataset", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus(null);
    try {
      const res = await api.uploadDataset(file);
      setUploadStatus({ success: true, message: res.message });
      await loadData();
    } catch (err: any) {
      setUploadStatus({ 
        success: false, 
        message: err.message || "Failed to upload CSV file. Verify schema formatting." 
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Restore default expense_data.csv (114 chronological records)?")) return;
    try {
      setLoading(true);
      const res = await api.resetDataset();
      setUploadStatus({ success: true, message: res.message });
      await loadData();
    } catch (err: any) {
      setUploadStatus({ success: false, message: err.message || "Failed to reset dataset." });
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = rows.filter((row) => {
    const matchesSearch = 
      (row.Description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (row.Category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (row.Payment_Method || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || row.Category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  if (loading && !info) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-zinc-800 border-t-white animate-spin" />
        <p className="text-xs font-mono-code text-zinc-400">Inspecting dataset metadata and schema integrity...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-heading">Historical Transaction Ledger</h2>
          <p className="text-xs text-zinc-400">
            Primary storage: <span className="font-mono-code text-zinc-300 font-semibold">expense_data.csv</span> (114 chronological transactions)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            Restore Default CSV
          </button>

          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-zinc-200 text-black cursor-pointer transition-colors shadow-sm">
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload New CSV</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Upload Feedback Toast */}
      {uploadStatus && (
        <div className="p-3.5 rounded-lg flex items-center gap-3 border bg-zinc-900 border-zinc-700 text-zinc-200 text-xs">
          {uploadStatus.success ? <CheckCircle2 className="w-4 h-4 text-zinc-300 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-zinc-400 flex-shrink-0" />}
          <span>{uploadStatus.message}</span>
        </div>
      )}

      {/* Dataset Metadata Diagnostic Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass-card rounded-xl p-4 border border-zinc-800">
          <span className="text-[11px] font-mono-code text-zinc-400 block mb-1">Total Entries</span>
          <p className="text-xl font-bold text-white font-mono-code">{info?.num_records || 114}</p>
        </div>
        <div className="glass-card rounded-xl p-4 border border-zinc-800">
          <span className="text-[11px] font-mono-code text-zinc-400 block mb-1">Feature Dimension</span>
          <p className="text-xl font-bold text-white font-mono-code">{info?.num_columns || 5}</p>
        </div>
        <div className="glass-card rounded-xl p-4 border border-zinc-800">
          <span className="text-[11px] font-mono-code text-zinc-400 block mb-1">Time Boundary</span>
          <p className="text-xs font-semibold text-zinc-300 font-mono-code mt-1 truncate">
            {info?.date_range.start} → {info?.date_range.end}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4 border border-zinc-800">
          <span className="text-[11px] font-mono-code text-zinc-400 block mb-1">Missing Values</span>
          <p className="text-xl font-bold text-white font-mono-code">{info?.total_missing_values ?? 0}</p>
        </div>
        <div className="glass-card rounded-xl p-4 border border-zinc-800">
          <span className="text-[11px] font-mono-code text-zinc-400 block mb-1">Duplicate Rows</span>
          <p className="text-xl font-bold text-white font-mono-code">{info?.duplicate_records ?? 0}</p>
        </div>
        <div className="glass-card rounded-xl p-4 border border-zinc-800">
          <span className="text-[11px] font-mono-code text-zinc-400 block mb-1">Categories</span>
          <p className="text-xl font-bold text-white font-mono-code">{info?.num_categories || 6}</p>
        </div>
      </div>

      {/* Dataset Schema Inspection Card */}
      <div className="glass-card rounded-xl p-5 border border-zinc-800">
        <h3 className="text-xs font-bold text-white uppercase font-mono-code tracking-wider mb-3 flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-zinc-400" />
          Field Specifications & Inferred Dtypes
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {['Date', 'Category', 'Amount', 'Payment_Method', 'Description'].map((col) => (
            <div key={col} className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono-code font-bold text-xs text-white">{col}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono-code">
                  {info?.data_types[col] || 'object'}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">
                {col === 'Date' && 'Chronological ISO format'}
                {col === 'Category' && '6 discrete expenditure classes'}
                {col === 'Amount' && 'Target continuous real variable'}
                {col === 'Payment_Method' && '4 financial channels'}
                {col === 'Description' && 'Free-form transactional text'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Dataset Data Table */}
      <div className="glass-card rounded-xl p-5 border border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-bold text-white font-heading">Ledger Browser</h3>
            <span className="text-xs text-zinc-500 font-mono-code">({filteredRows.length} displayed)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search description, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-zinc-500"
            >
              <option value="ALL">All Categories</option>
              {(info?.categories || []).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[480px]">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-zinc-900 text-zinc-400 border-b border-zinc-800 font-mono-code">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Payment Channel</th>
                <th className="py-2.5 px-3 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
              {filteredRows.map((r, i) => (
                <tr key={i} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-2 px-3 font-mono-code text-zinc-500">{i + 1}</td>
                  <td className="py-2 px-3 font-mono-code text-zinc-300">{r.Date}</td>
                  <td className="py-2 px-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-code bg-zinc-900 text-zinc-300 border border-zinc-800">
                      {r.Category}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-zinc-200">{r.Description}</td>
                  <td className="py-2 px-3 text-zinc-400">{r.Payment_Method}</td>
                  <td className="py-2 px-3 text-right font-mono-code font-bold text-white">
                    ₹{r.Amount?.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
