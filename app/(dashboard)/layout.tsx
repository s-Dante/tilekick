import { SidebarProvider, SidebarInset } from "@/components/index";
import { AppSidebar } from "@/components/index";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "18.5rem",
                    "--sidebar-width-mobile": "18.5rem",
                } as React.CSSProperties
            }
        >
            <AppSidebar />

            <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center border-b border-border/30 bg-background/80 backdrop-blur-sm px-6">
            </header>

            <div className="flex-1">
                {children}
            </div>
        </SidebarProvider>
    );
}
