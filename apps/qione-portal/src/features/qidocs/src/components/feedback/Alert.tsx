interface AlertProps {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

export default function Alert({ variant = "info", title, children, onClose }: AlertProps) {
  const variantClasses = {
    info: "bg-blue-500/10 border-blue-500/50 text-blue-300",
    success: "bg-green-500/10 border-green-500/50 text-green-300",
    warning: "bg-yellow-500/10 border-yellow-500/50 text-yellow-300",
    error: "bg-red-500/10 border-red-500/50 text-red-300",
  };

  return (
    <div
      className={`p-4 rounded-lg border ${variantClasses[variant]} flex items-start justify-between gap-2`}
    >
      <div className="flex-1">
        {title && <h3 className="font-semibold mb-1">{title}</h3>}
        <div>{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-current opacity-70 hover:opacity-100 transition-opacity"
        >
          ×
        </button>
      )}
    </div>
  );
}

