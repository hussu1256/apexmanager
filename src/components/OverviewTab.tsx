import React, { useMemo } from "react";
import { Earning, Expense } from "../types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, AlertCircle, Sparkles } from "lucide-react";

interface OverviewTabProps {
  earnings: Earning[];
  expenses: Expense[];
  onTabChange: (tab: string) => void;
}

export default function OverviewTab({ earnings, expenses, onTabChange }: OverviewTabProps) {
  // Calculate live summary metrics
  const stats = useMemo(() => {
    const totalGross = earnings.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const netRevenue = totalGross - totalExpenses;

    const currentYear = new Date().getFullYear().toString();
    const ytd = earnings
      .filter((e) => e.date && e.date.startsWith(currentYear))
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const currentMonth = new Date().toISOString().substring(0, 7);
    const mrr = earnings
      .filter((e) => e.date && e.date.startsWith(currentMonth))
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    return {
      totalGross,
      totalExpenses,
      netRevenue,
      ytd,
      mrr,
    };
  }, [earnings, expenses]);

  // Indian Rupee custom formatter helper
  const formatRupee = (value: number) => {
    return "₹" + value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Prepare subscription renewal tracker alerts (Upcoming within 30 days)
  const upcomingSubscriptions = useMemo(() => {
    const today = new Date();
    return expenses
      .filter((e) => {
        if (!e.isSubscription || !e.renewalDate) return false;
        const renewal = new Date(e.renewalDate);
        const diffTime = renewal.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 30;
      })
      .sort((a, b) => new Date(a.renewalDate!).getTime() - new Date(b.renewalDate!).getTime());
  }, [expenses]);

  // Prepare monthly trend data (Revenue vs Expense)
  const trendData = useMemo(() => {
    const monthsMap: { [key: string]: { month: string; revenue: number; expense: number } } = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = `${monthNames[d.getMonth()]} ${String(d.getFullYear()).substring(2)}`;
      monthsMap[key] = { month: label, revenue: 0, expense: 0 };
    }

    earnings.forEach((e) => {
      if (!e.date) return;
      const key = e.date.substring(0, 7);
      if (monthsMap[key]) {
        monthsMap[key].revenue += Number(e.amount || 0);
      }
    });

    expenses.forEach((ex) => {
      if (!ex.date) return;
      const key = ex.date.substring(0, 7);
      if (monthsMap[key]) {
        monthsMap[key].expense += Number(ex.amount || 0);
      }
    });

    return Object.values(monthsMap);
  }, [earnings, expenses]);

  // Prepare expense category breakdown (Doughnut Chart)
  const categoryData = useMemo(() => {
    const cats: { [key: string]: number } = {
      "SaaS/AI Subscriptions": 0,
      "Domain & Hosting": 0,
      "Hardware/Equipment": 0,
      "Marketing": 0,
      "Misc": 0,
    };

    expenses.forEach((ex) => {
      if (cats[ex.category] !== undefined) {
        cats[ex.category] += Number(ex.amount || 0);
      } else {
        cats["Misc"] += Number(ex.amount || 0);
      }
    });

    return Object.keys(cats)
      .map((cat) => ({
        name: cat,
        value: cats[cat],
      }))
      .filter((item) => item.value > 0);
  }, [expenses]);

  // Olive Green palette tones
  const COLORS = ["#606c38", "#283618", "#a3b18a", "#344e41", "#dad7cd"];

  // Prepare project profitability (Bar Chart: Total Earnings per Project)
  const projectData = useMemo(() => {
    const projectsMap: { [key: string]: number } = {};
    earnings.forEach((e) => {
      const proj = e.project || "Unnamed Project";
      projectsMap[proj] = (projectsMap[proj] || 0) + Number(e.amount || 0);
    });

    return Object.keys(projectsMap)
      .map((name) => ({
        name: name.length > 15 ? name.substring(0, 15) + "..." : name,
        revenue: projectsMap[name],
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  }, [earnings]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Alert Banner for Subscriptions */}
      {upcomingSubscriptions.length > 0 && (
        <div className="bg-[#fcfcf9] border border-[#606c38]/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#606c38] shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-[#283618]">Upcoming Bill Alerts (INR)</h4>
            <p className="text-xs text-[#606c38] mt-0.5">
              You have {upcomingSubscriptions.length} operating subscription(s) renewing within the next 30 days:
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {upcomingSubscriptions.map((sub) => (
                <span
                  key={sub.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#606c38]/10 border border-[#606c38]/20 text-[11px] font-bold text-[#283618]"
                >
                  <span className="font-bold">{sub.title}</span> ({formatRupee(sub.amount)}) on {sub.renewalDate}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Gross */}
        <div className="bg-white border border-[#3c422e]/20 p-6 rounded-xl hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-[#606c38]">Gross Earnings</p>
            <span className="p-2 bg-[#606c38]/10 text-[#606c38] rounded-lg">
              <span className="text-xs font-bold">₹</span>
            </span>
          </div>
          <p className="font-display text-2xl font-black text-[#283618] mt-4">
            {formatRupee(stats.totalGross)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs text-[#606c38] font-bold">
            <TrendingUp className="w-3 h-3" />
            <span>Cumulative total revenue logged</span>
          </div>
        </div>

        {/* MRR */}
        <div className="bg-white border border-[#3c422e]/20 p-6 rounded-xl hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-[#606c38]">Monthly Revenue</p>
            <span className="p-2 bg-[#606c38]/10 text-[#606c38] rounded-lg">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <p className="font-display text-2xl font-black text-[#283618] mt-4">
            {formatRupee(stats.mrr)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs text-[#606c38] font-bold">
            <span>Current Month logged income</span>
          </div>
        </div>

        {/* Net Revenue */}
        <div className="bg-white border border-[#3c422e]/20 p-6 rounded-xl hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-[#606c38]">Net Margin</p>
            <span className="p-2 rounded-lg bg-[#606c38]/10 text-[#606c38]">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <p className="font-display text-2xl font-black text-[#283618] mt-4">
            {formatRupee(stats.netRevenue)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs text-[#606c38] font-bold">
            <span>Total earnings minus operations</span>
          </div>
        </div>

        {/* YTD Totals */}
        <div className="bg-white border border-[#3c422e]/20 p-6 rounded-xl hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-[#606c38]">YTD Revenue</p>
            <span className="p-2 bg-slate-50 text-slate-600 rounded-lg">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <p className="font-display text-2xl font-black text-[#283618] mt-4">
            {formatRupee(stats.ytd)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-500 font-bold">
            <span>Earnings in calendar year {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart: Revenue vs Expense Trend */}
        <div className="bg-white border border-[#3c422e]/20 rounded-xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display text-lg font-black text-[#283618]">Cash Flow Trend (₹)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Comparison of monthly earnings against operating costs</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#3c422e" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#3c422e" }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value: any) => [formatRupee(Number(value)), ""]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    border: "1px solid #3c422e",
                    fontSize: "12px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Earnings"
                  stroke="#283618"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  name="Expenses"
                  stroke="#606c38"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Doughnut Chart: Expense Breakdown */}
        <div className="bg-white border border-[#3c422e]/20 rounded-xl p-6">
          <div className="mb-6">
            <h3 className="font-display text-lg font-black text-[#283618]">Expense Breakdown</h3>
            <p className="text-xs text-slate-500 mt-0.5">Operating distribution by cost category</p>
          </div>
          <div className="h-56 relative flex items-center justify-center">
            {categoryData.length === 0 ? (
              <div className="text-center text-xs text-[#606c38] p-8 font-bold">No expenses logged yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [formatRupee(Number(value)), "Total"]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #3c422e",
                      fontSize: "11px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Legend Grid */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs text-[#283618] font-bold">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="truncate max-w-[90px]">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Revenue Bar Chart */}
        <div className="bg-white border border-[#3c422e]/20 rounded-xl p-6 lg:col-span-2">
          <div className="mb-6">
            <h3 className="font-display text-lg font-black text-[#283618]">Project Revenue</h3>
            <p className="text-xs text-slate-500 mt-0.5">Top performing business projects by gross value (INR)</p>
          </div>
          <div className="h-64">
            {projectData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">No project revenue recorded yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#283618" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#283618" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value) => [formatRupee(Number(value)), "Revenue"]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #3c422e",
                      fontSize: "11px",
                    }}
                  />
                  <Bar dataKey="revenue" fill="#606c38" radius={[4, 4, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Action Dashboard Links Card */}
        <div className="bg-gradient-to-br from-[#283618] to-[#141b0c] text-white rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-xl font-black tracking-tight">Need smart advice on operating cash flows?</h3>
            <p className="text-slate-200 text-xs mt-2 leading-relaxed font-bold">
              Consult our dynamic financial models directly to draft business strategies, optimize overhead costs, or inspect transaction anomalies.
            </p>
          </div>
          <div className="mt-8 space-y-3">
            <button
              onClick={() => onTabChange("earnings")}
              className="w-full py-3 px-4 bg-[#606c38] hover:bg-[#4f592e] text-white rounded-xl text-xs font-black text-center transition duration-200 cursor-pointer"
            >
              Log New Project Earning
            </button>
            <button
              onClick={() => onTabChange("ai_assistant")}
              className="w-full py-3 px-4 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-black text-center transition duration-200 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Under Development Hub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
