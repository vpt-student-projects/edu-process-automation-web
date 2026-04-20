// components/journal/ModeToggle.tsx
"use client";

import { GraduationCap, Users } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { JournalMode } from "@/types/types";

interface Props {
    mode: JournalMode;
    onChange: (mode: JournalMode) => void;
}

export function ModeToggle({ mode, onChange }: Props) {
    return (
        <GlassCard className="!rounded-full" intensity="low">
            <div className="p-1.5 rounded-full flex relative">
                <div
                    className={`absolute top-1.5 bottom-1.5 w-[calc(50%-9px)] bg-accent rounded-full transition-all duration-300 ease-in-out ${
                        mode === "GRADES" ? "left-1.5" : "left-[calc(50%+4px)]"
                    }`}
                />
                {(["GRADES", "ATTENDANCE"] as JournalMode[]).map((m) => (
                    <button
                        key={m}
                        onClick={() => onChange(m)}
                        className={`flex-1 py-2 px-4 rounded-full relative z-10 text-body-sm font-semibold transition-colors duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${
                            mode === m ? "text-background" : "text-primary/85"
                        }`}
                    >
                        {m === "GRADES" ? (
                            <>
                                <GraduationCap className="w-4 h-4 shrink-0" />{" "}
                                Успеваемость
                            </>
                        ) : (
                            <>
                                <Users className="w-4 h-4 shrink-0" />{" "}
                                Посещаемость
                            </>
                        )}
                    </button>
                ))}
            </div>
        </GlassCard>
    );
}
