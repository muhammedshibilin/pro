'use client';

import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, ChevronRight, UserPlus, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Employee, Company } from '@/types';

interface MobileSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectEmployee: (employee: Employee) => void;
  onSelectCompany: (company: Company) => void;
}

export default function MobileSearch({ open, onOpenChange, onSelectEmployee, onSelectCompany }: MobileSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ employees: Employee[], companies: Company[] }>({ employees: [], companies: [] });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults({ employees: [], companies: [] });
    }
  }, [open]);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length < 2) {
        setResults({ employees: [], companies: [] });
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col w-full max-w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Search Header */}
      <header className="flex items-center gap-2 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 border-b bg-card shadow-xs shrink-0">
        <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-11 w-11 min-h-[44px] min-w-[44px] shrink-0">
          <ArrowLeft className="w-5 h-5" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search employees, QID, companies, CR..."
            className="w-full h-11 pl-10 rounded-xl bg-muted/70 border-none text-sm"
          />
        </div>
      </header>

      {/* Results Container */}
      <main className="flex-1 overflow-y-auto p-4 pb-[max(2rem,env(safe-area-inset-bottom))] space-y-6">
        {isLoading ? (
          <div className="flex justify-center p-8 text-xs font-semibold text-muted-foreground">Searching compliance records...</div>
        ) : query.length > 0 && results.employees.length === 0 && results.companies.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
            <p className="font-bold text-sm text-foreground">No matches found</p>
            <p className="text-xs text-muted-foreground">Try searching with a different name, QID number, or company CR.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Employees Search Group */}
            {results.employees.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-primary" />
                  <span>Employees ({results.employees.length})</span>
                </h3>
                <div className="space-y-2">
                  {results.employees.map(emp => (
                    <div 
                      key={emp.id} 
                      onClick={() => { onSelectEmployee(emp); onOpenChange(false); }}
                      className="flex items-center justify-between gap-3 p-3.5 bg-card border rounded-2xl active:scale-[0.98] transition-transform cursor-pointer shadow-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-foreground break-words">{emp.employeeName}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5 break-all">
                          QID: {emp.qidNumber} {emp.phone ? `• Ph: ${emp.phone}` : ''}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Companies Search Group */}
            {results.companies.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-500" />
                  <span>Companies ({results.companies.length})</span>
                </h3>
                <div className="space-y-2">
                  {results.companies.map(comp => (
                    <div 
                      key={comp.id} 
                      onClick={() => { onSelectCompany(comp); onOpenChange(false); }}
                      className="flex items-center justify-between gap-3 p-3.5 bg-card border rounded-2xl active:scale-[0.98] transition-transform cursor-pointer shadow-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-foreground break-words">{comp.companyName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 break-words">
                          {comp.ownerName ? `Authorized: ${comp.ownerName}` : (comp.crNumber ? `CR: ${comp.crNumber}` : 'Corporate Registry')}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
