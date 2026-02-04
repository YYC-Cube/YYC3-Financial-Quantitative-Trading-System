import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = ({ className, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        "rounded-lg border border-[#233554] bg-[#112240] text-[#CCD6F6] shadow-md",
        className
      )}
      {...props}
    />
  );
};
Card.displayName = "Card";