"use client";
import React, { useState } from "react";
import GlassCard from "@/components/GlassCard";
import {
    ChevronLeft,
    ChevronRight,
    BookOpen,
    Calendar,
    Users,
} from "lucide-react";

const slides = [
    {
        icon: <Calendar className="w-8 h-8 text-blue-400 flex-shrink-0" />,
        title: "Просмотр расписания",
        desc: "Отслеживайте своё расписание пар.",
    },
    {
        icon: <Users className="w-8 h-8 text-pink-400 flex-shrink-0" />,
        title: "Ведение журнала",
        desc: "Ведите учёт успеваемости и посещаемости студентов.",
    },
    {
        icon: <BookOpen className="w-8 h-8 text-purple-400 flex-shrink-0" />,
        title: "Интерактивные группы",
        desc: "Отслеживайте свои группы.",
    },
];

export default function LandingPage() {
    const [activeSlide, setActiveSlide] = useState(0);

    const prev = () =>
        setActiveSlide((s) => (s - 1 + slides.length) % slides.length);
    const next = () => setActiveSlide((s) => (s + 1) % slides.length);
    return (
        <div className="p-6 w-full h-full flex flex-col gap-4">
            {/* Шапка */}
            <div className="flex items-center text-left space-x-4">
                <svg
                    width="120"
                    height="65"
                    viewBox="0 0 88 32"
                    fill="none"
                    shadow-2x1="true"
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
                <div className="flex-row">
                    <p className="text-primary text-caption tracking-tight ">
                        Государственное бюджетное профессиональное
                        образовательное учреждение «Волжский политехнический
                        техникум»
                    </p>
                    <h1 className="text-text text-h2 tracking-tight drop-shadow-md">
                        Электронное образование
                    </h1>
                </div>
            </div>
            <p className="text-text text-body">
                Цифровая платформа для работы с учебными группами, дисциплинами
                и расписанием.
            </p>

            {/* Карточки */}
            <div className="flex flex-col flex-1">
                <div className="relative overflow-hidden flex-1">
                    <div
                        className="flex h-full transition-transform duration-300 ease-in-out"
                        style={{
                            transform: `translateX(-${activeSlide * 100}%)`,
                        }}
                    >
                        {slides.map((slide, i) => (
                            <div
                                key={i}
                                className="w-full flex-shrink-0 h-full"
                            >
                                <div className="px-8 pb-1 h-full box-border">
                                    <GlassCard className="p-6 h-full ">
                                        <div className="flex flex-col items-stretch gap-1 h-full">
                                            <div className="flex flex-row gap-3 flex-shrink-0 self-start">
                                                {/*Заголовок*/}
                                                {slide.icon}
                                                <div className="flex flex-col h-full w-full">
                                                    <h3 className=" text-text text-h4 leading-tight">
                                                        {slide.title}
                                                    </h3>
                                                    <p className="text-body-sm text-text leading-snug">
                                                        {slide.desc}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col  h-full w-full flex-1 mt-2">
                                                <div className="w-full h-full bg-black/10 rounded-lg flex items-center justify-center">
                                                    GIF / IMAGE
                                                </div>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Стрелки */}
                    <button
                        onClick={prev}
                        className="absolute -left-2 top-1/2 -translate-y-1/2 "
                    >
                        <ChevronLeft className="text-primary/30 w-8 h-8 hover:text-primary/80 transition" />
                    </button>
                    <button
                        onClick={next}
                        className="absolute -right-2 top-1/2 -translate-y-1/2"
                    >
                        <ChevronRight className="text-primary/30 w-8 h-8 hover:text-primary/80 transition" />
                    </button>
                </div>
                {/* Точки */}
                <div className="flex justify-center py-1 gap-2 mt-3">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveSlide(i)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                i === activeSlide
                                    ? "bg-accent w-4"
                                    : "bg-primary/30 w-2"
                            }`}
                        />
                    ))}
                </div>
            </div>

            <p className="text-center text-caption text-text/30 uppercase tracking-widest">
                Версия v1.0
            </p>
        </div>
    );
}
