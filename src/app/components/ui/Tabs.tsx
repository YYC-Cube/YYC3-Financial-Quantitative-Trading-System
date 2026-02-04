import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from '@/app/components/SafeMotion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TabsProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs = ({ tabs, activeTab, onChange, className }: TabsProps) => {
  return (
    <div className={cn("flex gap-2 border-b border-[#233554]", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "relative px-4 py-2 text-sm font-medium transition-colors",
            activeTab === tab.id ? "text-white" : "text-[#8892B0] hover:text-[#CCD6F6]"
          )}
        >
          {tab.label}
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#38B2AC]"
            />
          )}
        </button>
      ))}
    </div>
  );
};