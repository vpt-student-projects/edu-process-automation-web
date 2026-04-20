// components/journal/JournalFilters.tsx
"use client";

import { ChevronRight } from "lucide-react";
import { MOCK_GROUPS, ALL_SUBJECTS } from "@/constants";

interface Props {
    selectedGroup: string;
    selectedSubject: string;
    onChange: (group: string, subject: string) => void;
}

export function JournalFilters({
    selectedGroup,
    selectedSubject,
    onChange,
}: Props) {
    return (
        <div className="flex flex-col gap-3 flex-shrink-0 sm:flex-row sm:items-end sm:flex-wrap">
            <div className="flex flex-col gap-1">
                <label className="text-caption font-semibold text-primary/65 uppercase tracking-wider px-2">
                    Группа
                </label>
                <div className="relative">
                    <select
                        value={selectedGroup}
                        onChange={(e) =>
                            onChange(e.target.value, selectedSubject)
                        }
                        className="w-full sm:w-48 appearance-none bg-primary/5 hover:bg-secondary/15 border border-primary/10 rounded-full px-4 py-2.5 pr-9 outline-none focus:ring-1 focus:ring-accent/85 hover:border-accent/85 transition-colors cursor-pointer text-sm"
                    >
                        {MOCK_GROUPS.map((g) => (
                            <option key={g.id} value={g.name}>
                                {g.name}
                            </option>
                        ))}
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rotate-90 text-text/50 pointer-events-none" />
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-caption font-semibold text-primary/65 uppercase tracking-wider px-2">
                    Предмет
                </label>
                <div className="relative">
                    <select
                        value={selectedSubject}
                        onChange={(e) =>
                            onChange(selectedGroup, e.target.value)
                        }
                        className="w-full sm:w-64 appearance-none bg-primary/5 hover:bg-secondary/15 border border-primary/10 rounded-full px-4 py-2.5 pr-9 outline-none focus:ring-1 focus:ring-accent/85 hover:border-accent/85 transition-colors cursor-pointer text-sm"
                    >
                        {ALL_SUBJECTS.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rotate-90 text-text/50 pointer-events-none" />
                </div>
            </div>
        </div>
    );
}
