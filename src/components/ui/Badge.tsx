import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'critical' | 'strategic' | 'high' | 'medium' | 'low' | 'success' | 'warning' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'sm', className = '' }: BadgeProps) {
  const variantStyles = {
    default: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    critical: 'bg-rose-500/10 text-rose-400 border-rose-500/30 font-semibold',
    strategic: 'bg-purple-500/10 text-purple-400 border-purple-500/30 font-semibold',
    high: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    medium: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    low: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}
