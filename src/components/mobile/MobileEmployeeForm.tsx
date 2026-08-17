'use client';

import React, { useState } from 'react';
import { Employee } from '@/types';
import { ArrowLeft, UserPlus, Phone, Globe, CreditCard, BookOpen, Building2, Briefcase, UserCheck, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateEmployee, useUpdateEmployee } from '@/hooks/use-employees';
import { useCompanies } from '@/hooks/use-companies';
import { CloudinaryPhotoUpload } from '../cloudinary-photo-upload';
import { FormSection } from '@/components/shared';

interface MobileEmployeeFormProps {
  employee?: Employee;
  onBack: () => void;
}

export default function MobileEmployeeForm({ employee, onBack }: MobileEmployeeFormProps) {
  const toDateInput = (val?: string | null) => {
    if (!val) return '';
    try {
      return new Date(val).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const { data: companies = [] } = useCompanies();

  const [formData, setFormData] = useState({
    employeeName: employee?.employeeName || '',
    role: (employee?.role?.toUpperCase() === 'OWNER' ? 'OWNER' : 'EMPLOYEE'),
    companyId: employee?.companyId || (companies[0]?.id || ''),
    currentWorkingCompanyId: employee?.currentWorkingCompanyId || '',
    phone: employee?.phone || '',
    nativeRelativePhone: employee?.nativeRelativePhone || '',
    qidNumber: employee?.qidNumber || '',
    qidExpiry: toDateInput(employee?.qidExpiry),
    qidPhoto: employee?.qidPhoto || '',
    passportNumber: employee?.passportNumber || '',
    passportExpiry: toDateInput(employee?.passportExpiry),
    passportPhoto: employee?.passportPhoto || '',
    status: employee?.status || 'Active',
    notes: employee?.notes || '',
  });

  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      const payload = {
        ...formData,
        currentWorkingCompanyId: formData.currentWorkingCompanyId || null,
      };

      if (employee) {
        await updateMutation.mutateAsync({ id: employee.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload as unknown as Parameters<typeof createMutation.mutateAsync>[0]);
      }
      onBack();
    } catch (err: unknown) {
      console.error('Error saving employee:', err);
      const apiErr = err as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(apiErr?.response?.data?.message || apiErr?.message || 'Failed to save employee record');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col w-full max-w-full overflow-hidden animate-in slide-in-from-bottom-full">
      {/* Top App Bar with prominent Save button */}
      <header className="flex items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 border-b bg-card shadow-xs shrink-0 z-50">
        <div className="flex items-center min-w-0 flex-1 pr-2">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-10 w-10 shrink-0">
            <ArrowLeft className="w-5 h-5" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-base sm:text-lg font-bold ml-1 flex items-center gap-2 truncate">
            <UserPlus className="w-5 h-5 text-primary shrink-0" />
            <span className="truncate">{employee ? 'Edit Employee Profile' : 'Register New Employee'}</span>
          </h1>
        </div>

        <Button 
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          size="sm"
          className="h-9 px-3.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 shrink-0 gap-1.5"
        >
          <Check className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save'}</span>
        </Button>
      </header>

      {errorMessage && (
        <div className="m-4 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Fields Scroll Container */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 pb-[max(7rem,calc(env(safe-area-inset-bottom)+6rem))] space-y-4">
        {/* Core Info & Role */}
        <div className="p-4 bg-card border rounded-2xl space-y-3.5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <UserCheck className="w-4 h-4 text-primary" />
            <span>Profile & Role Information</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">EMPLOYEE FULL NAME *</label>
            <Input 
              required 
              value={formData.employeeName}
              onChange={(e) => handleChange('employeeName', e.target.value)}
              className="h-12 text-sm rounded-xl font-semibold bg-background"
              placeholder="e.g. Ahmed Ali"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">ROLE *</label>
            <select 
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className="w-full h-12 px-3 py-2 bg-background border border-input rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="EMPLOYEE">Employee</option>
              <option value="OWNER">Owner / Executive</option>
            </select>
          </div>

          <div className="space-y-1.5 pt-1 border-t border-border/40">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-primary" />
              <span>REGISTERED COMPANY (SPONSOR) *</span>
            </label>
            <select 
              required
              value={formData.companyId}
              onChange={(e) => handleChange('companyId', e.target.value)}
              className="w-full h-12 px-3 py-2 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="" disabled>Select registered sponsoring company</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.companyName}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              <span>CURRENT WORKING COMPANY (OPTIONAL)</span>
            </label>
            <select 
              value={formData.currentWorkingCompanyId}
              onChange={(e) => handleChange('currentWorkingCompanyId', e.target.value)}
              className="w-full h-12 px-3 py-2 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Same as Registered Company (Default)</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.companyName}</option>
              ))}
            </select>
            <p className="text-[11px] text-muted-foreground">Select if employee is assigned or subcontracted to another firm</p>
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-foreground">EMPLOYMENT STATUS</label>
            <select 
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full h-12 px-3 py-2 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Active">Active (Compliant)</option>
              <option value="On Leave">On Leave</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>
        </div>

        {/* Contact Numbers */}
        <div className="p-4 bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-2xl space-y-3.5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
            <Phone className="w-4 h-4 shrink-0" />
            <span>Contact Information</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>LOCAL / QATAR CONTACT NUMBER</span>
            </label>
            <Input 
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="h-12 text-sm rounded-xl font-mono bg-background"
              placeholder="+974 5511 2233"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>NATIVE RELATIVE CONTACT (EMERGENCY)</span>
            </label>
            <Input 
              type="tel"
              value={formData.nativeRelativePhone}
              onChange={(e) => handleChange('nativeRelativePhone', e.target.value)}
              className="h-12 text-sm rounded-xl font-mono bg-background"
              placeholder="+91 98470 12345 (Father / Spouse)"
            />
          </div>
        </div>

        {/* Qatar ID Details */}
        <div className="p-4 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border border-blue-500/20 rounded-2xl space-y-3.5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400">
            <CreditCard className="w-4 h-4 shrink-0" />
            <span>Qatar ID (QID) Details</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground">QID NUMBER *</label>
            <Input 
              required
              value={formData.qidNumber}
              onChange={(e) => handleChange('qidNumber', e.target.value)}
              className="h-12 text-sm rounded-xl font-mono bg-background"
              placeholder="e.g. 28412345678"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground">QID EXPIRY DATE *</label>
            <Input 
              required
              type="date"
              value={formData.qidExpiry}
              onChange={(e) => handleChange('qidExpiry', e.target.value)}
              className="h-12 text-sm rounded-xl font-mono bg-background"
            />
          </div>

          <CloudinaryPhotoUpload
            label="Qatar ID Photo / Scan"
            value={formData.qidPhoto}
            onChange={(url) => handleChange('qidPhoto', url)}
            folder="employee_qids"
            placeholderText="Upload Qatar ID scan or photo"
          />
        </div>

        {/* Passport Details */}
        <div className="p-4 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 rounded-2xl space-y-3.5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Passport Document Details</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground">PASSPORT NUMBER</label>
            <Input 
              value={formData.passportNumber}
              onChange={(e) => handleChange('passportNumber', e.target.value)}
              className="h-12 text-sm rounded-xl font-mono bg-background"
              placeholder="e.g. N1234567"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground">PASSPORT EXPIRY DATE</label>
            <Input 
              type="date"
              value={formData.passportExpiry}
              onChange={(e) => handleChange('passportExpiry', e.target.value)}
              className="h-12 text-sm rounded-xl font-mono bg-background"
            />
          </div>

          <CloudinaryPhotoUpload
            label="Passport Photo / Scan"
            value={formData.passportPhoto}
            onChange={(url) => handleChange('passportPhoto', url)}
            folder="employee_passports"
            placeholderText="Upload Passport scan or photo"
          />
        </div>

        {/* Notes */}
        <div className="p-4 bg-card border rounded-2xl space-y-2 shadow-xs">
          <label className="text-xs font-bold text-foreground">Operational Notes / Designation</label>
          <Input 
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="h-12 text-sm rounded-xl bg-background"
            placeholder="Designation, visa notes, profession..."
          />
        </div>
      </form>

      {/* Bottom Sticky Submit Button */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-card/95 backdrop-blur-lg border-t border-border/80 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl z-[100]">
        <Button 
          type="button" 
          onClick={handleSubmit}
          disabled={isSaving}
          className="w-full h-12 text-base font-bold rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 gap-2"
        >
          <Check className="w-5 h-5" />
          <span>{isSaving ? 'Saving...' : employee ? 'Update Employee Details' : 'Save Employee'}</span>
        </Button>
      </footer>
    </div>
  );
}
