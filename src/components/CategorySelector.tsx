import React from 'react';
import { MENU_CATEGORIES } from '../data/menu';

interface CategorySelectorProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  itemCounts: Record<string, number>;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  activeCategory,
  onSelectCategory,
  itemCounts,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1">
      {MENU_CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id;
        const count = itemCounts[cat.id] || 0;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-sm active:scale-95 ${
              isActive
                ? 'bg-gradient-to-r from-[#E5A93B] to-[#F3BF59] text-[#180E0A] ring-2 ring-[#E5A93B]/50'
                : 'bg-[#2C1810] text-[#FAF6F0]/80 hover:bg-[#3D2218] border border-[#543123]'
            }`}
          >
            <span className="text-base">{cat.icon}</span>
            <span>{cat.name}</span>
            {count > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isActive
                    ? 'bg-[#180E0A] text-[#E5A93B]'
                    : 'bg-[#E5A93B] text-[#180E0A]'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
