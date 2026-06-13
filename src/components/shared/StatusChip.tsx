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
  role?: string;
}

export function StatusChip({ status, className, role }: StatusChipProps) {
  const colorKey = getStatusColor(status);
  let label = getStatusLabel(status);
  
  if (role === "supplier") {
    if (status === "quote_received") {
      label = "Quote Sent";
    } else if (status === "sent" || status === "open") {
      label = "New";
    }
  }

  return (
    <span className={cn(colorMap[colorKey] || colorMap.default, className)}>
      {label}
    </span>
  );
}
