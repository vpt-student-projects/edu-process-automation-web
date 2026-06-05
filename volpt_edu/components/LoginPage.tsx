"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeClosed, Lock, User } from "lucide-react";
import LiquidButton from "@/components/LiquidButton";
import { getStoredApiBaseUrl } from "@/lib/config/api";
import { isAdminRole, saveAuthSession } from "@/lib/auth/session";
import { loginUser } from "@/lib/services/auth";

export default function LoginPage() {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const apiBaseUrl = getStoredApiBaseUrl();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const session = await loginUser({
                apiBaseUrl,
                login,
                password,
            });

            saveAuthSession(session);
            router.push(isAdminRole(session.role) ? "/admin" : "/schedule");
        } catch (err) {
            if (err instanceof Error && err.message === "INVALID_CREDENTIALS") {
                setError("Неверный логин или пароль");
            } else {
                setError("Не удалось выполнить вход.");
            }
        } finally {
            setLoading(false);
        }
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
                            <User className="h-5 w-5 text-secondary/50 group-focus-within:text-accent transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={login}
                            onChange={(event) => setLogin(event.target.value)}
                            required
                            className="block w-full text-body pl-12 pr-4 py-4 bg-primary/10 border border-primary/15 rounded-2xl text-text/50 group-focus-within:text-secondary group-hover:border-accent placeholder-secondary/60 focus:outline-none focus:ring-1 focus:ring-accent/85 transition-all"
                            placeholder="example@example.com"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-body-sm font-medium text-primary/65 uppercase tracking-wider ml-2">
                        Пароль
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-secondary/50 group-focus-within:text-accent transition-colors" />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            className="block w-full text-body pl-12 pr-12 py-4 bg-primary/10 border border-primary/15 rounded-2xl text-secondary/50 group-focus-within:text-secondary group-hover:border-accent placeholder-secondary/60 focus:outline-none focus:ring-1 focus:ring-accent/85 transition-all"
                            required
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-secondary/60 hover:text-secondary transition-colors"
                            aria-label={
                                showPassword
                                    ? "Скрыть пароль"
                                    : "Показать пароль"
                            }
                        >
                            {showPassword ? (
                                <Eye className="h-5 w-5" />
                            ) : (
                                <EyeClosed className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>

                {error ? (
                    <div
                        className="
                            rounded-2xl border border-red-400/25 bg-red-500/10
                            px-4 py-3 text-body-sm text-red-400

                            animate-in fade-in slide-in-from-top-1 duration-300
                        "
                    >
                        {error}
                    </div>
                ) : null}

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
