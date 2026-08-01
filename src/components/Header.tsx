import React from 'react';
import { Phone, MapPin } from 'lucide-react';
import { restaurantConfig } from '../config/restaurantConfig';
import { LOGO_DATA_URI } from '../assets/logoData';

interface HeaderProps {
  cartItemCount?: number;
  totalAmount?: number;
  onOpenCart?: () => void;
  onResetOrder?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
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
          <div className="relative w-10 h-10 rounded-xl bg-[#2C1810] p-0.5 flex items-center justify-center shadow-lg shadow-[#E5A93B]/20 border border-[#E5A93B]/60 overflow-hidden">
            <img 
              src={LOGO_DATA_URI} 
              alt="Kolkata Waffle King Logo" 
              className="w-full h-full object-cover rounded-[9px]"
            />
            <span className="absolute -top-1 -right-1 flex h-3 w-3 z-10">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E5A93B] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-[#2C1810]"></span>
            </span>
          </div>

          <div>
            <h1 className="font-serif font-bold text-base tracking-wide text-[#FAF6F0] group-hover:text-[#E5A93B] transition-colors leading-tight">
              {restaurantConfig.name}
            </h1>
          </div>
        </button>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2">
          {/* Store Location Maps Button */}
          {restaurantConfig.googleMapsUrl && (
            <a
              href={restaurantConfig.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-[#3D2218] hover:bg-[#543123] text-[#FAF6F0]/90 transition-colors border border-[#543123] flex items-center justify-center"
              title="Open Location on Google Maps"
            >
              <MapPin className="w-4 h-4 text-[#E5A93B]" />
            </a>
          )}

          {/* Quick Call Button */}
          <a
            href={`tel:${restaurantConfig.whatsappNumber}`}
            className="p-2 rounded-xl bg-[#3D2218] hover:bg-[#543123] text-[#FAF6F0]/90 transition-colors border border-[#543123]"
            title="Call Restaurant"
          >
            <Phone className="w-4 h-4 text-[#E5A93B]" />
          </a>
        </div>
      </div>
    </header>
  );
};
