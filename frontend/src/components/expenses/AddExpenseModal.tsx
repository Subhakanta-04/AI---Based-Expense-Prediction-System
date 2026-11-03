import React, { useState } from 'react';
import { X, Plus, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseAdded?: () => void;
  categories?: string[];
  paymentMethods?: string[];
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onExpenseAdded,
  categories = ['Food', 'Shopping', 'Transport', 'Utilities', 'Entertainment', 'Health'],
  paymentMethods = ['UPI', 'Credit Card', 'Cash', 'Net Banking'],
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(categories[0] || 'Food');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0] || 'UPI');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ isAnomaly: boolean; reason: string; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = parseFloat(amount);
    if (isNaN(numAmt) || numAmt <= 0) {
      alert("Please enter a valid positive numerical amount.");
      return;
    }

    setLoading(true);
    setFeedback(null);
    try {
      const res = await api.addExpense({
        Date: date,
        Category: category,
        Amount: numAmt,
        Payment_Method: paymentMethod,
        Description: description || `${category} purchase`,
      });

      setFeedback({
        isAnomaly: res.is_anomaly,
        reason: res.anomaly_reason,
        message: res.message
      });

      if (onExpenseAdded) {
        onExpenseAdded();
      }

      // Reset form fields after 1.8s
      setTimeout(() => {
        setAmount('');
        setDescription('');
        setFeedback(null);
        onClose();
      }, 1800);
    } catch (err: any) {
      alert(err.message || "Failed to record expense.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 animate-in fade-in duration-150">
      <div className="w-full max-w-lg glass-card rounded-xl p-6 border border-zinc-800 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-heading">Record Transaction</h3>
            <p className="text-xs text-zinc-400">Append entry to ledger with real-time IQR dispersion check</p>
          </div>
        </div>

        {/* Real-time Anomaly Feedback Alert */}
        {feedback && (
          <div className={`p-3.5 mb-4 rounded-lg border flex items-start gap-2.5 text-xs ${
            feedback.isAnomaly 
              ? 'bg-zinc-900 border-zinc-700 text-zinc-200' 
              : 'bg-zinc-900 border-zinc-700 text-zinc-200'
          }`}>
            {feedback.isAnomaly ? (
              <AlertTriangle className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <strong className="block font-bold mb-0.5">
                {feedback.isAnomaly ? "Statistical Anomaly Flagged" : "Recorded & Validated Normal"}
              </strong>
              <span className="text-zinc-400">{feedback.reason}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Amount (₹)</label>
              <input
                type="number"
                step="any"
                required
                placeholder="850"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-zinc-500 font-mono-code font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-zinc-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-zinc-500"
              >
                {paymentMethods.map((pm) => (
                  <option key={pm} value={pm}>{pm}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Description (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Office Supplies"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-zinc-200 text-black transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Save Entry
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
