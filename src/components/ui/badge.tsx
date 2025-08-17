import { cn } from "../../utils/cn.ts";
import type { HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "outline" | "warning" | "success";
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        variant === "default" && "bg-gray-900 text-white",
        variant === "outline" && "border border-gray-300 text-gray-700",
        variant === "warning" && "bg-amber-100 text-amber-900",
        variant === "success" && "bg-emerald-100 text-emerald-900",
        className
      )}
      {...props}
    />
  );
}
