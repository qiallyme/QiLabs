import { formatMoney } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MoneyProps {
  amountMinor: number;
  currency: string;
  className?: string;
  showSign?: boolean;
}

export function Money({
  amountMinor,
  currency,
  className,
  showSign = false,
}: MoneyProps) {
  const formatted = formatMoney(amountMinor, currency);
  const isPositive = amountMinor > 0;
  const isNegative = amountMinor < 0;

  return (
    <span
      className={cn(
        "font-medium",
        isPositive && "text-green-600 dark:text-green-400",
        isNegative && "text-red-600 dark:text-red-400",
        className
      )}
    >
      {showSign && isPositive && "+"}
      {formatted}
    </span>
  );
}
