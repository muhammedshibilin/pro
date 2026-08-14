'use client';

import React, { useState } from 'react';
import { Employee } from '@/types';
import { ArrowLeft, Edit2, Trash2, Building2, Phone, Globe, CreditCard, BookOpen, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate, getDaysRemaining } from '@/lib/utils';
import { EmployeeFormModal } from '@/components/employee-form-modal';
import { DeleteConfirmModal } from '@/components/delete-confirm-modal';
import { useDeleteEmployee } from '@/hooks/use-employees';

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
  const qidDays = employee.qidExpiry ? getDaysRemaining(employee.qidExpiry) : null;
  const passDays = employee.passportExpiry ? getDaysRemaining(employee.passportExpiry) : null;
  
  const handleDelete = async () => {
    await deleteMutation.mutateAsync(employee.id);
    setIsDeleteOpen(false);
    onBack();
  };

  const getStatusBadge = (days: number | null) => {
    if (days === null) return null;
    if (days < 0) {
      return <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">Expired ({Math.abs(days)}d ago)</span>;
    }
    if (days <= 30) {
      return <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">{days}d remaining</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Valid</span>;
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in slide-in-from-right">
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-lg font-bold text-foreground">Personnel Profile</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {/* Header Card */}
        <div className="bg-card rounded-2xl border p-6 flex flex-col items-center text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-primary/20 text-primary flex items-center justify-center font-bold text-2xl mb-3 border border-primary/20">
            {initials}
          </div>
          <h2 className="text-xl font-extrabold text-foreground">{employee.employeeName}</h2>
          <p className="text-xs text-muted-foreground mt-1">{employee.notes || 'Personnel'}</p>
          <span className="mt-3 px-3 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            {employee.status || 'Active'}
          </span>
        </div>

        {/* Contact Numbers */}
        <div className="bg-card rounded-2xl border border-amber-500/20 p-4 shadow-xs space-y-3">
          <h3 className="font-bold text-sm flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <Phone className="w-4 h-4" /> Contact Vectors
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-amber-600" /> Local Contact:</span>
              <strong className="font-mono">{employee.phone || '—'}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-amber-600" /> Native Relative:</span>
              <span className="font-medium text-right truncate max-w-[180px]">{employee.nativeRelativePhone || '—'}</span>
            </div>
          </div>
        </div>

        {/* Qatar ID (QID) Details */}
        <div className="bg-card rounded-2xl border border-blue-500/20 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <CreditCard className="w-4 h-4" /> Qatar ID (QID)
            </h3>
            {employee.qidPhoto && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1 text-primary"
                onClick={() => setViewingPhoto({ url: employee.qidPhoto!, title: `${employee.employeeName} — Qatar ID` })}
              >
                <Eye className="w-3.5 h-3.5" /> View Photo
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground text-[10px]">QID NUMBER</p>
              <p className="font-bold font-mono mt-0.5">{employee.qidNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-[10px]">EXPIRY DATE</p>
              <p className="font-medium mt-0.5">{employee.qidExpiry ? formatDate(employee.qidExpiry) : 'N/A'}</p>
            </div>
          </div>
          <div>{getStatusBadge(qidDays)}</div>
        </div>

        {/* Passport Details */}
        <div className="bg-card rounded-2xl border border-emerald-500/20 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <BookOpen className="w-4 h-4" /> Passport Document
            </h3>
            {employee.passportPhoto && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1 text-primary"
                onClick={() => setViewingPhoto({ url: employee.passportPhoto!, title: `${employee.employeeName} — Passport` })}
              >
                <Eye className="w-3.5 h-3.5" /> View Photo
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground text-[10px]">PASSPORT NUMBER</p>
              <p className="font-bold font-mono mt-0.5">{employee.passportNumber || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-[10px]">EXPIRY DATE</p>
              <p className="font-medium mt-0.5">{employee.passportExpiry ? formatDate(employee.passportExpiry) : 'N/A'}</p>
            </div>
          </div>
          {employee.passportExpiry && <div>{getStatusBadge(passDays)}</div>}
        </div>

        {/* Sponsor Company Info */}
        <div className="bg-card rounded-2xl border p-4 shadow-xs space-y-2">
          <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
            <Building2 className="w-4 h-4 text-primary" /> Sponsor Entity
          </h3>
          <p className="text-xs font-semibold text-foreground">{employee.company?.companyName || employee.companyId}</p>
        </div>
      </div>

      {/* Full Photo Modal */}
      {viewingPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setViewingPhoto(null)}
        >
          <div className="relative max-w-lg max-h-[85vh] bg-card rounded-2xl p-3 border shadow-2xl space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-xs truncate text-foreground">{viewingPhoto.title}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setViewingPhoto(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={viewingPhoto.url} alt={viewingPhoto.title} className="max-h-[60vh] mx-auto object-contain rounded-lg" />
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t flex gap-3 pb-[env(safe-area-inset-bottom,16px)]">
        <Button variant="outline" className="flex-1 h-12 text-rose-600 hover:bg-rose-500/10" onClick={() => setIsDeleteOpen(true)}>
          <Trash2 className="w-5 h-5 mr-2" /> Delete
        </Button>
        <Button className="flex-1 h-12 bg-primary text-primary-foreground font-bold" onClick={() => setIsEditOpen(true)}>
          <Edit2 className="w-5 h-5 mr-2" /> Edit Details
        </Button>
      </div>

      <EmployeeFormModal employee={employee} open={isEditOpen} onOpenChange={setIsEditOpen} />
      <DeleteConfirmModal
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
