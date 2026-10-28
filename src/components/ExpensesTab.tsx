import React, { useState } from "react";
import { Expense } from "../types";
import { Plus, Search, Trash2, Tag, Calendar, RotateCcw, AlertTriangle, BadgeDollarSign } from "lucide-react";

interface ExpensesTabProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, "id">) => Promise<void>;
  onDeleteExpense: (id: string) => Promise<void>;
}

export default function ExpensesTab({ expenses, onAddExpense, onDeleteExpense }: ExpensesTabProps) {
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Expense["category"]>("SaaS/AI Subscriptions");
  const [date, setDate] = useState("");
  const [isSubscription, setIsSubscription] = useState(false);
  const [renewalDate, setRenewalDate] = useState("");
  const [loading, setLoading] = useState(false);

  // Search/Filter State
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !date) return;
    setLoading(true);

    try {
      await onAddExpense({
        title,
        amount: Number(amount),
        category,
        date,
        isSubscription,
        renewalDate: isSubscription && renewalDate ? renewalDate : undefined,
        createdAt: new Date().toISOString(),
      });

      // Reset
      setTitle("");
      setAmount("");
      setCategory("SaaS/AI Subscriptions");
      setDate("");
      setIsSubscription(false);
      setRenewalDate("");
      setShowForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter((ex) => {
    const matchesSearch = ex.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || ex.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate summary categories
  const categoryTotals = expenses.reduce((acc: { [key: string]: number }, ex) => {
    acc[ex.category] = (acc[ex.category] || 0) + Number(ex.amount || 0);
    return acc;
  }, {});

  const formatRupee = (val: number) => {
    return "₹" + val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-black text-[#283618]">Expenses & Operations</h2>
          <p className="text-xs text-[#606c38] mt-1">Audit SaaS subscriptions, API usage, hosting packages, and hardware investments in Indian Rupees (₹).</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#606c38] hover:bg-[#4f592e] text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Log Expense Cost
        </button>
      </div>

      {/* Expense Form Drawer */}
      {showForm && (
        <div className="bg-white border border-[#3c422e]/20 rounded-xl p-6 shadow-sm animate-slideDown">
          <h3 className="font-display text-base font-black text-[#283618] mb-4">Log Expense / Cost</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Expense Title / Merchant *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Hostinger, Zoho Books"
                className="w-full px-3 py-2 text-xs font-bold bg-[#fcfcf9] border border-[#3c422e]/20 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#606c38]/10 focus:border-[#606c38] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Operating Cost (₹ INR) *
              </label>
              <input
                type="number"
                required
                step="1"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 text-xs font-bold bg-[#fcfcf9] border border-[#3c422e]/20 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#606c38]/10 focus:border-[#606c38] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Expense Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs font-bold bg-[#fcfcf9] border border-[#3c422e]/20 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#606c38]/10 focus:border-[#606c38] focus:bg-white transition"
              >
                <option value="SaaS/AI Subscriptions">SaaS / AI Subscriptions</option>
                <option value="Domain & Hosting">Domain & Hosting</option>
                <option value="Hardware/Equipment">Hardware & Equipment</option>
                <option value="Marketing">Marketing & Advertising</option>
                <option value="Misc">Miscellaneous Expenses</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Expense Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold bg-[#fcfcf9] border border-[#3c422e]/20 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#606c38]/10 focus:border-[#606c38] focus:bg-white transition"
              />
            </div>

            <div className="flex items-center gap-2 md:pt-6">
              <input
                type="checkbox"
                id="isSubscription"
                checked={isSubscription}
                onChange={(e) => setIsSubscription(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#606c38] focus:ring-[#606c38] cursor-pointer"
              />
              <label htmlFor="isSubscription" className="text-xs font-bold text-[#283618] cursor-pointer select-none">
                This is a recurring subscription
              </label>
            </div>

            {isSubscription && (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Next Renewal Date *
                </label>
                <input
                  type="date"
                  required={isSubscription}
                  value={renewalDate}
                  onChange={(e) => setRenewalDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold bg-[#fcfcf9] border border-[#3c422e]/20 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#606c38]/10 focus:border-[#606c38] focus:bg-white transition"
                />
              </div>
            )}

            <div className="md:col-span-3 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#606c38] hover:bg-[#4f592e] text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {loading ? "Saving..." : "Log Expense"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expense Stats summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white border border-[#3c422e]/20 p-4 rounded-xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total SaaS Cost</p>
          <p className="text-sm font-black text-[#283618] mt-1">{formatRupee(categoryTotals["SaaS/AI Subscriptions"] || 0)}</p>
        </div>
        <div className="bg-white border border-[#3c422e]/20 p-4 rounded-xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Domain & Web</p>
          <p className="text-sm font-black text-[#283618] mt-1">{formatRupee(categoryTotals["Domain & Hosting"] || 0)}</p>
        </div>
        <div className="bg-white border border-[#3c422e]/20 p-4 rounded-xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hardware</p>
          <p className="text-sm font-black text-[#283618] mt-1">{formatRupee(categoryTotals["Hardware/Equipment"] || 0)}</p>
        </div>
        <div className="bg-white border border-[#3c422e]/20 p-4 rounded-xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Marketing</p>
          <p className="text-sm font-black text-[#283618] mt-1">{formatRupee(categoryTotals["Marketing"] || 0)}</p>
        </div>
        <div className="bg-white border border-[#3c422e]/20 p-4 rounded-xl shadow-sm col-span-2 sm:col-span-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Misc/Other</p>
          <p className="text-sm font-black text-[#283618] mt-1">{formatRupee(categoryTotals["Misc"] || 0)}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white border border-[#3c422e]/20 rounded-xl p-4 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search expense titles..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#fcfcf9] border border-[#3c422e]/20 rounded-lg text-xs font-bold placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#606c38]/10 focus:border-[#606c38] transition"
          />
        </div>

        <div className="flex gap-2 items-center w-full sm:w-auto overflow-x-auto justify-end">
          <span className="text-[11px] text-[#606c38] font-bold uppercase tracking-wider shrink-0">Category</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1 bg-[#fcfcf9] border border-[#3c422e]/20 rounded-lg text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="SaaS/AI Subscriptions">SaaS / AI Subscriptions</option>
            <option value="Domain & Hosting">Domain & Hosting</option>
            <option value="Hardware/Equipment">Hardware & Equipment</option>
            <option value="Marketing">Marketing & Advertising</option>
            <option value="Misc">Miscellaneous Expenses</option>
          </select>
        </div>
      </div>

      {/* Table Log */}
      <div className="bg-white border border-[#3c422e]/20 rounded-xl overflow-hidden shadow-sm">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 px-4">
            <BadgeDollarSign className="w-10 h-10 text-[#606c38]/20 mx-auto mb-2" />
            <h4 className="text-[#283618] font-bold text-sm">No Expenses Logged</h4>
            <p className="text-slate-500 text-xs mt-1">Try logging a new expense to track operating costs.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#3c422e]/20 bg-[#fcfcf9]">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Item & Category</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cost Amount</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date Logged</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type / Renewal</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4.5">
                      <p className="text-xs font-bold text-[#283618]">{ex.title}</p>
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-[#606c38] bg-[#606c38]/10 px-2 py-0.5 rounded border border-[#606c38]/20">
                        <Tag className="w-2.5 h-2.5 shrink-0" />
                        {ex.category}
                      </span>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className="text-xs font-black text-slate-950">
                        {formatRupee(ex.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-xs text-slate-500 font-bold">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {ex.date}
                      </span>
                    </td>
                    <td className="px-6 py-4.5">
                      {ex.isSubscription ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#283618] bg-[#606c38]/10 px-2 py-0.5 rounded border border-[#606c38]/20 uppercase tracking-wider w-fit">
                            <RotateCcw className="w-2.5 h-2.5 shrink-0" />
                            Subscription
                          </span>
                          {ex.renewalDate && (
                            <span className="text-[10px] text-slate-500 font-bold mt-1 inline-flex items-center gap-0.5">
                              <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                              Renews: {ex.renewalDate}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold">One-Time Charge</span>
                      )}
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <button
                        onClick={() => ex.id && onDeleteExpense(ex.id)}
                        className="p-1.5 hover:bg-slate-100 hover:text-rose-600 text-slate-400 rounded-lg transition shrink-0 cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
