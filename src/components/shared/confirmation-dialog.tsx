'use client';

import React from 'react';
import { DeleteConfirmModal } from '@/components/delete-confirm-modal';

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isLoading = false,
}: ConfirmationDialogProps) {
  return (
    <DeleteConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}
