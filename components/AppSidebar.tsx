"use client"

import * as React from "react"
import Link from "next/link"
import {
    Joystick, Settings, ChartColumn,
    ChevronsUpDown, LogOut, User,
    Globe, Users, Bot, Palette, Check,
} from "lucide-react"
import { useTheme } from "next-themes"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarSeparator,
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

/* ── Datos ────────────────────────────────────────────────────────────────── */

const PLAY_SUBMENU = [
    { title: "Online", url: "/play/online", icon: Globe, desc: "Jugadores de todo el mundo" },
    { title: "Local", url: "/play/local", icon: Users, desc: "Con amigos en el mismo lugar" },
    { title: "VS IA", url: "/play/ia", icon: Bot, desc: "Entrena contra la IA" },
]

const NAV_ITEMS = [
    { title: "Jugar", url: "/play", icon: Joystick, hasSubmenu: true },
    { title: "Ranking", url: "/leaderboard", icon: ChartColumn },
    { title: "Ajustes", url: "/settings", icon: Settings },
]

const USER = {
    name: "Dante Omar",
    email: "dante@tilekick.com",
    avatar: "/avatars/user.jpg",
}

/* ── Componente ───────────────────────────────────────────────────────────── */

const THEMES = [
    { value: "light", label: "Claro" },
    { value: "dark", label: "Oscuro" },
    { value: "neon", label: "Neon" },
    { value: "retro", label: "Retro" },
]

export default function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { theme, setTheme } = useTheme()

    return (
        <Sidebar collapsible="offcanvas" variant="floating" {...props}>

            {/* ── Header ─────────────────────────────────────────────────── */}
            <SidebarHeader className="p-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild size="lg" className="text-7xl">
                            <Link href="/home" className="flex items-center justify-center gap-3 text-4xl uppercase font-bold">
                                TileKick
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* ── Nav principal ───────────────────────────────────────────── */}
            <SidebarContent className="px-2 pt-1">
                <SidebarGroup>
                    <SidebarMenu className="gap-0.5">

                        {NAV_ITEMS.map((item) =>
                            item.hasSubmenu ? (

                                /* ── Jugar: hover muestra submenu flotante ──── */
                                <SidebarMenuItem key={item.title}>
                                    <HoverCard openDelay={150} closeDelay={200}>
                                        <HoverCardTrigger asChild>
                                            <SidebarMenuButton
                                                asChild
                                                size="lg"
                                                className="font-medium text-xl uppercase font-semibold"
                                            >
                                                <Link href={item.url}>
                                                    <item.icon className="shrink-0 h-6 w-6 pr-2" />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </HoverCardTrigger>

                                        <HoverCardContent
                                            side="right"
                                            align="start"
                                            sideOffset={10}
                                            className="w-64 p-2 rounded-2xl text-xl uppercase font-semibold"
                                        >
                                            <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                                                Modos de juego
                                            </p>
                                            <div className="flex flex-col gap-0.5">
                                                {PLAY_SUBMENU.map((sub) => (
                                                    <Link
                                                        key={sub.title}
                                                        href={sub.url}
                                                        className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent transition-colors"
                                                    >
                                                        <sub.icon className="h-6 w-6 shrink-0 text-primary/70" />
                                                        <div>
                                                            <p className="text-sm font-medium leading-none">
                                                                {sub.title}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                                {sub.desc}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </HoverCardContent>
                                    </HoverCard>
                                </SidebarMenuItem>

                            ) : (

                                /* ── Items regulares ────────────────────────── */
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={item.title}
                                        size="lg"
                                        className="font-medium h-16 text-xl uppercase font-semibold"
                                    >
                                        <Link href={item.url}>
                                            <item.icon className="shrink-0 size-8" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>

                            )
                        )}

                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            {/* ── Footer — usuario ────────────────────────────────────────── */}
            <SidebarFooter className="p-2">
                <SidebarSeparator className="mb-1" />
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent border border-sidebar-border/40 hover:border-sidebar-border/80 transition-colors"
                                >
                                    <Avatar className="h-12 w-12 rounded-lg shrink-0">
                                        <AvatarImage src={USER.avatar} alt={USER.name} />
                                        <AvatarFallback className="rounded-lg text-lg font-bold bg-primary/10 text-primary">
                                            {USER.name.split(" ").map((n) => n[0]).join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left leading-tight overflow-hidden">
                                        <span className="truncate text-lg font-semibold">
                                            {USER.name}
                                        </span>
                                        <span className="truncate text-md text-muted-foreground">
                                            {USER.email}
                                        </span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto h-8 w-8 shrink-0 text-muted-foreground/70" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl"
                                side="top"
                                align="end"
                                sideOffset={6}
                            >
                                {/* Info usuario */}
                                <DropdownMenuLabel className="p-0 font-normal text-lg">
                                    <div className="flex items-center gap-3 px-3 py-2.5">
                                        <Avatar className="h-12 w-12 rounded-md shrink-0">
                                            <AvatarImage src={USER.avatar} alt={USER.name} />
                                            <AvatarFallback className="rounded-xl text-lg font-bold bg-primary/10 text-primary">
                                                {USER.name.split(" ").map((n) => n[0]).join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left leading-tight">
                                            <span className="text-md font-semibold">{USER.name}</span>
                                            <span className="text-sm text-muted-foreground">{USER.email}</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>

                                <DropdownMenuSeparator />

                                <DropdownMenuGroup>
                                    <DropdownMenuItem>
                                        <Link href="/profile" className="flex items-center gap-2 w-full text-lg">
                                            <User className="h-8 w-8" />
                                            Perfil
                                        </Link>
                                    </DropdownMenuItem>

                                    {/* Selector de tema */}
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger className="gap-2 text-lg">
                                            <Palette className="h-8 w-8" />
                                            Tema
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent className="min-w-32 text-lg">
                                            {THEMES.map((t) => (
                                                <DropdownMenuItem
                                                    key={t.value}
                                                    onClick={() => setTheme(t.value)}
                                                    className="gap-2"
                                                >
                                                    <Check className={`h-4 w-4 ${theme === t.value ? "opacity-100" : "opacity-0"}`} />
                                                    {t.label}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuSubContent>
                                    </DropdownMenuSub>
                                </DropdownMenuGroup>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10 text-lg">
                                    <LogOut className="h-8 w-8 mr-2" />
                                    Cerrar sesión
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

        </Sidebar>
    )
}
