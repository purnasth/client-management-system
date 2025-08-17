import type { InputHTMLAttributes } from "react";
import { cn } from "../../utils/cn.ts";

export function Checkbox({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-900",
        className
      )}
      {...props}
    />
  );
}
