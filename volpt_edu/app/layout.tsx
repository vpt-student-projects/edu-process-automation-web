import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { RuntimeErrorBoundary } from "@/components/RuntimeErrorBoundary";

export const metadata: Metadata = {
    title: "ВПТ: Образование",
    description: "Цифровое управление образованием",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ru">
            <body className="font-sans antialiased min-h-screen relative">
                {/*<Background />*/}
                <RuntimeErrorBoundary>
                    <main className="relative z-10 min-h-screen">{children}</main>
                </RuntimeErrorBoundary>
                <Navbar />
            </body>
        </html>
    );
}
