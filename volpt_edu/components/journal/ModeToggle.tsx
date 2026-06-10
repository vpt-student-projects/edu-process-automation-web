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
        <GlassCard
            className="w-full !rounded-[1.5rem] sm:w-auto sm:!rounded-full"
            intensity="low"
        >
            <div className="relative flex rounded-[1.5rem] p-1.5 sm:rounded-full">
                <div
                    className={`absolute top-1.5 bottom-1.5 w-[calc(50%-9px)] bg-accent rounded-full transition-all duration-300 ease-in-out ${
                        mode === "GRADES" ? "left-1.5" : "left-[calc(50%+4px)]"
                    }`}
                />
                {(["GRADES", "ATTENDANCE"] as JournalMode[]).map((m) => (
                    <button
                        key={m}
                        onClick={() => onChange(m)}
                        className={`relative z-10 flex-1 rounded-full px-3 py-2 text-caption sm:px-4 sm:text-body-sm font-semibold transition-colors duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${
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
