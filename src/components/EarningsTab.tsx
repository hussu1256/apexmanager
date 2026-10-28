import React, { useState } from "react";
import { Earning } from "../types";
import { Plus, Search, Trash2, Calendar, Landmark, Receipt, FileSpreadsheet } from "lucide-react";

interface EarningsTabProps {
  earnings: Earning[];
  onAddEarning: (earning: Omit<Earning, "id">) => Promise<void>;
  onDeleteEarning: (id: string) => Promise<void>;
}

export default function EarningsTab({ earnings, onAddEarning, onDeleteEarning }: EarningsTabProps) {
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [client, setClient] = useState("");
  const [project, setProject] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<"Paid" | "Pending" | "Overdue">("Pending");
  const [paymentMethod, setPaymentMethod] = useState("UPI / Bank");
  const [invoiceRef, setInvoiceRef] = useState("");
  const [loading, setLoading] = useState(false);

  // Filter/Search State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Paid" | "Pending" | "Overdue">("All");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !project || !amount || !date) return;
    setLoading(true);

    try {
      await onAddEarning({
        client,
        project,
        amount: Number(amount),
        date,
        status,
        paymentMethod,
        invoiceRef,
        createdAt: new Date().toISOString(),
      });

      // Reset Form
      setClient("");
      setProject("");
      setAmount("");
      setDate("");
      setStatus("Pending");
      setPaymentMethod("UPI / Bank");
      setInvoiceRef("");
      setShowForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered earnings
  const filteredEarnings = earnings.filter((e) => {
    const matchesSearch =
      e.client.toLowerCase().includes(search.toLowerCase()) ||
      e.project.toLowerCase().includes(search.toLowerCase()) ||
      (e.invoiceRef && e.invoiceRef.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "All" || e.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-black text-[#283618]">Revenue & Client Income</h2>
          <p className="text-xs text-[#606c38] mt-1">Record gross client payments, deposit status, and invoicing markers in Indian Rupees (₹).</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#606c38] hover:bg-[#4f592e] text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer shrink-0 animate-bounceOnce"
        >
          <Plus className="w-4 h-4" />
          Log Client Revenue
        </button>
      </div>

      {/* Log Earning Form Drawer / Dropdown */}
      {showForm && (
        <div className="bg-white border-2 border-[#3c422e]/20 rounded-xl p-6 shadow-sm animate-slideDown">
          <h3 className="font-display text-base font-black text-[#283618] mb-4">Log Incoming Payment</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Client Name *
              </label>
              <input
                type="text"
                required
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full px-3 py-2 text-xs font-bold bg-[#fcfcf9] border border-[#3c422e]/20 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#606c38]/10 focus:border-[#606c38] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="e.g. Website Redesign"
                className="w-full px-3 py-2 text-xs font-bold bg-[#fcfcf9] border border-[#3c422e]/20 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#606c38]/10 focus:border-[#606c38] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Payment Amount (₹ INR) *
              </label>
              <input
                type="number"
                required
                step="1"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 text-xs font-bold bg-[#fcfcf9] border border-[#3c422e]/20 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#606c38]/10 focus:border-[#606c38] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold bg-[#fcfcf9] border border-[#3c422e]/20 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#606c38]/10 focus:border-[#606c38] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Payment Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs font-bold bg-[#fcfcf9] border border-[#3c422e]/20 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#606c38]/10 focus:border-[#606c38] focus:bg-white transition"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending / Unpaid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Payment Method
              </label>
              <input
                type="text"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="e.g. UPI, NetBanking, IMPS"
                className="w-full px-3 py-2 text-xs font-bold bg-[#fcfcf9] border border-[#3c422e]/20 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#606c38]/10 focus:border-[#606c38] focus:bg-white transition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Invoice Reference (Optional)
              </label>
              <input
                type="text"
                value={invoiceRef}
                onChange={(e) => setInvoiceRef(e.target.value)}
                placeholder="e.g. INV-2026-001"
                className="w-full px-3 py-2 text-xs font-bold bg-[#fcfcf9] border border-[#3c422e]/20 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#606c38]/10 focus:border-[#606c38] focus:bg-white transition"
              />
            </div>

            <div className="md:col-span-1 flex items-end gap-2 justify-end">
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
                {loading ? "Saving..." : "Log Earning"}
              </button>
            </div>
          </form>
        </div>
      )}

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
            placeholder="Search clients or projects..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#fcfcf9] border border-[#3c422e]/20 rounded-lg text-xs font-bold placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#606c38]/10 focus:border-[#606c38] transition"
          />
        </div>

        <div className="flex gap-2 items-center w-full sm:w-auto overflow-x-auto justify-end">
          <div className="flex bg-[#fcfcf9] border border-[#3c422e]/20 rounded-lg p-0.5 shrink-0">
            {(["All", "Paid", "Pending", "Overdue"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1 text-[11px] font-bold rounded-md transition ${
                  statusFilter === filter
                    ? "bg-[#606c38] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-950"
                }`}
              >
                {filter === "Pending" ? "Unpaid / Pending" : filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Earnings Table */}
      <div className="bg-white border border-[#3c422e]/20 rounded-xl overflow-hidden shadow-sm">
        {filteredEarnings.length === 0 ? (
          <div className="text-center py-12 px-4">
            <FileSpreadsheet className="w-10 h-10 text-[#606c38]/30 mx-auto mb-2" />
            <h4 className="text-[#283618] font-bold text-sm">No Earnings Found</h4>
            <p className="text-slate-500 text-xs mt-1">Try resetting the filter or log a new payment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#3c422e]/20 bg-[#fcfcf9]">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Client & Project</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Payment Amount</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reference / Mode</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEarnings.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4.5">
                      <p className="text-xs font-bold text-[#283618]">{e.client}</p>
                      <p className="text-[11px] text-[#606c38] mt-0.5">{e.project}</p>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className="inline-flex items-center gap-0.5 text-xs font-black text-slate-950">
                        ₹{e.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-xs text-slate-500 font-bold">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {e.date}
                      </span>
                    </td>
                    <td className="px-6 py-4.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide uppercase border ${
                          e.status === "Paid"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : e.status === "Overdue"
                            ? "bg-rose-50 border-rose-200 text-rose-800"
                            : "bg-amber-50 border-amber-200 text-amber-800"
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#283618] font-bold">
                          <Landmark className="w-3 h-3 text-slate-400 shrink-0" />
                          {e.paymentMethod}
                        </span>
                        {e.invoiceRef && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#606c38] font-bold">
                            <Receipt className="w-2.5 h-2.5 shrink-0" />
                            {e.invoiceRef}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <button
                        onClick={() => e.id && onDeleteEarning(e.id)}
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
