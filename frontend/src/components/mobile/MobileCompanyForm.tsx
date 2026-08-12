'use client';

import React, { useState } from 'react';
import { Company } from '@/types';
import { ArrowLeft, Building2, FileCheck, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateCompany, useUpdateCompany } from '@/hooks/use-companies';
import { CloudinaryPhotoUpload } from '../cloudinary-photo-upload';

interface MobileCompanyFormProps {
  company?: Company;
  onBack: () => void;
}

export default function MobileCompanyForm({ company, onBack }: MobileCompanyFormProps) {
  const toDateInput = (val?: string | null) => {
    if (!val) return '';
    try {
      return new Date(val).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const [formData, setFormData] = useState({
    companyName: company?.companyName || '',
    crNumber: company?.crNumber || '',
    crExpiry: toDateInput(company?.crExpiry),
    crPhoto: company?.crPhoto || '',
    licenseNumber: company?.licenseNumber || '',
    licenseExpiry: toDateInput(company?.licenseExpiry),
    licensePhoto: company?.licensePhoto || '',
    ownerName: company?.ownerName || '',
    phone: company?.phone || '',
    email: company?.email || '',
    status: company?.status || 'Active',
    notes: company?.notes || ''
  });

  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (company) {
      await updateMutation.mutateAsync({ id: company.id, data: formData });
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
          <Building2 className="w-5 h-5 text-primary" />
          {company ? 'Edit Company Details' : 'Add Corporate Entity'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 pb-28 space-y-4">
        {/* Core Company Details */}
        <div className="p-3.5 bg-card border rounded-2xl space-y-3 shadow-xs">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">COMPANY NAME *</label>
            <Input 
              required 
              value={formData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              className="h-11 text-sm rounded-xl font-semibold"
              placeholder="Cyberdyne Systems Corporation"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">STATUS</label>
            <select 
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full h-11 px-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Commercial Registration (CR) Details */}
        <div className="p-3.5 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border border-blue-500/20 rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
            <FileCheck className="w-4 h-4" />
            <span>Commercial Registration (CR)</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground">CR NUMBER</label>
            <Input 
              value={formData.crNumber}
              onChange={(e) => handleChange('crNumber', e.target.value)}
              className="h-11 text-sm rounded-xl font-mono bg-background"
              placeholder="CR-992014-QA"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground">CR EXPIRE DATE</label>
            <Input 
              type="date"
              value={formData.crExpiry}
              onChange={(e) => handleChange('crExpiry', e.target.value)}
              className="h-11 text-sm rounded-xl font-mono bg-background"
            />
          </div>

          <CloudinaryPhotoUpload
            label="CR Document / Photo"
            value={formData.crPhoto}
            onChange={(url) => handleChange('crPhoto', url)}
            folder="cr_certificates"
            placeholderText="Upload CR photo to Cloudinary"
          />
        </div>

        {/* Trade License Details */}
        <div className="p-3.5 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Trade License Details</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground">LICENSE NUMBER</label>
            <Input 
              value={formData.licenseNumber}
              onChange={(e) => handleChange('licenseNumber', e.target.value)}
              className="h-11 text-sm rounded-xl font-mono bg-background"
              placeholder="TL-883920-IND"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground">LICENSE EXPIRE DATE</label>
            <Input 
              type="date"
              value={formData.licenseExpiry}
              onChange={(e) => handleChange('licenseExpiry', e.target.value)}
              className="h-11 text-sm rounded-xl font-mono bg-background"
            />
          </div>

          <CloudinaryPhotoUpload
            label="Trade License Photo"
            value={formData.licensePhoto}
            onChange={(url) => handleChange('licensePhoto', url)}
            folder="trade_licenses"
            placeholderText="Upload License photo to Cloudinary"
          />
        </div>

        {/* Officer & Contacts */}
        <div className="p-3.5 bg-card border rounded-2xl space-y-3 shadow-xs">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Authorized Person / Owner</label>
            <Input 
              value={formData.ownerName}
              onChange={(e) => handleChange('ownerName', e.target.value)}
              className="h-11 text-sm rounded-xl"
              placeholder="Miles Dyson"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Phone Number</label>
            <Input 
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="h-11 text-sm rounded-xl font-mono"
              placeholder="+974 4411 2233"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Email Address</label>
            <Input 
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="h-11 text-sm rounded-xl"
              placeholder="contact@cyberdyne.com"
            />
          </div>
        </div>
      </form>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t pb-[env(safe-area-inset-bottom,16px)]">
        <Button 
          type="submit" 
          onClick={handleSubmit}
          disabled={isSaving}
          className="w-full h-12 text-base font-bold rounded-xl bg-primary text-primary-foreground"
        >
          {isSaving ? 'Saving...' : company ? 'Update Company Details' : 'Save Company Details'}
        </Button>
      </div>
    </div>
  );
}
