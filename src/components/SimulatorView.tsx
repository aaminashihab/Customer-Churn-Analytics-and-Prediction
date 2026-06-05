import React from "react";
import { Sparkles, RefreshCw, User, Zap } from "lucide-react";
import { Customer, ChurnPredictionResult } from "../types";

interface SimulatorViewProps {
  SAMPLE_CUSTOMERS: Customer[];
  selectedCustomer: Customer;
  setSelectedCustomer: (cust: Customer) => void;
  simProps: Customer;
  updateSimProp: (field: keyof Customer, value: any) => void;
  prediction: ChurnPredictionResult | null;
  handleConsultAIAgent: () => void;
  aiAnalyzing: boolean;
  aiResult: ChurnPredictionResult | null;
}

export function SimulatorView({
  SAMPLE_CUSTOMERS,
  selectedCustomer,
  setSelectedCustomer,
  simProps,
  updateSimProp,
  prediction,
  handleConsultAIAgent,
  aiAnalyzing,
  aiResult,
}: SimulatorViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
      {/* Left: Customer Parameter Adjustment */}
      <div className="lg:col-span-12 xl:col-span-5 bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl space-y-6 shadow-xl">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wide">Simulation Inputs</h3>
          <p className="text-xs text-white/40 mt-0.5">Adjust client behavioral variables to study instant model changes</p>
        </div>

        {/* Selector to load alternative template quickly */}
        <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl flex items-center justify-between">
          <span className="text-xs font-bold text-white/60">Active Profile Template:</span>
          <select
            id="template-selector"
            value={selectedCustomer.customerID}
            onChange={(e) => {
              const found = SAMPLE_CUSTOMERS.find((c) => c.customerID === e.target.value);
              if (found) setSelectedCustomer(found);
            }}
            className="bg-slate-900/90 border border-white/10 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            {SAMPLE_CUSTOMERS.map((cust) => (
              <option key={cust.customerID} value={cust.customerID} className="glass-select-option">
                {cust.customerID} ({cust.Contract} &middot; ${cust.MonthlyCharges})
              </option>
            ))}
          </select>
        </div>

        {/* Individual Settings lists */}
        <div className="space-y-4">
          <div className="border-b border-white/10 pb-4">
            <h4 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Demographics & Base details</h4>
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <span className="text-white/40 block mb-1.5">Gender</span>
                <div className="flex space-x-2">
                  {["Male", "Female"].map((g) => (
                    <button
                      key={g}
                      onClick={() => updateSimProp("gender", g)}
                      className={`flex-1 py-1.5 rounded-lg border text-center transition cursor-pointer ${
                        simProps.gender === g
                          ? "bg-white/20 border-white/31 text-white font-bold shadow-lg"
                          : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <span className="text-white/40 block mb-1.5">Senior Citizen</span>
                <div className="flex space-x-2">
                  {[[1, "Yes"], [0, "No"]].map(([val, label]) => (
                    <button
                      key={val as number}
                      onClick={() => updateSimProp("SeniorCitizen", val)}
                      className={`flex-1 py-1.5 rounded-lg border text-center transition cursor-pointer ${
                        simProps.SeniorCitizen === val
                          ? "bg-white/20 border-white/31 text-white font-bold shadow-lg"
                          : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {label as string}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Account sliders */}
          <div className="border-b border-white/10 pb-4 space-y-4">
            <h4 className="text-xs font-bold text-white/30 uppercase tracking-widest">Account Tenure & Billing</h4>
            
            <div>
              <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                <span className="text-white/60">Tenure (Length)</span>
                <span className="text-white font-mono text-xs bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                  {simProps.tenure} Months
                </span>
              </div>
              <input
                id="input-tenure"
                type="range"
                min="1"
                max="72"
                value={simProps.tenure}
                onChange={(e) => updateSimProp("tenure", Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] font-bold text-white/30 mt-1">
                <span>1 Month</span>
                <span>36 Mo (Medium)</span>
                <span>72 Months</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                <span className="text-white/60">Monthly invoice price</span>
                <span className="text-white font-mono text-xs bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                  ${simProps.MonthlyCharges.toFixed(2)}
                </span>
              </div>
              <input
                id="input-charges"
                type="range"
                min="18"
                max="122"
                value={simProps.MonthlyCharges}
                onChange={(e) => updateSimProp("MonthlyCharges", Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] font-bold text-white/30 mt-1">
                <span>$18.00 (Min)</span>
                <span>$70.00 (Avg)</span>
                <span>$122.00 (Max)</span>
              </div>
            </div>
          </div>

          {/* Contract & Payment options */}
          <div className="border-b border-white/10 pb-4 space-y-3">
            <h4 className="text-xs font-bold text-white/30 uppercase tracking-widest">Agreement Specifications</h4>
            
            <div className="grid grid-cols-1 gap-2.5 text-xs font-semibold">
              <div>
                <span className="text-white/40 block mb-1">Contract Duration Type</span>
                <div className="flex space-x-2">
                  {["Month-to-month", "One year", "Two year"].map((c) => (
                    <button
                      key={c}
                      id={`contract-${c.replace(/\s+/g, '-').toLowerCase()}`}
                      onClick={() => updateSimProp("Contract", c)}
                      className={`flex-1 py-1.5 rounded-lg border text-center transition cursor-pointer text-xs ${
                        simProps.Contract === c
                          ? "bg-white/20 border-white/30 text-white font-bold shadow-lg"
                          : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-white/40 block mb-1">Billing Invoicing Mode</span>
                <select
                  value={simProps.PaymentMethod}
                  onChange={(e) => updateSimProp("PaymentMethod", e.target.value)}
                  className="w-full bg-slate-900/90 border border-white/10 text-white text-xs font-semibold px-2.5 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="Electronic check" className="glass-select-option">Electronic check (Manual/Non-Auto)</option>
                  <option value="Mailed check" className="glass-select-option">Mailed check (Manual/Non-Auto)</option>
                  <option value="Bank transfer (automatic)" className="glass-select-option">Bank transfer (automatic)</option>
                  <option value="Credit card (automatic)" className="glass-select-option">Credit card (automatic)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tech specifications category */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white/30 uppercase tracking-widest">Service Add-Ons & Tech Tier</h4>
            
            <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
              <div>
                <span className="text-white/40 block mb-1">Internet Type</span>
                <select
                  id="select-internet"
                  value={simProps.InternetService}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateSimProp("InternetService", val);
                    if (val === "No") {
                      updateSimProp("OnlineSecurity", "No internet service");
                      updateSimProp("TechSupport", "No internet service");
                      updateSimProp("OnlineBackup", "No internet service");
                    } else {
                      if (simProps.OnlineSecurity === "No internet service") updateSimProp("OnlineSecurity", "No");
                      if (simProps.TechSupport === "No internet service") updateSimProp("TechSupport", "No");
                      if (simProps.OnlineBackup === "No internet service") updateSimProp("OnlineBackup", "No");
                    }
                  }}
                  className="w-full bg-slate-900/90 border border-white/10 text-white text-xs font-semibold px-2.5 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="DSL" className="glass-select-option">DSL Broadband</option>
                  <option value="Fiber optic" className="glass-select-option">Fiber Optic Gigabit</option>
                  <option value="No" className="glass-select-option">No Internet Service</option>
                </select>
              </div>

              <div>
                <span className="text-white/40 block mb-1">Dedicated Tech Support</span>
                <select
                  value={simProps.TechSupport}
                  disabled={simProps.InternetService === "No"}
                  onChange={(e) => updateSimProp("TechSupport", e.target.value)}
                  className="w-full bg-slate-900/90 border border-white/10 text-white text-xs font-semibold px-2.5 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:bg-white/5 disabled:border-white/5 disabled:text-white/30"
                >
                  <option value="No" className="glass-select-option">No Support Package</option>
                  <option value="Yes" className="glass-select-option">Yes (Activated Support)</option>
                  <option value="No internet service" className="glass-select-option">No Internet Service</option>
                </select>
              </div>

              <div>
                <span className="text-white/40 block mb-1">Online Cyber-Security</span>
                <select
                  id="select-security"
                  value={simProps.OnlineSecurity}
                  disabled={simProps.InternetService === "No"}
                  onChange={(e) => updateSimProp("OnlineSecurity", e.target.value)}
                  className="w-full bg-slate-900/90 border border-white/10 text-white text-xs font-semibold px-2.5 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:bg-white/5 disabled:border-white/5 disabled:text-white/30"
                >
                  <option value="No" className="glass-select-option">No Cyber-Security</option>
                  <option value="Yes" className="glass-select-option">Yes (Activated Protection)</option>
                  <option value="No internet service" className="glass-select-option">No Internet Service</option>
                </select>
              </div>

              <div>
                <span className="text-white/40 block mb-1">Online cloud Backup</span>
                <select
                  value={simProps.OnlineBackup}
                  disabled={simProps.InternetService === "No"}
                  onChange={(e) => updateSimProp("OnlineBackup", e.target.value)}
                  className="w-full bg-slate-900/90 border border-white/10 text-white text-xs font-semibold px-2.5 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:bg-white/5 disabled:border-white/5 disabled:text-white/30"
                >
                  <option value="No" className="glass-select-option">No Online Backup</option>
                  <option value="Yes" className="glass-select-option">Yes (Activated Backup)</option>
                  <option value="No internet service" className="glass-select-option">No Internet Service</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Model predictions risk dials & AI Report */}
      <div className="lg:col-span-12 xl:col-span-7 space-y-6">
        
        {/* Prediction Score Card */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">Model Output Risk Assessment</h3>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Probability Speedometer dial */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-5 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-3">Churn Risk Chance</span>
              
              <div className="relative flex items-center justify-center w-36 h-36">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    id="risk-dial-circle"
                    cx="72"
                    cy="72"
                    r="58"
                    stroke={
                      prediction && prediction.probability >= 55
                        ? "#ef4444"
                        : prediction && prediction.probability >= 25
                        ? "#fbbf24"
                        : "#10b981"
                    }
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 58}
                    strokeDashoffset={
                      2 * Math.PI * 58 * (1 - (prediction ? prediction.probability : 0) / 100)
                    }
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-white font-mono tracking-tighter leading-none">
                    {prediction ? prediction.probability : 0}%
                  </span>
                  <span className={`text-[10px] mt-1.5 font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded ${
                    prediction && prediction.riskCategory === "High"
                      ? "text-rose-400 bg-rose-500/20 border border-rose-500/30"
                      : prediction && prediction.riskCategory === "Medium"
                      ? "text-amber-400 bg-amber-500/20 border border-amber-500/30"
                      : "text-emerald-400 bg-emerald-500/20 border border-emerald-500/30"
                  }`}>
                    {prediction ? prediction.riskCategory : "Low"}
                  </span>
                </div>
              </div>

              <p className="text-[9px] text-white/40 mt-3 font-semibold text-center leading-normal">
                Based on Logistic Regression trained on standard IBM benchmark set
              </p>
            </div>

            {/* Primary active drivers checklist */}
            <div className="md:col-span-7 space-y-3">
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest block">Leading Statistical Triggers</span>
              
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {prediction && prediction.riskFactors.map((factor, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-xl border flex items-start space-x-2.5 text-xs transition ${
                      factor.type === "increase"
                        ? "bg-rose-500/5 border-rose-500/20 text-rose-300"
                        : "bg-emerald-500/5 border-emerald-500/20 text-emerald-300"
                    }`}
                  >
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-extrabold mt-0.5 ${
                      factor.type === "increase" ? "bg-rose-500/30 text-rose-400" : "bg-emerald-500/30 text-emerald-400"
                    }`}>
                      {factor.type === "increase" ? "+" : ""}{factor.weight}%
                    </span>
                    <div>
                      <p className="font-bold text-white leading-tight">{factor.factor}</p>
                      <p className="text-[10px] text-white/50 mt-1 leading-snug">{factor.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chat forensic audit segment featuring active Gemini */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>Gemini Forensic Intelligence Report</span>
              </h3>
              <p className="text-xs text-white/40 mt-0.5">Automated generative CRM advice tailored to customer driver vulnerability</p>
            </div>
            
            <button
              id="trigger-ai-btn"
              onClick={handleConsultAIAgent}
              disabled={aiAnalyzing}
              className="self-start sm:self-center bg-gradient-to-tr from-blue-600 to-purple-600 text-white hover:brightness-110 active:scale-95 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-2 disabled:bg-white/5 disabled:text-white/30 disabled:border-white/5 cursor-pointer border-none shadow-lg shadow-blue-500/15"
            >
              {aiAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Querying Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                  <span>Generate Diagnostic Report</span>
                </>
              )}
            </button>
          </div>

          {/* Report panel container */}
          <div className="min-h-48 rounded-xl bg-white/5 border border-white/10 p-4 space-y-4">
            {aiResult ? (
              <div className="space-y-4 animate-fadeIn">
                
                {/* Section A: Critique report text */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-white/50" />
                    <span>Behavioral Driver Synthesis</span>
                  </h4>
                  
                  {/* Custom visual display for markdown */}
                  <div className="text-xs text-white/80 leading-relaxed font-normal bg-slate-950/40 p-4.5 rounded-xl border border-white/5 shadow-inner whitespace-pre-wrap">
                    {aiResult.aiAnalysis}
                  </div>
                </div>

                {/* Section B: Highly Targeted retention Actions */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Deployable Retention Interventions</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {aiResult.retentionPlan && aiResult.retentionPlan.map((action, idx) => (
                      <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/10 shadow-lg flex flex-col justify-between hover:bg-white/10 transition duration-200">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-[9px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md ${
                              action.priority === "High"
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/20"
                                : action.priority === "Medium"
                                ? "bg-amber-500/20 text-amber-450 border border-amber-500/20"
                                : "bg-blue-500/20 text-blue-450 border border-blue-500/20"
                            }`}>
                              {action.priority} Priority
                            </span>
                            <span className="text-[10px] text-white/40 font-bold font-mono">#{idx + 1}</span>
                          </div>
                          <h5 className="text-xs font-extrabold text-white leading-tight">{action.action}</h5>
                          <p className="text-[10px] text-white/50 mt-1.5 leading-normal">{action.impactDescription}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : aiAnalyzing ? (
              <div className="flex flex-col items-center justify-center p-8 space-y-3.5 h-full">
                <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                <div className="text-center">
                  <p className="text-xs font-bold text-white">Forensic Agent in action</p>
                  <p className="text-[10px] text-white/40 mt-1.5">Interrogating client variables via deep model analysis models...</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 h-full">
                <Sparkles className="w-6 h-6 text-white/20" />
                <div className="max-w-sm">
                  <p className="text-xs font-bold text-white/80">Audit report empty</p>
                  <p className="text-[10px] text-white/40 mt-1.5 leading-relaxed">
                    Submit customer attributes above and tap "Generate Diagnostic Report" to invoke Gemini AI for bespoke retention briefs and prioritized action models.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
