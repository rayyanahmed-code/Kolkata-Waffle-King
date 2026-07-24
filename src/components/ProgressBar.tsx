import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepName?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  stepName,
}) => {
  const percentage = Math.min(Math.max((currentStep / totalSteps) * 100, 0), 100);

  return (
    <div className="w-full bg-[#2C1810]/80 backdrop-blur border-b border-[#3D2218] px-4 py-2.5">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
          <span className="text-[#E5A93B] flex items-center gap-1.5 font-medium">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#E5A93B]/20 text-[#E5A93B] text-[11px] font-bold">
              {currentStep}
            </span>
            <span>Step {currentStep} of {totalSteps}</span>
          </span>
          {stepName && (
            <span className="text-[#FAF6F0]/80 text-[11px] font-normal truncate max-w-[180px]">
              {stepName}
            </span>
          )}
        </div>

        {/* Progress Bar Container */}
        <div className="w-full h-2 bg-[#180E0A] rounded-full overflow-hidden p-0.5 border border-[#3D2218]">
          <motion.div
            className="h-full bg-gradient-to-r from-[#E5A93B] via-[#F3BF59] to-[#E5A93B] rounded-full shadow-sm"
            initial={{ width: '0%' }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
};
