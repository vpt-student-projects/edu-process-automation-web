"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LiquidButton from "@/components/LiquidButton";
import { Lock, User } from "lucide-react";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API delay
        setTimeout(() => {
            setLoading(false);
            router.push("/schedule");
        }, 1000);
    };

    return (
        <div className="h-full flex flex-col justify-center">
            <div className="text-center mb-8">
                <h2 className="text-text text-h3 mb-2">Добро пожаловать!</h2>
                <p className="text-text/85 text-body">Введите свои данные</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                    <label className="text-body-sm font-medium text-primary/65 uppercase tracking-wider ml-2">
                        Логин
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-secondary/60 group-focus-within:text-secondary transition-colors" />
                        </div>
                        <input
                            type="text"
                            required
                            className="block w-full text-body pl-12 pr-4 py-4 bg-primary/10 border border-primary/15 rounded-2xl text-text/50 group-focus-within:text-secondary placeholder-secondary/60 focus:outline-none focus:ring-1 focus:ring-accent/85 focus:bg-text/15 transition-all"
                            placeholder="логин229"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-body-sm font-medium text-primary/65 uppercase tracking-wider ml-2">
                        Пароль
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-secondary/60 group-focus-within:text-secondary transition-colors" />
                        </div>
                        <input
                            type="password"
                            required
                            className="block w-full text-body pl-12 pr-4 py-4 bg-primary/10 border border-primary/15 rounded-2xl text-text/50 group-focus-within:text-secondary placeholder-secondary/60 focus:outline-none focus:ring-1 focus:ring-accent/85 focus:bg-text/15 transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <LiquidButton
                        className="shadow-lg text-body"
                        type="submit"
                        fullWidth
                        disabled={loading}
                    >
                        {loading ? "Аутентификация..." : "Войти"}
                    </LiquidButton>
                </div>
            </form>
        </div>
    );
}
