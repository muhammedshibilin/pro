'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateCompany, useUpdateCompany } from '@/hooks/use-companies';
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
import { Building2, FileCheck, ShieldCheck, User } from 'lucide-react';
import { CloudinaryPhotoUpload } from './cloudinary-photo-upload';

const companySchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, 'Company name must be at least 2 characters')
    .max(120, 'Company name cannot exceed 120 characters'),
  crNumber: z.string().trim().max(60).optional().or(z.literal('')),
  crExpiry: z.string().optional().or(z.literal('')),
  crPhoto: z.string().optional().or(z.literal('')),
  licenseNumber: z.string().trim().max(60).optional().or(z.literal('')),
  licenseExpiry: z.string().optional().or(z.literal('')),
  licensePhoto: z.string().optional().or(z.literal('')),
  ownerName: z.string().trim().max(100).optional().or(z.literal('')),
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
      crNumber: '',
      crExpiry: '',
      crPhoto: '',
      licenseNumber: '',
      licenseExpiry: '',
      licensePhoto: '',
      ownerName: '',
      phone: '',
      email: '',
      notes: '',
      status: 'Active',
    },
  });

  const crPhotoValue = watch('crPhoto');
  const licensePhotoValue = watch('licensePhoto');

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
      if (company) {
        reset({
          companyName: company.companyName || '',
          crNumber: company.crNumber || '',
          crExpiry: toDateInput(company.crExpiry),
          crPhoto: company.crPhoto || '',
          licenseNumber: company.licenseNumber || '',
          licenseExpiry: toDateInput(company.licenseExpiry),
          licensePhoto: company.licensePhoto || '',
          ownerName: company.ownerName || '',
          phone: company.phone || '',
          email: company.email || '',
          notes: company.notes || '',
          status: company.status || 'Active',
        });
      } else {
        reset({
          companyName: '',
          crNumber: '',
          crExpiry: '',
          crPhoto: '',
          licenseNumber: '',
          licenseExpiry: '',
          licensePhoto: '',
          ownerName: '',
          phone: '',
          email: '',
          notes: '',
          status: 'Active',
        });
      }
    }
  }, [company, open, reset]);

  const onSubmit = async (data: CompanyFormValues) => {
    try {
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
                  placeholder="Cyberdyne Systems Corporation" 
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

          {/* Section 4: Authorized Officer & Contacts */}
          <div className="p-3.5 bg-muted/20 border rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <User className="h-4 w-4 text-primary" />
              <span>Authorized Officer & Contact Vectors</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Authorized Person / Owner</label>
                <Input placeholder="Miles Dyson" {...register('ownerName')} className="bg-background text-xs" />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Phone Number</label>
                <Input placeholder="+974 4411 2233" {...register('phone')} className="bg-background font-mono text-xs" />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Email Address</label>
                <Input type="email" placeholder="contact@cyberdyne.com" {...register('email')} className="bg-background text-xs" />
                {errors.email && <p className="text-[10px] text-destructive">{errors.email.message}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Notes & Operational Details</label>
              <Input placeholder="Optional descriptions, sponsorship details, or special terms..." {...register('notes')} className="bg-background text-xs" />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground font-semibold">
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Company Details' : 'Save Company Details'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
