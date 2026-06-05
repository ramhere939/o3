import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  color?: "indigo" | "emerald" | "amber" | "rose" | "blue" | "violet";
  className?: string;
  index?: number;
}

const colorConfig = {
  indigo: {
    bg: "bg-indigo-50",
    icon: "text-indigo-600",
    border: "border-indigo-100",
  },
  emerald: {
    bg: "bg-emerald-50",
    icon: "text-emerald-600",
    border: "border-emerald-100",
  },
  amber: {
    bg: "bg-amber-50",
    icon: "text-amber-600",
    border: "border-amber-100",
  },
  rose: {
    bg: "bg-rose-50",
    icon: "text-rose-600",
    border: "border-rose-100",
  },
  blue: {
    bg: "bg-blue-50",
    icon: "text-blue-600",
    border: "border-blue-100",
  },
  violet: {
    bg: "bg-violet-50",
    icon: "text-violet-600",
    border: "border-violet-100",
  },
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "indigo",
  className,
  index = 0,
}: MetricCardProps) {
  const c = colorConfig[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={cn("metric-card", className)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.value > 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              ) : trend.value < 0 ? (
                <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
              ) : (
                <Minus className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.value > 0
                    ? "text-emerald-600"
                    : trend.value < 0
                    ? "text-rose-600"
                    : "text-slate-500"
                )}
              >
                {trend.value > 0 ? "+" : ""}
                {trend.value}%{trend.label ? ` ${trend.label}` : ""}
              </span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", c.bg, `border ${c.border}`)}>
          <div className={cn("w-5 h-5", c.icon)}>{icon}</div>
        </div>
      </div>
    </motion.div>
  );
}
