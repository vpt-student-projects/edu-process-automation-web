"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LandingPage from "@/components/LandingPage";
import LoginPage from "@/components/LoginPage";
import { hasAuthSession } from "@/lib/auth/session";

export default function AuthSplitPage() {
    const [activeTab, setActiveTab] = useState<"landing" | "login">("landing");
    const [isMobile, setIsMobile] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (hasAuthSession()) {
            router.replace("/schedule");
            return;
        }

        setCheckingSession(false);
    }, [router]);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    if (checkingSession) {
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
                <section className="w-2/3 min-h-screen flex border-r border-primary/10">
                    <LandingPage />
                </section>
                <section className="w-1/3 min-h-screen flex justify-center p-12 bg-background/85">
                    <LoginPage />
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex flex-col">
            {/* Таб-бар */}
            <div className="flex border-b border-primary/10 px-4 pt-4 gap-2 flex-shrink-0">
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
                    <div className="p-6 flex flex-col justify-center min-h-[calc(100vh-49px)]">
                        <LoginPage />
                    </div>
                )}
            </div>
        </main>
    );
}
