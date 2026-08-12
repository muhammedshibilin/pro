'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { Company, Employee, Document } from '@/types';
import {
  Dialog,
  DialogContent,
} from './ui/dialog';
import { Input } from './ui/input';
import { Search, Loader2, Building, Users, FileText, ArrowRight, CornerDownLeft } from 'lucide-react';

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectEmployee: (id: string) => void;
  onSelectCompany: (companyName: string) => void;
}

interface SearchResults {
  companies: Company[];
  employees: Employee[];
  documents: Document[];
}

export function GlobalSearch({
  open,
  onOpenChange,
  onSelectEmployee,
  onSelectCompany,
}: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({ companies: [], employees: [], documents: [] });
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);

  // Debouncing effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Fetch search results from backend
  useEffect(() => {
    const fetchResults = async () => {
      const trimmed = debouncedQuery.trim();
      if (!trimmed) {
        setResults({ companies: [], employees: [], documents: [] });
        setActiveIndex(-1);
        return;
      }

      setLoading(true);
      try {
        const response = await apiClient.get(`/search?q=${encodeURIComponent(trimmed)}`);
        setResults(response.data);
        setActiveIndex(0); // auto-highlight first item
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  // Flatten results into a single list for simple keyboard navigation
  const getFlatItems = () => {
    const list: Array<{
      type: 'company' | 'employee' | 'document';
      id: string;
      title: string;
      subtitle: string;
      matchedField: string;
      status: string;
      raw: unknown;
    }> = [];

    // 1. Companies
    results.companies.forEach((c) => {
      let matched = 'Company Name';
      if (query && (c.crNumber || '').toLowerCase().includes(query.toLowerCase())) {
        matched = 'CR Number';
      } else if (query && (c.licenseNumber || '').toLowerCase().includes(query.toLowerCase())) {
        matched = 'License Number';
      } else if (query && (c.ownerName || '').toLowerCase().includes(query.toLowerCase())) {
        matched = 'Owner Name';
      }
      list.push({
        type: 'company',
        id: c.id,
        title: c.companyName,
        subtitle: `CR: ${c.crNumber || '—'} | Lic: ${c.licenseNumber || '—'}${c.ownerName ? ` | ${c.ownerName}` : ''}`,
        matchedField: matched,
        status: c.status,
        raw: c,
      });
    });

    // 2. Employees
    results.employees.forEach((e) => {
      let matched = 'Personnel Name';
      if (query && (e.qidNumber || '').includes(query)) matched = 'Qatar ID Number';
      else if (query && (e.passportNumber || '').toLowerCase().includes(query.toLowerCase())) matched = 'Passport Number';
      else if (query && (e.phone || '').toLowerCase().includes(query.toLowerCase())) matched = 'Contact Number';
      else if (query && (e.nativeRelativePhone || '').toLowerCase().includes(query.toLowerCase())) matched = 'Native Relative Contact';

      list.push({
        type: 'employee',
        id: e.id,
        title: e.employeeName,
        subtitle: `QID: ${e.qidNumber || '—'}${e.phone ? ` | Ph: ${e.phone}` : ''}${e.passportNumber ? ` | Pass: ${e.passportNumber}` : ''}`,
        matchedField: matched,
        status: e.status || 'Active',
        raw: e,
      });
    });

    // 3. Documents
    results.documents.forEach((d) => {
      let matched = 'Document Type';
      if (query && d.documentNumber.toLowerCase().includes(query.toLowerCase())) {
        matched = 'Document Number';
      }

      list.push({
        type: 'document',
        id: d.id,
        title: d.documentType,
        subtitle: `No: ${d.documentNumber} | Company: ${d.company?.companyName || 'Corporate'}`,
        matchedField: matched,
        status: d.status || 'Active',
        raw: d,
      });
    });

    return list;
  };

  const flatItems = getFlatItems();

  const handleSelectItem = useCallback((item: {
    type: 'company' | 'employee' | 'document';
    id: string;
    title: string;
    subtitle: string;
    matchedField: string;
    status: string;
    raw: unknown;
  }) => {
    onOpenChange(false);
    setQuery('');
    setResults({ companies: [], employees: [], documents: [] });

    if (item.type === 'employee') {
      onSelectEmployee(item.id);
    } else if (item.type === 'company') {
      onSelectCompany(item.title);
    } else if (item.type === 'document') {
      onSelectCompany((item.raw as Document).company?.companyName || '');
    }
  }, [onOpenChange, onSelectEmployee, onSelectCompany]);

  // Keyboard navigation controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open || flatItems.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % flatItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < flatItems.length) {
          handleSelectItem(flatItems[activeIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, flatItems, activeIndex, handleSelectItem]);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  const getIcon = (type: 'company' | 'employee' | 'document') => {
    switch (type) {
      case 'company':
        return <Building className="h-4 w-4 text-blue-500" />;
      case 'employee':
        return <Users className="h-4 w-4 text-indigo-500" />;
      case 'document':
        return <FileText className="h-4 w-4 text-emerald-500" />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
      case 'Expired':
        return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20';
      case 'Expiring Soon':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden bg-card text-card-foreground border">
        {/* Search header bar */}
        <div className="flex items-center gap-3 px-4 border-b h-14">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <Input
            placeholder="Type search queries (QID, names, owners)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border-0 outline-none focus:ring-0 focus-visible:ring-0 p-0 text-sm bg-transparent"
            autoFocus
          />
          {loading ? (
            <Loader2 className="h-4.5 w-4.5 text-muted-foreground animate-spin shrink-0" />
          ) : (
            <span className="hidden sm:inline-flex items-center gap-0.5 text-[9px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded border">
              ESC
            </span>
          )}
        </div>

        {/* Results listing */}
        <div className="max-h-[360px] overflow-y-auto" ref={listRef}>
          {query.trim() === '' ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Search by employee name, QID number, company name, document numbers, or owners...
            </div>
          ) : flatItems.length === 0 && !loading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No results found matching &ldquo;{query}&rdquo;.
            </div>
          ) : (
            flatItems.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className={`p-3.5 flex items-center justify-between border-b last:border-b-0 cursor-pointer transition-all duration-150 ${
                    isActive ? 'bg-primary/5 border-l-2 border-l-primary pl-3' : 'hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-card border shrink-0 mt-0.5 shadow-sm">
                      {getIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-foreground truncate">{item.title}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium ${getStatusStyle(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 truncate">{item.subtitle}</p>
                      <p className="text-[9px] text-primary mt-1 font-medium tracking-wide">
                        Matched: {item.matchedField}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isActive && (
                      <span className="hidden sm:flex items-center gap-0.5 text-[8px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded border select-none">
                        <CornerDownLeft className="h-2 w-2" /> ENTER
                      </span>
                    )}
                    <button
                      className={`p-1.5 rounded-lg border text-muted-foreground transition-all duration-150 ${
                        isActive ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-background hover:bg-muted'
                      }`}
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
