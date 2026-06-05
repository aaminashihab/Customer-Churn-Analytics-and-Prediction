import React, { useState, useEffect, useRef } from "react";
import {
  TrendingUp,
  Search,
  Users,
  CreditCard,
  Shield,
  Activity,
  FileText,
  Sliders,
  Database,
  Sparkles,
  Upload,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  User,
  Zap,
  Info
} from "lucide-react";
import Papa from "papaparse";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { Customer, ChurnPredictionResult, DatasetSummary } from "./types";
import { SAMPLE_CUSTOMERS } from "./data/sample_customers";
import { DashboardView } from "./components/DashboardView";
import { SimulatorView } from "./components/SimulatorView";
import { BulkView } from "./components/BulkView";

// Quick heuristic calculation helper on the client-side for ultra-fast slider feedback
function quickClientPredict(cust: Customer): ChurnPredictionResult {
  let logOdds = -1.2;
  const factors: any[] = [];

  if (Number(cust.SeniorCitizen) === 1) {
    logOdds += 0.25;
    factors.push({
      factor: "Senior Citizen Group",
      weight: 8,
      description: "Seniors historically showcase higher cancellation rates due to fixed income.",
      type: "increase",
    });
  }

  if (cust.Partner === "No") {
    logOdds += 0.15;
    factors.push({
      factor: "No Partner on Record",
      weight: 5,
      description: "Individual accounts cancel slightly faster than joint-partner accounts.",
      type: "increase",
    });
  }

  if (cust.Dependents === "Yes") {
    logOdds -= 0.2;
    factors.push({
      factor: "Family Dependents Present",
      weight: -6,
      description: "Family households present significantly more stability and lower churn velocities.",
      type: "decrease",
    });
  }

  if (cust.tenure <= 6) {
    logOdds += 1.25;
    factors.push({
      factor: "Critical Onboarding Window (<= 6 mos)",
      weight: 35,
      description: "Customers in their first 6 months have extremely high churn rates.",
      type: "increase",
    });
  } else if (cust.tenure <= 12) {
    logOdds += 0.6;
    factors.push({
      factor: "Early Lifecycle Phase (6-12 mos)",
      weight: 18,
      description: "Early-stage accounts undergo a secondary review milestone and higher risk.",
      type: "increase",
    });
  } else if (cust.tenure > 48) {
    logOdds -= 1.1;
    factors.push({
      factor: "High Customer Loyalty (> 4 yrs)",
      weight: -30,
      description: "Highly established accounts represent high long-term retention.",
      type: "decrease",
    });
  } else {
    logOdds -= 0.3;
    factors.push({
      factor: "Maturing Tenure",
      weight: -10,
      description: "Account tenure is maturing past critical churn cycles.",
      type: "decrease",
    });
  }

  if (cust.Contract === "Month-to-month") {
    logOdds += 1.6;
    factors.push({
      factor: "Flexible Month-to-Month Contract",
      weight: 42,
      description: "Absence of lock-in creates high transactional volatility.",
      type: "increase",
    });
  } else if (cust.Contract === "Two year") {
    logOdds -= 1.5;
    factors.push({
      factor: "Two-Year Long Term Agreement",
      weight: -38,
      description: "Fixed long-term contracts heavily insulate against competitive outreach.",
      type: "decrease",
    });
  } else if (cust.Contract === "One year") {
    logOdds -= 0.5;
    factors.push({
      factor: "One-Year Contract Guarantee",
      weight: -15,
      description: "Guarantees intermediate continuity and limits immediate transition.",
      type: "decrease",
    });
  }

  if (cust.InternetService === "Fiber optic") {
    logOdds += 0.85;
    factors.push({
      factor: "Fiber Optic High Broadband",
      weight: 24,
      description: "Fiber services correlate strongly with pricing complaints.",
      type: "increase",
    });
  } else if (cust.InternetService === "No") {
    logOdds -= 0.8;
    factors.push({
      factor: "Basic Services Only (No Internet)",
      weight: -22,
      description: "Simple phone-only accounts showcase extremely high brand loyalty.",
      type: "decrease",
    });
  }

  if (cust.InternetService !== "No") {
    if (cust.OnlineSecurity === "No") {
      logOdds += 0.35;
      factors.push({
        factor: "Lack of Online Security Package",
        weight: 12,
        description: "Missing cyber-protection lowers account friction of leaving.",
        type: "increase",
      });
    } else if (cust.OnlineSecurity === "Yes") {
      logOdds -= 0.25;
      factors.push({
        factor: "Online Security Activated",
        weight: -8,
        description: "Embedded security utilities create strong product integration.",
        type: "decrease",
      });
    }

    if (cust.TechSupport === "No") {
      logOdds += 0.4;
      factors.push({
        factor: "No Tech Support Subscription",
        weight: 15,
        description: "Unassisted technical issues represent a gateway to service frustration.",
        type: "increase",
      });
    } else if (cust.TechSupport === "Yes") {
      logOdds -= 0.35;
      factors.push({
        factor: "Dedicated Tech Support Service",
        weight: -11,
        description: "Fast support resolution vastly diminishes utility friction.",
        type: "decrease",
      });
    }
  }

  if (cust.PaymentMethod === "Electronic check") {
    logOdds += 0.55;
    factors.push({
      factor: "Manual Electronic Check Payments",
      weight: 16,
      description: "Active monthly manual invoicing reminds customers of costs, amplifying pricing fatigue.",
      type: "increase",
    });
  } else if (
    cust.PaymentMethod === "Bank transfer (automatic)" ||
    cust.PaymentMethod === "Credit card (automatic)"
  ) {
    logOdds -= 0.45;
    factors.push({
      factor: "Automatic Billing Activated",
      weight: -14,
      description: "Passive, automated transactions significantly reduce routine payment friction.",
      type: "decrease",
    });
  }

  const billingPremium = cust.MonthlyCharges / 60;
  if (billingPremium > 1.4) {
    logOdds += 0.35;
    factors.push({
      factor: "High Billing Tariff Tier",
      weight: 11,
      description: "Monthly charges exceed 40% of normal median limits.",
      type: "increase",
    });
  } else if (cust.MonthlyCharges < 25) {
    logOdds -= 0.4;
    factors.push({
      factor: "Economy/Budget Billing Profile",
      weight: -12,
      description: "Ultra-low subscription fees rarely spark budget reviews or contract audits.",
      type: "decrease",
    });
  }

  const probabilityDecimal = 1 / (1 + Math.exp(-logOdds));
  const probability = Math.round(probabilityDecimal * 100);

  return {
    customerID: cust.customerID,
    probability,
    riskCategory: probability >= 55 ? "High" : probability >= 25 ? "Medium" : "Low",
    riskFactors: factors.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight)),
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "simulator" | "bulk">("dashboard");
  const [summaryData, setSummaryData] = useState<DatasetSummary | null>(null);
  const [isGeminiActive, setIsGeminiActive] = useState<boolean>(false);
  
  // Single Customer Simulator States
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(SAMPLE_CUSTOMERS[0]);
  const [simProps, setSimProps] = useState<Customer>({ ...SAMPLE_CUSTOMERS[0] });
  const [prediction, setPrediction] = useState<ChurnPredictionResult | null>(null);
  
  // AI Agent States
  const [aiAnalyzing, setAiAnalyzing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<ChurnPredictionResult | null>(null);
  
  // Bulk Evaluation States
  const [bulkCustomers, setBulkCustomers] = useState<Customer[]>([]);
  const [bulkResults, setBulkResults] = useState<ChurnPredictionResult[]>([]);
  const [bulkProcessing, setBulkProcessing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync simulator properties with selected customer when selected customer changes
  useEffect(() => {
    setSimProps({ ...selectedCustomer });
    setAiResult(null);
  }, [selectedCustomer]);

  // Recalculate risk automatically in the simulation state inside immediate feedback
  useEffect(() => {
    const res = quickClientPredict(simProps);
    setPrediction(res);
  }, [simProps]);

  // Fetch benchmark statistics from server
  useEffect(() => {
    fetch("/api/dataset-summary")
      .then((res) => res.json())
      .then((data) => {
        setSummaryData(data);
        if (data && typeof data.geminiActive === "boolean") {
          setIsGeminiActive(data.geminiActive);
        }
      })
      .catch((err) => console.error("Error loading benchmark metadata:", err));
  }, []);

  // Consult AI Forensic Agent Route
  const handleConsultAIAgent = async () => {
    if (!prediction) return;
    setAiAnalyzing(true);
    setAiResult(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: simProps,
          prediction: prediction,
        }),
      });
      const result = await response.json();
      setAiResult(result);
    } catch (err) {
      console.error("Gemini Forensic query error:", err);
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Helper: Trigger customer change in simulator controls
  const updateSimProp = (field: keyof Customer, value: any) => {
    setSimProps((prev) => {
      const copy = { ...prev, [field]: value };
      // Maintain total charges correlation: tenure * monthly charges roughly
      if (field === "tenure" || field === "MonthlyCharges") {
        copy.TotalCharges = Number((copy.tenure * copy.MonthlyCharges).toFixed(2));
      }
      return copy;
    });
  };

  // Handle Loading Default Sample CSV
  const handleLoadSampleCSV = () => {
    setBulkProcessing(true);
    setTimeout(() => {
      // Process sample list
      const results = SAMPLE_CUSTOMERS.map((cust) => quickClientPredict(cust));
      setBulkCustomers(SAMPLE_CUSTOMERS);
      setBulkResults(results);
      setBulkProcessing(false);
    }, 800);
  };

  // Handle CSV Import Upload manual/drag-drop
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkProcessing(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        const rawRows = results.data as any[];
        const validCustomers: Customer[] = rawRows
          .map((row, idx) => {
            const customerID = String(row.customerID || row.CustomerID || `BULK-${1000 + idx}`);
            const gender = row.gender === "Female" ? ("Female" as const) : ("Male" as const);
            const SeniorCitizen = row.SeniorCitizen === 1 ? (1 as const) : (0 as const);
            const Partner = row.Partner === "No" ? ("No" as const) : ("Yes" as const);
            const Dependents = row.Dependents === "Yes" ? ("Yes" as const) : ("No" as const);
            const tenure = Math.max(1, Math.min(72, Number(row.tenure || row.Tenure || 6)));
            const PhoneService = row.PhoneService === "No" ? ("No" as const) : ("Yes" as const);
            
            let MultipleLines = "No";
            if (row.MultipleLines === "Yes") MultipleLines = "Yes";
            else if (row.MultipleLines === "No phone service" || PhoneService === "No") MultipleLines = "No phone service";

            const InternetService = row.InternetService === "DSL" ? ("DSL" as const) : (row.InternetService === "Fiber optic" ? ("Fiber optic" as const) : ("No" as const));

            let OnlineSecurity = "No";
            if (row.OnlineSecurity === "Yes") OnlineSecurity = "Yes";
            else if (InternetService === "No") OnlineSecurity = "No internet service";

            let OnlineBackup = "No";
            if (row.OnlineBackup === "Yes") OnlineBackup = "Yes";
            else if (InternetService === "No") OnlineBackup = "No internet service";

            let DeviceProtection = "No";
            if (row.DeviceProtection === "Yes") DeviceProtection = "Yes";
            else if (InternetService === "No") DeviceProtection = "No internet service";

            let TechSupport = "No";
            if (row.TechSupport === "Yes") TechSupport = "Yes";
            else if (InternetService === "No") TechSupport = "No internet service";

            let StreamingTV = "No";
            if (row.StreamingTV === "Yes") StreamingTV = "Yes";
            else if (InternetService === "No") StreamingTV = "No internet service";

            let StreamingMovies = "No";
            if (row.StreamingMovies === "Yes") StreamingMovies = "Yes";
            else if (InternetService === "No") StreamingMovies = "No internet service";

            const Contract = row.Contract === "Two year" ? ("Two year" as const) : (row.Contract === "One year" ? ("One year" as const) : ("Month-to-month" as const));
            const PaperlessBilling = row.PaperlessBilling === "No" ? ("No" as const) : ("Yes" as const);

            let PaymentMethod: any = "Electronic check";
            if (row.PaymentMethod?.includes("Mailed")) PaymentMethod = "Mailed check";
            else if (row.PaymentMethod?.includes("Bank")) PaymentMethod = "Bank transfer (automatic)";
            else if (row.PaymentMethod?.includes("Credit")) PaymentMethod = "Credit card (automatic)";

            const MonthlyCharges = Number(row.MonthlyCharges || row.Monthly || 55.0);
            const TotalCharges = Number(row.TotalCharges || row.Total || (MonthlyCharges * tenure));

            return {
              customerID,
              gender,
              SeniorCitizen,
              Partner,
              Dependents,
              tenure,
              PhoneService,
              MultipleLines,
              InternetService,
              OnlineSecurity,
              OnlineBackup,
              DeviceProtection,
              TechSupport,
              StreamingTV,
              StreamingMovies,
              Contract,
              PaperlessBilling,
              PaymentMethod,
              MonthlyCharges,
              TotalCharges,
            } as Customer;
          });

        const batchPredictions = validCustomers.map((c) => quickClientPredict(c));
        setBulkCustomers(validCustomers);
        setBulkResults(batchPredictions);
        setBulkProcessing(false);
      },
      error: (err) => {
        console.error("CSV parse failure:", err);
        setBulkProcessing(false);
      }
    });
  };

  // Bulk Summary Metrics Helpers
  const highRiskCount = bulkResults.filter((r) => r.riskCategory === "High").length;
  const mediumRiskCount = bulkResults.filter((r) => r.riskCategory === "Medium").length;
  const lowRiskCount = bulkResults.filter((r) => r.riskCategory === "Low").length;
  const avgBulkProbability = bulkResults.length 
    ? Math.round(bulkResults.reduce((acc, r) => acc + r.probability, 0) / bulkResults.length) 
    : 0;

  // Filtered sample checklist
  const filteredCustomers = SAMPLE_CUSTOMERS.filter((cust) => {
    return (
      cust.customerID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.Contract.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.InternetService.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-[#0c1015] font-sans text-white antialiased flex flex-col relative overflow-x-hidden">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/15 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/15 rounded-full blur-[120px]"></div>
        <div className="absolute top-[30%] right-[20%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Platform Branding Header */}
      <header className="sticky top-0 z-40 bg-[#0c1015]/40 backdrop-blur-xl border-b border-white/10 shadow-lg px-6 py-4 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-blue-500 to-purple-500 text-white rounded-xl shadow-inner flex items-center justify-center font-bold">
            <Activity className="w-5 h-5 animate-pulse" id="brand-logo" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-tight">
              Customer Churn Analytics
            </h1>
            <p className="text-xs text-white/40 font-medium">
              Enterprise Risk Assessment Console &middot; IBM Telco Standard
            </p>
          </div>
        </div>

        {/* Live Simulation Badge Status */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 text-xs font-semibold animate-double-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            <span>Live Analysis Connected</span>
          </div>

          {!isGeminiActive ? (
            <div className="flex items-center space-x-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-xs animate-pulse">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold">AI Demo Mode</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 bg-teal-500/10 border border-teal-500/20 text-teal-300 px-2.5 py-1 rounded-full text-xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-300 animate-pulse" />
              <span className="font-semibold tracking-wide">Gemini Activated</span>
            </div>
          )}
        </div>
      </header>

      {/* Primary tab control strip */}
      <div className="bg-slate-950/25 border-b border-white/10 px-6 flex space-x-8 text-sm font-semibold text-white/60 relative z-10">
        <button
          id="tab-dashboard"
          onClick={() => setActiveTab("dashboard")}
          className={`py-4 transition-all relative outline-none cursor-pointer ${
            activeTab === "dashboard"
              ? "text-white font-bold"
              : "hover:text-white/80"
          }`}
        >
          Overview Dashboard
          {activeTab === "dashboard" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
          )}
        </button>
        <button
          id="tab-simulator"
          onClick={() => setActiveTab("simulator")}
          className={`py-4 transition-all relative outline-none cursor-pointer ${
            activeTab === "simulator"
              ? "text-white font-bold"
              : "hover:text-white/80"
          }`}
        >
          Individual Risk Simulator
          {activeTab === "simulator" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
          )}
        </button>
        <button
          id="tab-bulk"
          onClick={() => setActiveTab("bulk")}
          className={`py-4 transition-all relative outline-none cursor-pointer ${
            activeTab === "bulk"
              ? "text-white font-bold"
              : "hover:text-white/80"
          }`}
        >
          Bulk Ingestion Predictor
          {activeTab === "bulk" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Main body canvas */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6 relative z-10">
        {activeTab === "dashboard" && (
          <DashboardView
            summaryData={summaryData}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredCustomers={filteredCustomers}
            quickClientPredict={quickClientPredict}
            setSelectedCustomer={setSelectedCustomer}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "simulator" && (
          <SimulatorView
            SAMPLE_CUSTOMERS={SAMPLE_CUSTOMERS}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            simProps={simProps}
            updateSimProp={updateSimProp}
            prediction={prediction}
            handleConsultAIAgent={handleConsultAIAgent}
            aiAnalyzing={aiAnalyzing}
            aiResult={aiResult}
          />
        )}

        {activeTab === "bulk" && (
          <BulkView
            bulkResults={bulkResults}
            bulkCustomers={bulkCustomers}
            bulkProcessing={bulkProcessing}
            highRiskCount={highRiskCount}
            mediumRiskCount={mediumRiskCount}
            avgBulkProbability={avgBulkProbability}
            handleLoadSampleCSV={handleLoadSampleCSV}
            fileInputRef={fileInputRef}
            handleCSVUpload={handleCSVUpload}
            setSelectedCustomer={setSelectedCustomer}
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      {/* Corporate design footer */}
      <footer className="bg-slate-950/40 border-t border-white/5 px-6 py-4.5 mt-auto text-center text-[10px] font-semibold text-white/40 flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10 shadow-inner">
        <span>© 2026 Customer Churn Analytics Platform &middot; Fully compiled client-side execution stubs backed by Gemini generative inference</span>
        <div className="flex items-center justify-center space-x-4">
          <span className="hover:text-white cursor-pointer transition">Security Compliance</span>
          <span>&bull;</span>
          <span className="hover:text-white cursor-pointer transition">IBM Telco Metadata Spec</span>
        </div>
      </footer>
    </div>
  );
}
