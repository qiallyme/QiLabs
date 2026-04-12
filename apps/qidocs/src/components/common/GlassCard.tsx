import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function GlassCard({ 
  children, 
  className = "", 
  hover = false,
  onClick 
}: GlassCardProps) {
  return (
    <div
      className={`
        glass-card rounded-2xl p-6
        ${hover ? "glass-card-hover cursor-pointer" : ""}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

