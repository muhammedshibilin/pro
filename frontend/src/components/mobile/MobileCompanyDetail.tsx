'use client';

import React, { useState } from 'react';
import { Company, Document } from '@/types';
import { ArrowLeft, Edit2, Trash2, Phone, Mail, FileText, Plus, FileCheck, ShieldCheck, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate, getDaysRemaining } from '@/lib/utils';
import { CompanyFormModal } from '@/components/company-form-modal';
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

  const renderExpiryPill = (dateString?: string | null) => {
    if (!dateString) return <span className="text-muted-foreground italic text-xs">No Expiry Date</span>;
    const days = getDaysRemaining(dateString);
    if (days < 0) {
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
          Expired ({Math.abs(days)}d ago)
        </span>
      );
    }
    if (days <= 30) {
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
          {days} days remaining
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
        Valid until {formatDate(dateString)}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in slide-in-from-right">
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-lg font-bold text-foreground">Company Entity</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {/* Header Card */}
        <div className="bg-card rounded-2xl border p-6 flex flex-col items-center text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/10 text-primary flex items-center justify-center font-bold text-2xl mb-3 border border-primary/20">
            {company.companyName.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-extrabold text-foreground">{company.companyName}</h2>
          {company.ownerName && <p className="text-xs text-muted-foreground mt-1">Authorized Person: {company.ownerName}</p>}
          <span className="mt-3 px-3 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            {company.status}
          </span>
        </div>

        {/* Commercial Registration (CR) Details */}
        <div className="bg-card rounded-2xl border border-blue-500/20 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <FileCheck className="w-4 h-4" /> Commercial Registration (CR)
            </h3>
            {company.crPhoto && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1 text-primary"
                onClick={() => setViewingPhoto({ url: company.crPhoto!, title: `${company.companyName} — CR Certificate` })}
              >
                <Eye className="w-3.5 h-3.5" /> View Photo
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[10px]">CR NUMBER</span>
              <strong className="font-mono text-sm">{company.crNumber || '—'}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">STATUS</span>
              {renderExpiryPill(company.crExpiry)}
            </div>
          </div>
        </div>

        {/* Trade License Details */}
        <div className="bg-card rounded-2xl border border-emerald-500/20 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> Trade License Details
            </h3>
            {company.licensePhoto && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1 text-primary"
                onClick={() => setViewingPhoto({ url: company.licensePhoto!, title: `${company.companyName} — Trade License` })}
              >
                <Eye className="w-3.5 h-3.5" /> View Photo
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[10px]">LICENSE NUMBER</span>
              <strong className="font-mono text-sm">{company.licenseNumber || '—'}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">STATUS</span>
              {renderExpiryPill(company.licenseExpiry)}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-card rounded-2xl border p-4 shadow-xs space-y-3">
          <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">Contact Vectors</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono">{company.phone || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{company.email || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-card rounded-2xl border p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
              <FileText className="w-4 h-4 text-primary" /> Company Documents
            </h3>
            <Button size="sm" variant="ghost" onClick={handleAddDoc} className="h-8 w-8 p-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {documents.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No additional documents registered</p>
            ) : (
              documents.map(doc => (
                <div 
                  key={doc.id} 
                  onClick={() => handleEditDoc(doc)}
                  className="flex items-center justify-between p-3 border rounded-xl active:scale-[0.98] transition-transform text-xs"
                >
                  <div>
                    <p className="font-semibold text-foreground">{doc.documentType}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{doc.documentNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[11px] text-muted-foreground">Exp: {formatDate(doc.expiryDate)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t flex gap-3 pb-[env(safe-area-inset-bottom,16px)]">
        <Button variant="outline" className="flex-1 h-12 text-rose-600 hover:bg-rose-500/10" onClick={() => setIsDeleteOpen(true)}>
          <Trash2 className="w-5 h-5 mr-2" /> Delete
        </Button>
        <Button className="flex-1 h-12 bg-primary text-primary-foreground font-bold" onClick={() => setIsEditOpen(true)}>
          <Edit2 className="w-5 h-5 mr-2" /> Edit Details
        </Button>
      </div>

      {/* Full Photo Preview Modal */}
      {viewingPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setViewingPhoto(null)}
        >
          <div className="relative max-w-lg max-h-[85vh] bg-card rounded-2xl p-3 border shadow-2xl space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-xs truncate text-foreground">{viewingPhoto.title}</span>
              <Button variant="ghost" size="sm" onClick={() => setViewingPhoto(null)}>Close</Button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={viewingPhoto.url} alt={viewingPhoto.title} className="max-h-[60vh] mx-auto object-contain rounded-lg" />
          </div>
        </div>
      )}

      <CompanyFormModal company={company} open={isEditOpen} onOpenChange={setIsEditOpen} />
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
