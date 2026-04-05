import { cn } from "@/lib/utils";

interface MemberChipProps {
  name: string;
  avatarUrl?: string;
  className?: string;
}

export function MemberChip({ name, avatarUrl, className }: MemberChipProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      <span className="text-sm font-medium">{name}</span>
    </div>
  );
}
