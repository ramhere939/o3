import { cn, getStatusColor, getStatusLabel } from "@/lib/utils";

const colorMap: Record<string, string> = {
  success: "chip-success",
  warning: "chip-warning",
  danger: "chip-danger",
  info: "chip-info",
  purple: "chip-purple",
  default: "chip-default",
};

interface StatusChipProps {
  status: string;
  className?: string;
}

export function StatusChip({ status, className }: StatusChipProps) {
  const colorKey = getStatusColor(status);
  const label = getStatusLabel(status);
  return (
    <span className={cn(colorMap[colorKey] || colorMap.default, className)}>
      {label}
    </span>
  );
}
