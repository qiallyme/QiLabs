/**
 * Glassmorphism Card Component
 * 
 * Reusable card with translucent background and blur effect
 */

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export default function Card({ children, className = "", onClick, hover = true }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl border border-slate-800/50
        bg-slate-900/40 backdrop-blur-md
        ${hover ? "hover:bg-slate-900/60 hover:border-sky-500/30 transition-all" : ""}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

