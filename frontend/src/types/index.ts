export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface BudgetStatus {
  period: string;
  total_budget: number;
  total_spent_so_far: number;
  total_projected_month_end: number;
  overall_percentage: number;
  categories: Array<{
    category: string;
    monthly_limit: number;
    spent_so_far: number;
    remaining_budget: number;
    percentage_used: number;
    projected_month_end: number;
    is_over_budget: boolean;
    will_exceed: boolean;
    status_level: 'safe' | 'warning' | 'danger';
    alert_message: string;
  }>;
}

export interface ScenarioResult {
  baseline_30_day_total: number;
  scenario_30_day_total: number;
  projected_monthly_savings: number;
  savings_percentage: number;
  category_savings: Record<string, number>;
  daily_comparison: Array<{
    step: number;
    date: string;
    day_name: string;
    category: string;
    baseline_amount: number;
    simulated_amount: number;
    daily_savings: number;
  }>;
  verdict: string;
}

export interface DatasetInfo {
  num_records: number;
  num_columns: number;
  columns: string[];
  data_types: Record<string, string>;
  missing_values: Record<string, number>;
  total_missing_values: number;
  duplicate_records: number;
  date_range: {
    start: string;
    end: string;
  };
  num_categories: number;
  categories: string[];
  num_payment_methods: number;
  payment_methods: string[];
  amount_stats: {
    total: number;
    mean: number;
    median: number;
    std: number;
    min: number;
    max: number;
  };
}

export interface EDASummary {
  total_records: number;
  total_expense: number;
  average_expense: number;
  median_expense: number;
  max_expense: number;
  min_expense: number;
  top_category: string;
  top_category_percentage: number;
  most_used_payment_method: string;
  categories: Array<{
    category: string;
    total_spent: number;
    average_spent: number;
    transaction_count: number;
    highest_expense: number;
    percentage_of_total: number;
  }>;
  payment_methods: Array<{
    payment_method: string;
    total_spent: number;
    transaction_count: number;
    average_spent: number;
    percentage_volume: number;
  }>;
  spending_trend: {
    direction: "Increasing" | "Decreasing" | "Stable";
    slope: number;
    percentage_change: number;
    description: string;
  };
  weekend_vs_weekday: {
    weekend_mean: number;
    weekend_total: number;
    weekend_count: number;
    weekday_mean: number;
    weekday_total: number;
    weekday_count: number;
  };
}

export interface EDACharts {
  timeline: Array<{
    date: string;
    amount: number;
    category: string;
    payment_method: string;
    description: string;
  }>;
  monthly: Array<{
    month: string;
    total: number;
    average: number;
    count: number;
  }>;
  daily_pattern: Array<{
    day: string;
    total: number;
    average: number;
    count: number;
  }>;
  top_expenses: Array<{
    date: string;
    category: string;
    amount: number;
    payment_method: string;
    description: string;
  }>;
  distribution_buckets: Array<{
    range: string;
    count: number;
  }>;
}

export interface ModelComparison {
  Model: string;
  MAE: number;
  MSE: number;
  RMSE: number;
  R2: number;
  Train_RMSE: number;
  Train_R2: number;
  Is_Best: boolean;
}

export interface BestModelInfo {
  best_model_name: string;
  primary_criterion: string;
  secondary_criterion: string;
  test_metrics: {
    mae: number;
    mse: number;
    rmse: number;
    r2: number;
    mape?: number;
  };
  train_metrics: {
    mae: number;
    mse: number;
    rmse: number;
    r2: number;
  };
  num_features: number;
  features: string[];
  feature_importances: Array<{
    feature: string;
    importance: number;
    relative_importance: number;
  }>;
  training_time: string;
}

export interface PredictionResult {
  predicted_amount: number;
  currency: string;
  model_name: string;
  reliability_label: string;
  reliability_score: number;
  test_rmse: number;
  test_mae: number;
  test_r2: number;
  typical_range: {
    lower: number;
    upper: number;
  };
  interpretation: string;
}

export interface ForecastData {
  next_7_days: {
    total_spending: number;
    daily_average: number;
    records: Array<{
      step: number;
      date: string;
      day_name: string;
      category: string;
      predicted_amount: number;
      lower_bound: number;
      upper_bound: number;
    }>;
  };
  next_14_days: {
    total_spending: number;
    daily_average: number;
    records: Array<any>;
  };
  next_30_days: {
    total_spending: number;
    daily_average: number;
    records: Array<any>;
  };
  combined_chart_series: Array<{
    date: string;
    actual: number | null;
    predicted: number | null;
    lower_bound?: number;
    upper_bound?: number;
    category: string;
    is_forecast: boolean;
  }>;
  disclaimer: string;
}

export interface AnomalyReport {
  total_transactions: number;
  anomaly_count: number;
  anomaly_percentage: number;
  total_anomalous_amount: number;
  global_iqr_threshold: number;
  category_thresholds: Record<string, any>;
  anomalies: Array<{
    date: string;
    category: string;
    amount: number;
    payment_method: string;
    description: string;
    z_score: number;
    reason: string;
  }>;
  normal_sample: Array<{
    date: string;
    category: string;
    amount: number;
    payment_method: string;
    description: string;
  }>;
}

export interface AIInsight {
  id: string;
  type: string;
  icon: string;
  title: string;
  description: string;
  impact: "High" | "Medium" | "Low";
  badge: string;
}
