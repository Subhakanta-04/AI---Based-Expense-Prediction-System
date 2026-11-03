import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Code2, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';

interface VivaQuestion {
  id: number;
  category: string;
  question: string;
  shortAnswer: string;
  detailedRationale: string;
  codeSnippet?: string;
  keyKeywords: string[];
}

const VIVA_QUESTIONS: VivaQuestion[] = [
  {
    id: 1,
    category: "Problem Formulation",
    question: "Why is the problem formulated as supervised regression rather than classification?",
    shortAnswer: "Continuous quantity estimation in Indian Rupees (INR) vs discrete label prediction.",
    detailedRationale: "Classification maps inputs into discrete class labels (e.g. category classification or binary fraud flags). In this architecture, the target variable 'Amount' is a continuous real-valued positive float. Predicting the monetary magnitude of future expenditure is a classic supervised regression task.",
    keyKeywords: ["Continuous Target", "Supervised Regression", "Amount in INR", "Empirical Risk Minimization"]
  },
  {
    id: 2,
    category: "Data Leakage Prevention",
    question: "How does the pipeline ensure zero lookahead data leakage in rolling and lag features?",
    shortAnswer: "Strict application of `.shift(1)` before computing rolling window averages.",
    detailedRationale: "If rolling averages were computed on raw Amount values without shifting, row t would include its own target y_t in the calculation, leaking the dependent variable into the feature space. By applying `df['Amount'].shift(1)` first, rolling window features strictly evaluate observations from t-1 backwards.",
    codeSnippet: "# Strictly causal shifting before rolling calculation\nshifted_amt = df['Amount'].shift(1)\ndf['Rolling_7_Day_Avg'] = shifted_amt.rolling(7, min_periods=1).mean()",
    keyKeywords: [".shift(1)", "Strict Causality", "Zero Lookahead Bias", "No Target Leakage"]
  },
  {
    id: 3,
    category: "Train/Test Partitioning",
    question: "Why is random K-Fold cross validation prohibited for this dataset?",
    shortAnswer: "Random shuffling shuffles future transactions into the training set.",
    detailedRationale: "Financial transactions occur in chronological time series. Random shuffling allows transactions from June 2024 to train models that predict February 2024, violating time causality. We use a chronological 80% train (Jan 2 to May 18) and 20% test (May 20 to June 30) split.",
    keyKeywords: ["Chronological 80/20 Split", "Temporal Ordering", "No Lookahead", "Unseen Future Validation"]
  },
  {
    id: 4,
    category: "Algorithm Comparison",
    question: "Why does the regularized Gradient Boosting / XGBoost architecture excel on this dataset?",
    shortAnswer: "Log-target transformation and text-semantic features allow gradient boosted trees to model multiplicative expense dynamics with minimal error.",
    detailedRationale: "By incorporating semantic TF-IDF token features with log-target transformation (TransformedTargetRegressor) and conservative tree depth (max_depth=2), gradient boosted trees capture transaction semantics without overfitting, achieving stellar generalization (Test RMSE = ₹60.99, Test R² = 0.9822).",
    keyKeywords: ["Gradient Boosting & XGBoost", "Log Target Transform", "Semantic TF-IDF Features", "High R² (>0.98)"]
  },
  {
    id: 5,
    category: "Anomaly Detection",
    question: "How does the Interquartile Range (IQR) method isolate anomalous transactions?",
    shortAnswer: "Flags values exceeding Q3 + 1.5 × IQR globally and at the category level.",
    detailedRationale: "The IQR is Q3 - Q1. Any transaction exceeding Q3 + 1.5*IQR is an outlier. Because an expense of ₹1,500 is normal for Shopping/Electronics but anomalous for Food or Transport, FYTE computes category-specific fences to avoid false positives.",
    codeSnippet: "iqr = q75 - q25\nupper_fence = q75 + (1.5 * iqr)\nis_anomaly = amount > upper_fence",
    keyKeywords: ["IQR (Q3 - Q1)", "1.5 × IQR Fence", "Category Sensitivity", "Non-Parametric Outlier"]
  },
  {
    id: 6,
    category: "Evaluation Metrics",
    question: "What is the structural difference between MAE and RMSE in evaluating financial models?",
    shortAnswer: "RMSE squares deviations, heavily penalizing large unexpected spikes (e.g. ₹4,000 purchases).",
    detailedRationale: "MAE is the average absolute deviation (|y - y_hat|), representing typical expected rupee error (₹204). RMSE takes the square root of squared errors, giving disproportionate weight to large outliers. For a financial application, low RMSE is preferred because large surprise expenditures cause severe budget deficits.",
    keyKeywords: ["L1 vs L2 Loss", "Quadratic Penalty", "MAE ₹204 vs RMSE ₹297", "Outlier Sensitivity"]
  },
  {
    id: 7,
    category: "Multi-Step Forecasting",
    question: "How does FYTE generate 30-day ahead projections without future data?",
    shortAnswer: "Autoregressive iterative multi-step simulation updating rolling features dynamically.",
    detailedRationale: "For day 1, the model predicts using current rolling statistics. That prediction is appended to the historical sequence, dynamically recalculating the 3-day, 7-day, and 14-day rolling averages for day 2. This process repeats recursively across 30 days.",
    keyKeywords: ["Autoregressive Iteration", "Dynamic Rolling Updates", "Multi-Step Forecasting"]
  }
];

export const VivaAssistant: React.FC = () => {
  const [openCard, setOpenCard] = useState<number | null>(1);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white font-heading flex items-center gap-2.5">
          <GraduationCap className="w-5 h-5 text-zinc-300" />
          Technical Methodology & Examination Defense
        </h2>
        <p className="text-xs text-zinc-400">
          Formal architectural justifications, mathematical formulations, and algorithmic rationale.
        </p>
      </div>

      {/* Quick Summary Note */}
      <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-3">
        <BookOpen className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="block font-semibold text-white mb-0.5">Methodological Rationale Brief</strong>
          Emphasize the statistical rigor: strict causal shifting (`.shift(1)`), chronological out-of-time evaluation, and variance reduction through bootstrap aggregation (Random Forest) on small sample distributions.
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {VIVA_QUESTIONS.map((q) => {
          const isOpen = openCard === q.id;

          return (
            <div
              key={q.id}
              className={`rounded-xl border transition-colors ${
                isOpen ? 'border-zinc-700 bg-zinc-900/70' : 'border-zinc-800 bg-zinc-900/40'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenCard(isOpen ? null : q.id)}
                className="w-full p-4 text-left flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 font-mono-code text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {q.id}
                  </span>
                  <div>
                    <span className="text-[10px] font-mono-code uppercase tracking-wider text-zinc-400 font-medium">
                      {q.category}
                    </span>
                    <h3 className="text-sm font-semibold text-white mt-0.5">
                      {q.question}
                    </h3>
                    <p className="text-xs text-zinc-300 font-medium mt-1">
                      Key Takeaway: {q.shortAnswer}
                    </p>
                  </div>
                </div>

                <div className="p-1 text-zinc-400">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-zinc-800/80 space-y-3">
                  <div>
                    <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                      Formal Mathematical & Architectural Rationale
                    </h4>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {q.detailedRationale}
                    </p>
                  </div>

                  {q.codeSnippet && (
                    <div>
                      <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-zinc-400" />
                        Implementation Reference
                      </h4>
                      <pre className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] font-mono-code text-zinc-300 overflow-x-auto">
                        {q.codeSnippet}
                      </pre>
                    </div>
                  )}

                  <div>
                    <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                      Defense Keywords
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {q.keyKeywords.map((kw) => (
                        <span key={kw} className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
