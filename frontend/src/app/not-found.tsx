'use client';

import Link from 'next/link';
import { AlertOctagon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 p-8 border rounded-2xl bg-card shadow-lg">
        {/* Glow warning icon */}
        <div className="mx-auto h-16 w-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shadow-md shadow-rose-500/5 animate-bounce">
          <AlertOctagon className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">404</h1>
          <h2 className="text-lg font-bold text-muted-foreground">Page Not Found</h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            The page you are looking for does not exist or has been relocated to another route.
          </p>
        </div>

        <div className="pt-2">
          <Button asChild className="gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
