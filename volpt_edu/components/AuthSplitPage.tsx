"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LandingPage from "@/components/LandingPage";
import LoginPage from "@/components/LoginPage";
import { getStoredUser, hasAuthSession, isAdminRole } from "@/lib/auth/session";

export default function AuthSplitPage() {
    const [activeTab, setActiveTab] = useState<"landing" | "login">("landing");
    const [isMobile, setIsMobile] = useState(false);
    const router = useRouter();
    const hasSession = hasAuthSession();

    useEffect(() => {
        if (hasSession) {
            const user = getStoredUser();
            router.replace(isAdminRole(user?.role) ? "/admin" : "/schedule");
        }
    }, [hasSession, router]);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1024);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    if (hasSession) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-body text-text/80">
                    Проверка сохраненной сессии...
                </div>
            </main>
        );
    }

    if (!isMobile) {
        return (
            <main className="min-h-screen flex flex-row">
                <section className="w-[58%] min-h-screen flex border-r border-primary/10 xl:w-2/3">
                    <LandingPage />
                </section>
                <section className="w-[42%] min-h-screen flex justify-center p-8 xl:w-1/3 xl:p-12 bg-background/85">
                    <LoginPage />
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex flex-col">
            {/* Таб-бар */}
            <div className="sticky top-0 z-20 flex flex-shrink-0 gap-2 border-b border-primary/10 bg-background/80 px-4 pt-3 backdrop-blur-xl sm:px-6">
                <button
                    onClick={() => setActiveTab("landing")}
                    className={`flex-1 py-2 text-body-sm font-medium transition-all ${
                        activeTab === "landing"
                            ? "text-accent border-b-2 border-accent"
                            : "text-text/40"
                    }`}
                >
                    О платформе
                </button>
                <button
                    onClick={() => setActiveTab("login")}
                    className={`flex-1 py-2 text-body-sm font-medium transition-all ${
                        activeTab === "login"
                            ? "text-accent border-b-2 border-accent"
                            : "text-text/40"
                    }`}
                >
                    Войти
                </button>
            </div>

            {/* Контент */}
            <div className="flex-1">
                {activeTab === "landing" ? (
                    <LandingPage />
                ) : (
                    <div className="flex min-h-[calc(100vh-49px)] flex-col justify-center p-4 sm:p-8 bg-background/65">
                        <LoginPage />
                    </div>
                )}
            </div>
        </main>
    );
}
