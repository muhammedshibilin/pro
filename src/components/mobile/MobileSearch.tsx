'use client';

import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, ChevronRight } from 'lucide-react';
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
        // Mock API call for search
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
    <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center gap-2 p-4 border-b h-16">
        <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search employees, companies..."
            className="w-full h-12 pl-10 rounded-full bg-muted border-none text-base"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center p-8 text-muted-foreground">Searching...</div>
        ) : query.length > 0 && results.employees.length === 0 && results.companies.length === 0 ? (
          <div className="flex justify-center p-8 text-muted-foreground">No results found</div>
        ) : (
          <div className="space-y-6">
            {results.employees.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-2">Employees</h3>
                <div className="space-y-2">
                  {results.employees.map(emp => (
                    <div 
                      key={emp.id} 
                      onClick={() => { onSelectEmployee(emp); onOpenChange(false); }}
                      className="flex items-center justify-between p-3 bg-card border rounded-xl active:scale-[0.98] transition-all"
                    >
                      <div>
                        <p className="font-medium">{emp.employeeName}</p>
                        <p className="text-xs text-muted-foreground font-mono">QID: {emp.qidNumber}{emp.phone ? ` • Ph: ${emp.phone}` : ''}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {results.companies.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-2">Companies</h3>
                <div className="space-y-2">
                  {results.companies.map(comp => (
                    <div 
                      key={comp.id} 
                      onClick={() => { onSelectCompany(comp); onOpenChange(false); }}
                      className="flex items-center justify-between p-3 bg-card border rounded-xl active:scale-[0.98] transition-all"
                    >
                      <div>
                        <p className="font-medium">{comp.companyName}</p>
                        <p className="text-sm text-muted-foreground">{comp.ownerName || (comp.crNumber ? `CR: ${comp.crNumber}` : 'Corporate Account')}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
