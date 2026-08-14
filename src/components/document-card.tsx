'use client';

import { useState } from 'react';
import { Document } from '@/types';
import { formatDate, getDaysRemaining } from '@/lib/utils';
import { FileText, Calendar, Building, ShieldAlert, Trash2, Edit3, Eye, Download } from 'lucide-react';
import { Button } from './ui/button';
import { useDeleteDocument } from '@/hooks/use-documents';
import { DeleteConfirmModal } from './delete-confirm-modal';

interface DocumentCardProps {
  doc: Document;
  onEditClick: (doc: Document) => void;
}

export function DocumentCard({ doc, onEditClick }: DocumentCardProps) {
  const deleteDoc = useDeleteDocument();
  const daysRemaining = getDaysRemaining(doc.expiryDate);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const statusThemes = {
    Active: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    Expired: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 animate-pulse shadow-sm shadow-rose-500/10',
    'Expiring Soon': 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 shadow-sm animate-pulse',
  };

  const statusTheme = statusThemes[doc.status as keyof typeof statusThemes] || statusThemes.Active;

  return (
    <div className="group flex flex-col justify-between p-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 group-hover:bg-primary/20 transition-colors">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm leading-none tracking-tight truncate">{doc.documentType}</h3>
              <p className="text-[10px] text-muted-foreground mt-1 truncate">No: {doc.documentNumber}</p>
            </div>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-wider shrink-0 ${statusTheme}`}>
            {doc.status}
          </span>
        </div>

        <div className="mt-4 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{doc.company ? doc.company.companyName : 'Unassigned Company'}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>Expires: {formatDate(doc.expiryDate)}</span>
          </div>

          {doc.notes && (
            <p className="text-[11px] text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border/40 mt-2 italic">
              &ldquo;{doc.notes}&rdquo;
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t flex items-center justify-between">
        <div className="flex items-center gap-1 text-[11px] font-medium min-w-0">
          <ShieldAlert className={`h-3.5 w-3.5 shrink-0 ${daysRemaining < 0 ? 'text-rose-500' : 'text-amber-500'}`} />
          {daysRemaining < 0 ? (
            <span className="text-rose-600 dark:text-rose-400 font-semibold truncate">Expired {-daysRemaining} days ago</span>
          ) : (
            <span className="text-muted-foreground truncate">{daysRemaining} days remaining</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          {doc.attachment && (
            <>
              <a
                href={doc.attachment}
                target="_blank"
                rel="noopener noreferrer"
                title="View document file"
                className="p-1 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
              >
                <Eye className="h-3.5 w-3.5" />
              </a>
              <a
                href={doc.attachment}
                download
                title="Download document file"
                className="p-1 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
              </a>
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => onEditClick(doc)}
            aria-label="Edit document"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
            onClick={() => setIsDeleteOpen(true)}
            disabled={deleteDoc.isPending}
            aria-label="Delete document"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <DeleteConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Document"
        description={`Are you sure you want to permanently delete the "${doc.documentType}" document (No: ${doc.documentNumber})? This action cannot be undone.`}
        isLoading={deleteDoc.isPending}
        onConfirm={async () => {
          await deleteDoc.mutateAsync(doc.id);
        }}
      />
    </div>
  );
}
