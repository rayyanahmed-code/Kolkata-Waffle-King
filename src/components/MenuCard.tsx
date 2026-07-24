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
      className={`relative rounded-2xl bg-[#FAF6F0] border transition-all duration-200 overflow-hidden shadow-md flex flex-col justify-between ${
        quantity > 0
          ? 'border-[#E5A93B] ring-2 ring-[#E5A93B]/30'
          : 'border-[#E6D7C3] hover:border-[#E5A93B]/50'
      }`}
    >
      {/* Top Image Banner */}
      <div className="relative h-28 w-full bg-[#3D2218] overflow-hidden group">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-95"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C1810]/80 via-transparent to-transparent"></div>

        {/* Subcategory Tag */}
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-[#2C1810]/80 backdrop-blur-md text-[10px] text-[#FAF6F0] font-medium border border-[#543123]">
          {item.subcategory}
        </span>

        {/* Popular / Special Badge */}
        {item.badge && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-[#E5A93B] text-[#180E0A] font-extrabold text-[10px] uppercase tracking-wider shadow-sm flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            {item.badge}
          </span>
        )}

        {/* Price Tag Overlay */}
        <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-xl bg-[#2C1810]/90 backdrop-blur-md border border-[#E5A93B]/40 text-[#E5A93B] font-extrabold text-xs shadow-md">
          {restaurantConfig.currencySymbol}{item.price}
        </div>
      </div>

      {/* Content Info */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-serif font-bold text-sm text-[#2C1810] leading-snug line-clamp-1">
            {item.name}
          </h3>
          <p className="text-[11px] text-[#2C1810]/70 mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Quantity Controls */}
        <div className="mt-3 pt-2.5 border-t border-[#E6D7C3]/60 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-[#2C1810]/80">
            {quantity > 0 ? (
              <span className="text-[#C78D24] font-bold flex items-center gap-1">
                <Check className="w-3 h-3 text-[#C78D24]" /> Added
              </span>
            ) : (
              'Freshly Made'
            )}
          </span>

          {quantity === 0 ? (
            <button
              onClick={() => onUpdateQuantity(1)}
              className="px-3.5 py-1.5 rounded-xl bg-[#E5A93B] hover:bg-[#F3BF59] text-[#180E0A] font-extrabold text-xs flex items-center gap-1 shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>ADD</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-[#2C1810] text-[#FAF6F0] px-1.5 py-1 rounded-xl shadow border border-[#543123]">
              <button
                onClick={() => onUpdateQuantity(quantity - 1)}
                className="w-6 h-6 rounded-lg bg-[#3D2218] hover:bg-[#543123] flex items-center justify-center text-[#FAF6F0] transition-colors active:scale-90"
                title="Decrease"
              >
                <Minus className="w-3 h-3 stroke-[3]" />
              </button>
              <span className="text-xs font-bold w-4 text-center text-[#E5A93B]">
                {quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(quantity + 1)}
                className="w-6 h-6 rounded-lg bg-[#E5A93B] hover:bg-[#F3BF59] text-[#180E0A] flex items-center justify-center transition-colors active:scale-90"
                title="Increase"
              >
                <Plus className="w-3 h-3 stroke-[3]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
