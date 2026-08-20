'use client';

import React, { useState } from 'react';
import { Employee } from '@/types';
import { ArrowLeft, UserPlus, UserCheck, Phone, Globe, CreditCard, BookOpen, Building2, Briefcase, Check, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateEmployee, useUpdateEmployee } from '@/hooks/use-employees';
import { useCompanies } from '@/hooks/use-companies';
import { CloudinaryPhotoUpload } from '../cloudinary-photo-upload';
import { FormSection, FormField } from '@/components/shared';

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
      <header className="flex items-center justify-between gap-2 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 border-b bg-card shadow-xs shrink-0 z-50">
        <div className="flex items-center gap-1 min-w-0 flex-1">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-11 w-11 shrink-0">
            <ArrowLeft className="w-5 h-5" />
            <span className="sr-only">Back</span>
          </Button>
          <div className="min-w-0 flex-1 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary shrink-0" />
            <h1 className="text-sm sm:text-base font-bold text-foreground truncate min-w-0">
              {employee ? 'Edit Employee Profile' : 'Register New Employee'}
            </h1>
          </div>
        </div>

        <Button 
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          size="sm"
          className="h-10 px-4 text-xs font-bold rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 shrink-0 gap-1.5 min-h-[40px]"
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

      {/* Single Column Mobile Form Container */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 pb-[max(7rem,calc(env(safe-area-inset-bottom)+6rem))] space-y-4">
        {/* Section 1: Profile & Role */}
        <FormSection title="Profile & Role Information" icon={UserCheck}>
          <div className="space-y-4 grid grid-cols-1">
            <FormField label="Employee Full Name" required icon={UserCheck}>
              <Input 
                required 
                value={formData.employeeName}
                onChange={(e) => handleChange('employeeName', e.target.value)}
                className="w-full h-12 text-sm font-semibold rounded-xl bg-background"
                placeholder="e.g. Ahmed Ali"
              />
            </FormField>

            <FormField label="Role" required>
              <select 
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="w-full h-12 px-3.5 py-2 bg-background border border-input rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="OWNER">Owner / Executive</option>
              </select>
            </FormField>

            <FormField label="Registered Company (Sponsor)" required icon={Building2}>
              <select 
                required
                value={formData.companyId}
                onChange={(e) => handleChange('companyId', e.target.value)}
                className="w-full h-12 px-3.5 py-2 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring truncate"
              >
                <option value="" disabled>Select registered sponsoring company</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.companyName}</option>
                ))}
              </select>
            </FormField>

            <FormField 
              label="Current Working Company" 
              icon={Briefcase}
              hint="Select if employee is assigned or subcontracted to another firm"
            >
              <select 
                value={formData.currentWorkingCompanyId}
                onChange={(e) => handleChange('currentWorkingCompanyId', e.target.value)}
                className="w-full h-12 px-3.5 py-2 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring truncate"
              >
                <option value="">Same as Registered Company (Default)</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.companyName}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Employment Status">
              <select 
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full h-12 px-3.5 py-2 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="Active">Active (Compliant)</option>
                <option value="On Leave">On Leave</option>
                <option value="Terminated">Terminated</option>
              </select>
            </FormField>
          </div>
        </FormSection>

        {/* Section 2: Qatar ID (QID) Details */}
        <FormSection title="Qatar ID (QID) Details" icon={CreditCard} variant="blue">
          <div className="space-y-4 grid grid-cols-1">
            <FormField label="QID Number" required icon={CreditCard}>
              <Input 
                required
                value={formData.qidNumber}
                onChange={(e) => handleChange('qidNumber', e.target.value)}
                className="w-full h-12 text-sm font-mono rounded-xl bg-background"
                placeholder="e.g. 28412345678"
              />
            </FormField>

            <FormField label="QID Expiry Date" required>
              <Input 
                required
                type="date"
                value={formData.qidExpiry}
                onChange={(e) => handleChange('qidExpiry', e.target.value)}
                className="w-full h-12 text-sm font-mono rounded-xl bg-background"
              />
            </FormField>

            <CloudinaryPhotoUpload
              label="Qatar ID Photo / Scan"
              value={formData.qidPhoto}
              onChange={(url) => handleChange('qidPhoto', url)}
              folder="employee_qids"
              placeholderText="Upload Qatar ID scan or photo"
            />
          </div>
        </FormSection>

        {/* Section 3: Contact Information */}
        <FormSection title="Contact Information" icon={Phone} variant="amber">
          <div className="space-y-4 grid grid-cols-1">
            <FormField label="Local / Qatar Contact Number" icon={Phone}>
              <Input 
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full h-12 text-sm font-mono rounded-xl bg-background"
                placeholder="+974 5511 2233"
              />
            </FormField>

            <FormField label="Native Relative Contact (Emergency)" icon={Globe}>
              <Input 
                type="tel"
                value={formData.nativeRelativePhone}
                onChange={(e) => handleChange('nativeRelativePhone', e.target.value)}
                className="w-full h-12 text-sm font-mono rounded-xl bg-background"
                placeholder="+91 98470 12345 (Father / Spouse)"
              />
            </FormField>
          </div>
        </FormSection>

        {/* Section 4: Passport Document Details */}
        <FormSection title="Passport Document Details" icon={BookOpen} variant="emerald">
          <div className="space-y-4 grid grid-cols-1">
            <FormField label="Passport Number" icon={BookOpen}>
              <Input 
                value={formData.passportNumber}
                onChange={(e) => handleChange('passportNumber', e.target.value)}
                className="w-full h-12 text-sm font-mono rounded-xl bg-background"
                placeholder="e.g. N1234567"
              />
            </FormField>

            <FormField label="Passport Expiry Date">
              <Input 
                type="date"
                value={formData.passportExpiry}
                onChange={(e) => handleChange('passportExpiry', e.target.value)}
                className="w-full h-12 text-sm font-mono rounded-xl bg-background"
              />
            </FormField>

            <CloudinaryPhotoUpload
              label="Passport Photo / Scan"
              value={formData.passportPhoto}
              onChange={(url) => handleChange('passportPhoto', url)}
              folder="employee_passports"
              placeholderText="Upload Passport scan or photo"
            />
          </div>
        </FormSection>

        {/* Section 5: Notes */}
        <FormSection title="Operational Notes" icon={FileText}>
          <FormField label="Notes / Designation">
            <Input 
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full h-12 text-sm rounded-xl bg-background"
              placeholder="Designation, visa notes, profession..."
            />
          </FormField>
        </FormSection>
      </form>

      {/* Bottom Sticky Submit Button */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-card/95 backdrop-blur-lg border-t border-border/80 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl z-[100]">
        <Button 
          type="button" 
          onClick={handleSubmit}
          disabled={isSaving}
          className="w-full h-12 min-h-[48px] text-base font-bold rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 gap-2"
        >
          <Check className="w-5 h-5" />
          <span>{isSaving ? 'Saving...' : employee ? 'Update Employee Details' : 'Save Employee'}</span>
        </Button>
      </footer>
    </div>
  );
}
