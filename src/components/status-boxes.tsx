'use client';

import React from 'react';
import { ShieldCheck, AlertCircle, AlertTriangle, Flame, ShieldAlert } from 'lucide-react';
import { EmployeeStatusCounts, CompanyStatusCounts } from '@/types';
import { cn } from '@/lib/utils';

interface EmployeeStatusBoxesProps {
  counts: EmployeeStatusCounts;
  activeFilter?: string;
  onSelectStatus: (status: string) => void;
  className?: string;
}

export function EmployeeStatusBoxes({
  counts,
  activeFilter,
  onSelectStatus,
  className,
}: EmployeeStatusBoxesProps) {
  const boxes = [
    {
      id: 'SAFE',
      label: 'SAFE',
      sublabel: 'Before Expiry',
      desc: 'QIDs okay / valid',
      count: counts.safe,
      icon: ShieldCheck,
      bg: 'bg-emerald-600 dark:bg-emerald-700 text-white',
      border: 'border-emerald-500/40',
      ring: 'ring-emerald-400',
      pill: 'bg-emerald-700/60 text-emerald-100',
    },
    {
      id: 'MONTH_1_EXPIRED',
      label: '1ST MONTH EXPIRED',
      sublabel: '0–1 Mo Past Expiry',
      desc: 'First month after expiry',
      count: counts.month1Expired,
      icon: AlertCircle,
      bg: 'bg-zinc-950 dark:bg-black text-white border border-zinc-700',
      border: 'border-zinc-700',
      ring: 'ring-zinc-400',
      pill: 'bg-zinc-800 text-zinc-200 border border-zinc-600',
    },
    {
      id: 'MONTH_2_EXPIRED',
      label: '2ND MONTH EXPIRED',
      sublabel: '1–2 Mos Past Expiry',
      desc: 'Second month after expiry',
      count: counts.month2Expired,
      icon: AlertTriangle,
      bg: 'bg-amber-400 dark:bg-amber-500 text-zinc-950 font-bold',
      border: 'border-amber-500/40',
      ring: 'ring-amber-400',
      pill: 'bg-amber-500/50 text-zinc-950 font-extrabold',
    },
    {
      id: 'MONTH_3_EXPIRED',
      label: '3RD MONTH EXPIRED',
      sublabel: '2–3 Mos Past Expiry',
      desc: 'Third month after expiry',
      count: counts.month3Expired,
      icon: Flame,
      bg: 'bg-rose-600 dark:bg-rose-700 text-white',
      border: 'border-rose-500/40',
      ring: 'ring-rose-400',
      pill: 'bg-rose-700/60 text-rose-100 font-bold',
    },
  ];

  return (
    <div className={cn("w-full space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg md:text-xl font-display font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <span>EMPLOYEE QID EXPIRY</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            4-tier calendar-month tracking based on Qatar ID expiry date
          </p>
        </div>
        {activeFilter && activeFilter !== 'ALL' && (
          <button
            onClick={() => onSelectStatus('ALL')}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* 4 Large Full-Color-Filled Status Boxes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {boxes.map((box) => {
          const Icon = box.icon;
          const isSelected = activeFilter === box.id;
          return (
            <button
              key={box.id}
              onClick={() => onSelectStatus(box.id)}
              className={cn(
                "relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl sm:rounded-3xl transition-all duration-200 text-left shadow-sm cursor-pointer min-h-[140px] sm:min-h-[160px]",
                box.bg,
                "hover:scale-[1.02] active:scale-[0.98]",
                isSelected ? "ring-4 ring-offset-2 " + box.ring : "opacity-95 hover:opacity-100"
              )}
            >
              <div className="flex items-start justify-between w-full">
                <span className={cn("text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full uppercase tracking-wider", box.pill)}>
                  {box.sublabel}
                </span>
                <Icon className="w-5 h-5 opacity-80 shrink-0" />
              </div>

              <div className="mt-4 sm:mt-6">
                <p className="text-4xl sm:text-5xl font-black font-mono tracking-tight leading-none">
                  {box.count}
                </p>
                <div className="mt-2.5">
                  <h3 className="font-extrabold text-sm sm:text-base leading-tight tracking-tight uppercase">
                    {box.label}
                  </h3>
                  <p className="text-[11px] sm:text-xs opacity-90 leading-tight mt-0.5">
                    {box.desc}
                  </p>
                </div>
              </div>

              {isSelected && (
                <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface CompanyStatusBoxesProps {
  counts: CompanyStatusCounts;
  activeFilter?: string;
  onSelectStatus: (status: string) => void;
  className?: string;
}

export function CompanyStatusBoxes({
  counts,
  activeFilter,
  onSelectStatus,
  className,
}: CompanyStatusBoxesProps) {
  const boxes = [
    {
      id: 'SAFE',
      label: 'SAFE',
      sublabel: '3+ Months Left',
      desc: 'Companies documents okay',
      count: counts.safe,
      icon: ShieldCheck,
      bg: 'bg-emerald-600 dark:bg-emerald-700 text-white',
      border: 'border-emerald-500/40',
      ring: 'ring-emerald-400',
      pill: 'bg-emerald-700/60 text-emerald-100',
    },
    {
      id: 'WARNING',
      label: 'WARNING',
      sublabel: '2 Months Left',
      desc: 'Expiring soon (2 months left)',
      count: counts.warning,
      icon: AlertTriangle,
      bg: 'bg-amber-400 dark:bg-amber-500 text-zinc-950 font-bold',
      border: 'border-amber-500/40',
      ring: 'ring-amber-400',
      pill: 'bg-amber-500/50 text-zinc-950 font-extrabold',
    },
    {
      id: 'DANGER',
      label: 'DANGER',
      sublabel: '< 1 Mo / Expired',
      desc: 'Immediate action (≤1 month or expired)',
      count: counts.danger,
      icon: ShieldAlert,
      bg: 'bg-rose-600 dark:bg-rose-700 text-white',
      border: 'border-rose-500/40',
      ring: 'ring-rose-400',
      pill: 'bg-rose-700/60 text-rose-100 font-bold',
    },
  ];

  return (
    <div className={cn("w-full space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg md:text-xl font-display font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <span>COMPANY DOCUMENTS</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            3-tier compliance status for CR, Trade License, and Computer Card
          </p>
        </div>
        {activeFilter && activeFilter !== 'ALL' && (
          <button
            onClick={() => onSelectStatus('ALL')}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* 3 Large Full-Color-Filled Status Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {boxes.map((box) => {
          const Icon = box.icon;
          const isSelected = activeFilter === box.id;
          return (
            <button
              key={box.id}
              onClick={() => onSelectStatus(box.id)}
              className={cn(
                "relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl sm:rounded-3xl transition-all duration-200 text-left shadow-sm cursor-pointer min-h-[140px] sm:min-h-[160px]",
                box.bg,
                "hover:scale-[1.02] active:scale-[0.98]",
                isSelected ? "ring-4 ring-offset-2 " + box.ring : "opacity-95 hover:opacity-100"
              )}
            >
              <div className="flex items-start justify-between w-full">
                <span className={cn("text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full uppercase tracking-wider", box.pill)}>
                  {box.sublabel}
                </span>
                <Icon className="w-5 h-5 opacity-80 shrink-0" />
              </div>

              <div className="mt-4 sm:mt-6">
                <p className="text-4xl sm:text-5xl font-black font-mono tracking-tight leading-none">
                  {box.count}
                </p>
                <div className="mt-2.5">
                  <h3 className="font-extrabold text-sm sm:text-base leading-tight tracking-tight uppercase">
                    {box.label}
                  </h3>
                  <p className="text-[11px] sm:text-xs opacity-90 leading-tight mt-0.5">
                    {box.desc}
                  </p>
                </div>
              </div>

              {isSelected && (
                <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
