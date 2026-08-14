'use client';

import React, { useState } from 'react';
import { Employee } from '@/types';
import { ArrowLeft, UserPlus, Phone, Globe, CreditCard, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateEmployee, useUpdateEmployee } from '@/hooks/use-employees';
import { useCompanies } from '@/hooks/use-companies';
import { CloudinaryPhotoUpload } from '../cloudinary-photo-upload';

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

  const [formData, setFormData] = useState({
    employeeName: employee?.employeeName || '',
    companyId: employee?.companyId || '',
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
  const { data: companies = [] } = useCompanies();

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (employee) {
      await updateMutation.mutateAsync({ id: employee.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData as unknown as Parameters<typeof createMutation.mutateAsync>[0]);
    }
    onBack();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in slide-in-from-bottom-full">
      <div className="flex items-center p-4 border-b bg-card">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-lg font-bold ml-2 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" />
          {employee ? 'Edit Personnel Profile' : 'Add Personnel Profile'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 pb-28 space-y-4">
        {/* Core Info */}
        <div className="p-3.5 bg-card border rounded-2xl space-y-3 shadow-xs">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">FULL NAME *</label>
            <Input 
              required 
              value={formData.employeeName}
              onChange={(e) => handleChange('employeeName', e.target.value)}
              className="h-11 text-sm rounded-xl font-semibold"
              placeholder="Sarah Connor"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">SPONSOR COMPANY *</label>
            <select 
              required
              value={formData.companyId}
              onChange={(e) => handleChange('companyId', e.target.value)}
              className="w-full h-11 px-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="" disabled>Select a sponsor</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.companyName}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">STATUS</label>
            <select 
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full h-11 px-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Active">Active (Compliant)</option>
              <option value="On Leave">On Leave</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>
        </div>

        {/* Contact Numbers */}
        <div className="p-3.5 bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
            <Phone className="w-4 h-4" />
            <span>Contact Details</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <Phone className="w-3 h-3 text-amber-600" /> LOCAL / QATAR CONTACT
            </label>
            <Input 
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="h-11 text-sm rounded-xl font-mono bg-background"
              placeholder="+974 5511 2233"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <Globe className="w-3 h-3 text-amber-600" /> NATIVE RELATIVE CONTACT
            </label>
            <Input 
              type="tel"
              value={formData.nativeRelativePhone}
              onChange={(e) => handleChange('nativeRelativePhone', e.target.value)}
              className="h-11 text-sm rounded-xl font-mono bg-background"
              placeholder="+91 98470 12345 (Father / Spouse)"
            />
          </div>
        </div>

        {/* Qatar ID Details */}
        <div className="p-3.5 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border border-blue-500/20 rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400">
            <CreditCard className="w-4 h-4" />
            <span>Qatar ID (QID) Details</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground">QID NUMBER *</label>
            <Input 
              required
              value={formData.qidNumber}
              onChange={(e) => handleChange('qidNumber', e.target.value)}
              className="h-11 text-sm rounded-xl font-mono bg-background"
              placeholder="28567891234"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground">QID EXPIRE DATE *</label>
            <Input 
              required
              type="date"
              value={formData.qidExpiry}
              onChange={(e) => handleChange('qidExpiry', e.target.value)}
              className="h-11 text-sm rounded-xl font-mono bg-background"
            />
          </div>

          <CloudinaryPhotoUpload
            label="Qatar ID Photo / Scan"
            value={formData.qidPhoto}
            onChange={(url) => handleChange('qidPhoto', url)}
            folder="employee_qids"
            placeholderText="Upload Qatar ID photo to Cloudinary"
          />
        </div>

        {/* Passport Details */}
        <div className="p-3.5 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <BookOpen className="w-4 h-4" />
            <span>Passport Documentation</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground">PASSPORT NUMBER</label>
            <Input 
              value={formData.passportNumber}
              onChange={(e) => handleChange('passportNumber', e.target.value)}
              className="h-11 text-sm rounded-xl font-mono bg-background"
              placeholder="USA-99881122"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground">PASSPORT EXPIRE DATE</label>
            <Input 
              type="date"
              value={formData.passportExpiry}
              onChange={(e) => handleChange('passportExpiry', e.target.value)}
              className="h-11 text-sm rounded-xl font-mono bg-background"
            />
          </div>

          <CloudinaryPhotoUpload
            label="Passport Photo / Scan"
            value={formData.passportPhoto}
            onChange={(url) => handleChange('passportPhoto', url)}
            folder="employee_passports"
            placeholderText="Upload Passport photo to Cloudinary"
          />
        </div>

        {/* Notes */}
        <div className="p-3.5 bg-card border rounded-2xl space-y-1.5 shadow-xs">
          <label className="text-xs font-semibold text-foreground">Operational Notes</label>
          <Input 
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="h-11 text-sm rounded-xl"
            placeholder="Designation, visa notes..."
          />
        </div>
      </form>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t pb-[env(safe-area-inset-bottom,16px)]">
        <Button 
          type="submit" 
          onClick={handleSubmit}
          disabled={isSaving}
          className="w-full h-12 text-base font-bold rounded-xl bg-primary text-primary-foreground"
        >
          {isSaving ? 'Saving...' : employee ? 'Update Personnel Details' : 'Save Personnel Record'}
        </Button>
      </div>
    </div>
  );
}
