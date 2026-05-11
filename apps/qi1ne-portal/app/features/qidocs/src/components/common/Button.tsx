import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const baseClasses = "px-4 py-2 rounded-lg transition-colors font-medium";
  const variantClasses = {
    primary: "bg-sky-500 hover:bg-sky-600 text-white",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-100",
    ghost: "hover:bg-slate-800 text-slate-300",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

