import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "../../utils/cn.ts";

export function SidebarLayout({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const content = (
    <aside
      className={cn(
        "h-full overflow-y-auto border-r bg-white",
        isMobile
          ? open
            ? "fixed inset-y-0 left-0 z-40 w-72"
            : "hidden"
          : open
          ? "w-72"
          : "w-16"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <span className={cn("font-semibold", !open && !isMobile && "sr-only")}>
          Dashboard
        </span>
        <Button variant="ghost" size="sm" onClick={() => setOpen(!open)}>
          ☰
        </Button>
      </div>
      <div className={cn("p-2", !open && !isMobile && "px-1")}>{sidebar}</div>
    </aside>
  );

  return (
    <div className="h-screen w-full grid grid-cols-1 lg:grid-cols-[auto_1fr] bg-gray-50">
      {content}
      <main className="min-h-0 overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-white/80 backdrop-blur border-b px-4 py-2 lg:hidden">
          <Button variant="ghost" onClick={() => setOpen((v) => !v)}>
            ☰
          </Button>
          <div className="font-semibold">Dashboard</div>
          <div className="w-8" />
        </div>
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
