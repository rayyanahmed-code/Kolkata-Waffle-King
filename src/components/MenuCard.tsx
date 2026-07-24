import React from 'react';
import { Plus, Minus, Sparkles, Check } from 'lucide-react';
import { MenuItem } from '../types';
import { restaurantConfig } from '../config/restaurantConfig';

interface MenuCardProps {
  item: MenuItem;
  quantity: number;
  onUpdateQuantity: (quantity: number) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  item,
  quantity,
  onUpdateQuantity,
}) => {
  return (
    <div
      className={`relative rounded-xl bg-[#FAF6F0] border p-3 transition-all duration-200 shadow-sm flex flex-col justify-between ${
        quantity > 0
          ? 'border-[#E5A93B] ring-1 ring-[#E5A93B]/40'
          : 'border-[#E6D7C3] hover:border-[#E5A93B]/50'
      }`}
    >
      <div>
        {/* Subcategory & Badge Row */}
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-1.5 py-0.5 rounded-md bg-[#2C1810] text-[10px] text-[#FAF6F0] font-medium">
              {item.subcategory}
            </span>
            {item.badge && (
              <span className="px-1.5 py-0.5 rounded-md bg-[#E5A93B] text-[#180E0A] font-extrabold text-[9px] uppercase tracking-wider flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" />
                {item.badge}
              </span>
            )}
          </div>
          <span className="font-extrabold text-xs text-[#E5A93B] bg-[#2C1810] px-2 py-0.5 rounded-lg border border-[#543123]">
            {restaurantConfig.currencySymbol}{item.price}
          </span>
        </div>

        {/* Name & Description */}
        <h3 className="font-serif font-bold text-xs text-[#2C1810] leading-snug">
          {item.name}
        </h3>
        <p className="text-[10px] text-[#2C1810]/70 mt-0.5 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
      </div>

      {/* Controls Row */}
      <div className="mt-2.5 pt-2 border-t border-[#E6D7C3]/60 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-[#2C1810]/80">
          {quantity > 0 ? (
            <span className="text-[#C78D24] font-bold flex items-center gap-0.5">
              <Check className="w-3 h-3 text-[#C78D24]" /> Added
            </span>
          ) : (
            'Freshly Made'
          )}
        </span>

        {quantity === 0 ? (
          <button
            onClick={() => onUpdateQuantity(1)}
            className="px-2.5 py-1 rounded-lg bg-[#E5A93B] hover:bg-[#F3BF59] text-[#180E0A] font-extrabold text-xs flex items-center gap-1 shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-3 h-3 stroke-[3]" />
            <span>ADD</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 bg-[#2C1810] text-[#FAF6F0] px-1.5 py-0.5 rounded-lg shadow border border-[#543123]">
            <button
              onClick={() => onUpdateQuantity(quantity - 1)}
              className="w-5 h-5 rounded bg-[#3D2218] hover:bg-[#543123] flex items-center justify-center text-[#FAF6F0] transition-colors active:scale-90"
              title="Decrease"
            >
              <Minus className="w-2.5 h-2.5 stroke-[3]" />
            </button>
            <span className="text-xs font-bold w-3 text-center text-[#E5A93B]">
              {quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(quantity + 1)}
              className="w-5 h-5 rounded bg-[#E5A93B] hover:bg-[#F3BF59] text-[#180E0A] flex items-center justify-center transition-colors active:scale-90"
              title="Increase"
            >
              <Plus className="w-2.5 h-2.5 stroke-[3]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
