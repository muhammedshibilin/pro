'use client';

import React, { useState } from 'react';
import { Employee } from '@/types';
import { Edit2, Trash2, Building2, Phone, Globe, CreditCard, BookOpen, Eye, X, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate, getDaysRemaining, cn } from '@/lib/utils';
import { calculateEmployeeQidStatus, EMPLOYEE_STATUS_META } from '@/lib/status-calculator';
import MobileEmployeeForm from './MobileEmployeeForm';
import { useDeleteEmployee } from '@/hooks/use-employees';
import {
  PageHeader,
  FormSection,
  ConfirmationDialog,
} from '@/components/shared';

interface MobileEmployeeDetailProps {
  employee: Employee;
  onBack: () => void;
}

export default function MobileEmployeeDetail({ employee, onBack }: MobileEmployeeDetailProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState<{ url: string; title: string } | null>(null);
  const deleteMutation = useDeleteEmployee();

  const initials = (employee.employeeName || 'EM').substring(0, 2).toUpperCase();
  
  const handleDelete = async () => {
    await deleteMutation.mutateAsync(employee.id);
    setIsDeleteOpen(false);
    onBack();
  };

  const renderQidBadge = (dateString?: string | null) => {
    if (!dateString) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono text-muted-foreground bg-muted/60 border border-border">
          No QID Expiry
        </span>
      );
    }
    const status = calculateEmployeeQidStatus(dateString);
    const meta = EMPLOYEE_STATUS_META[status];
    const days = getDaysRemaining(dateString);

    let detail = `Valid until ${formatDate(dateString)}`;
    if (status !== 'SAFE') {
      detail = `${meta.label} (${Math.abs(days)}d ago)`;
    }

    return (
      <span className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-semibold border",
        meta.badgeBg,
        meta.badgeText,
        meta.badgeBorder
      )}>
        {detail}
      </span>
    );
  };

  const renderExpiryBadge = (dateString?: string | null) => {
    if (!dateString) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono text-muted-foreground bg-muted/60 border border-border">
          No Expiry Date
        </span>
      );
    }
    const days = getDaysRemaining(dateString);
    if (days < 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
          Expired ({Math.abs(days)}d ago)
        </span>
      );
    }
    if (days <= 30) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
          {days} days remaining
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
        Valid until {formatDate(dateString)}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col w-full max-w-full overflow-hidden animate-in slide-in-from-right">
      {/* Top App Bar with Top-Right Actions */}
      <PageHeader
        title="Employee Profile"
        onBack={onBack}
        primaryAction={{
          label: "Edit",
          icon: Edit2,
          title: "Edit Employee Details",
          onClick: () => setIsEditOpen(true),
          variant: "outline",
        }}
        secondaryActions={[
          {
            label: "Delete",
            icon: Trash2,
            title: "Delete Employee",
            variant: "destructive",
            onClick: () => setIsDeleteOpen(true),
          },
        ]}
        className="rounded-none border-x-0 border-t-0 p-3 bg-card shadow-xs shrink-0"
      />

      {/* Main Scroll Content */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-[max(7rem,calc(env(safe-area-inset-bottom)+6rem))]">
        {/* Header Profile Card */}
        <div className="bg-card rounded-2xl border p-5 flex flex-col items-center text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-primary/20 text-primary flex items-center justify-center font-bold text-2xl mb-3 border border-primary/20 shrink-0">
            {initials}
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-foreground break-words w-full leading-snug">
            {employee.employeeName}
          </h2>
          <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
            <span className={cn(
              "px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider border",
              employee.role?.toUpperCase() === 'OWNER' ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30" : "bg-muted text-muted-foreground border-border"
            )}>
              {employee.role?.toUpperCase() === 'OWNER' ? 'Owner / Executive' : 'Employee'}
            </span>
            <span className="px-3 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              {employee.status || 'Active'}
            </span>
          </div>

          <div className="mt-4 w-full p-3 rounded-xl bg-muted/30 border space-y-2 text-xs text-left">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Registered Sponsor:</span>
              <strong className="text-foreground">{employee.company?.companyName || 'Unassigned'}</strong>
            </div>
            {employee.currentWorkingCompany && employee.currentWorkingCompanyId !== employee.companyId && (
              <div className="flex items-center justify-between pt-1 border-t border-border/40 text-blue-600 dark:text-blue-400">
                <span>Current Working Company:</span>
                <strong>{employee.currentWorkingCompany.companyName}</strong>
              </div>
            )}
          </div>

          {employee.notes && (
            <p className="text-xs text-muted-foreground mt-2 break-words w-full">{employee.notes}</p>
          )}
        </div>

        {/* Contact Vectors */}
        <FormSection title="Contact Information" icon={Phone} variant="amber">
          <div className="flex justify-between items-center pb-2 border-b border-border/40 text-xs">
            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span>Qatar Contact Number:</span>
            </span>
            <strong className="font-mono text-foreground">{employee.phone || '—'}</strong>
          </div>
          <div className="flex justify-between items-center pt-1 text-xs">
            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span>Native Relative Contact:</span>
            </span>
            <span className="font-mono text-foreground font-semibold">{employee.nativeRelativePhone || '—'}</span>
          </div>
        </FormSection>

        {/* Qatar ID (QID) Details */}
        <FormSection title="Qatar ID (QID) Details" icon={CreditCard} variant="blue">
          <div className="flex justify-between items-center pb-2 border-b border-border/40 text-xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">QID Number</span>
            <strong className="font-mono text-sm font-bold text-foreground">{employee.qidNumber}</strong>
          </div>
          <div className="flex justify-between items-center pt-1 text-xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Expiry Status</span>
            <div>{renderQidBadge(employee.qidExpiry)}</div>
          </div>
          {employee.qidPhoto && (
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs gap-1.5 text-primary border-primary/20 mt-2"
              onClick={() => setViewingPhoto({ url: employee.qidPhoto!, title: `${employee.employeeName} — Qatar ID` })}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View QID Photo</span>
            </Button>
          )}
        </FormSection>

        {/* Passport Details */}
        <FormSection title="Passport Document Details" icon={BookOpen} variant="emerald">
          <div className="flex justify-between items-center pb-2 border-b border-border/40 text-xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Passport Number</span>
            <strong className="font-mono text-sm font-bold text-foreground">{employee.passportNumber || '—'}</strong>
          </div>
          <div className="flex justify-between items-center pt-1 text-xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Expiry Status</span>
            <div>{renderExpiryBadge(employee.passportExpiry)}</div>
          </div>
          {employee.passportPhoto && (
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs gap-1.5 text-primary border-primary/20 mt-2"
              onClick={() => setViewingPhoto({ url: employee.passportPhoto!, title: `${employee.employeeName} — Passport` })}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Passport Photo</span>
            </Button>
          )}
        </FormSection>

        {/* Sponsor Company Info */}
        <FormSection title="Sponsoring Company" icon={Building2}>
          <p className="text-sm font-semibold text-foreground">
            {employee.company?.companyName || 'Unassigned Sponsor Entity'}
          </p>
        </FormSection>
      </main>

      {/* Sticky Bottom Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-card/95 backdrop-blur-lg border-t border-border/80 flex gap-3 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-xl z-[100]">
        <Button 
          variant="outline" 
          className="flex-1 h-12 text-sm font-semibold text-rose-600 hover:bg-rose-500/10 border-rose-500/30" 
          onClick={() => setIsDeleteOpen(true)}
        >
          <Trash2 className="w-4 h-4 mr-2 shrink-0" />
          <span>Delete</span>
        </Button>
        <Button 
          className="flex-1 h-12 text-sm bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20" 
          onClick={() => setIsEditOpen(true)}
        >
          <Edit2 className="w-4 h-4 mr-2 shrink-0" />
          <span>Edit Details</span>
        </Button>
      </footer>

      {/* Full Photo Modal */}
      {viewingPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setViewingPhoto(null)}>
          <div className="relative w-full max-w-lg max-h-[85vh] bg-card rounded-2xl p-4 border shadow-2xl space-y-3 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-xs truncate text-foreground pr-2">{viewingPhoto.title}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewingPhoto(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={viewingPhoto.url} alt={viewingPhoto.title} className="max-h-[60vh] w-auto mx-auto object-contain rounded-lg" />
          </div>
        </div>
      )}

      {isEditOpen && (
        <MobileEmployeeForm employee={employee} onBack={() => setIsEditOpen(false)} />
      )}
      <ConfirmationDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Employee"
        description={`Are you sure you want to delete ${employee.employeeName}?`}
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
