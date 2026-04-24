"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SortOption } from "@/types/types";
import { SortButton } from "@/components/groups/SortButton";
import { GroupCard } from "@/components/groups/GroupCard";
import {
    loadGroupsFromApi,
    type ServiceError,
} from "@/lib/services/educationData";
import { PageState } from "@/components/shared/PageState";
import type { GroupSummary } from "@/types/types";
import { useRouter } from "next/navigation";

export default function GroupsPage() {
    const [sortBy, setSortBy] = useState<SortOption>("NAME");
    const [groups, setGroups] = useState<ReadonlyArray<GroupSummary>>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ServiceError | null>(null);
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;

        async function loadGroups() {
            setLoading(true);
            const result = await loadGroupsFromApi();

            if (!isMounted) {
                return;
            }

            if (result.error?.code === "UNAUTHORIZED") {
                router.replace("/");
                return;
            }

            setError(result.error);
            setGroups(result.data ?? []);
            setLoading(false);
        }

        void loadGroups();

        return () => {
            isMounted = false;
        };
    }, [router]);

    const sortedGroups = useMemo(
        () =>
            [...groups].sort((a, b) =>
                sortBy === "NAME"
                    ? a.name.localeCompare(b.name)
                    : b.subjects.length - a.subjects.length,
            ),
        [groups, sortBy],
    );

    const handleSortToggle = useCallback(() => {
        setSortBy((p) => (p === "NAME" ? "SUBJECTS_COUNT" : "NAME"));
    }, []);

    return (
        <div className="p-4 md:p-6 mx-auto w-full mb-24">
            <div className="mb-4 flex justify-between items-center">
                <div className="pl-2">
                    <h2 className="text-text text-h2 drop-shadow-sm">
                        Мои группы
                    </h2>
                    <p className="text-text/85 text-body">
                        Список групп и предметов
                    </p>
                </div>
                <SortButton sortBy={sortBy} onToggle={handleSortToggle} />
            </div>

            <div className="space-y-5">
                {loading ? (
                    <PageState
                        title="Загрузка групп"
                        description="Получаем закреплённые группы с API."
                    />
                ) : error ? (
                    <PageState
                        title="Ошибка загрузки групп"
                        description={error.message}
                        variant="error"
                    />
                ) : sortedGroups.length === 0 ? (
                    <PageState
                        title="Группы не найдены"
                        description="API не вернуло ни одной группы для текущего преподавателя."
                    />
                ) : (
                    sortedGroups.map((group) => (
                        <GroupCard key={group.id} group={group} />
                    ))
                )}
            </div>
        </div>
    );
}
