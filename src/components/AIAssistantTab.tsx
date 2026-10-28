import React from "react";
import { Sparkles, Construction, HelpCircle, ArrowRight } from "lucide-react";

export default function AIAssistantTab() {
  return (
    <div className="w-full bg-white border-2 border-[#3c422e]/20 rounded-2xl shadow-sm flex flex-col min-h-[550px] items-center justify-center p-8 text-center bg-[#fcfcf9]">
      <div className="p-4 bg-[#606c38]/10 rounded-full text-[#606c38] mb-6 animate-pulse">
        <Construction className="w-12 h-12" />
      </div>

      <span className="px-3 py-1 rounded-full bg-[#606c38]/10 border border-[#606c38]/20 text-xs font-bold text-[#3c422e] uppercase tracking-wider mb-3 inline-flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#606c38] inline-block animate-ping"></span>
        Upgrades In Progress
      </span>

      <h3 className="text-2xl font-black text-[#283618] tracking-tight max-w-md">
        ApexAI Financial Pro
      </h3>
      <p className="text-sm font-bold text-[#606c38] mt-2 max-w-md leading-relaxed">
        We are optimizing the real-time Indian Rupee ledger synchronization modules. This interactive advisor panel is temporarily under scheduled maintenance and will return shortly with advanced predictive metrics.
      </p>

      <div className="mt-8 border-t border-[#3c422e]/10 pt-6 w-full max-w-md text-left space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-lg bg-[#606c38]/10 text-[#606c38] flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-xs font-bold">1</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#283618]">Ledger Upgrades</h4>
            <p className="text-[11px] font-bold text-slate-500">Fine-tuning instant audit response speeds for heavy Indian transactional ledgers.</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-lg bg-[#606c38]/10 text-[#606c38] flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-xs font-bold">2</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#283618]">Tax Engine Optimization</h4>
            <p className="text-[11px] font-bold text-slate-500">Revising dynamic consultation scopes and Indian GST advisory templates.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
