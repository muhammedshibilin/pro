'use client';

import { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

interface DocumentUploadProps {
  value: string;
  onChange: (value: string) => void;
}

export function DocumentUpload({ value, onChange }: DocumentUploadProps) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    // 1. Validation
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

    if (file.size > maxSize) {
      setError('File size exceeds the 10 MB limit.');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setError('Unsupported file type. Only PDFs and images are allowed.');
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Use relative API path. Since Next.js dev server proxies API, axios to '/api/uploads' works great
      const response = await axios.post('/api/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percent);
          }
        },
      });

      const uploadedUrl = response.data.url;
      onChange(uploadedUrl);
    } catch (err) {
      console.error(err);
      const errMsg = axios.isAxiosError(err)
        ? err.response?.data?.message
        : 'File upload failed. Please try again.';
      setError(errMsg || 'File upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (uploading) return;
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleClear = () => {
    onChange('');
    setProgress(0);
    setError(null);
  };

  const triggerInput = () => {
    fileInputRef.current?.click();
  };

  const isImage = (url: string) => {
    return /\.(jpg|jpeg|png|webp)($|\?)/i.test(url);
  };

  const getFullUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    // Static assets from public/uploads are served directly on the same Next.js host
    return url;
  };

  return (
    <div className="space-y-3 text-xs">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg"
        disabled={uploading}
      />

      {/* Uploading Progress */}
      {uploading && (
        <div className="p-4 border rounded-xl bg-muted/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-muted-foreground animate-pulse">Uploading file...</span>
            <span className="font-bold text-foreground font-mono">{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-3 border border-rose-500/20 rounded-xl bg-rose-500/5 text-rose-600 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Preview block if value is populated */}
      {value && !uploading ? (
        <div className="p-3 border rounded-xl bg-card shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {isImage(value) ? (
              // Image Thumbnail preview
              <div className="relative h-12 w-12 rounded-lg border overflow-hidden shrink-0 bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getFullUrl(value)}
                  alt="Attachment Preview"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              // PDF Document icon preview
              <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shrink-0">
                <FileText className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0">
              <h5 className="font-bold text-foreground truncate">Document Attached</h5>
              <a
                href={getFullUrl(value)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-primary hover:underline font-mono truncate block mt-0.5"
              >
                {value.split('/').pop()}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={triggerInput}
              disabled={uploading}
            >
              Replace
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10"
              onClick={handleClear}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}

      {/* Upload Dropzone if no file is uploaded */}
      {!value && !uploading && (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={triggerInput}
          className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/10 transition-all duration-200"
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-foreground">Drag and drop file here, or click to upload</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Supporting PDFs, PNGs, and JPEGs (Max 10 MB)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
