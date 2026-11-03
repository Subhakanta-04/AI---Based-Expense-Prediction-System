import { 
  User,
  AuthResponse,
  BudgetStatus,
  ScenarioResult,
  DatasetInfo, 
  EDASummary, 
  EDACharts, 
  ModelComparison, 
  BestModelInfo, 
  PredictionResult, 
  ForecastData, 
  AnomalyReport, 
  AIInsight 
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('fyte_token') || localStorage.getItem('spendwise_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...getAuthHeader(),
        ...(options?.headers || {})
      }
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.detail || `HTTP Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err: any) {
    console.error(`API Call failed on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  register: (payload: { name: string; email: string; password: string; role?: string }) =>
    fetchJson<AuthResponse>('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }),

  login: (payload: { email: string; password: string }) =>
    fetchJson<AuthResponse>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }),

  getMe: () => fetchJson<User>('/auth/me'),
  logout: () => fetchJson<{ message: string }>('/auth/logout', { method: 'POST' }),

  // Budget & Goal Targets
  getBudgetStatus: () => fetchJson<BudgetStatus>('/budget/status'),
  setBudget: (category: string, monthly_limit: number) =>
    fetchJson<{ category: string; monthly_limit: number; message: string }>('/budget/set', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, monthly_limit })
    }),

  // Add Expense Live
  addExpense: (payload: { Date: string; Category: string; Amount: number; Payment_Method: string; Description?: string }) =>
    fetchJson<{ success: boolean; record: any; is_anomaly: boolean; anomaly_reason: string; total_records: number; message: string }>('/expenses/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }),

  // Scenario / What-If Simulator
  simulateScenario: (payload: { cut_food_pct?: number; cut_shopping_pct?: number; cut_entertainment_pct?: number; shopping_cap?: number }) =>
    fetchJson<ScenarioResult>('/ml/scenario-simulation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }),

  // Dataset
  getDatasetInfo: () => fetchJson<DatasetInfo>('/dataset/info'),
  getDatasetPreview: (limit = 50) => fetchJson<{ columns: string[]; rows: any[]; total_count: number }>(`/dataset/preview?limit=${limit}`),
  uploadDataset: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/dataset/upload`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Upload failed');
    }
    return await res.json();
  },
  resetDataset: () => fetchJson<{ success: boolean; message: string }>('/dataset/reset', { method: 'POST' }),

  // EDA
  getEDASummary: () => fetchJson<EDASummary>('/eda/summary'),
  getEDACharts: () => fetchJson<EDACharts>('/eda/charts'),
  getEDACorrelation: () => fetchJson<{ features: string[]; correlation_matrix: Record<string, Record<string, number>> }>('/eda/correlation'),

  // ML Models
  trainModels: () => fetchJson<{ status: string; best_model: string; metrics: any; num_records: number; audit: any }>('/ml/train', { method: 'POST' }),
  getModelComparison: () => fetchJson<ModelComparison[]>('/ml/models'),
  getBestModel: () => fetchJson<BestModelInfo>('/ml/best-model'),
  getMetrics: () => fetchJson<any>('/ml/metrics'),
  getFeatureImportance: () => fetchJson<Array<{ feature: string; importance: number; relative_importance: number }>>('/ml/feature-importance'),
  getActualVsPredicted: () => fetchJson<Array<{ Date: string; Actual: number; Predicted: number; Residual: number }>>('/ml/actual-vs-predicted'),

  // Prediction & Forecast
  predictExpense: (payload: {
    Date?: string;
    Category: string;
    Payment_Method: string;
    Description?: string;
    Previous_Expense?: number;
    Rolling_3_Day_Average?: number;
    Rolling_7_Day_Average?: number;
    Rolling_14_Day_Average?: number;
  }) => fetchJson<PredictionResult>('/ml/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }),

  getForecast: (days = 30) => fetchJson<ForecastData>(`/ml/forecast?days=${days}`),

  // Anomalies & Insights
  getAnomalies: () => fetchJson<AnomalyReport>('/ml/anomalies'),
  getInsights: () => fetchJson<AIInsight[]>('/ml/insights'),
  getReportMarkdown: () => fetchJson<{ report_markdown: string }>('/reports/summary'),
};
