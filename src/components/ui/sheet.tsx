import { useEffect } from "react";
import { cn } from "../../utils/cn";

export function Sheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className={cn("fixed inset-0 z-50", open ? "block" : "hidden")}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 w-80 max-w-[85%] bg-white shadow-xl">
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-4 border-b font-medium">{children}</div>;
}

export function SheetContent({ children }: { children: React.ReactNode }) {
  return <div className="p-4">{children}</div>;
}
