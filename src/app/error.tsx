'use client';

import { useEffect } from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('PWA Client Runtime Error Boundary Caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 p-8 border rounded-2xl bg-card shadow-lg">
        {/* Warning Badge */}
        <div className="mx-auto h-16 w-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shadow-md shadow-rose-500/5">
          <ShieldAlert className="h-8 w-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight">System Error</h1>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            An unexpected error occurred during execution. The offline mock store state remains cached.
          </p>
          <div className="p-3 bg-muted/30 border rounded-xl font-mono text-[10px] text-muted-foreground text-left max-h-[120px] overflow-y-auto mt-4 leading-normal break-words">
            {error.message || 'Unknown application error'}
          </div>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <Button variant="outline" onClick={() => (window.location.href = '/')} className="text-xs">
            Reload App
          </Button>
          <Button onClick={reset} className="gap-2 text-xs">
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
