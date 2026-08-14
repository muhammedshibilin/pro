'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function DeleteConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isLoading,
}: DeleteConfirmModalProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (err) {
      console.error('Delete confirmation failed:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription className="text-xs pt-1.5 leading-normal">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2.5 pt-3 flex flex-col-reverse sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="text-xs h-11 sm:h-9 w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
            className="gap-1.5 text-xs h-11 sm:h-9 w-full sm:w-auto font-semibold shadow-xs"
          >
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{isLoading ? 'Deleting...' : 'Delete Permanently'}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
