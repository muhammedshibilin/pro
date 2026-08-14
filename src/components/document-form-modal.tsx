'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateDocument, useUpdateDocument } from '@/hooks/use-documents';
import { useCompanies } from '@/hooks/use-companies';
import { Document } from '@/types';
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
import { useEffect } from 'react';
import { FilePlus } from 'lucide-react';
import { DocumentUpload } from './document-upload';

const documentSchema = z.object({
  companyId: z.string().min(1, 'Please select a company to assign this document'),
  documentType: z.string().min(1, 'Document type is required'),
  documentNumber: z
    .string()
    .trim()
    .min(2, 'Document number must be at least 2 characters')
    .max(80, 'Document number cannot exceed 80 characters'),
  expiryDate: z
    .string()
    .min(1, 'Expiry date is required')
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Please select a valid expiry date',
    }),
  attachment: z.string().optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

interface DocumentFormModalProps {
  document?: Document;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentFormModal({ document: doc, open, onOpenChange }: DocumentFormModalProps) {
  const createDocument = useCreateDocument();
  const updateDocument = useUpdateDocument();
  const { data: companies = [] } = useCompanies();
  const isEdit = !!doc;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      companyId: '',
      documentType: 'Trade License',
      documentNumber: '',
      expiryDate: '',
      attachment: '',
      notes: '',
    },
  });

  const attachmentUrl = watch('attachment');

  useEffect(() => {
    if (open) {
      if (doc) {
        const formattedDate = doc.expiryDate ? new Date(doc.expiryDate).toISOString().split('T')[0] : '';
        reset({
          companyId: doc.companyId,
          documentType: doc.documentType,
          documentNumber: doc.documentNumber,
          expiryDate: formattedDate,
          attachment: doc.attachment || '',
          notes: doc.notes || '',
        });
      } else {
        reset({
          companyId: '',
          documentType: 'Trade License',
          documentNumber: '',
          expiryDate: '',
          attachment: '',
          notes: '',
        });
      }
    }
  }, [doc, open, reset]);

  const onSubmit = async (data: DocumentFormValues) => {
    try {
      const payload = {
        ...data,
        attachment: data.attachment || null,
        notes: data.notes || null,
      };

      if (isEdit && doc) {
        await updateDocument.mutateAsync({ id: doc.id, data: payload });
      } else {
        await createDocument.mutateAsync(payload);
      }
      onOpenChange(false);
      reset();
    } catch (err) {
      console.error(err);
    }
  };

  const documentTypes = [
    { value: 'Commercial Registration', label: 'Commercial Registration (CR)' },
    { value: 'Trade License', label: 'Trade License' },
    { value: 'Computer Card', label: 'Computer Card' },
    { value: 'Other', label: 'Other' },
  ];

  const companyOptions = [
    { value: '', label: 'Select Company' },
    ...companies.map((c) => ({ value: c.id, label: c.companyName })),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FilePlus className="h-5 w-5 text-primary" />
            {isEdit ? 'Edit Document Details' : 'Add Company Document'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Assign to Company</label>
            <Select options={companyOptions} {...register('companyId')} />
            {errors.companyId && <p className="text-xs text-destructive">{errors.companyId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Document Type</label>
              <Select options={documentTypes} {...register('documentType')} />
              {errors.documentType && <p className="text-xs text-destructive">{errors.documentType.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Document Number</label>
              <Input placeholder="TL-CY-887766" {...register('documentNumber')} />
              {errors.documentNumber && <p className="text-xs text-destructive">{errors.documentNumber.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Expiry Date</label>
            <Input type="date" {...register('expiryDate')} />
            {errors.expiryDate && <p className="text-xs text-destructive">{errors.expiryDate.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Document Attachment</label>
            <DocumentUpload
              value={attachmentUrl || ''}
              onChange={(val) => setValue('attachment', val, { shouldValidate: true })}
            />
            {errors.attachment && <p className="text-xs text-destructive">{errors.attachment.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Notes</label>
            <Input placeholder="Optional annotations..." {...register('notes')} />
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
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Document' : 'Save Document'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
