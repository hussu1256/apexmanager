import { useState, useEffect, useMemo } from "react";
import { Earning, Expense, FinancialContext } from "./types";
import { INITIAL_EARNINGS, INITIAL_EXPENSES } from "./demoData";

// UI Components
import OverviewTab from "./components/OverviewTab";
import EarningsTab from "./components/EarningsTab";
import ExpensesTab from "./components/ExpensesTab";
import AIAssistantTab from "./components/AIAssistantTab";

import {
  Sparkles,
  LayoutDashboard,
  BadgeDollarSign,
  Sparkle,
  RotateCcw,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

const STORAGE_KEY_EARNINGS = "apexmanager_demo_earnings_v1";
const STORAGE_KEY_EXPENSES = "apexmanager_demo_expenses_v1";

export default function App() {
  // Demo State with local storage persistence
  const [earnings, setEarnings] = useState<Earning[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_EARNINGS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Could not load stored earnings:", e);
    }
    return INITIAL_EARNINGS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_EXPENSES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Could not load stored expenses:", e);
    }
    return INITIAL_EXPENSES;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EARNINGS, JSON.stringify(earnings));
    } catch (e) {
      console.warn("Could not save earnings to localStorage:", e);
    }
  }, [earnings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
    } catch (e) {
      console.warn("Could not save expenses to localStorage:", e);
    }
  }, [expenses]);

  // Navigation / Panel State
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Handlers for Demo Session Data
  const handleAddEarning = async (earning: Omit<Earning, "id">) => {
    const newRecord: Earning = {
      ...earning,
      id: `earn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    setEarnings((prev) => [newRecord, ...prev]);
    showToast("Earning record added successfully!");
  };

  const handleDeleteEarning = async (id: string) => {
    setEarnings((prev) => prev.filter((item) => item.id !== id));
    showToast("Earning record deleted.");
  };

  const handleAddExpense = async (expense: Omit<Expense, "id">) => {
    const newRecord: Expense = {
      ...expense,
      id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    setExpenses((prev) => [newRecord, ...prev]);
    showToast("Expense record added successfully!");
  };

  const handleDeleteExpense = async (id: string) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
    showToast("Expense record deleted.");
  };

  const handleResetDemoData = () => {
    if (window.confirm("Reset all earnings and expenses to the default demo data?")) {
      setEarnings(INITIAL_EARNINGS);
      setExpenses(INITIAL_EXPENSES);
      showToast("Demo ledger reset to defaults!");
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#fafaf5] flex flex-col relative pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#283618] text-white px-4 py-3 rounded-xl shadow-lg border border-[#606c38]/40 text-xs font-bold flex items-center gap-2 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-[#a3b18a]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Navigation Header */}
      <header className="sticky top-0 bg-white border-b-4 border-[#3c422e]/20 z-30 px-6 sm:px-8 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 shrink-0 shadow-sm">
        <div className="flex items-center justify-between lg:justify-start gap-3.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#606c38] text-white rounded-xl shadow-md">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-black text-[#283618] tracking-tight">ApexManager</h1>
                <span className="px-2 py-0.5 rounded-md bg-[#606c38]/15 border border-[#606c38]/30 text-[10px] font-black text-[#283618] uppercase tracking-wider">
                  Demo Mode
                </span>
              </div>
              <span className="text-[10px] text-[#606c38] font-bold uppercase tracking-wider block mt-0.5">
                Enterprise Hub • INR Edition (₹)
              </span>
            </div>
          </div>
        </div>

        {/* Navbar Tab Selection */}
        <nav className="flex flex-wrap bg-[#fcfcf9] border-2 border-[#3c422e]/20 rounded-2xl p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab("overview")}
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-[#606c38] text-white shadow-md border border-[#283618]"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Overview Dashboard
          </button>
          <button
            onClick={() => setActiveTab("earnings")}
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
              activeTab === "earnings"
                ? "bg-[#606c38] text-white shadow-md border border-[#283618]"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            <BadgeDollarSign className="w-4 h-4" />
            Client Income (₹)
          </button>
          <button
            onClick={() => setActiveTab("expenses")}
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
              activeTab === "expenses"
                ? "bg-[#606c38] text-white shadow-md border border-[#283618]"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Operating Expenses (₹)
          </button>
          <button
            onClick={() => setActiveTab("ai_assistant")}
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
              activeTab === "ai_assistant"
                ? "bg-[#283618] text-white shadow-md border border-[#141b0c]"
                : "text-slate-600 hover:text-[#283618]"
            }`}
          >
            <Sparkle className="w-4 h-4" />
            ApexAI Status (Beta)
          </button>
        </nav>

        {/* Action / Reset Demo Controls */}
        <div className="flex items-center gap-3 border-t lg:border-t-0 border-slate-100 pt-3 lg:pt-0 justify-end">
          <button
            onClick={handleResetDemoData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#606c38] hover:bg-[#606c38]/10 border border-[#3c422e]/20 transition-all cursor-pointer"
            title="Restore sample demo data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo Data
          </button>
        </div>
      </header>

      {/* Main Panel Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === "overview" && (
          <OverviewTab earnings={earnings} expenses={expenses} onTabChange={setActiveTab} />
        )}
        {activeTab === "earnings" && (
          <EarningsTab earnings={earnings} onAddEarning={handleAddEarning} onDeleteEarning={handleDeleteEarning} />
        )}
        {activeTab === "expenses" && (
          <ExpensesTab expenses={expenses} onAddExpense={handleAddExpense} onDeleteExpense={handleDeleteExpense} />
        )}
        {activeTab === "ai_assistant" && (
          <AIAssistantTab />
        )}
      </main>
    </div>
  );
}
