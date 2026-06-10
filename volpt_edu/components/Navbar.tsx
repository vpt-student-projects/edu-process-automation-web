"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Calendar,
    Users,
    LogOut,
    BookOpen,
    LayoutDashboard,
} from "lucide-react";
import {
    clearAuthSession,
    getStoredUser,
    isAdminRole,
} from "@/lib/auth/session";
import GlassCard from "@/components/GlassCard";

const teacherNavItems = [
    { href: "/schedule", icon: Calendar, label: "Расписание" },
    { href: "/journal", icon: BookOpen, label: "Журнал" },
    { href: "/groups", icon: Users, label: "Группы" },
];

/** У администратора только панель админки (остальные разделы — для преподавателей). */
const adminNavItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Админ" },
];

const Navbar: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = useCallback(() => {
        clearAuthSession();
        router.push("/");
    }, [router]);

    if (pathname === "/" || pathname === "/login") return null;

    const navItems = isAdminRole(getStoredUser()?.role)
        ? adminNavItems
        : teacherNavItems;

    return (
        <div className="fixed inset-x-0 bottom-3 z-50 flex justify-center px-3 safe-bottom sm:bottom-5 sm:px-4">
            <GlassCard
                intensity="medium"
                className="w-full max-w-[min(24rem,calc(100vw-1.5rem))] p-2 !rounded-[1.75rem] !overflow-visible sm:w-auto sm:!rounded-full"
            >
                <div className="flex items-center justify-around gap-1 sm:gap-2">
                    {navItems.map((item) => {
                        const isActive = pathname?.startsWith(item.href);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    relative flex min-w-0 flex-1 items-center justify-center h-12 rounded-full transition-all duration-300 group sm:w-12 sm:flex-none
                ${isActive ? "text-white" : "text-primary/65 "}
              `}
                            >
                                {isActive && (
                                    <div className="absolute inset-0 bg-accent/85 rounded-full shadow-[0_0_10px_rgba(41,125,214,0.5)] animate-in zoom-in-90 duration-300" />
                                )}

                                <Icon className="w-5 h-5 relative z-10 transition-transform group-hover:scale-110" />

                                {!isActive && (
                                    <span className="absolute -top-10 bg-primary/20 text-secondary text-caption px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-md">
                                        {item.label}
                                    </span>
                                )}
                            </Link>
                        );
                    })}

                    <div className="w-px h-6 bg-primary/20 mx-0.5" />

                    <button
                        onClick={handleLogout}
                        className="flex h-12 flex-1 items-center justify-center rounded-full text-red-400/85 transition-all hover:bg-red-400/85 hover:text-red-50 active:scale-95 sm:w-12 sm:flex-none"
                        title="Выйти"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </GlassCard>
        </div>
    );
};

export default Navbar;
