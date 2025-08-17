import { useEffect } from "react";

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onOpenChange]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 w-full max-w-2xl rounded-xl bg-white shadow-lg border">
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="p-4 border-b">
      <div className="font-semibold">{title}</div>
      {description && (
        <div className="text-sm text-gray-500 mt-1">{description}</div>
      )}
    </div>
  );
}

export function DialogContent({ children }: { children: React.ReactNode }) {
  return <div className="p-4 max-h-[70vh] overflow-auto">{children}</div>;
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="p-4 border-t flex justify-end gap-2">{children}</div>;
}
