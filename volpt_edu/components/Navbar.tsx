"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Calendar, Users, LogOut, BookOpen } from "lucide-react";

const navItems = [
    { href: "/schedule", icon: Calendar, label: "Расписание" },
    { href: "/journal", icon: BookOpen, label: "Журнал" },
    { href: "/groups", icon: Users, label: "Группы" },
];

const Navbar: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();
    const handleLogout = useCallback(() => {
        router.push("/");
    }, [router]);

    if (pathname === "/" || pathname === "/login") return null;

    return (
        <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-50">
            <div
                className="
        flex items-center gap-2 p-2 rounded-full
        bg-background/[0.08] backdrop-blur-xl
        border border-primary/20
        shadow-[0_4px_16px_0_rgba(0,0,0,0.2),inset_0_1px_0_0_rgba(255,255,255,0.2)]
      "
            >
                {navItems.map((item) => {
                    const isActive = pathname?.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 group
                ${isActive ? "text-white" : "text-primary/60 hover:text-secondary/85 hover:bg-primary/10"}
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
                    className="flex items-center justify-center w-12 h-12 rounded-full text-red-400/85 hover:text-red-50 hover:bg-red-400/85 transition-all active:scale-95"
                    title="Выйти"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default Navbar;
