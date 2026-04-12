interface PillProps {
  children: React.ReactNode;
  variant?: "default" | "info" | "success" | "warning";
}

export default function Pill({
  children,
  variant = "default",
}: PillProps) {
  const variantClasses = {
    default: "bg-slate-800 text-slate-300",
    info: "bg-sky-500/20 text-sky-300",
    success: "bg-green-500/20 text-green-300",
    warning: "bg-yellow-500/20 text-yellow-300",
  };

  return (
    <span
      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}

