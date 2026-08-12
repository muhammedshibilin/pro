'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateEmployee, useUpdateEmployee } from '@/hooks/use-employees';
import { useCompanies } from '@/hooks/use-companies';
import { Employee } from '@/types';
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
import { UserPlus, UserCheck, Phone, Globe, CreditCard, BookOpen } from 'lucide-react';
import { CloudinaryPhotoUpload } from './cloudinary-photo-upload';

const employeeSchema = z.object({
  employeeName: z.string().min(2, 'Full name is required'),
  companyId: z.string().min(1, 'Sponsor company is required'),
  phone: z.string().optional().or(z.literal('')),
  nativeRelativePhone: z.string().optional().or(z.literal('')),
  qidNumber: z.string().min(5, 'QID number must be at least 5 digits'),
  qidExpiry: z.string().min(1, 'QID expiry date is required'),
  qidPhoto: z.string().optional().or(z.literal('')),
  passportNumber: z.string().optional().or(z.literal('')),
  passportExpiry: z.string().optional().or(z.literal('')),
  passportPhoto: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  status: z.string().min(1, 'Status is required'),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormModalProps {
  employee?: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployeeFormModal({ employee, open, onOpenChange }: EmployeeFormModalProps) {
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const { data: companies = [] } = useCompanies();
  const isEdit = !!employee;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employeeName: '',
      companyId: '',
      phone: '',
      nativeRelativePhone: '',
      qidNumber: '',
      qidExpiry: '',
      qidPhoto: '',
      passportNumber: '',
      passportExpiry: '',
      passportPhoto: '',
      notes: '',
      status: 'Active',
    },
  });

  const qidPhotoValue = watch('qidPhoto');
  const passportPhotoValue = watch('passportPhoto');

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
      if (employee) {
        reset({
          employeeName: employee.employeeName || '',
          companyId: employee.companyId || '',
          phone: employee.phone || '',
          nativeRelativePhone: employee.nativeRelativePhone || '',
          qidNumber: employee.qidNumber || '',
          qidExpiry: toDateInput(employee.qidExpiry),
          qidPhoto: employee.qidPhoto || '',
          passportNumber: employee.passportNumber || '',
          passportExpiry: toDateInput(employee.passportExpiry),
          passportPhoto: employee.passportPhoto || '',
          notes: employee.notes || '',
          status: employee.status || 'Active',
        });
      } else {
        reset({
          employeeName: '',
          companyId: companies[0]?.id || '',
          phone: '',
          nativeRelativePhone: '',
          qidNumber: '',
          qidExpiry: '',
          qidPhoto: '',
          passportNumber: '',
          passportExpiry: '',
          passportPhoto: '',
          notes: '',
          status: 'Active',
        });
      }
    }
  }, [employee, open, reset, companies]);

  const onSubmit = async (data: EmployeeFormValues) => {
    try {
      if (isEdit && employee) {
        await updateEmployee.mutateAsync({ id: employee.id, data });
      } else {
        await createEmployee.mutateAsync(data);
      }
      onOpenChange(false);
      reset();
    } catch (err) {
      console.error('Error saving employee:', err);
    }
  };

  const statusOptions = [
    { value: 'Active', label: 'Active (Compliant)' },
    { value: 'On Leave', label: 'On Leave' },
    { value: 'Terminated', label: 'Terminated' },
  ];

  const companyOptions = [
    { value: '', label: 'Select Sponsor Entity' },
    ...companies.map((c) => ({ value: c.id, label: c.companyName })),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <UserPlus className="h-5 w-5 text-primary" />
            {isEdit ? 'Edit Personnel Profile & Documents' : 'Register Personnel Profile'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Section 1: Basic Information */}
          <div className="p-3.5 bg-muted/20 border rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <UserCheck className="h-4 w-4 text-primary" />
              <span>Primary Personnel Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">PERSONNEL FULL NAME *</label>
                <Input placeholder="Sarah Connor" {...register('employeeName')} className="bg-background text-xs font-semibold" />
                {errors.employeeName && <p className="text-[10px] text-destructive">{errors.employeeName.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">SPONSORING COMPANY *</label>
                <Select options={companyOptions} {...register('companyId')} className="bg-background text-xs" />
                {errors.companyId && <p className="text-[10px] text-destructive">{errors.companyId.message}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">EMPLOYMENT STATUS</label>
              <Select options={statusOptions} {...register('status')} className="bg-background text-xs" />
            </div>
          </div>

          {/* Section 2: Contact Numbers */}
          <div className="p-3.5 bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
                <Phone className="h-4 w-4" />
                <span>Contact Vectors</span>
              </div>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                Direct & Emergency
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-amber-600" />
                  CONTACT NUMBER (LOCAL / QATAR)
                </label>
                <Input
                  type="tel"
                  placeholder="+974 5511 2233"
                  {...register('phone')}
                  className="bg-background font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Globe className="h-3 w-3 text-amber-600" />
                  RELATIVE NUMBER (NATIVE COUNTRY)
                </label>
                <Input
                  type="tel"
                  placeholder="+91 98470 12345 (Father / Spouse)"
                  {...register('nativeRelativePhone')}
                  className="bg-background font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Qatar ID (QID) Details */}
          <div className="p-3.5 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border border-blue-500/20 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400">
                <CreditCard className="h-4 w-4" />
                <span>Qatar ID (QID) Details</span>
              </div>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                Mandatory National ID
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">QATAR ID (QID) NUMBER *</label>
                <Input placeholder="28567891234" {...register('qidNumber')} className="bg-background font-mono text-xs" />
                {errors.qidNumber && <p className="text-[10px] text-destructive">{errors.qidNumber.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">QID EXPIRE DATE *</label>
                <Input type="date" {...register('qidExpiry')} className="bg-background font-mono text-xs" />
                {errors.qidExpiry && <p className="text-[10px] text-destructive">{errors.qidExpiry.message}</p>}
              </div>
            </div>

            <CloudinaryPhotoUpload
              label="Qatar ID (QID) Document / Photo"
              value={qidPhotoValue}
              onChange={(url) => setValue('qidPhoto', url)}
              folder="employee_qids"
              placeholderText="Upload Qatar ID scan or photo to Cloudinary"
            />
          </div>

          {/* Section 4: Passport Details */}
          <div className="p-3.5 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <BookOpen className="h-4 w-4" />
                <span>Passport Details</span>
              </div>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                International Travel Document
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">PASSPORT NUMBER</label>
                <Input placeholder="USA-99881122" {...register('passportNumber')} className="bg-background font-mono text-xs" />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">PASSPORT EXPIRE DATE</label>
                <Input type="date" {...register('passportExpiry')} className="bg-background font-mono text-xs" />
              </div>
            </div>

            <CloudinaryPhotoUpload
              label="Passport Document / Photo"
              value={passportPhotoValue}
              onChange={(url) => setValue('passportPhoto', url)}
              folder="employee_passports"
              placeholderText="Upload Passport scan or photo to Cloudinary"
            />
          </div>

          {/* Section 5: Notes */}
          <div className="p-3 bg-muted/20 border rounded-xl space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground">Operational Notes / Designation</label>
            <Input placeholder="Designation, visa profession, native city..." {...register('notes')} className="bg-background text-xs" />
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
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Personnel Details' : 'Save Personnel Record'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
