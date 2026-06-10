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
            <div className="flex w-full items-center gap-3 p-4 sm:gap-4 sm:p-6">
                <div className="rounded-2xl bg-accent/85 p-2.5 sm:p-3">
                    <Users className="w-6 h-6 text-background" />
                </div>
                <div>
                    <h3 className="text-h5 text-text sm:text-h4">
                        {group.name}
                    </h3>
                    <p className="text-body-sm text-text/50">
                        {group.subjects.length} предмета
                    </p>
                </div>
            </div>

            <div className="p-6 pt-0 border-t border-white/10">
                <p className="text-caption text-text/60 uppercase tracking-wider pl-1.5 mb-3 mt-4">
                    Список предметов
                </p>
                {group.subjects.length > 0 ? (
                    <div className="grid gap-3">
                        {group.subjects.map((sub) => (
                            <Link
                                key={sub}
                                href={buildJournalHref({
                                    group: group.name,
                                    subject: sub,
                                })}
                                className="flex items-center gap-2 rounded-xl p-3 bg-primary/[0.05] border border-primary/15 hover:bg-accent/15 hover:border-accent/30 group transition-colors"
                            >
                                <Book className="w-4 h-4 text-text/85 group-hover:text-accent" />
                                <span className="text-body-sm font-semibold text-text group-hover:text-accent sm:text-h6">
                                    {sub}
                                </span>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-body-sm text-text/65">
                        Предметы для этой группы пока не приходят из API. На
                        этом этапе мы уже подключили реальные группы, а предметы
                        подтянем следующим шагом.
                    </div>
                )}
            </div>
        </GlassCard>
    );
}

export const GroupCard = memo(GroupCardComponent);
