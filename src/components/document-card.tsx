'use client';

import { useState } from 'react';
import { Document } from '@/types';
import { formatDate, getDaysRemaining } from '@/lib/utils';
import { calculateCompanyDocumentStatus, COMPANY_DOC_STATUS_META } from '@/lib/status-calculator';
import { FileText, Calendar, Building, ShieldAlert, Trash2, Edit3, Eye, Download } from 'lucide-react';
import { Button } from './ui/button';
import { useDeleteDocument } from '@/hooks/use-documents';
import { DeleteConfirmModal } from './delete-confirm-modal';
import { cn } from '@/lib/utils';

interface DocumentCardProps {
  doc: Document;
  onEditClick: (doc: Document) => void;
}

export function DocumentCard({ doc, onEditClick }: DocumentCardProps) {
  const deleteDoc = useDeleteDocument();
  const daysRemaining = getDaysRemaining(doc.expiryDate);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const status = calculateCompanyDocumentStatus(doc.expiryDate);
  const meta = COMPANY_DOC_STATUS_META[status];

  return (
    <div className="group flex flex-col justify-between p-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div>
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 group-hover:bg-primary/20 transition-colors mt-0.5">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm leading-snug tracking-tight text-foreground break-words">{doc.documentType}</h3>
              <p className="text-[11px] font-mono text-muted-foreground mt-0.5 break-all">No: {doc.documentNumber}</p>
            </div>
          </div>
          <span className={cn("text-[10px] px-2.5 py-0.5 rounded-full border font-mono font-semibold whitespace-nowrap shrink-0", meta.badgeBg, meta.badgeText, meta.badgeBorder)}>
            {meta.shortLabel}
          </span>
        </div>

        <div className="mt-3.5 space-y-2 text-xs">
          <div className="flex items-start gap-2 text-muted-foreground">
            <Building className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span className="break-words font-medium text-foreground">{doc.company ? doc.company.companyName : 'Unassigned Company'}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span className="font-mono text-[11px]">Expires: {formatDate(doc.expiryDate)}</span>
          </div>

          {doc.notes && (
            <p className="text-[11px] text-muted-foreground bg-muted/30 p-2.5 rounded-xl border border-border/40 mt-2 italic break-words">
              &ldquo;{doc.notes}&rdquo;
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-medium min-w-0">
          <ShieldAlert className={`h-3.5 w-3.5 shrink-0 ${daysRemaining < 0 ? 'text-rose-500' : 'text-amber-500'}`} />
          {daysRemaining < 0 ? (
            <span className="text-rose-600 dark:text-rose-400 font-semibold font-mono text-[11px]">Expired {-daysRemaining}d ago</span>
          ) : (
            <span className="text-muted-foreground font-mono text-[11px]">{daysRemaining} days remaining</span>
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
