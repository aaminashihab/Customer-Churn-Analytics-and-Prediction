/**
 * Types and interfaces for Customer Churn Analytics and Prediction
 */

export interface Customer {
  customerID: string;
  gender: "Male" | "Female";
  SeniorCitizen: 0 | 1;
  Partner: "Yes" | "No";
  Dependents: "Yes" | "No";
  tenure: number;
  PhoneService: "Yes" | "No";
  MultipleLines: "Yes" | "No" | "No phone service";
  InternetService: "DSL" | "Fiber optic" | "No";
  OnlineSecurity: "Yes" | "No" | "No internet service";
  OnlineBackup: "Yes" | "No" | "No internet service";
  DeviceProtection: "Yes" | "No" | "No internet service";
  TechSupport: "Yes" | "No" | "No internet service";
  StreamingTV: "Yes" | "No" | "No internet service";
  StreamingMovies: "Yes" | "No" | "No internet service";
  Contract: "Month-to-month" | "One year" | "Two year";
  PaperlessBilling: "Yes" | "No";
  PaymentMethod:
    | "Electronic check"
    | "Mailed check"
    | "Bank transfer (automatic)"
    | "Credit card (automatic)";
  MonthlyCharges: number;
  TotalCharges: number;
  Churn?: "Yes" | "No";
}

export interface RiskFactor {
  factor: string;
  weight: number; // percentage impact - can be positive or negative
  description: string;
  type: "increase" | "decrease";
}

export interface RetentionAction {
  action: string;
  priority: "High" | "Medium" | "Low";
  impactDescription: string;
}

export interface ChurnPredictionResult {
  customerID: string;
  probability: number; // 0 to 100%
  riskCategory: "High" | "Medium" | "Low";
  riskFactors: RiskFactor[];
  aiAnalysis?: string;
  retentionPlan?: RetentionAction[];
}

export interface DatasetSummary {
  totalCustomers: number;
  churnRate: number; // e.g. 26.5
  avgMonthlyCharges: number;
  avgTenure: number;
  contractDistribution: { name: string; value: number }[];
  internetDistribution: { name: string; value: number }[];
  paymentDistribution: { name: string; value: number }[];
  churnByContract: { contract: string; churnRate: number; activeRate: number }[];
  churnByInternet: { service: string; churnRate: number; activeRate: number }[];
  churnByTenure: { range: string; churnCount: number; activeCount: number }[];
}
