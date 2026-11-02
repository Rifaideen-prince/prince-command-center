'use client';

import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  TrendingUp,
  Download,
  Trash2,
  PieChart,
  Tag
} from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { Transaction, TransactionType } from '../../lib/types';
import { Modal } from '../ui/Modal';

export function MoneyView() {
  const { transactions, addTransaction, deleteTransaction } = useCommandCenter();

  const [modalOpen, setModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  // Form states
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Lab Supplies');
  const [description, setDescription] = useState('');
  const [sourceOrReason, setSourceOrReason] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = [
    'Stipend',
    'Lab Supplies',
    'Books & Courses',
    'Freelance',
    'Productivity & Tech',
    'Travel & Food',
    'Other'
  ];

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  // Spending by category map
  const spendingByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const filtered = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    return true;
  });

  const handleOpenCreate = (selectedType: TransactionType) => {
    setType(selectedType);
    setAmount('');
    setDescription('');
    setSourceOrReason('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory(selectedType === 'income' ? 'Stipend' : 'Lab Supplies');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!parsed || !description.trim()) return;

    addTransaction({
      type,
      amount: parsed,
      category,
      date,
      description: description.trim(),
      sourceOrReason: sourceOrReason.trim() || 'Manual Entry'
    });

    setModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = 'ID,Type,Amount,Category,Date,Description,Source\n';
    const rows = transactions
      .map(t => `"${t.id}","${t.type}",${t.amount},"${t.category}","${t.date}","${t.description}","${t.sourceOrReason}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PRINCE_Finance_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Money &amp; Research Finance</h1>
            <p className="text-xs text-slate-400">Track fellowships, lab consumables, hardware costs, and net savings.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleOpenCreate('income')}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600/30 text-emerald-400 text-xs font-semibold rounded-xl transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Income</span>
          </button>
          <button
            onClick={() => handleOpenCreate('expense')}
            className="flex items-center gap-1 px-3 py-1.5 bg-rose-600/20 border border-rose-500/40 hover:bg-rose-600/30 text-rose-400 text-xs font-semibold rounded-xl transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Net Balance</span>
          <div className="text-xl font-black font-mono text-emerald-400 mt-1">
            ₹{netBalance.toLocaleString()}
          </div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Total Income</span>
          <div className="text-xl font-black font-mono text-indigo-400 mt-1">
            ₹{totalIncome.toLocaleString()}
          </div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Total Expenses</span>
          <div className="text-xl font-black font-mono text-rose-400 mt-1">
            ₹{totalExpense.toLocaleString()}
          </div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Savings Rate</span>
          <div className="text-xl font-black font-mono text-white mt-1">
            {savingsRate}%
          </div>
        </div>
      </div>

      {/* Spending Breakdown & Category Bars */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
          Expense Category Allocation
        </h3>
        <div className="space-y-3">
          {Object.entries(spendingByCategory).map(([cat, amt]) => {
            const pct = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0;
            return (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 font-medium">{cat}</span>
                  <span className="text-slate-400">₹{amt.toLocaleString()} ({pct}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800 overflow-hidden">
        <div className="p-4 flex items-center justify-between bg-slate-950/40">
          <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
            Transaction History
          </span>
          <div className="flex gap-1">
            {(['all', 'income', 'expense'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterType(mode)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  filterType === mode ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No transactions found. Click &quot;Log Income&quot; or &quot;Log Expense&quot; above to add your first record.
          </div>
        ) : (
          filtered.map((tx) => (
          <div
            key={tx.id}
            className="p-4 flex items-center justify-between gap-4 hover:bg-slate-950/40 transition-colors"
          >
            <div className="flex items-center gap-3 truncate">
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  tx.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {tx.type === 'income' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-white truncate">{tx.description}</span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {tx.date} • {tx.category} • {tx.sourceOrReason}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span
                className={`text-sm font-bold font-mono ${
                  tx.type === 'income' ? 'text-emerald-400' : 'text-slate-200'
                }`}
              >
                {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
              </span>
              <button
                onClick={() => deleteTransaction(tx.id)}
                className="p-1 text-slate-500 hover:text-rose-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>

      {/* Transaction Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={type === 'income' ? 'Add Income Record' : 'Add Expense Record'}
        subtitle="Log financial activity and research costs"
      >
        <form onSubmit={handleSave} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 500ml HPLC-grade Acetone"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Source / Vendor / Reason</label>
            <input
              type="text"
              value={sourceOrReason}
              onChange={(e) => setSourceOrReason(e.target.value)}
              placeholder="e.g. Academic Fellowship / Sigma-Aldrich"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
            >
              Save Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
