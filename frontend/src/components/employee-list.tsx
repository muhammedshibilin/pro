'use client';

import { useEmployees, useDeleteEmployee } from '@/hooks/use-employees';
import { useCompanies } from '@/hooks/use-companies';
import { Employee } from '@/types';
import { EmployeeFormModal } from './employee-form-modal';
import { EmployeeDetailsModal } from './employee-details-modal';
import { DeleteConfirmModal } from './delete-confirm-modal';
import {
  Trash2,
  Edit3,
  Eye,
  Search,
  Building,
  Calendar,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { Button } from './ui/button';
import { useState } from 'react';
import { formatDate, getDaysRemaining } from '@/lib/utils';

export function EmployeeList() {
  const { data: employees = [], isLoading } = useEmployees();
  const { data: companies = [] } = useCompanies();
  const deleteEmployee = useDeleteEmployee();

  // Search, filter, sorting & pagination states
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<'employeeName' | 'employeeCode' | 'qidExpiry'>('employeeName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>(undefined);

  // Delete modal states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<{ id: string; name: string } | undefined>(undefined);

  const handleAddClick = () => {
    setSelectedEmployee(undefined);
    setIsFormOpen(true);
  };

  const handleEditClick = (emp: Employee, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering row-click view details
    setSelectedEmployee(emp);
    setIsFormOpen(true);
  };

  const handleRowClick = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsDetailsOpen(true);
  };

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingEmployee({ id, name });
    setIsDeleteOpen(true);
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const getQidStatus = (expiryDate: string) => {
    const days = getDaysRemaining(expiryDate);
    if (days < 0) return { label: 'Expired', style: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20' };
    if (days <= 30) return { label: 'Expiring Soon', style: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 shadow-sm animate-pulse' };
    return { label: 'Active', style: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' };
  };

  // Filtering & Search
  const filtered = employees
    .filter((emp) => {
      const matchSearch =
        (emp.employeeName || '').toLowerCase().includes(search.toLowerCase()) ||
        (emp.phone || '').toLowerCase().includes(search.toLowerCase()) ||
        (emp.nativeRelativePhone || '').toLowerCase().includes(search.toLowerCase()) ||
        (emp.qidNumber || '').includes(search) ||
        (emp.passportNumber || '').toLowerCase().includes(search.toLowerCase()) ||
        (emp.employeeCode || '').toLowerCase().includes(search.toLowerCase());
      const matchCompany = companyFilter === '' || emp.companyId === companyFilter;
      const matchStatus = statusFilter === '' || emp.status === statusFilter;
      return matchSearch && matchCompany && matchStatus;
    })
    // Sort
    .sort((a, b) => {
      let valA = '';
      let valB = '';

      if (sortBy === 'qidExpiry') {
        valA = a.qidExpiry;
        valB = b.qidExpiry;
      } else {
        valA = (a[sortBy] || '').toLowerCase();
        valB = (b[sortBy] || '').toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination math
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const companyFilters = [
    { value: '', label: 'All Companies' },
    ...companies.map((c) => ({ value: c.id, label: c.companyName })),
  ];

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
          <div className="skeleton h-9 w-36" />
          <div className="skeleton h-9 w-36" />
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
      {/* Search and Filters */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-stretch xl:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by employee name, code or QID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 w-full bg-background"
          />
        </div>
        <div className="grid grid-cols-2 md:flex gap-3 items-center">
          <div className="w-[160px] shrink-0 col-span-1">
            <Select
              options={companyFilters}
              value={companyFilter}
              onChange={(e) => {
                setCompanyFilter(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="w-[130px] shrink-0 col-span-1">
            <Select
              options={statusFilters}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <Button size="sm" onClick={handleAddClick} className="gap-1 shrink-0 col-span-2 md:col-span-1">
            <Plus className="h-4 w-4" />
            <span>Add Employee</span>
          </Button>
        </div>
      </div>

      {/* Shared modals */}
      <EmployeeFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        employee={selectedEmployee}
      />

      <EmployeeDetailsModal
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        employee={selectedEmployee}
      />

      <DeleteConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Employee Record"
        description={`This action is permanent and cannot be undone. Are you sure you want to delete employee "${deletingEmployee?.name}"? All associated QID tracking data will be removed.`}
        isLoading={deleteEmployee.isPending}
        onConfirm={async () => {
          if (deletingEmployee) {
            await deleteEmployee.mutateAsync(deletingEmployee.id);
          }
        }}
      />

      {filtered.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-card">
          No employees found matching the filters.
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-muted/40 border-b text-muted-foreground font-semibold uppercase tracking-wider">
                  <th className="p-4 cursor-pointer hover:text-foreground animate-none" onClick={() => handleSort('employeeCode')}>
                    <span className="flex items-center gap-1">
                      Emp Code
                      <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-foreground animate-none" onClick={() => handleSort('employeeName')}>
                    <span className="flex items-center gap-1">
                      Full Name
                      <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                  <th className="p-4">Sponsor Company</th>
                  <th className="p-4">Qatar ID (QID)</th>
                  <th className="p-4 cursor-pointer hover:text-foreground animate-none" onClick={() => handleSort('qidExpiry')}>
                    <span className="flex items-center gap-1">
                      QID Expiry
                      <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                  <th className="p-4">Compliance</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedItems.map((emp) => {
                  const qidStatus = getQidStatus(emp.qidExpiry);
                  return (
                    <tr
                      key={emp.id}
                      onClick={() => handleRowClick(emp)}
                      className="hover:bg-muted/10 transition-colors cursor-pointer"
                    >
                      <td className="p-4 font-mono font-semibold text-[11px] text-muted-foreground">{emp.employeeCode}</td>
                      <td className="p-4 font-semibold text-foreground">{emp.employeeName}</td>
                      <td className="p-4">{emp.company ? emp.company.companyName : 'Unassigned'}</td>
                      <td className="p-4 font-mono">{emp.qidNumber}</td>
                      <td className="p-4 font-semibold">{formatDate(emp.qidExpiry)}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold border uppercase tracking-wider ${qidStatus.style}`}>
                          {qidStatus.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(emp);
                            }}
                            aria-label="View employee"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={(e) => handleEditClick(emp, e)}
                            aria-label="Edit employee"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10"
                            onClick={(e) => handleDelete(emp.id, emp.employeeName, e)}
                            disabled={deleteEmployee.isPending}
                            aria-label="Delete employee"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {paginatedItems.map((emp) => {
              const qidStatus = getQidStatus(emp.qidExpiry);
              return (
                <div
                  key={emp.id}
                  onClick={() => handleRowClick(emp)}
                  className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-sm leading-tight text-foreground">{emp.employeeName}</h4>
                        <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded mt-1.5 inline-block">
                          {emp.employeeCode}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(emp);
                          }}
                          aria-label="View employee"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground"
                          onClick={(e) => handleEditClick(emp, e)}
                          aria-label="Edit employee"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10"
                          onClick={(e) => handleDelete(emp.id, emp.employeeName, e)}
                          disabled={deleteEmployee.isPending}
                          aria-label="Delete employee"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground border-t pt-3">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Building className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                        <span className="truncate">{emp.company ? emp.company.companyName : 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                        <span className="truncate">QID: {emp.qidNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Expires: {formatDate(emp.qidExpiry)}</span>
                    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold border uppercase tracking-wider ${qidStatus.style}`}>
                      {qidStatus.label}
                    </span>
                  </div>
                </div>
              );
            })}
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
