import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Cpu, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

const PIPELINE_STEPS = [
  { id: 1, name: "Dataset Ingestion & Schema Validation", desc: "Ingesting raw expense_data.csv and verifying column types" },
  { id: 2, name: "Data Cleansing & Standardization", desc: "Standardizing categorical mappings, null handling, and date parsing" },
  { id: 3, name: "Causal Feature Engineering", desc: "Computing strictly shifted rolling window averages via shift(1)" },
  { id: 4, name: "Chronological Partitioning", desc: "Strict temporal 80% Train (91 rows) / 20% Test (23 rows) split" },
  { id: 5, name: "Model Estimation & Fitting", desc: "Fitting Linear Regression, Random Forest, Gradient Boost & XGBoost" },
  { id: 6, name: "Out-of-Time Metric Evaluation", desc: "Evaluating test MAE, MSE, RMSE, and R² scores" },
  { id: 7, name: "Champion Model Selection", desc: "Ranking candidates primarily by lowest test RMSE, secondarily by R²" },
  { id: 8, name: "Artifact Serialization", desc: "Serializing best model, preprocessor, and metadata via Joblib" }
];

export const TrainModel: React.FC = () => {
  const [training, setTraining] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [trainResult, setTrainResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const startTrainingPipeline = async () => {
    setTraining(true);
    setCompleted(false);
    setError(null);
    setActiveStep(1);

    try {
      // Step simulation for visual evaluation feedback
      for (let s = 1; s <= 7; s++) {
        setActiveStep(s);
        await new Promise((r) => setTimeout(r, 400));
      }

      const res = await api.trainModels();
      setActiveStep(8);
      await new Promise((r) => setTimeout(r, 350));
      
      setTrainResult(res);
      setCompleted(true);
    } catch (err: any) {
      console.error("Training error", err);
      setError(err.message || "Model training pipeline encountered an error.");
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-heading flex items-center gap-2.5">
            <BrainCircuit className="w-5 h-5 text-zinc-300" />
            Machine Learning Pipeline Orchestration
          </h2>
          <p className="text-xs text-zinc-400">
            Execute data cleansing, causal feature construction, 80/20 chronological partitioning, and model serialization.
          </p>
        </div>

        <button
          onClick={startTrainingPipeline}
          disabled={training}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs bg-white hover:bg-zinc-200 text-black transition-colors disabled:opacity-50"
        >
          {training ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Running Pipeline...
            </>
          ) : (
            <>
              <Cpu className="w-3.5 h-3.5" />
              Execute Pipeline Retraining
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-zinc-400 flex-shrink-0" />
          <span className="text-xs">{error}</span>
        </div>
      )}

      {/* Completion Banner */}
      {completed && trainResult && (
        <div className="p-5 rounded-xl glass-card border border-zinc-700 bg-zinc-900/60 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 text-white flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Pipeline Execution Complete
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono-code bg-zinc-800 text-zinc-300 border border-zinc-700">
                    Joblib Persisted
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white font-heading mt-0.5">
                  Champion Model: <span className="text-white">{trainResult.best_model}</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Designated optimal candidate based on lowest out-of-sample RMSE and maximal R².
                </p>
              </div>
            </div>

            <div className="flex items-center gap-5 border-t sm:border-t-0 sm:border-l border-zinc-800 pt-3 sm:pt-0 sm:pl-6">
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-mono-code">Test RMSE</span>
                <span className="text-lg font-bold text-white font-mono-code">
                  ₹{trainResult.metrics.rmse}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-mono-code">Test R²</span>
                <span className="text-lg font-bold text-white font-mono-code">
                  {trainResult.metrics.r2}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8-Step Pipeline Visual Tracker */}
      <div className="glass-card rounded-xl p-6 border border-zinc-800">
        <h3 className="text-sm font-bold text-white font-heading mb-1">
          Sequential Pipeline Pipeline Execution
        </h3>
        <p className="text-xs text-zinc-400 mb-5">
          Standardized 8-stage transformation enforcing strict temporal non-leakage
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PIPELINE_STEPS.map((step) => {
            const isDone = completed || (activeStep !== null && activeStep > step.id);
            const isCurrent = activeStep === step.id && training;

            return (
              <div
                key={step.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-zinc-800 border-zinc-600'
                    : isDone
                    ? 'bg-zinc-900/80 border-zinc-800'
                    : 'bg-zinc-950/40 border-zinc-900 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`w-5 h-5 rounded text-[10px] font-mono-code font-bold flex items-center justify-center ${
                    isDone
                      ? 'bg-white text-black'
                      : isCurrent
                      ? 'bg-zinc-700 text-white animate-pulse'
                      : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                  }`}>
                    {step.id}
                  </span>
                  {isDone && <CheckCircle2 className="w-4 h-4 text-zinc-300" />}
                  {isCurrent && <RefreshCw className="w-4 h-4 text-white animate-spin" />}
                </div>

                <h4 className={`text-xs font-semibold ${isCurrent ? 'text-white' : isDone ? 'text-zinc-200' : 'text-zinc-500'}`}>
                  {step.name}
                </h4>
                <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Architectural Guarantee Note */}
      <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-zinc-300 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-zinc-200 block mb-0.5">Strict Temporal Causality</strong>
          All rolling statistics are shifted prior to computation (`.shift(1)`), and the dataset partition is split chronologically (80% training up to May 18, 2024; 20% testing from May 20, 2024).
        </div>
      </div>
    </div>
  );
};
