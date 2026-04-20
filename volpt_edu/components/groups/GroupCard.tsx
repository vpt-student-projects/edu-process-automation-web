"use client";

import { memo } from "react";
import Link from "next/link";
import GlassCard from "@/components/GlassCard";
import { Users, Book } from "lucide-react";
import { GroupSummary } from "@/types/types";
import { buildJournalHref } from "@/lib/journalFilters";

interface Props {
    group: GroupSummary;
}

function GroupCardComponent({ group }: Props) {
    return (
        <GlassCard
            className="transition-all overflow-visible"
            intensity="medium"
        >
            <div className="w-full p-6 flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-accent/85">
                    <Users className="w-6 h-6 text-background" />
                </div>
                <div>
                    <h3 className="text-h4 text-text">{group.name}</h3>
                    <p className="text-body-sm text-text/50">
                        {group.subjects.length} предмета
                    </p>
                </div>
            </div>

            <div className="p-6 pt-0 border-t border-white/10">
                <p className="text-caption text-text/60 uppercase tracking-wider pl-1.5 mb-3 mt-4">
                    Список предметов
                </p>
                <div className="grid gap-3">
                    {group.subjects.map((sub) => (
                        <Link
                            key={sub}
                            href={buildJournalHref({
                                group: group.name,
                                subject: sub,
                            })}
                            className="flex items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/5 hover:bg-accent/15 hover:border-accent/30 transition-colors"
                        >
                            <Book className="w-4 h-4 text-secondary/85" />
                            <span className="text-text text-h6">{sub}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </GlassCard>
    );
}

export const GroupCard = memo(GroupCardComponent);
