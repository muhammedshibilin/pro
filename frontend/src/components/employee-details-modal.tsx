'use client';

import React, { useState } from 'react';
import { Employee } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { formatDate, getDaysRemaining } from '@/lib/utils';
import { Building, BadgeInfo, Phone, Globe, CreditCard, BookOpen, Eye, X, Cloud } from 'lucide-react';
import { Button } from './ui/button';

interface EmployeeDetailsModalProps {
  employee?: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployeeDetailsModal({ employee, open, onOpenChange }: EmployeeDetailsModalProps) {
  const [viewingPhoto, setViewingPhoto] = useState<{ url: string; title: string } | null>(null);

  if (!employee) return null;

  const qidDays = getDaysRemaining(employee.qidExpiry);
  const passportDays = employee.passportExpiry ? getDaysRemaining(employee.passportExpiry) : null;

  const getBadgeStyle = (days: number | null) => {
    if (days === null) return 'bg-muted text-muted-foreground border-border';
    if (days < 0) return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20';
    if (days <= 30) return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 shadow-xs animate-pulse';
    return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BadgeInfo className="h-5 w-5 text-primary" />
            Personnel Profile & Documentation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Header Card */}
          <div className="p-3.5 border rounded-2xl bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-primary/20 text-primary flex items-center justify-center font-bold text-base shrink-0 ring-1 ring-primary/20">
                {employee.employeeName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">{employee.employeeName}</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">{employee.notes || 'Company Personnel'}</p>
              </div>
            </div>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${
              employee.status === 'Active'
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-muted text-muted-foreground border-muted'
            }`}>
              {employee.status || 'Active'}
            </span>
          </div>

          {/* Contact Numbers */}
          <div className="border border-amber-500/20 rounded-2xl p-4 space-y-2.5 bg-gradient-to-br from-amber-500/5 to-orange-500/5 shadow-xs">
            <h5 className="font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-amber-500/20 pb-2">
              <Phone className="h-4 w-4" />
              Contact Details
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-muted-foreground block font-medium flex items-center gap-1">
                  <Phone className="h-3 w-3 text-amber-600" /> LOCAL / QATAR CONTACT
                </span>
                <span className="font-bold font-mono text-foreground text-xs mt-0.5 block">
                  {employee.phone || '—'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block font-medium flex items-center gap-1">
                  <Globe className="h-3 w-3 text-amber-600" /> NATIVE RELATIVE CONTACT
                </span>
                <span className="font-medium text-foreground text-xs mt-0.5 block">
                  {employee.nativeRelativePhone || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Qatar ID (QID) Details */}
          <div className="border border-blue-500/20 rounded-2xl p-4 space-y-3 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 shadow-xs">
            <div className="flex items-center justify-between border-b border-blue-500/20 pb-2">
              <h5 className="font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="h-4 w-4" />
                Qatar ID (QID) Details
              </h5>
              {employee.qidPhoto && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px] gap-1 px-2 text-primary"
                  onClick={() => setViewingPhoto({ url: employee.qidPhoto!, title: `${employee.employeeName} — Qatar ID Photo` })}
                >
                  <Eye className="h-3 w-3" /> View QID Photo
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-muted-foreground block uppercase font-medium">QID Number</span>
                <span className="font-bold font-mono text-foreground text-xs mt-0.5 block">{employee.qidNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block uppercase font-medium">QID Expiry Date</span>
                <span className="font-semibold text-foreground text-xs mt-0.5 block">{formatDate(employee.qidExpiry)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-blue-500/20 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground uppercase font-medium">QID Status</span>
              <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${getBadgeStyle(qidDays)}`}>
                {qidDays < 0
                  ? `Expired ${-qidDays} days ago`
                  : qidDays === 0
                  ? 'Expires Today'
                  : `${qidDays} days remaining`}
              </span>
            </div>
          </div>

          {/* Passport Details */}
          <div className="border border-emerald-500/20 rounded-2xl p-4 space-y-3 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 shadow-xs">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
              <h5 className="font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                Passport Documentation
              </h5>
              {employee.passportPhoto && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px] gap-1 px-2 text-primary"
                  onClick={() => setViewingPhoto({ url: employee.passportPhoto!, title: `${employee.employeeName} — Passport Photo` })}
                >
                  <Eye className="h-3 w-3" /> View Passport Photo
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-muted-foreground block uppercase font-medium">Passport Number</span>
                <span className="font-bold font-mono text-foreground text-xs mt-0.5 block">{employee.passportNumber || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block uppercase font-medium">Passport Expiry Date</span>
                <span className="font-semibold text-foreground text-xs mt-0.5 block">
                  {employee.passportExpiry ? formatDate(employee.passportExpiry) : '—'}
                </span>
              </div>
            </div>

            {employee.passportExpiry && (
              <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground uppercase font-medium">Passport Status</span>
                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${getBadgeStyle(passportDays)}`}>
                  {passportDays! < 0
                    ? `Expired ${-passportDays!} days ago`
                    : passportDays === 0
                    ? 'Expires Today'
                    : `${passportDays} days remaining`}
                </span>
              </div>
            )}
          </div>

          {/* Company Sponsor details */}
          <div className="border rounded-2xl p-4 space-y-2 bg-card shadow-xs">
            <h5 className="font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
              <Building className="h-4 w-4 text-primary" />
              Sponsoring Company
            </h5>
            {employee.company ? (
              <div className="space-y-1 text-muted-foreground text-xs">
                <p className="font-bold text-foreground">{employee.company.companyName}</p>
                {employee.company.ownerName && <p>Owner: {employee.company.ownerName}</p>}
                {employee.company.email && <p>Email: {employee.company.email}</p>}
                {employee.company.phone && <p>Phone: {employee.company.phone}</p>}
              </div>
            ) : (
              <p className="text-muted-foreground italic">No sponsor company linked.</p>
            )}
          </div>
        </div>

        {/* Full Image Preview Modal */}
        {viewingPhoto && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setViewingPhoto(null)}
          >
            <div className="relative max-w-xl max-h-[85vh] bg-card rounded-2xl overflow-hidden shadow-2xl border p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between pb-2 border-b">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-foreground">{viewingPhoto.title}</span>
                  {viewingPhoto.url.includes('cloudinary') && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-mono bg-sky-500/10 text-sky-600 border border-sky-500/20">
                      <Cloud className="h-2.5 w-2.5" /> Cloudinary
                    </span>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setViewingPhoto(null)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={viewingPhoto.url}
                alt={viewingPhoto.title}
                className="max-h-[60vh] w-auto mx-auto object-contain rounded-xl"
              />
              <div className="text-center pt-2">
                <a href={viewingPhoto.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary hover:underline font-mono">
                  Open Original High-Res ↗
                </a>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
