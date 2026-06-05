import React from "react";
import {
  Database,
  TrendingUp,
  CreditCard,
  Users,
  Info,
  Search,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Customer, DatasetSummary, ChurnPredictionResult } from "../types";

interface DashboardViewProps {
  summaryData: DatasetSummary | null;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filteredCustomers: Customer[];
  quickClientPredict: (cust: Customer) => ChurnPredictionResult;
  setSelectedCustomer: (cust: Customer) => void;
  setActiveTab: (tab: "dashboard" | "simulator" | "bulk") => void;
}

export function DashboardView({
  summaryData,
  searchTerm,
  setSearchTerm,
  filteredCustomers,
  quickClientPredict,
  setSelectedCustomer,
  setActiveTab,
}: DashboardViewProps) {
  return (
    <div className="space-y-6">
      {/* Top Level Metric Strips */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Cohort Database */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-xl transition hover:bg-white/10 hover:border-white/20 duration-300 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">Cohort Database</p>
            <p className="text-3xl font-extrabold mt-1 text-white font-mono">7,043</p>
            <p className="text-xs text-white/60 mt-1">Historically Compiled Clients</p>
          </div>
          <div className="p-3 bg-white/5 border border-white/10 text-blue-400 rounded-xl">
            <Database className="w-5 h-5" />
          </div>
        </div>

        {/* Benchmark Churn */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-xl transition hover:bg-white/10 hover:border-white/20 duration-300 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">Benchmark Churn Rate</p>
            <p className="text-3xl font-extrabold mt-1 text-rose-400 font-mono">26.54%</p>
            <p className="text-xs text-white/55 mt-1">Global attrition rate target</p>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Median Bill */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-xl transition hover:bg-white/10 hover:border-white/20 duration-300 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">Median Monthly Bill</p>
            <p className="text-3xl font-extrabold mt-1 text-emerald-400 font-mono">$64.76</p>
            <p className="text-xs text-white/55 mt-1">Standard subscription price point</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        {/* Avg Tenure */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-xl transition hover:bg-white/10 hover:border-white/20 duration-300 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">Avg Account Tenure</p>
            <p className="text-3xl font-extrabold mt-1 text-white font-mono">32.4 mos</p>
            <p className="text-xs text-white/60 mt-1">Lifecycle stability median</p>
          </div>
          <div className="p-3 bg-white/5 border border-white/10 text-purple-400 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart A: Churn Rate by Contract Agreement */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">Churn Rate vs Contract Model</h3>
              <p className="text-xs text-white/40 mt-0.5">Statistical correlation of tenure types</p>
            </div>
            <Info className="w-4 h-4 text-white/30" />
          </div>
          
          <div className="h-64">
            {summaryData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={summaryData.churnByContract}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="contract" tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="rgba(255, 255, 255, 0.1)" />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} unit="%" stroke="rgba(255, 255, 255, 0.1)" />
                  <Tooltip 
                    contentStyle={{ fontSize: 12, backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
                    formatter={(value) => [`${value}%`]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="churnRate" name="Attrited %" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="activeRate" name="Retained %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-white/40 text-xs">
                Loading visualization data...
              </div>
            )}
          </div>
        </div>

        {/* Chart B: Attrition by Tenure Cohorts */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">Cohort Size by Months</h3>
              <p className="text-xs text-white/40 mt-0.5">Attrition counts across life stages</p>
            </div>
            <Info className="w-4 h-4 text-white/30" />
          </div>
          
          <div className="h-64">
            {summaryData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={summaryData.churnByTenure}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="rgba(255, 255, 255, 0.1)" />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="rgba(255, 255, 255, 0.1)" />
                  <Tooltip 
                    contentStyle={{ fontSize: 12, backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="churnCount" name="Lost Customers" fill="#f43f5e" stackId="a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="activeCount" name="Active Customers" fill="rgba(255, 255, 255, 0.12)" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-white/40 text-xs">
                Loading lifecycle models...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Customer Ledger Section */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-white/10 gap-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">Interactive Customer Ledger</h3>
            <p className="text-xs text-white/40 mt-0.5">Selected representative client listings to test and simulate</p>
          </div>

          {/* Filter and Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search by ID, Contract or Internet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white/10 transition"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase text-white/40 tracking-widest border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 rounded-l-lg">Client ID</th>
                <th className="px-4 py-3">Tenure</th>
                <th className="px-4 py-3">Contract</th>
                <th className="px-4 py-3">Internet Tier</th>
                <th className="px-4 py-3">Support Services</th>
                <th className="px-4 py-3">Monthly Bill</th>
                <th className="px-4 py-3">Calculated Churn Risk</th>
                <th className="px-4 py-3 text-right rounded-r-lg">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((cust) => {
                const computed = quickClientPredict(cust);
                return (
                  <tr key={cust.customerID} className="border-b border-white/5 hover:bg-white/5 transition text-xs font-medium text-white/80">
                    <td className="px-4 py-4 font-bold text-white font-mono">
                      {cust.customerID}
                      {cust.SeniorCitizen === 1 && (
                        <span className="ml-1.5 px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[9px] font-semibold tracking-wide uppercase">
                          Senior
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">{cust.tenure} mos</td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-0.5 bg-white/10 text-white rounded-full font-semibold border border-white/10">
                        {cust.Contract}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-semibold text-white/70">
                      {cust.InternetService}
                    </td>
                    <td className="px-4 py-4 text-white/50">
                      Sec: {cust.OnlineSecurity === "Yes" ? "✅" : "❌"} &middot; Support: {cust.TechSupport === "Yes" ? "✅" : "❌"}
                    </td>
                    <td className="px-4 py-4 font-mono font-bold text-white">${cust.MonthlyCharges.toFixed(2)}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                        computed.riskCategory === "High"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : computed.riskCategory === "Medium"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          computed.riskCategory === "High" ? "bg-rose-500" : computed.riskCategory === "Medium" ? "bg-amber-500" : "bg-emerald-500"
                        }`} />
                        <span>{computed.probability}% ({computed.riskCategory})</span>
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        id={`load-sim-${cust.customerID}`}
                        onClick={() => {
                          setSelectedCustomer(cust);
                          setActiveTab("simulator");
                        }}
                        className="px-3 py-1.5 bg-gradient-to-tr from-blue-600 to-purple-600 text-white border-none rounded-lg hover:brightness-110 active:scale-95 transition text-[11px] font-bold cursor-pointer shadow-lg shadow-blue-500/10"
                      >
                        Simulate Profile
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
  );
}
