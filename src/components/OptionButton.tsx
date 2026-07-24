import React from 'react';
import { motion } from 'motion/react';

interface OptionButtonProps {
  label: string;
  icon?: React.ReactNode;
  subtitle?: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'gold';
  disabled?: boolean;
  fullWidth?: boolean;
  badge?: string;
}

export const OptionButton: React.FC<OptionButtonProps> = ({
  label,
  icon,
  subtitle,
  onClick,
  variant = 'primary',
  disabled = false,
  fullWidth = true,
  badge,
}) => {
  const variantStyles = {
    gold: 'bg-gradient-to-r from-[#E5A93B] to-[#F3BF59] text-[#180E0A] font-bold shadow-lg shadow-[#E5A93B]/20 hover:brightness-105 border-transparent',
    primary: 'bg-[#2C1810] text-[#FAF6F0] font-semibold hover:bg-[#3D2218] border border-[#543123] shadow-md',
    secondary: 'bg-[#FAF6F0] text-[#2C1810] font-semibold hover:bg-[#F2E9DE] border border-[#E6D7C3] shadow-sm',
    outline: 'bg-transparent text-[#FAF6F0] font-medium border border-[#E5A93B]/50 hover:bg-[#E5A93B]/10 hover:border-[#E5A93B]',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={`relative flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl transition-all text-left ${
        variantStyles[variant]
      } ${fullWidth ? 'w-full' : 'w-auto'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-xl flex-shrink-0">{icon}</span>}
        <div>
          <div className="text-sm leading-tight font-sans flex items-center gap-2">
            <span>{label}</span>
            {badge && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#180E0A] text-[#E5A93B] font-bold uppercase tracking-wider">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <div className="text-xs opacity-80 mt-0.5 font-normal">
              {subtitle}
            </div>
          )}
        </div>
      </div>
      <span className="text-xs opacity-60">→</span>
    </motion.button>
  );
};
