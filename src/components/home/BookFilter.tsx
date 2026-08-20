import React from 'react';
import { Filter, CheckCircle2, Sparkles, BookOpen, Layers } from 'lucide-react';

export type FilterCategory = 'all' | 'available' | 'reading' | 'coming_soon';

interface BookFilterProps {
  currentFilter: FilterCategory;
  onFilterChange: (filter: FilterCategory) => void;
  counts: {
    all: number;
    available: number;
    reading: number;
    coming_soon: number;
  };
}

export const BookFilter: React.FC<BookFilterProps> = ({ currentFilter, onFilterChange, counts }) => {
  const filterTabs = [
    { id: 'all' as FilterCategory, label: 'Tất Cả Tựa Sách', count: counts.all, icon: Layers },
    { id: 'available' as FilterCategory, label: 'Có Sẵn Đọc & Nghe', count: counts.available, icon: CheckCircle2 },
    { id: 'reading' as FilterCategory, label: 'Đang Đọc', count: counts.reading, icon: BookOpen },
    { id: 'coming_soon' as FilterCategory, label: 'Sắp Ra Mắt', count: counts.coming_soon, icon: Sparkles },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 pb-2">
      {filterTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentFilter === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onFilterChange(tab.id)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
              isActive
                ? 'bg-slate-900 text-white shadow-md dark:bg-emerald-600 dark:text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
            }`}
          >
            <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>{tab.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
