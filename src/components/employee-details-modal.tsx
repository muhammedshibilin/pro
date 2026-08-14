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
import { calculateEmployeeQidStatus, EMPLOYEE_STATUS_META } from '@/lib/status-calculator';
import { Building, BadgeInfo, Phone, Globe, CreditCard, BookOpen, Eye, Edit3, Trash2, Briefcase } from 'lucide-react';
import { Button } from './ui/button';
import { EmployeeFormModal } from './employee-form-modal';
import { DeleteConfirmModal } from './delete-confirm-modal';
import { useDeleteEmployee } from '@/hooks/use-employees';
import { cn } from '@/lib/utils';

interface EmployeeDetailsModalProps {
  employee?: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployeeDetailsModal({ employee, open, onOpenChange }: EmployeeDetailsModalProps) {
  const [viewingPhoto, setViewingPhoto] = useState<{ url: string; title: string } | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const deleteMutation = useDeleteEmployee();

  if (!employee) return null;

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(employee.id);
    setIsDeleteOpen(false);
    onOpenChange(false);
  };

  const qidStatus = calculateEmployeeQidStatus(employee.qidExpiry);
  const qidMeta = EMPLOYEE_STATUS_META[qidStatus];
  const qidDays = getDaysRemaining(employee.qidExpiry);
  const isOwner = employee.role?.toUpperCase() === 'OWNER';

  const passportDays = employee.passportExpiry ? getDaysRemaining(employee.passportExpiry) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BadgeInfo className="h-5 w-5 text-primary" />
            Employee Profile & Documentation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Header Card */}
          <div className="p-4 border rounded-2xl bg-muted/20 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-primary/20 text-primary flex items-center justify-center font-bold text-lg shrink-0 ring-1 ring-primary/20">
                  {employee.employeeName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-bold text-sm text-foreground">{employee.employeeName}</h4>
                    <span className={cn(
                      "px-2 py-0.2 rounded-md text-[9px] font-bold font-mono uppercase tracking-wider border",
                      isOwner ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30" : "bg-muted text-muted-foreground border-border"
                    )}>
                      {isOwner ? 'Owner / Executive' : 'Employee'}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{employee.notes || 'Personnel Record'}</p>
                </div>
              </div>
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 shrink-0">
                {employee.status || 'Active'}
              </span>
            </div>

            {/* Sponsoring & Working Company Grid */}
            <div className="p-3 rounded-xl bg-background border space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-primary" />
                  <span>Registered Sponsoring Company:</span>
                </span>
                <strong className="text-foreground">{employee.company?.companyName || 'Unassigned'}</strong>
              </div>
              {employee.currentWorkingCompany && employee.currentWorkingCompanyId !== employee.companyId && (
                <div className="flex items-center justify-between pt-1.5 border-t border-border/40 text-blue-600 dark:text-blue-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Current Working Company:</span>
                  </span>
                  <strong>{employee.currentWorkingCompany.companyName}</strong>
                </div>
              )}
            </div>
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
              <span className={cn("px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold", qidMeta.badgeBg, qidMeta.badgeText, qidMeta.badgeBorder)}>
                {qidMeta.label} ({qidDays < 0 ? `${Math.abs(qidDays)}d ago` : `${qidDays}d left`})
              </span>
            </div>
          </div>

          {/* Passport Details */}
          <div className="border border-emerald-500/20 rounded-2xl p-4 space-y-3 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 shadow-xs">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
              <h5 className="font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                Passport Information
              </h5>
              {employee.passportPhoto && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px] gap-1 px-2 text-primary"
                  onClick={() => setViewingPhoto({ url: employee.passportPhoto!, title: `${employee.employeeName} — Passport Photo` })}
                >
                  <Eye className="h-3 w-3" /> View Passport
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-muted-foreground block uppercase font-medium">Passport Number</span>
                <span className="font-bold font-mono text-foreground text-xs mt-0.5 block">
                  {employee.passportNumber || '—'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block uppercase font-medium">Expiry Date</span>
                <span className="font-semibold text-foreground text-xs mt-0.5 block">
                  {employee.passportExpiry ? formatDate(employee.passportExpiry) : '—'}
                </span>
              </div>
            </div>

            {passportDays !== null && (
              <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground uppercase font-medium">Passport Status</span>
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-semibold",
                  passportDays < 0 ? "bg-rose-500/10 text-rose-600 border-rose-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                )}>
                  {passportDays < 0 ? `Expired ${-passportDays}d ago` : `${passportDays}d left`}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setIsEditOpen(true)}
            >
              <Edit3 className="h-3.5 w-3.5 mr-1" />
              Edit Profile
            </Button>

            <Button
              variant="destructive"
              size="sm"
              className="text-xs"
              onClick={() => setIsDeleteOpen(true)}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete Employee
            </Button>
          </div>
        </div>
      </DialogContent>

      <EmployeeFormModal
        employee={employee}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <DeleteConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Employee"
        description={`Are you sure you want to permanently delete ${employee.employeeName}? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />

      {/* Full Photo Modal Viewer */}
      {viewingPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setViewingPhoto(null)}>
          <div className="bg-card border rounded-2xl max-w-2xl w-full p-4 space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-sm truncate text-foreground">{viewingPhoto.title}</span>
              <Button variant="ghost" size="sm" onClick={() => setViewingPhoto(null)}>Close</Button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={viewingPhoto.url} alt={viewingPhoto.title} className="max-h-[70vh] w-auto mx-auto object-contain rounded-lg" />
          </div>
        </div>
      )}
    </Dialog>
  );
}
