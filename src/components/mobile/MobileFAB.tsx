'use client';

import React, { useState } from 'react';
import { Plus, UserPlus, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileFABProps {
  onAddEmployee: () => void;
  onAddCompany: () => void;
  onAddDocument?: () => void;
}

export default function MobileFAB({ onAddEmployee, onAddCompany }: MobileFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  const actions = [
    { label: 'Add Company', icon: Building2, onClick: () => { onAddCompany(); setIsOpen(false); } },
    { label: 'Add Employee', icon: UserPlus, onClick: () => { onAddEmployee(); setIsOpen(false); } },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end space-y-3 pointer-events-none">
        {isOpen && (
          <div className="flex flex-col items-end space-y-2.5 mb-1 pointer-events-auto">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  className="flex items-center space-x-3 bg-card border shadow-lg rounded-full px-4 py-2.5 hover:bg-accent active:scale-95 transition-all transform animate-in slide-in-from-bottom-3"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <span className="text-xs sm:text-sm font-bold text-foreground">{action.label}</span>
                  <div className="bg-primary/10 p-2 rounded-full text-primary shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
        
        <Button
          type="button"
          size="icon"
          className="w-14 h-14 rounded-full shadow-xl hover:shadow-2xl transition-transform active:scale-90 bg-primary text-primary-foreground pointer-events-auto"
          onClick={toggleOpen}
          aria-label={isOpen ? "Close Quick Add Menu" : "Open Quick Add Menu"}
        >
          <Plus className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`} />
        </Button>
      </div>
    </>
  );
}
