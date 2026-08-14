'use client';

import React, { useState, useMemo } from 'react';
import { AppData } from '@/hooks/use-app-data';
import { Search, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import MobileCompanyCard from './MobileCompanyCard';
import MobileCompanyDetail from './MobileCompanyDetail';
import { Company } from '@/types';

interface MobileCompanyListProps {
  appData: AppData;
}

export default function MobileCompanyList({ appData }: MobileCompanyListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const filteredCompanies = useMemo(() => {
    return appData.companies.filter(comp => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        (comp.companyName || '').toLowerCase().includes(q) ||
        (comp.crNumber || '').toLowerCase().includes(q) ||
        (comp.licenseNumber || '').toLowerCase().includes(q) ||
        (comp.ownerName || '').toLowerCase().includes(q) ||
        (comp.phone || '').toLowerCase().includes(q);

      const matchesStatus = statusFilter ? comp.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [appData.companies, search, statusFilter]);

  if (selectedCompany) {
    return (
      <MobileCompanyDetail 
        company={selectedCompany} 
        onBack={() => setSelectedCompany(null)} 
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md p-4 space-y-3 pb-2.5 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground font-display flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Company Registry
          </h1>
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            {appData.companies.length} Registered
          </span>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, CR, license, officer..." 
            className="w-full h-10 pl-9 rounded-xl bg-muted/70 border-none text-xs"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {['', 'Active', 'Inactive'].map((status) => (
            <button
              key={status || 'all'}
              onClick={() => setStatusFilter(status)}
              className={`flex-shrink-0 h-8 px-3.5 rounded-full text-xs font-semibold transition-colors ${
                statusFilter === status
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {status || 'All Entities'}
            </button>
          ))}
        </div>
      </div>

      {/* Cards List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-28">
        {filteredCompanies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center space-y-3">
            <div className="w-14 h-14 bg-muted/80 rounded-2xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">No companies found</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your search criteria</p>
            </div>
          </div>
        ) : (
          filteredCompanies.map(comp => (
            <MobileCompanyCard 
              key={comp.id} 
              company={comp} 
              onTap={setSelectedCompany} 
            />
          ))
        )}
      </div>
    </div>
  );
}
