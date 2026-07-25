import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 10);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  // Scroll active category into view when changed
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeCategory]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative flex items-center group py-1">
      {/* Left Scroll Button & Fade Mask */}
      {showLeftScroll && (
        <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pr-4 bg-gradient-to-r from-[#180E0A] via-[#180E0A]/90 to-transparent pointer-events-none">
          <button
            onClick={() => scroll('left')}
            className="pointer-events-auto flex items-center justify-center w-8 h-8 rounded-full bg-[#2C1810] text-[#E5A93B] border border-[#E5A93B]/50 shadow-md transition-transform hover:scale-110 active:scale-95"
            aria-label="Scroll left"
            type="button"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Categories Scrollable Track */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth w-full"
      >
        {MENU_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          const count = itemCounts[cat.id] || 0;

          return (
            <button
              key={cat.id}
              data-active={isActive ? "true" : "false"}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-sm active:scale-95 shrink-0 ${
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

      {/* Right Scroll Button & Fade Mask */}
      {showRightScroll && (
        <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center pl-4 bg-gradient-to-l from-[#180E0A] via-[#180E0A]/90 to-transparent pointer-events-none">
          <button
            onClick={() => scroll('right')}
            className="pointer-events-auto flex items-center justify-center w-8 h-8 rounded-full bg-[#2C1810] text-[#E5A93B] border border-[#E5A93B]/50 shadow-md transition-transform hover:scale-110 active:scale-95"
            aria-label="Scroll right"
            type="button"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

