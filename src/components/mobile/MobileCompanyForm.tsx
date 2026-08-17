'use client';

import React, { useState } from 'react';
import { Company } from '@/types';
import { ArrowLeft, Building2, FileCheck, ShieldCheck, User, Plus, CreditCard, Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateCompany, useUpdateCompany } from '@/hooks/use-companies';
import { usePersons, useCreatePerson } from '@/hooks/use-persons';
import { CloudinaryPhotoUpload } from '../cloudinary-photo-upload';
import { FormSection } from '@/components/shared';

interface MobileCompanyFormProps {
  company?: Company;
  onBack: () => void;
}

export default function MobileCompanyForm({ company, onBack }: MobileCompanyFormProps) {
  const { data: persons = [] } = usePersons();
  const createPersonMutation = useCreatePerson();

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
    ownerId: company?.ownerId || '',
    ownerName: company?.ownerName || company?.owner?.name || '',
    crNumber: company?.crNumber || '',
    crExpiry: toDateInput(company?.crExpiry),
    crPhoto: company?.crPhoto || '',
    licenseNumber: company?.licenseNumber || '',
    licenseExpiry: toDateInput(company?.licenseExpiry),
    licensePhoto: company?.licensePhoto || '',
    computerCardNumber: company?.computerCardNumber || '',
    computerCardPhoto: company?.computerCardPhoto || '',
    phone: company?.phone || '',
    email: company?.email || '',
    status: company?.status || 'Active',
    notes: company?.notes || ''
  });

  const [isAddingNewOwner, setIsAddingNewOwner] = useState(false);
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerPhone, setNewOwnerPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleQuickCreateOwner = async () => {
    if (!newOwnerName.trim()) return;
    try {
      const created = await createPersonMutation.mutateAsync({
        name: newOwnerName.trim(),
        phone: newOwnerPhone.trim() || undefined,
      });
      setFormData(prev => ({
        ...prev,
        ownerId: created.id,
        ownerName: created.name,
      }));
      setIsAddingNewOwner(false);
      setNewOwnerName('');
      setNewOwnerPhone('');
    } catch (err) {
      console.error('Error creating owner:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      const payload = { ...formData };
      if (payload.ownerId) {
        const p = persons.find(item => item.id === payload.ownerId);
        if (p) payload.ownerName = p.name;
      }

      if (company) {
        await updateMutation.mutateAsync({ id: company.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload as unknown as Parameters<typeof createMutation.mutateAsync>[0]);
      }
      onBack();
    } catch (err: unknown) {
      console.error('Error saving company:', err);
      const apiErr = err as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(apiErr?.response?.data?.message || apiErr?.message || 'Failed to save company details');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col w-full max-w-full overflow-hidden animate-in slide-in-from-bottom-full">
      {/* Top App Bar with prominent Save Button */}
      <header className="flex items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 border-b bg-card shadow-xs shrink-0 z-50">
        <div className="flex items-center min-w-0 flex-1 pr-2">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-10 w-10 shrink-0">
            <ArrowLeft className="w-5 h-5" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-base sm:text-lg font-bold ml-1 flex items-center gap-2 truncate">
            <Building2 className="w-5 h-5 text-primary shrink-0" />
            <span className="truncate">{company ? 'Edit Company Details' : 'Register Corporate Entity'}</span>
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
        <div className="m-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Fields Scroll Container */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 pb-[max(7rem,calc(env(safe-area-inset-bottom)+6rem))] space-y-4">
        {/* Core Company Details */}
        <div className="p-4 bg-card border rounded-2xl space-y-3.5 shadow-xs">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">COMPANY NAME *</label>
            <Input 
              required 
              value={formData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              className="h-12 text-sm rounded-xl font-semibold bg-background"
              placeholder="e.g. ABC Trading W.L.L."
            />
          </div>

          {/* Owner Dropdown & + Add New Owner */}
          <div className="space-y-2 pt-2 border-t border-border/40">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" />
                <span>OWNER / RESPONSIBLE PERSON</span>
              </label>
              {!isAddingNewOwner && (
                <button
                  type="button"
                  onClick={() => setIsAddingNewOwner(true)}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add New Owner</span>
                </button>
              )}
            </div>

            {!isAddingNewOwner ? (
              <select
                value={formData.ownerId}
                onChange={(e) => {
                  const val = e.target.value;
                  const p = persons.find(item => item.id === val);
                  setFormData(prev => ({
                    ...prev,
                    ownerId: val,
                    ownerName: p ? p.name : '',
                  }));
                }}
                className="w-full h-12 px-3 py-2 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select Existing Owner</option>
                {persons.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.phone ? `(${p.phone})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3.5 bg-muted/30 rounded-2xl border border-primary/30 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-primary">
                  <span>Register New Owner</span>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewOwner(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
                <Input
                  placeholder="Full Name (e.g. Ahmed Ali)"
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  className="h-11 text-sm bg-background"
                />
                <Input
                  placeholder="Phone Number (Optional)"
                  value={newOwnerPhone}
                  onChange={(e) => setNewOwnerPhone(e.target.value)}
                  className="h-11 text-sm bg-background"
                />
                <Button
                  type="button"
                  onClick={handleQuickCreateOwner}
                  disabled={!newOwnerName.trim() || createPersonMutation.isPending}
                  className="w-full h-10 text-xs font-bold bg-primary text-primary-foreground gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{createPersonMutation.isPending ? 'Saving...' : 'Save & Select Owner'}</span>
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-foreground">REGISTRATION STATUS</label>
            <select 
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full h-12 px-3 py-2 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Active">Active (Compliant)</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Commercial Registration (CR) Details */}
        <div className="p-4 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border border-blue-500/20 rounded-2xl space-y-3.5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
            <FileCheck className="w-4 h-4 shrink-0" />
            <span>Commercial Registration (CR)</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground">CR NUMBER</label>
            <Input 
              value={formData.crNumber}
              onChange={(e) => handleChange('crNumber', e.target.value)}
              className="h-12 text-sm rounded-xl font-mono bg-background"
              placeholder="e.g. 192837"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground">CR EXPIRY DATE</label>
            <Input 
              type="date"
              value={formData.crExpiry}
              onChange={(e) => handleChange('crExpiry', e.target.value)}
              className="h-12 text-sm rounded-xl font-mono bg-background"
            />
          </div>

          <CloudinaryPhotoUpload
            label="CR Certificate Document Photo"
            value={formData.crPhoto}
            onChange={(url) => handleChange('crPhoto', url)}
            folder="cr_certificates"
            placeholderText="Upload CR photo or document"
          />
        </div>

        {/* Trade License Details */}
        <div className="p-4 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 rounded-2xl space-y-3.5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Trade License Details</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground">LICENSE NUMBER</label>
            <Input 
              value={formData.licenseNumber}
              onChange={(e) => handleChange('licenseNumber', e.target.value)}
              className="h-12 text-sm rounded-xl font-mono bg-background"
              placeholder="e.g. TL-883920"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground">LICENSE EXPIRY DATE</label>
            <Input 
              type="date"
              value={formData.licenseExpiry}
              onChange={(e) => handleChange('licenseExpiry', e.target.value)}
              className="h-12 text-sm rounded-xl font-mono bg-background"
            />
          </div>

          <CloudinaryPhotoUpload
            label="Trade License Document Photo"
            value={formData.licensePhoto}
            onChange={(url) => handleChange('licensePhoto', url)}
            folder="trade_licenses"
            placeholderText="Upload License photo or document"
          />
        </div>

        {/* Computer Card / Establishment Card Details */}
        <div className="p-4 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 border border-purple-500/20 rounded-2xl space-y-3.5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400">
            <CreditCard className="w-4 h-4 shrink-0" />
            <span>Computer Card (Establishment Card)</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground">COMPUTER CARD NUMBER</label>
            <Input 
              value={formData.computerCardNumber}
              onChange={(e) => handleChange('computerCardNumber', e.target.value)}
              className="h-12 text-sm rounded-xl font-mono bg-background"
              placeholder="e.g. CC-449102"
            />
          </div>

          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>Expiry and status automatically link to the Trade License expiry date.</span>
          </div>

          <CloudinaryPhotoUpload
            label="Computer Card Photo / Document"
            value={formData.computerCardPhoto}
            onChange={(url) => handleChange('computerCardPhoto', url)}
            folder="computer_cards"
            placeholderText="Upload Computer Card photo"
          />
        </div>

        {/* Contact & Notes */}
        <div className="p-4 bg-card border rounded-2xl space-y-3.5 shadow-xs">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Official Phone Number</label>
            <Input 
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="h-12 text-sm rounded-xl font-mono bg-background"
              placeholder="+974 4411 2233"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Email Address</label>
            <Input 
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="h-12 text-sm rounded-xl bg-background"
              placeholder="info@company.qa"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Operational Notes</label>
            <Input 
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="h-12 text-sm rounded-xl bg-background"
              placeholder="Sector, branch notes, sponsorship terms..."
            />
          </div>
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
          <span>{isSaving ? 'Saving...' : company ? 'Update Company Details' : 'Save Company'}</span>
        </Button>
      </footer>
    </div>
  );
}
