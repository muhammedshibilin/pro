'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateCompany, useUpdateCompany } from '@/hooks/use-companies';
import { usePersons, useCreatePerson } from '@/hooks/use-persons';
import { Company } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { Building2, FileCheck, ShieldCheck, User, Plus, CreditCard, Check, Info } from 'lucide-react';
import { CloudinaryPhotoUpload } from './cloudinary-photo-upload';

const companySchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, 'Company name must be at least 2 characters')
    .max(120, 'Company name cannot exceed 120 characters'),
  ownerId: z.string().optional().or(z.literal('')),
  ownerName: z.string().trim().max(100).optional().or(z.literal('')),
  crNumber: z.string().trim().max(60).optional().or(z.literal('')),
  crExpiry: z.string().optional().or(z.literal('')),
  crPhoto: z.string().optional().or(z.literal('')),
  licenseNumber: z.string().trim().max(60).optional().or(z.literal('')),
  licenseExpiry: z.string().optional().or(z.literal('')),
  licensePhoto: z.string().optional().or(z.literal('')),
  computerCardNumber: z.string().trim().max(60).optional().or(z.literal('')),
  computerCardPhoto: z.string().optional().or(z.literal('')),
  phone: z.string().trim().max(50).optional().or(z.literal('')),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
  status: z.string().min(1, 'Status is required'),
});

type CompanyFormValues = z.infer<typeof companySchema>;

interface CompanyFormModalProps {
  company?: Company;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompanyFormModal({ company, open, onOpenChange }: CompanyFormModalProps) {
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const { data: persons = [] } = usePersons();
  const createPersonMutation = useCreatePerson();

  const [isAddingNewOwner, setIsAddingNewOwner] = useState(false);
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerPhone, setNewOwnerPhone] = useState('');

  const isEdit = !!company;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: '',
      ownerId: '',
      ownerName: '',
      crNumber: '',
      crExpiry: '',
      crPhoto: '',
      licenseNumber: '',
      licenseExpiry: '',
      licensePhoto: '',
      computerCardNumber: '',
      computerCardPhoto: '',
      phone: '',
      email: '',
      notes: '',
      status: 'Active',
    },
  });

  const crPhotoValue = watch('crPhoto');
  const licensePhotoValue = watch('licensePhoto');
  const computerCardPhotoValue = watch('computerCardPhoto');
  const ownerIdValue = watch('ownerId');

  // Format date helper for input type="date"
  const toDateInput = (val?: string | null) => {
    if (!val) return '';
    try {
      return new Date(val).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (open) {
      setIsAddingNewOwner(false);
      setNewOwnerName('');
      setNewOwnerPhone('');

      if (company) {
        reset({
          companyName: company.companyName || '',
          ownerId: company.ownerId || '',
          ownerName: company.ownerName || company.owner?.name || '',
          crNumber: company.crNumber || '',
          crExpiry: toDateInput(company.crExpiry),
          crPhoto: company.crPhoto || '',
          licenseNumber: company.licenseNumber || '',
          licenseExpiry: toDateInput(company.licenseExpiry),
          licensePhoto: company.licensePhoto || '',
          computerCardNumber: company.computerCardNumber || '',
          computerCardPhoto: company.computerCardPhoto || '',
          phone: company.phone || '',
          email: company.email || '',
          notes: company.notes || '',
          status: company.status || 'Active',
        });
      } else {
        reset({
          companyName: '',
          ownerId: '',
          ownerName: '',
          crNumber: '',
          crExpiry: '',
          crPhoto: '',
          licenseNumber: '',
          licenseExpiry: '',
          licensePhoto: '',
          computerCardNumber: '',
          computerCardPhoto: '',
          phone: '',
          email: '',
          notes: '',
          status: 'Active',
        });
      }
    }
  }, [company, open, reset]);

  const handleQuickCreateOwner = async () => {
    if (!newOwnerName.trim()) return;
    try {
      const created = await createPersonMutation.mutateAsync({
        name: newOwnerName.trim(),
        phone: newOwnerPhone.trim() || undefined,
      });
      setValue('ownerId', created.id);
      setValue('ownerName', created.name);
      setIsAddingNewOwner(false);
      setNewOwnerName('');
      setNewOwnerPhone('');
    } catch (err) {
      console.error('Error creating owner:', err);
    }
  };

  const onSubmit = async (data: CompanyFormValues) => {
    try {
      // Find matching person name if ownerId selected
      if (data.ownerId) {
        const found = persons.find(p => p.id === data.ownerId);
        if (found) data.ownerName = found.name;
      }

      if (isEdit && company) {
        await updateCompany.mutateAsync({ id: company.id, data });
      } else {
        await createCompany.mutateAsync(data);
      }
      onOpenChange(false);
      reset();
    } catch (err) {
      console.error('Error saving company:', err);
    }
  };

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Building2 className="h-5 w-5 text-primary" />
            {isEdit ? 'Edit Company Profile & Licenses' : 'Add Corporate Entity'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
          {/* Section 1: Company Core */}
          <div className="p-3.5 bg-muted/20 border rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <Building2 className="h-4 w-4 text-primary" />
              <span>Primary Information</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">COMPANY NAME *</label>
                <Input 
                  placeholder="e.g. ABC Trading W.L.L" 
                  {...register('companyName')} 
                  className="bg-background text-xs font-semibold"
                />
                {errors.companyName && <p className="text-[10px] text-destructive">{errors.companyName.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">STATUS</label>
                <Select options={statusOptions} {...register('status')} className="bg-background" />
              </div>
            </div>

            {/* Owner Selection & Inline Creation */}
            <div className="space-y-2 pt-1 border-t border-border/40">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span>OWNER / RESPONSIBLE PERSON</span>
                </label>
                {!isAddingNewOwner && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewOwner(true)}
                    className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Add New Owner</span>
                  </button>
                )}
              </div>

              {!isAddingNewOwner ? (
                <div className="flex gap-2">
                  <select
                    value={ownerIdValue || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setValue('ownerId', val);
                      const person = persons.find(p => p.id === val);
                      if (person) setValue('ownerName', person.name);
                    }}
                    className="w-full h-10 px-3 rounded-lg border bg-background text-xs font-medium focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="">Select Existing Owner</option>
                    {persons.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.phone ? `(${p.phone})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-3 bg-background rounded-xl border border-primary/30 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-primary">
                    <span>New Owner / Person Registration</span>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewOwner(false)}
                      className="text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      placeholder="Full Name (e.g. Ahmed Ali)"
                      value={newOwnerName}
                      onChange={(e) => setNewOwnerName(e.target.value)}
                      className="text-xs bg-muted/20"
                    />
                    <Input
                      placeholder="Phone (Optional)"
                      value={newOwnerPhone}
                      onChange={(e) => setNewOwnerPhone(e.target.value)}
                      className="text-xs bg-muted/20"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleQuickCreateOwner}
                    disabled={!newOwnerName.trim() || createPersonMutation.isPending}
                    className="w-full text-xs h-8 bg-primary text-primary-foreground gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{createPersonMutation.isPending ? 'Saving Owner...' : 'Save & Select Owner'}</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Commercial Registration (CR) Details */}
          <div className="p-3.5 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border border-blue-500/20 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400">
                <FileCheck className="h-4 w-4" />
                <span>Commercial Registration (CR)</span>
              </div>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                Mandatory Regulatory Permit
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">CR NUMBER</label>
                <Input 
                  placeholder="e.g. CR-992014-QA" 
                  {...register('crNumber')} 
                  className="bg-background font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">CR EXPIRE DATE</label>
                <Input 
                  type="date" 
                  {...register('crExpiry')} 
                  className="bg-background font-mono text-xs"
                />
              </div>
            </div>

            {/* Cloudinary CR Photo Upload */}
            <CloudinaryPhotoUpload
              label="CR Document / Certificate Photo"
              value={crPhotoValue}
              onChange={(url) => setValue('crPhoto', url)}
              folder="cr_certificates"
              placeholderText="Upload CR certificate photo to Cloudinary"
            />
          </div>

          {/* Section 3: Trade License Details */}
          <div className="p-3.5 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>Trade License Details</span>
              </div>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Municipality Operating License
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">LICENSE NUMBER</label>
                <Input 
                  placeholder="e.g. TL-883920-IND" 
                  {...register('licenseNumber')} 
                  className="bg-background font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">LICENSE EXPIRE DATE</label>
                <Input 
                  type="date" 
                  {...register('licenseExpiry')} 
                  className="bg-background font-mono text-xs"
                />
              </div>
            </div>

            {/* Cloudinary License Photo Upload */}
            <CloudinaryPhotoUpload
              label="Trade License Photo / Scan"
              value={licensePhotoValue}
              onChange={(url) => setValue('licensePhoto', url)}
              folder="trade_licenses"
              placeholderText="Upload trade license photo to Cloudinary"
            />
          </div>

          {/* Section 4: Computer Card / Establishment Card Details */}
          <div className="p-3.5 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 border border-purple-500/20 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-400">
                <CreditCard className="h-4 w-4" />
                <span>Computer Card (Establishment Card)</span>
              </div>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20">
                Immigration Ministry ID
              </span>
            </div>

            <div className="space-y-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">COMPUTER CARD NUMBER</label>
                <Input 
                  placeholder="e.g. CC-449102" 
                  {...register('computerCardNumber')} 
                  className="bg-background font-mono text-xs"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <span>Computer Card expiry and compliance status automatically link to the Trade License Expiry Date.</span>
              </div>
            </div>

            {/* Cloudinary Computer Card Photo Upload */}
            <CloudinaryPhotoUpload
              label="Computer Card Photo / Scan"
              value={computerCardPhotoValue}
              onChange={(url) => setValue('computerCardPhoto', url)}
              folder="computer_cards"
              placeholderText="Upload computer card photo to Cloudinary"
            />
          </div>

          {/* Section 5: Contacts & Notes */}
          <div className="p-3.5 bg-muted/20 border rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <User className="h-4 w-4 text-primary" />
              <span>Contact Vectors & Operational Notes</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Phone Number</label>
                <Input placeholder="+974 4411 2233" {...register('phone')} className="bg-background font-mono text-xs" />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Email Address</label>
                <Input type="email" placeholder="contact@company.com" {...register('email')} className="bg-background text-xs" />
                {errors.email && <p className="text-[10px] text-destructive">{errors.email.message}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Notes & Operational Details</label>
              <Input placeholder="Optional descriptions, sponsorship details, or special terms..." {...register('notes')} className="bg-background text-xs" />
            </div>
          </div>

          <DialogFooter className="pt-2 flex flex-col-reverse sm:flex-row gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-11 sm:h-9 text-xs"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full sm:w-auto h-11 sm:h-9 bg-primary text-primary-foreground font-semibold text-xs shadow-xs"
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Company Details' : 'Save Company'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
