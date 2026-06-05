import React from "react";
import { Upload, Users, AlertTriangle, Info, TrendingUp } from "lucide-react";
import { Customer, ChurnPredictionResult } from "../types";

interface BulkViewProps {
  bulkResults: ChurnPredictionResult[];
  bulkCustomers: Customer[];
  bulkProcessing: boolean;
  highRiskCount: number;
  mediumRiskCount: number;
  avgBulkProbability: number;
  handleLoadSampleCSV: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleCSVUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setSelectedCustomer: (cust: Customer) => void;
  setActiveTab: (tab: "dashboard" | "simulator" | "bulk") => void;
}

export function BulkView({
  bulkResults,
  bulkCustomers,
  bulkProcessing,
  highRiskCount,
  mediumRiskCount,
  avgBulkProbability,
  handleLoadSampleCSV,
  fileInputRef,
  handleCSVUpload,
  setSelectedCustomer,
  setActiveTab,
}: BulkViewProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top CSV configuration input segment */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 border-b border-white/10 gap-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">Bulk Client Ingestion</h3>
            <p className="text-xs text-white/40 mt-0.5">Upload a CSV package of customer variables or dry-run a demo array to test pipeline performance</p>
          </div>

          <div className="flex space-x-3">
            <button
              id="load-bulk-sample"
              onClick={handleLoadSampleCSV}
              className="px-4 py-2 border border-white/10 text-white bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Load Benchmark Array (25 rows)</span>
            </button>

            <button
              id="trigger-csv-btn"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-gradient-to-tr from-blue-600 to-purple-600 hover:brightness-110 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer border-none shadow-lg shadow-blue-500/10"
            >
              <Upload className="w-3.5 h-3.5 text-white/80" />
              <span>Upload CSV Package</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleCSVUpload}
              accept=".csv"
              className="hidden"
            />
          </div>
        </div>

        {/* Informative CSV schema map */}
        <div className="bg-slate-950/40 border border-white/5 p-4.5 rounded-xl">
          <h4 className="text-xs font-bold text-white/80 uppercase tracking-widest mb-2 flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-white/50" />
            <span>Expected CSV Headers Schema (Automatic Type Parsing enabled)</span>
          </h4>
          <p className="text-[10px] text-white/40 leading-relaxed pr-2">
            To match successfully, headers must resemble: <code className="bg-white/10 px-1 py-0.5 rounded font-bold font-mono text-white">customerID, tenure, Contract, MonthlyCharges, InternetService, OnlineSecurity, TechSupport, PaymentMethod</code>. 
            Any missing attributes will be filled cleanly with dataset defaults during loading.
          </p>
        </div>
      </div>

      {/* Ingestion analysis dashboard block */}
      {bulkResults.length > 0 && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Aggregate overview counters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-xl flex items-center justify-between">
              <div>
                <p className="text-xs text-white/40 font-bold uppercase tracking-wider">Batched Total</p>
                <p className="text-xl font-bold mt-1 text-white font-mono">{bulkResults.length} Customers</p>
              </div>
              <div className="p-2.5 bg-white/5 text-white/70 border border-white/5 rounded-lg">
                <Users className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-rose-450">High Risk Threat</p>
                <p className="text-xl font-bold mt-1 text-rose-400 font-mono">
                  {highRiskCount} <span className="text-xs font-semibold text-white/40">({Math.round((highRiskCount / bulkResults.length) * 100)}%)</span>
                </p>
              </div>
              <div className="p-2.5 bg-rose-500/10 text-rose-450 border border-rose-500/20 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-400">Medium Threat Category</p>
                <p className="text-xl font-bold mt-1 text-amber-450 font-mono">
                  {mediumRiskCount} <span className="text-xs font-semibold text-white/40">({Math.round((mediumRiskCount / bulkResults.length) * 100)}%)</span>
                </p>
              </div>
              <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20">
                <Info className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-450">Inferred Churn Mean</p>
                <p className="text-xl font-bold mt-1 text-emerald-400 font-mono">{avgBulkProbability}% Probability</p>
              </div>
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Ledger of evaluated bulk entries */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">Batch Prediction Results ledger</h3>
            
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] uppercase text-white/40 tracking-widest border-b border-white/10 bg-white/5">
                    <th className="px-4 py-3 rounded-l-lg">Client ID</th>
                    <th className="px-4 py-3">Contract</th>
                    <th className="px-4 py-3">Internet service</th>
                    <th className="px-4 py-3">Tenure</th>
                    <th className="px-4 py-3">Chg/Month</th>
                    <th className="px-4 py-3">Risk Probability</th>
                    <th className="px-4 py-3">Risk Tier</th>
                    <th className="px-4 py-3 text-right rounded-r-lg">Intervention Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkCustomers.map((cust, idx) => {
                    const res = bulkResults[idx];
                    if (!res) return null;
                    return (
                      <tr key={cust.customerID + idx} className="border-b border-white/5 hover:bg-white/5 transition text-xs font-medium text-white/80">
                        <td className="px-4 py-3.5 font-bold text-white font-mono">{cust.customerID}</td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 bg-white/10 text-white rounded-full font-semibold border border-white/5">
                            {cust.Contract}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-white/70">{cust.InternetService}</td>
                        <td className="px-4 py-3.5 font-mono text-white/60">{cust.tenure} mos</td>
                        <td className="px-4 py-3.5 font-mono font-bold text-white">${cust.MonthlyCharges.toFixed(2)}</td>
                        <td className="px-4 py-3.5 font-mono">
                          <div className="flex items-center space-x-2">
                            <div className="w-12 bg-white/10 h-1.5 rounded-full overflow-hidden border border-white/5">
                              <div
                                className={`h-full ${
                                  res.riskCategory === "High"
                                    ? "bg-rose-500"
                                    : res.riskCategory === "Medium"
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                }`}
                                style={{ width: `${res.probability}%` }}
                              />
                            </div>
                            <span className="font-bold text-white">{res.probability}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            res.riskCategory === "High"
                              ? "bg-rose-500/20 text-rose-450 border border-rose-500/30"
                              : res.riskCategory === "Medium"
                              ? "bg-amber-500/20 text-amber-450 border border-amber-500/30"
                              : "bg-emerald-500/20 text-emerald-450 border border-emerald-500/30"
                          }`}>
                            {res.riskCategory}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-right">
                          <button
                            id={`sim-bulk-cust-${cust.customerID}`}
                            onClick={() => {
                              setSelectedCustomer(cust);
                              setActiveTab("simulator");
                            }}
                            className="px-3 py-1.5 bg-white/10 text-white border border-white/10 rounded-lg hover:bg-white/20 hover:border-white/20 transition text-[11px] font-bold cursor-pointer"
                          >
                            Feed to Simulator
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Empty block representation */}
      {bulkResults.length === 0 && !bulkProcessing && (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl md:p-12 p-8 shadow-xl flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 bg-white/5 text-white/50 border border-white/10 rounded-full animate-pulse">
            <Upload className="w-10 h-10" />
          </div>
          <div className="max-w-md">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider leading-snug">No Active Batch Analysis loaded</h4>
            <p className="text-xs text-white/40 mt-2.5 pr-4 pl-4 leading-relaxed">
              Initiate batched computations by uploading a structured table (.csv) of clients, or load our precompiled benchmark checklist containing 25 records with alternative contracts.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
