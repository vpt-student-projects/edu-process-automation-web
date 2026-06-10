"use client";

import { ChevronRight } from "lucide-react";

interface Option {
    value: string;
    label: string;
}

interface Props {
    selectedGroup: string;
    selectedSubject: string;
    groups: ReadonlyArray<Option>;
    subjects: ReadonlyArray<Option>;
    onChange: (group: string, subject: string) => void;
}

export function JournalFilters({
    selectedGroup,
    selectedSubject,
    groups,
    subjects,
    onChange,
}: Props) {
    return (
        <div className="grid flex-shrink-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-row lg:flex-wrap lg:items-end">
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
                        className="w-full appearance-none lg:w-48 bg-primary/5 hover:bg-secondary/15 border border-primary/10 rounded-full px-4 py-2.5 pr-9 outline-none focus:ring-1 focus:ring-accent/85 hover:border-accent/85 transition-colors cursor-pointer text-sm"
                    >
                        {groups.map((group) => (
                            <option key={group.value} value={group.value}>
                                {group.label}
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
                        {subjects.map((subject) => (
                            <option key={subject.value} value={subject.value}>
                                {subject.label}
                            </option>
                        ))}
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rotate-90 text-text/50 pointer-events-none" />
                </div>
            </div>
        </div>
    );
}
