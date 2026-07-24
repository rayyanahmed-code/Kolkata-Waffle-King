import React from 'react';
import { Sparkles, Phone, MapPin, Clock, ShoppingBag } from 'lucide-react';
import { restaurantConfig } from '../config/restaurantConfig';

interface HeaderProps {
  cartItemCount: number;
  totalAmount: number;
  onOpenCart: () => void;
  onResetOrder?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartItemCount,
  totalAmount,
  onOpenCart,
  onResetOrder,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#2C1810]/95 backdrop-blur-md border-b border-[#3D2218] text-white shadow-xl">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <button 
          onClick={onResetOrder}
          className="flex items-center gap-2.5 text-left group transition-transform active:scale-98"
          title="Return to start"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#E5A93B] to-[#C78D24] p-0.5 flex items-center justify-center shadow-lg shadow-[#E5A93B]/20">
            <div className="w-full h-full bg-[#2C1810] rounded-[10px] flex items-center justify-center text-xl">
              🧇
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E5A93B] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-[#2C1810]"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-serif font-bold text-base tracking-wide text-[#FAF6F0] group-hover:text-[#E5A93B] transition-colors leading-tight">
                {restaurantConfig.name}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#FAF6F0]/70 font-medium">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Open Now
              </span>
              <span>•</span>
              <span className="flex items-center gap-0.5 text-[#E5A93B]">
                <Clock className="w-3 h-3" />
                {restaurantConfig.estimatedTime}
              </span>
            </div>
          </div>
        </button>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2">
          {/* Quick Call Button */}
          <a
            href={`tel:${restaurantConfig.whatsappNumber}`}
            className="p-2 rounded-xl bg-[#3D2218] hover:bg-[#543123] text-[#FAF6F0]/90 transition-colors border border-[#543123]"
            title="Call Restaurant"
          >
            <Phone className="w-4 h-4 text-[#E5A93B]" />
          </a>

          {/* Cart Shortcut */}
          {cartItemCount > 0 && (
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E5A93B] hover:bg-[#F3BF59] text-[#180E0A] font-bold text-xs transition-all shadow-md shadow-[#E5A93B]/20 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>₹{totalAmount}</span>
              <span className="ml-0.5 bg-[#180E0A] text-[#E5A93B] text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-extrabold">
                {cartItemCount}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
