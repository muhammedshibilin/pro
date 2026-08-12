'use client';

import React from 'react';
import { Employee } from '@/types';
import { ChevronRight, Phone, CreditCard, BookOpen, Image as ImageIcon } from 'lucide-react';
import { getDaysRemaining } from '@/lib/utils';

interface MobileEmployeeCardProps {
  employee: Employee;
  onTap: (employee: Employee) => void;
}

export default function MobileEmployeeCard({ employee, onTap }: MobileEmployeeCardProps) {
  const initials = (employee.employeeName || 'EM').substring(0, 2).toUpperCase();

  const getStatusBadge = (dateString?: string | null, label?: string) => {
    if (!dateString) return null;
    const days = getDaysRemaining(dateString);
    if (days < 0) {
      return (
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20">
          {label} Expired
        </span>
      );
    }
    if (days <= 30) {
      return (
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
          {label} in {days}d
        </span>
      );
    }
    return (
      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
        {label} Valid
      </span>
    );
  };

  return (
    <div 
      className="w-full bg-card rounded-2xl border p-4 shadow-xs active:scale-[0.98] transition-transform space-y-3"
      onClick={() => onTap(employee)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
            {initials}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm truncate text-foreground">{employee.employeeName}</h3>
            <p className="text-xs text-muted-foreground truncate">{employee.company?.companyName || 'Personnel'}</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
      </div>

      {/* Contact Number */}
      {employee.phone && (
        <div className="flex items-center gap-1.5 text-xs font-mono text-foreground bg-muted/20 px-2.5 py-1 rounded-xl">
          <Phone className="h-3 w-3 text-amber-600 shrink-0" />
          <span>{employee.phone}</span>
        </div>
      )}

      {/* QID & Passport Tracking Pills */}
      <div className="p-2.5 rounded-xl bg-muted/30 space-y-1.5 text-xs font-mono">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <CreditCard className="h-3.5 w-3.5 text-blue-500" />
            QID: <strong className="text-foreground">{employee.qidNumber}</strong>
          </span>
          <div className="flex items-center gap-1">
            {employee.qidPhoto && <ImageIcon className="h-3 w-3 text-blue-500" />}
            {getStatusBadge(employee.qidExpiry, 'QID')}
          </div>
        </div>

        {employee.passportNumber && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5 text-emerald-500" />
              Pass: <strong className="text-foreground">{employee.passportNumber}</strong>
            </span>
            <div className="flex items-center gap-1">
              {employee.passportPhoto && <ImageIcon className="h-3 w-3 text-emerald-500" />}
              {getStatusBadge(employee.passportExpiry, 'Pass')}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs pt-1 border-t">
        <span className="text-[10px] text-muted-foreground">{employee.notes || 'Personnel Profile'}</span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          {employee.status || 'Active'}
        </span>
      </div>
    </div>
  );
}
