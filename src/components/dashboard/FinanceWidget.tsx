'use client';

import React from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, ArrowRight, TrendingUp } from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';

export function FinanceWidget() {
  const { transactions, setCurrentView } = useCommandCenter();

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Financial Overview</h3>
            <span className="text-[11px] text-slate-400 font-mono">Research Stipend &amp; Lab Expenses</span>
          </div>
        </div>
        <button
          onClick={() => setCurrentView('money')}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
        >
          <span>Money Portal</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono uppercase">Net Balance</span>
          <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
            ₹{netBalance.toLocaleString()}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono uppercase">Income</span>
          <div className="text-sm font-bold font-mono text-indigo-400 mt-0.5">
            ₹{totalIncome.toLocaleString()}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono uppercase">Expenses</span>
          <div className="text-sm font-bold font-mono text-rose-400 mt-0.5">
            ₹{totalExpense.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Recent Transaction items */}
      <div className="space-y-1.5">
        {transactions.length === 0 ? (
          <p className="text-xs text-slate-500 py-3 text-center">
            No transactions recorded yet.
          </p>
        ) : (
          transactions.slice(0, 3).map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs"
          >
            <div className="flex items-center gap-2 truncate">
              {tx.type === 'income' ? (
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <ArrowUpRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              )}
              <span className="text-slate-200 truncate font-medium">{tx.description}</span>
            </div>
            <span
              className={`font-mono font-bold shrink-0 ${
                tx.type === 'income' ? 'text-emerald-400' : 'text-slate-300'
              }`}
            >
              {tx.type === 'income' ? '+' : '-'}₹{tx.amount}
            </span>
          </div>
        ))
      )}
    </div>
    </div>
  );
}
