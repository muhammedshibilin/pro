'use client';

import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, X, Image as ImageIcon, CheckCircle2, AlertCircle, Cloud, Eye } from 'lucide-react';
import { Button } from './ui/button';

interface CloudinaryPhotoUploadProps {
  label: string;
  value?: string | null;
  onChange: (url: string) => void;
  folder?: string;
  placeholderText?: string;
}

export function CloudinaryPhotoUpload({
  label,
  value,
  onChange,
  folder = 'company_documents',
  placeholderText = 'Upload document photo or scan',
}: CloudinaryPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isCloudinary, setIsCloudinary] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    // 1. Validation
    const maxSize = 15 * 1024 * 1024; // 15MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];

    if (file.size > maxSize) {
      setError('File exceeds 15 MB limit.');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setError('Unsupported file type. Please upload a JPEG, PNG, WebP, or PDF.');
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const response = await axios.post('/api/uploads/cloudinary', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percent);
          }
        },
      });

      const uploadedUrl = response.data.url;
      setIsCloudinary(response.data.provider === 'cloudinary');
      onChange(uploadedUrl);
    } catch (err: unknown) {
      console.error('Cloudinary photo upload error:', err);
      let errMsg = 'Photo upload failed. Please try again.';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errMsg = err.response.data.message;
      }
      setError(errMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleClear = () => {
    onChange('');
    setError(null);
    setProgress(0);
  };

  const isImage = (url: string) => {
    return !url.endsWith('.pdf') && (/\.(jpg|jpeg|png|webp)($|\?)/i.test(url) || url.includes('cloudinary') || url.includes('unsplash'));
  };

  return (
    <div className="space-y-1.5 text-xs">
      <div className="flex items-center justify-between">
        <label className="font-semibold text-foreground flex items-center gap-1.5">
          <ImageIcon className="h-3.5 w-3.5 text-primary" />
          {label}
        </label>
        {value && (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Attached
          </span>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        disabled={uploading}
      />

      {/* Uploading progress bar */}
      {uploading && (
        <div className="p-3 border rounded-xl bg-muted/30 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-muted-foreground animate-pulse flex items-center gap-1.5">
              <Cloud className="h-3.5 w-3.5 text-primary animate-bounce" />
              Uploading to Cloudinary...
            </span>
            <span className="font-mono font-bold text-foreground">{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="p-2.5 border border-destructive/20 rounded-xl bg-destructive/5 text-destructive flex items-center gap-2 text-[11px]">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Populated Photo Preview */}
      {value && !uploading ? (
        <div className="p-2.5 border rounded-xl bg-card shadow-xs flex items-center justify-between gap-3 group hover:border-primary/40 transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            {isImage(value) ? (
              <div 
                onClick={() => setPreviewModalOpen(true)}
                className="relative h-11 w-11 rounded-lg border overflow-hidden shrink-0 bg-muted cursor-pointer group-hover:ring-2 ring-primary/40 transition-all"
                title="Click to zoom preview"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value}
                  alt={label}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Eye className="h-3.5 w-3.5 text-white" />
                </div>
              </div>
            ) : (
              <div className="h-11 w-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <ImageIcon className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground text-xs truncate">Document Photo</span>
                {(value.includes('cloudinary') || isCloudinary) && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                    <Cloud className="h-2.5 w-2.5" />
                    Cloudinary
                  </span>
                )}
              </div>
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-primary hover:underline font-mono truncate block mt-0.5 max-w-[200px]"
              >
                {value.length > 35 ? value.substring(0, 35) + '...' : value}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-[11px] px-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              Replace
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={handleClear}
              disabled={uploading}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : null}

      {/* Empty Upload Dropzone */}
      {!value && !uploading && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed rounded-xl p-3.5 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 bg-muted/20"
        >
          <div className="flex items-center justify-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <Upload className="h-4 w-4" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground text-xs leading-none">{placeholderText}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Uploads securely to Cloudinary (JPEG, PNG, WebP, PDF)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Full-screen Image Preview Modal */}
      {previewModalOpen && value && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewModalOpen(false)}
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-card rounded-2xl overflow-hidden shadow-2xl border p-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-2 border-b mb-2">
              <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-primary" />
                {label} — Full Preview
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setPreviewModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={label}
              className="max-h-[70vh] w-auto mx-auto object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
