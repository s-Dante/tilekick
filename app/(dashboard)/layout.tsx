import { SidebarProvider, SelectTrigger, } from "@/components/index";
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
            {children}
        </SidebarProvider>
    );
}