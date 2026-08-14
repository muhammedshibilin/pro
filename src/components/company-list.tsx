'use client';

import { useCompanies, useDeleteCompany } from '@/hooks/use-companies';
import { Company } from '@/types';
import { CompanyFormModal } from './company-form-modal';
import { DeleteConfirmModal } from './delete-confirm-modal';
import {
  Trash2,
  Edit3,
  Search,
  Mail,
  Phone,
  User,
  Users,
  FileText,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { Button } from './ui/button';
import { useEffect, useState } from 'react';

export function CompanyList({ defaultSearch = '' }: { defaultSearch?: string }) {
  const { data: companies = [], isLoading } = useCompanies();
  const deleteCompany = useDeleteCompany();

  // Search, filter, sorting & pagination states
  const [search, setSearch] = useState(defaultSearch);

  useEffect(() => {
    setSearch(defaultSearch);
  }, [defaultSearch]);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<'companyName' | 'ownerName' | 'status'>('companyName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | undefined>(undefined);

  // Delete modal states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingCompany, setDeletingCompany] = useState<{ id: string; name: string } | undefined>(undefined);

  const handleAddClick = () => {
    setEditingCompany(undefined);
    setIsFormOpen(true);
  };

  const handleEditClick = (company: Company) => {
    setEditingCompany(company);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    setDeletingCompany({ id, name });
    setIsDeleteOpen(true);
  };

  // Toggle sorting logic
  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Filter & Search logic
  const filtered = companies
    .filter((c) => {
      const matchSearch =
        (c.companyName || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.crNumber || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.licenseNumber || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.ownerName || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === '' || c.status === statusFilter;
      return matchSearch && matchStatus;
    })
    // Sort logic
    .sort((a, b) => {
      const fieldA = (a[sortBy] || '').toLowerCase();
      const fieldB = (b[sortBy] || '').toLowerCase();
      if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination math
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const statusFilters = [
    { value: '', label: 'All Statuses' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-3 animate-fade-in">
        <div className="flex gap-3">
          <div className="skeleton h-9 flex-1" />
          <div className="skeleton h-9 w-32" />
          <div className="skeleton h-9 w-28" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Control bar: Search, Filter, Add Trigger */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by company name, owner or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 w-full bg-background"
          />
        </div>
        <div className="flex gap-3 items-center">
          <div className="w-[140px] shrink-0">
            <Select
              options={statusFilters}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <Button size="sm" onClick={handleAddClick} className="gap-1 shrink-0">
            <Plus className="h-4 w-4" />
            <span>Add Company</span>
          </Button>
        </div>
      </div>

      {/* Reusable Form Modal */}
      <CompanyFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        company={editingCompany}
      />

      <DeleteConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Corporate Account"
        description={`This action is permanent and cannot be undone. Are you sure you want to delete the company "${deletingCompany?.name}"? This will automatically wipe out all linked employees and documents.`}
        isLoading={deleteCompany.isPending}
        onConfirm={async () => {
          if (deletingCompany) {
            await deleteCompany.mutateAsync(deletingCompany.id);
          }
        }}
      />

      {filtered.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-card">
          No companies found matching the filters.
        </div>
      ) : (
        <>
          {/* Desktop Table View (>= md screen size) */}
          <div className="hidden md:block rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-muted/40 border-b text-muted-foreground font-semibold uppercase tracking-wider">
                  <th className="p-4 cursor-pointer hover:text-foreground" onClick={() => handleSort('companyName')}>
                    <span className="flex items-center gap-1">
                      Company Name
                      <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-foreground" onClick={() => handleSort('ownerName')}>
                    <span className="flex items-center gap-1">
                      Owner Name
                      <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                  <th className="p-4">Contacts</th>
                  <th className="p-4">Health Metric</th>
                  <th className="p-4 cursor-pointer hover:text-foreground" onClick={() => handleSort('status')}>
                    <span className="flex items-center gap-1">
                      Status
                      <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedItems.map((company) => (
                  <tr key={company.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4 font-semibold text-foreground">{company.companyName}</td>
                    <td className="p-4">{company.ownerName}</td>
                    <td className="p-4 space-y-1 text-[11px]">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                        <span>{company.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                        <span>{company.phone}</span>
                      </div>
                    </td>
                    <td className="p-4 space-y-1 font-semibold text-[11px]">
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-indigo-500/70" />
                        <span>{company._count?.employees || 0} Employees</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5 text-blue-500/70" />
                        <span>{company._count?.documents || 0} Documents</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                        company.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-muted text-muted-foreground border-muted'
                      }`}>
                        {company.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent"
                          onClick={() => handleEditClick(company)}
                          aria-label="Edit company"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10"
                          onClick={() => handleDelete(company.id, company.companyName)}
                          disabled={deleteCompany.isPending}
                          aria-label="Delete company"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View (< md screen size) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {paginatedItems.map((company) => (
              <div
                key={company.id}
                className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-sm leading-tight text-foreground">{company.companyName}</h4>
                      <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium border mt-1.5 ${
                        company.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-muted text-muted-foreground border-muted'
                      }`}>
                        {company.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground"
                        onClick={() => handleEditClick(company)}
                        aria-label="Edit company"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10"
                        onClick={() => handleDelete(company.id, company.companyName)}
                        disabled={deleteCompany.isPending}
                        aria-label="Delete company"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground border-t pt-3">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <User className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                      <span className="truncate">{company.ownerName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                      <span className="truncate">{company.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0 col-span-2">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                      <span className="truncate">{company.email}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-primary/70" />
                      <span>{company._count?.employees || 0} Staff</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5 text-primary/70" />
                      <span>{company._count?.documents || 0} Docs</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Simple Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 text-xs text-muted-foreground">
              <span>
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> &bull; Showing{' '}
                {paginatedItems.length} of {filtered.length} entries
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
