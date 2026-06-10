"use client";
import React from "react";
import GlassCard from "@/components/GlassCard";
import { BookOpen, Calendar, Users } from "lucide-react";

const features = [
    {
        icon: (
            <Calendar className="w-5 h-5 text-blue-400 transition-transform duration-300 group-hover:scale-110" />
        ),
        iconBg: "bg-blue-50",
        glow: "hover:shadow-[0_0_8px_2px_rgba(96,165,250,0.35)]",
        title: "Просмотр расписания",
        desc: "Отслеживайте расписание пар — фильтруйте по дате и дисциплине.",
    },
    {
        icon: (
            <Users className="w-5 h-5 text-pink-400 transition-transform duration-300 group-hover:scale-110" />
        ),
        iconBg: "bg-pink-50",
        glow: "hover:shadow-[0_0_8px_2px_rgba(244,114,182,0.35)]",
        title: "Ведение журнала",
        desc: "Учёт посещаемости и успеваемости студентов в удобном формате.",
    },
    {
        icon: (
            <BookOpen className="w-5 h-5 text-purple-400 transition-transform duration-300 group-hover:scale-110" />
        ),
        iconBg: "bg-purple-50",
        glow: "hover:shadow-[0_0_8px_2px_rgba(192,132,252,0.35)]",
        title: "Интерактивные группы",
        desc: "Полная информация по группам, составу и учебным планам.",
    },
];

export default function LandingPage() {
    return (
        <div className="flex min-h-full w-full flex-1 flex-col gap-4 p-4 sm:gap-5 sm:p-6 lg:p-8">
            {/* Шапка */}
            <div className="flex items-center gap-3 text-left sm:gap-4">
                <svg
                    className="h-auto w-20 flex-shrink-0 sm:w-24 lg:w-[120px]"
                    viewBox="0 0 88 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M86 27.1709V18.3411C86 18.1148 85.8628 17.9099 85.6506 17.8195L71.5814 11.8232C71.5079 11.7919 71.4288 11.7758 71.3487 11.7758H59.7018C59.3803 11.7758 59.1196 11.5211 59.1196 11.2068V8.27525C59.1196 7.96103 59.3803 7.70628 59.7018 7.70628H59.8088C60.1303 7.70628 60.391 7.45154 60.391 7.13731V6.59585C60.391 6.40532 60.4886 6.22743 60.6509 6.12197L60.6906 6.09634C60.8438 5.99677 60.9359 5.82883 60.9359 5.64894C60.9359 5.4023 60.7641 5.18734 60.5192 5.1277L43.6401 1.01689C43.5481 0.994484 43.4518 0.99437 43.3599 1.01655L26.2998 5.12858C26.0548 5.18767 25.8825 5.4026 25.8825 5.64937C25.8825 5.82899 25.9745 5.99668 26.1275 6.0961L26.1674 6.12197C26.3298 6.22743 26.4274 6.40532 26.4274 6.59585V7.13731C26.4274 7.45154 26.688 7.70628 27.0096 7.70628H27.1166C27.4381 7.70628 27.6987 7.96103 27.6987 8.27525V11.2068C27.6987 11.5211 27.4381 11.7758 27.1166 11.7758H15.8347C15.7535 11.7758 15.6731 11.7924 15.5989 11.8245L1.34641 17.9954C1.1358 18.0866 1 18.2906 1 18.5156V27.1728C1 27.4703 1.23433 27.7175 1.53765 27.7401L15.1666 28.7615H22.7575C23.0791 28.7615 23.3397 29.0162 23.3397 29.3305V29.4311C23.3397 29.7453 23.6004 30 23.9219 30H38.2335C38.3335 30 38.4146 29.9208 38.4146 29.8231C38.4146 29.7254 38.4956 29.6461 38.5956 29.6461H47.4963C47.5963 29.6461 47.6774 29.7254 47.6774 29.8231C47.6774 29.9208 47.7584 30 47.8584 30H62.7148C63.0363 30 63.2971 29.7453 63.2971 29.4311V29.3305C63.2971 29.0162 63.5577 28.7615 63.8792 28.7615H71.1068L85.4602 27.7384C85.7644 27.7167 86 27.4691 86 27.1709Z"
                        stroke="#050f1a"
                        strokeWidth="2"
                    />
                    <path
                        d="M59.0736 20.8967V8.09497H27.708V20.8967H59.0736Z"
                        stroke="#050f1a"
                        strokeWidth="2"
                    />
                    <path
                        d="M31.7502 8.43213H33.6139V20.5093H31.7502V8.43213Z"
                        fill="#050f1a"
                    />
                    <path
                        d="M37.3411 8.43213H39.2047V20.5093H37.3411V8.43213Z"
                        fill="#050f1a"
                    />
                    <path
                        d="M42.9321 8.43213H44.7958V20.5093H42.9321V8.43213Z"
                        fill="#050f1a"
                    />
                    <path
                        d="M48.5229 8.43213H50.3867V20.5093H48.5229V8.43213Z"
                        fill="#050f1a"
                    />
                    <path
                        d="M54.114 8.43213H55.9777V20.5093H54.114V8.43213Z"
                        fill="#050f1a"
                    />
                    <path
                        d="M60.5738 25.8364V21.4655C60.5738 21.1513 60.3131 20.8965 59.9916 20.8965H26.6437C26.3221 20.8965 26.0615 21.1513 26.0615 21.4655V25.8364M60.5738 25.8364H26.0615M60.5738 25.8364H62.7125C63.034 25.8364 63.2947 26.091 63.2947 26.4054V29.431C63.2947 29.7452 63.034 30 62.7125 30H23.924C23.6024 30 23.3418 29.7452 23.3418 29.431V26.4054C23.3418 26.091 23.6024 25.8364 23.924 25.8364H26.0615"
                        stroke="#050f1a"
                        strokeWidth="2"
                    />
                </svg>
                <div>
                    <p className="text-caption tracking-tight text-text/45 sm:text-body-sm">
                        Государственное бюджетное профессиональное
                        образовательное учреждение «Волжский политехнический
                        техникум»
                    </p>
                    <h1 className="text-h4 tracking-tight text-text drop-shadow-md sm:text-h3">
                        Электронное образование
                    </h1>
                </div>
            </div>
            <GlassCard
                className="relative overflow-hidden p-4 sm:p-5"
                intensity="low"
            >
                {/* Декоративный кружок */}
                <div className="absolute -bottom-20 -right-10 w-44 h-44 rounded-full bg-accent/10" />
                <div className="absolute -bottom-4 -right-2 w-24 h-24 rounded-full bg-accent/20" />
                <div className="absolute bottom-5 right-4 w-10 h-10 rounded-full bg-accent/30" />
                <p className="text-caption text-accent uppercase tracking-widest mb-1">
                    Цифровая платформа
                </p>
                <p className="max-w-xs text-body-sm leading-relaxed text-text sm:text-body">
                    Работа с учебными группами, дисциплинами и расписанием — в
                    одном месте.
                </p>
            </GlassCard>

            {/* Карточки */}
            <div className="flex flex-col gap-3">
                <p className="px-2 text-caption uppercase tracking-widest text-accent md:col-span-3">
                    Возможности
                </p>
                {features.map((f, i) => (
                    <GlassCard
                        key={i}
                        className={`group flex items-start gap-4 p-4
                                cursor-default select-none
                                transition-all duration-400 ease-in-out
                                ${f.glow}
                                `}
                        intensity="low"
                    >
                        <div className="flex w-full flex-row items-center gap-3 sm:gap-4">
                            <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                                            transition-all duration-300
                                            ${f.iconBg}
                                            `}
                            >
                                {f.icon}
                            </div>
                            <div className="transition-transform duration-300 ease-out group-hover:translate-x-0.5">
                                <h3 className="text-body font-medium text-text leading-tight">
                                    {f.title}
                                </h3>
                                <p className="text-body-sm text-text/55 leading-snug mt-0.5">
                                    {f.desc}
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            <p className="mt-auto text-center text-caption text-text/30 uppercase tracking-widest">
                Версия v1.0
            </p>
        </div>
    );
}
