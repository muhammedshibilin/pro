'use client';

import React, { useState } from 'react';
import { Company, Document } from '@/types';
import { ArrowLeft, Edit2, Trash2, Phone, Mail, FileText, Plus, FileCheck, ShieldCheck, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate, getDaysRemaining } from '@/lib/utils';
import { calculateCompanyDocumentStatus, COMPANY_DOC_STATUS_META } from '@/lib/status-calculator';
import { cn } from '@/lib/utils';
import MobileCompanyForm from './MobileCompanyForm';
import { DocumentFormModal } from '@/components/document-form-modal';
import { DeleteConfirmModal } from '@/components/delete-confirm-modal';
import { useDeleteCompany } from '@/hooks/use-companies';
import { useDocuments } from '@/hooks/use-documents';

interface MobileCompanyDetailProps {
  company: Company;
  onBack: () => void;
}

export default function MobileCompanyDetail({ company, onBack }: MobileCompanyDetailProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDocFormOpen, setIsDocFormOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | undefined>();
  const [viewingPhoto, setViewingPhoto] = useState<{ url: string; title: string } | null>(null);
  
  const deleteMutation = useDeleteCompany();
  const { data: documents = [] } = useDocuments({ scope: company.id });

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(company.id);
    setIsDeleteOpen(false);
    onBack();
  };

  const handleEditDoc = (doc: Document) => {
    setSelectedDoc(doc);
    setIsDocFormOpen(true);
  };

  const handleAddDoc = () => {
    setSelectedDoc(undefined);
    setIsDocFormOpen(true);
  };

  const renderExpiryBadge = (dateString?: string | null) => {
    if (!dateString) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono text-muted-foreground bg-muted/60 border border-border">
          No Expiry Date
        </span>
      );
    }
    const status = calculateCompanyDocumentStatus(dateString);
    const meta = COMPANY_DOC_STATUS_META[status];
    const days = getDaysRemaining(dateString);

    let detail = `Valid until ${formatDate(dateString)}`;
    if (status === 'WARNING') detail = `Warning (${days}d left)`;
    else if (status === 'DANGER') detail = days < 0 ? `Expired (${Math.abs(days)}d ago)` : `Danger (${days}d left)`;

    return (
      <span className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-semibold border",
        meta.badgeBg,
        meta.badgeText,
        meta.badgeBorder
      )}>
        {detail}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col w-full max-w-full overflow-hidden animate-in slide-in-from-right">
      {/* Top App Bar */}
      <header className="flex items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 border-b bg-card shadow-xs shrink-0">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-10 w-10 shrink-0">
          <ArrowLeft className="w-5 h-5" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-base sm:text-lg font-bold text-foreground truncate px-2">Company Details</h1>
        <div className="w-10 shrink-0" />
      </header>

      {/* Main Content Scroll View */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-[max(7rem,calc(env(safe-area-inset-bottom)+6rem))]">
        {/* Header Summary Card */}
        <div className="bg-card rounded-2xl border p-5 flex flex-col items-center text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/10 text-primary flex items-center justify-center font-bold text-2xl mb-3 border border-primary/20 shrink-0">
            {company.companyName ? company.companyName.charAt(0).toUpperCase() : 'C'}
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-foreground break-words w-full leading-snug">
            {company.companyName}
          </h2>
          {company.ownerName && (
            <p className="text-xs text-muted-foreground mt-1.5 break-words w-full">
              Authorized Officer: <strong className="text-foreground font-medium">{company.ownerName}</strong>
            </p>
          )}
          <span className="mt-3 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            Status: {company.status}
          </span>
        </div>

        {/* Commercial Registration (CR) Details */}
        <div className="bg-card rounded-2xl border border-blue-500/20 p-4 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/40">
            <h3 className="font-bold text-sm flex items-center gap-2 text-blue-600 dark:text-blue-400 min-w-0">
              <FileCheck className="w-4 h-4 shrink-0" />
              <span>Commercial Registration (CR)</span>
            </h3>
            {company.crPhoto && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 text-primary border-primary/20 hover:bg-primary/10"
                onClick={() => setViewingPhoto({ url: company.crPhoto!, title: `${company.companyName} — CR Certificate` })}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Photo</span>
              </Button>
            )}
          </div>
          
          <div className="space-y-2.5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">CR Number</span>
              <strong className="font-mono text-sm font-bold text-foreground break-all">{company.crNumber || '—'}</strong>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 pt-1.5 border-t border-border/40">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">CR Expiry Status</span>
              <div>{renderExpiryBadge(company.crExpiry)}</div>
            </div>
          </div>
        </div>

        {/* Trade License Details */}
        <div className="bg-card rounded-2xl border border-emerald-500/20 p-4 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/40">
            <h3 className="font-bold text-sm flex items-center gap-2 text-emerald-600 dark:text-emerald-400 min-w-0">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Trade License Details</span>
            </h3>
            {company.licensePhoto && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 text-primary border-primary/20 hover:bg-primary/10"
                onClick={() => setViewingPhoto({ url: company.licensePhoto!, title: `${company.companyName} — Trade License` })}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Photo</span>
              </Button>
            )}
          </div>
          
          <div className="space-y-2.5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">License Number</span>
              <strong className="font-mono text-sm font-bold text-foreground break-all">{company.licenseNumber || '—'}</strong>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 pt-1.5 border-t border-border/40">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">License Expiry Status</span>
              <div>{renderExpiryBadge(company.licenseExpiry)}</div>
            </div>
          </div>
        </div>

        {/* Computer Card (Establishment Card) Details */}
        <div className="bg-card rounded-2xl border border-purple-500/20 p-4 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/40">
            <h3 className="font-bold text-sm flex items-center gap-2 text-purple-600 dark:text-purple-400 min-w-0">
              <FileText className="w-4 h-4 shrink-0" />
              <span>Computer Card (Establishment Card)</span>
            </h3>
            {company.computerCardPhoto && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 text-primary border-primary/20 hover:bg-primary/10"
                onClick={() => setViewingPhoto({ url: company.computerCardPhoto!, title: `${company.companyName} — Computer Card` })}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Photo</span>
              </Button>
            )}
          </div>
          
          <div className="space-y-2.5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Computer Card Number</span>
              <strong className="font-mono text-sm font-bold text-foreground break-all">{company.computerCardNumber || '—'}</strong>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pt-1.5 border-t border-border/40">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Card Expiry</span>
              <span className="font-medium text-foreground">
                {company.licenseExpiry ? `Same as License (${formatDate(company.licenseExpiry)})` : 'Inherits Trade License Expiry'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 pt-1.5 border-t border-border/40">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Compliance Status</span>
              <div>{renderExpiryBadge(company.licenseExpiry)}</div>
            </div>
          </div>
        </div>

        {/* Contact Vectors */}
        <div className="bg-card rounded-2xl border p-4 shadow-xs space-y-3">
          <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
            <Phone className="w-4 h-4 text-primary shrink-0" />
            <span>Contact Information</span>
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="font-mono text-foreground break-all">{company.phone || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-foreground break-all">{company.email || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Company Documents Section */}
        <div className="bg-card rounded-2xl border p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2 pb-1 border-b border-border/40">
            <h3 className="font-bold text-sm flex items-center gap-2 text-foreground min-w-0">
              <FileText className="w-4 h-4 text-primary shrink-0" />
              <span>Company Documents</span>
            </h3>
            <Button size="sm" variant="outline" onClick={handleAddDoc} className="h-8 px-2.5 text-xs gap-1">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Document</span>
            </Button>
          </div>
          
          <div className="space-y-2">
            {documents.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-5">No additional documents registered</p>
            ) : (
              documents.map(doc => (
                <div 
                  key={doc.id} 
                  onClick={() => handleEditDoc(doc)}
                  className="flex flex-wrap items-center justify-between gap-2 p-3 border rounded-xl bg-muted/20 active:scale-[0.98] transition-transform text-xs cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground break-words">{doc.documentType}</p>
                    <p className="font-mono text-[11px] text-muted-foreground break-all">{doc.documentNumber}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-[11px] text-muted-foreground">Exp: {formatDate(doc.expiryDate)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Bottom Sticky Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-card/95 backdrop-blur-lg border-t border-border/80 flex gap-3 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-xl z-40">
        <Button 
          variant="outline" 
          className="flex-1 h-12 text-sm font-semibold text-rose-600 hover:bg-rose-500/10 border-rose-500/30" 
          onClick={() => setIsDeleteOpen(true)}
        >
          <Trash2 className="w-4 h-4 mr-2 shrink-0" />
          <span>Delete</span>
        </Button>
        <Button 
          className="flex-1 h-12 text-sm bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20" 
          onClick={() => setIsEditOpen(true)}
        >
          <Edit2 className="w-4 h-4 mr-2 shrink-0" />
          <span>Edit Details</span>
        </Button>
      </footer>

      {/* Full Photo Preview Modal */}
      {viewingPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setViewingPhoto(null)}
        >
          <div className="relative w-full max-w-lg max-h-[85vh] bg-card rounded-2xl p-4 border shadow-2xl space-y-3 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-xs truncate text-foreground pr-2">{viewingPhoto.title}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewingPhoto(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={viewingPhoto.url} alt={viewingPhoto.title} className="max-h-[60vh] w-auto mx-auto object-contain rounded-lg" />
          </div>
        </div>
      )}

      {isEditOpen && (
        <MobileCompanyForm company={company} onBack={() => setIsEditOpen(false)} />
      )}
      <DocumentFormModal document={selectedDoc} open={isDocFormOpen} onOpenChange={setIsDocFormOpen} />
      <DeleteConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Corporate Account"
        description={`Are you sure you want to delete ${company.companyName}? All associated employees and documents will be permanently removed.`}
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
