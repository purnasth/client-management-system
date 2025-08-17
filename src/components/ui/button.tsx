import { cn } from "../../utils/cn.ts";
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
  }
>;

export function Button({
  className,
  children,
  variant = "default",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        variant === "default" && "bg-gray-900 text-white hover:bg-gray-800",
        variant === "outline" && "border border-gray-300 hover:bg-gray-50",
        variant === "ghost" && "hover:bg-gray-100",
        size === "sm" && "h-8 px-3 text-sm",
        size === "md" && "h-10 px-4 text-sm",
        size === "lg" && "h-12 px-6 text-base",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
