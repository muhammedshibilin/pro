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
import { UserPlus, UserCheck, Phone, Globe, CreditCard, BookOpen, Building2, Briefcase } from 'lucide-react';
import { CloudinaryPhotoUpload } from './cloudinary-photo-upload';
import { FormSection } from '@/components/shared';

const employeeSchema = z.object({
  employeeName: z
    .string()
    .trim()
    .min(2, 'Employee full name is required (min 2 characters)')
    .max(100, 'Name cannot exceed 100 characters'),
  role: z.enum(['EMPLOYEE', 'OWNER']),
  companyId: z.string().min(1, 'Please select a registered sponsoring company'),
  currentWorkingCompanyId: z.string().optional().or(z.literal('')),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  nativeRelativePhone: z.string().trim().max(80).optional().or(z.literal('')),
  qidNumber: z
    .string()
    .trim()
    .min(5, 'Qatar ID (QID) must be at least 5 digits')
    .max(30, 'QID cannot exceed 30 characters'),
  qidExpiry: z.string().min(1, 'QID expiry date is required').refine((val) => !isNaN(Date.parse(val)), {
    message: 'Please provide a valid QID expiry date',
  }),
  qidPhoto: z.string().optional().or(z.literal('')),
  passportNumber: z.string().trim().max(40).optional().or(z.literal('')),
  passportExpiry: z.string().optional().or(z.literal('')),
  passportPhoto: z.string().optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
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
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employeeName: '',
      role: 'EMPLOYEE',
      companyId: '',
      currentWorkingCompanyId: '',
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
      setServerError(null);
      if (employee) {
        reset({
          employeeName: employee.employeeName || '',
          role: (employee.role?.toUpperCase() === 'OWNER' ? 'OWNER' : 'EMPLOYEE'),
          companyId: employee.companyId || '',
          currentWorkingCompanyId: employee.currentWorkingCompanyId || '',
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
          role: 'EMPLOYEE',
          companyId: companies[0]?.id || '',
          currentWorkingCompanyId: '',
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
    setServerError(null);
    try {
      const payload = {
        ...data,
        currentWorkingCompanyId: data.currentWorkingCompanyId || null,
      };

      if (isEdit && employee) {
        await updateEmployee.mutateAsync({ id: employee.id, data: payload });
      } else {
        await createEmployee.mutateAsync(payload as unknown as Parameters<typeof createEmployee.mutateAsync>[0]);
      }
      onOpenChange(false);
      reset();
    } catch (err: unknown) {
      console.error('Error saving employee:', err);
      const apiErr = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = apiErr?.response?.data?.message || apiErr?.message || 'Failed to save employee record';
      setServerError(msg);
      if (msg.toLowerCase().includes('qid')) {
        setError('qidNumber', { type: 'manual', message: msg });
      } else if (msg.toLowerCase().includes('passport')) {
        setError('passportNumber', { type: 'manual', message: msg });
      }
    }
  };

  const roleOptions = [
    { value: 'EMPLOYEE', label: 'Employee' },
    { value: 'OWNER', label: 'Owner / Executive' },
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active (Compliant)' },
    { value: 'On Leave', label: 'On Leave' },
    { value: 'Terminated', label: 'Terminated' },
  ];

  const registeredCompanyOptions = [
    { value: '', label: 'Select Registered Company *' },
    ...companies.map((c) => ({ value: c.id, label: c.companyName })),
  ];

  const workingCompanyOptions = [
    { value: '', label: 'Same as Registered Company (Default)' },
    ...companies.map((c) => ({ value: c.id, label: c.companyName })),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <UserPlus className="h-5 w-5 text-primary" />
            {isEdit ? 'Edit Employee Profile & Documents' : 'Register New Employee'}
          </DialogTitle>
        </DialogHeader>

        {serverError && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Section 1: Basic Information & Role */}
          <div className="p-3.5 bg-muted/20 border rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <UserCheck className="h-4 w-4 text-primary" />
              <span>Primary Profile & Role</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">EMPLOYEE FULL NAME *</label>
                <Input placeholder="e.g. Ahmed Ali" {...register('employeeName')} className="bg-background text-xs font-semibold" />
                {errors.employeeName && <p className="text-[10px] text-destructive">{errors.employeeName.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">ROLE *</label>
                <Select options={roleOptions} {...register('role')} className="bg-background text-xs font-bold" />
                {errors.role && <p className="text-[10px] text-destructive">{errors.role.message}</p>}
              </div>
            </div>

            {/* Sponsoring / Registered Company & Current Working Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border/40">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  <span>REGISTERED COMPANY (SPONSOR) *</span>
                </label>
                <Select options={registeredCompanyOptions} {...register('companyId')} className="bg-background text-xs" />
                {errors.companyId && <p className="text-[10px] text-destructive">{errors.companyId.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                  <span>CURRENT WORKING COMPANY (OPTIONAL)</span>
                </label>
                <Select options={workingCompanyOptions} {...register('currentWorkingCompanyId')} className="bg-background text-xs" />
                <p className="text-[10px] text-muted-foreground">Leave default if working at registered sponsor</p>
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
                  placeholder="+91 98470 12345 (Father / Relative)"
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
                <Input placeholder="N12345678" {...register('passportNumber')} className="bg-background font-mono text-xs" />
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
            <Input placeholder="Designation, visa profession, assignment notes..." {...register('notes')} className="bg-background text-xs" />
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
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Employee Details' : 'Save Employee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
