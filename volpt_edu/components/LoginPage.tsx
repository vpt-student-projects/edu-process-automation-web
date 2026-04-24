"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";
import LiquidButton from "@/components/LiquidButton";
import { getStoredApiBaseUrl, saveApiBaseUrl } from "@/lib/config/api";
import { saveAuthSession } from "@/lib/auth/session";
import { loginUser } from "@/lib/services/auth";

export default function LoginPage() {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [apiBaseUrl, setApiBaseUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        setApiBaseUrl(getStoredApiBaseUrl());
    }, []);

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

            saveApiBaseUrl(apiBaseUrl);
            saveAuthSession(session);
            router.push("/schedule");
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : "Не удалось выполнить вход.",
            );
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
                            <User className="h-5 w-5 text-secondary/50 group-focus-within:text-secondary transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={login}
                            onChange={(event) => setLogin(event.target.value)}
                            required
                            className="block w-full text-body pl-12 pr-4 py-4 bg-primary/10 border border-primary/15 rounded-2xl text-text/50 group-focus-within:text-secondary placeholder-secondary/60 focus:outline-none focus:ring-1 focus:ring-accent/85 focus:bg-primary/20 transition-all"
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
                            <Lock className="h-5 w-5 text-secondary/50 group-focus-within:text-secondary transition-colors" />
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="block w-full text-body pl-12 pr-4 py-4 bg-primary/10 border border-primary/15 rounded-2xl text-secondary/50 group-focus-within:text-secondary placeholder-secondary/60 focus:outline-none focus:ring-1 focus:ring-accent/85 focus:bg-primary/20 transition-all"
                            required
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-body-sm font-medium text-primary/65 uppercase tracking-wider ml-2">
                        API URL
                    </label>
                    <input
                        type="url"
                        value={apiBaseUrl}
                        onChange={(event) => setApiBaseUrl(event.target.value)}
                        required
                        className="block w-full text-body px-4 py-4 bg-primary/10 border border-primary/15 rounded-2xl text-text/70 placeholder-secondary/60 focus:outline-none focus:ring-1 focus:ring-accent/85 focus:bg-primary/20 transition-all"
                        placeholder="http://192.168.0.10:5000"
                    />
                    <p className="text-caption text-text/55 px-2">
                        Адрес API сохраняется в браузере, поэтому IP можно менять без правок в коде.
                    </p>
                </div>

                {error ? (
                    <div className="rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-body-sm text-red-100">
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
