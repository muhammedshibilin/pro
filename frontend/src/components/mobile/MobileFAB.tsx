'use client';

import React, { useState } from 'react';
import { Plus, UserPlus, Building2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileFABProps {
  onAddEmployee: () => void;
  onAddCompany: () => void;
  onAddDocument: () => void;
}

export default function MobileFAB({ onAddEmployee, onAddCompany, onAddDocument }: MobileFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  const actions = [
    { label: 'Add Document', icon: FileText, onClick: () => { onAddDocument(); setIsOpen(false); } },
    { label: 'Add Company', icon: Building2, onClick: () => { onAddCompany(); setIsOpen(false); } },
    { label: 'Add Employee', icon: UserPlus, onClick: () => { onAddEmployee(); setIsOpen(false); } },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end space-y-4">
        {isOpen && (
          <div className="flex flex-col items-end space-y-3 mb-2">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="flex items-center space-x-3 bg-card border shadow-md rounded-full px-4 py-2 hover:bg-accent transition-all transform animate-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="text-sm font-medium">{action.label}</span>
                  <div className="bg-primary/10 p-2 rounded-full text-primary">
                    <Icon className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
        
        <Button
          size="icon"
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all"
          onClick={toggleOpen}
        >
          <Plus className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`} />
        </Button>
      </div>
    </>
  );
}
