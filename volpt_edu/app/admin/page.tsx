"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/GlassCard";
import { getStoredUser, isAdminRole } from "@/lib/auth/session";
import {
    adminAddStudent,
    adminAddSubject,
    adminAddTeacher,
    adminChangeLogin,
    adminChangePassword,
    adminDeleteStudent,
    adminDeleteSubject,
    adminDeleteTeacher,
    adminGetStudents,
    adminGetSubjects,
    adminGetTeachers,
    adminImportStudents,
    adminUpdateSubject,
    type AdminStudentRow,
    type AdminSubjectRow,
    type AdminTeacherRow,
} from "@/lib/services/adminApi";

const inputClass =
    "block w-full text-body px-4 py-3 bg-primary/10 border border-primary/15 rounded-xl text-text placeholder:text-secondary/50 focus:outline-none focus:ring-1 focus:ring-accent/60";
const labelClass =
    "text-body-sm font-medium text-primary/65 uppercase tracking-wider ml-1";
const btnPrimary =
    "rounded-xl px-4 py-2.5 text-body-sm font-medium bg-accent/85 text-white hover:bg-accent transition-colors disabled:opacity-40";
const btnGhost =
    "rounded-xl px-4 py-2.5 text-body-sm font-medium border border-primary/20 text-text/90 hover:bg-primary/10 transition-colors disabled:opacity-40";
/** Крупная зона нажатия — для нижнего блока, чтобы не пересекалась с навбаром */
const btnAccount =
    "rounded-xl min-h-12 px-5 py-3 text-body-sm font-semibold border-2 border-accent/50 bg-accent/15 text-text hover:bg-accent/25 active:scale-[0.99] transition-all disabled:opacity-40 relative z-10 cursor-pointer w-full sm:w-auto sm:min-w-[220px]";
const btnDanger =
    "rounded-xl px-3 py-1.5 text-caption font-medium text-red-300 border border-red-400/30 hover:bg-red-500/15 transition-colors";

function SectionTitle({ children }: { children: ReactNode }) {
    return (
        <h2 className="text-h3 text-text font-semibold mb-3 pl-1">
            {children}
        </h2>
    );
}

type Flash = { kind: "ok" | "err"; text: string };

const FLASH_OK_MS = 4500;
const FLASH_ERR_MS = 7000;

/** Сообщение внутри карточки, в тон остальному UI */
function BlockNotice({ flash }: { flash: Flash | null }) {
    if (!flash) return null;
    const ok = flash.kind === "ok";
    return (
        <div
            role={ok ? "status" : "alert"}
            className={[
                "mb-3 rounded-xl border px-3 py-2.5 text-body-sm leading-snug",
                ok
                    ? "border-emerald-500/30 bg-primary/[0.07] text-text"
                    : "border-red-400/35 bg-red-500/[0.08] text-text",
            ].join(" ")}
        >
            {flash.text}
        </div>
    );
}

type FlashKey =
    | "load"
    | "import"
    | "addStudent"
    | "studentsList"
    | "teachersAdd"
    | "teachersActions"
    | "subjectsAdd"
    | "subjectsEdit"
    | "account";

const emptyFlashes: Record<FlashKey, Flash | null> = {
    load: null,
    import: null,
    addStudent: null,
    studentsList: null,
    teachersAdd: null,
    teachersActions: null,
    subjectsAdd: null,
    subjectsEdit: null,
    account: null,
};

export default function AdminPage() {
    const router = useRouter();
    const [ready, setReady] = useState(false);
    const [flashes, setFlashes] =
        useState<Record<FlashKey, Flash | null>>(emptyFlashes);
    const flashTimers = useRef<Partial<Record<FlashKey, number>>>({});

    const flash = useCallback(
        (key: FlashKey, kind: "ok" | "err", text: string) => {
            const prev = flashTimers.current[key];
            if (prev !== undefined) {
                window.clearTimeout(prev);
            }
            setFlashes((p) => ({ ...p, [key]: { kind, text } }));
            const ms = kind === "ok" ? FLASH_OK_MS : FLASH_ERR_MS;
            flashTimers.current[key] = window.setTimeout(() => {
                setFlashes((p) => ({ ...p, [key]: null }));
                delete flashTimers.current[key];
            }, ms);
        },
        [],
    );

    const [students, setStudents] = useState<AdminStudentRow[]>([]);
    const [teachers, setTeachers] = useState<AdminTeacherRow[]>([]);
    const [subjects, setSubjects] = useState<AdminSubjectRow[]>([]);

    const [importText, setImportText] = useState("");
    const [singleName, setSingleName] = useState("");
    const [singleGroup, setSingleGroup] = useState("");

    const [teacherLogin, setTeacherLogin] = useState("");
    const [teacherName, setTeacherName] = useState("");
    const [teacherPassword, setTeacherPassword] = useState("");

    const [newSubjectName, setNewSubjectName] = useState("");
    const [newSubjectHours, setNewSubjectHours] = useState("");

    const [subjectSearchQuery, setSubjectSearchQuery] = useState("");
    const [selectedSubject, setSelectedSubject] =
        useState<AdminSubjectRow | null>(null);
    const [editSubjectName, setEditSubjectName] = useState("");
    const [editSubjectHours, setEditSubjectHours] = useState("");

    const [studentSearchQuery, setStudentSearchQuery] = useState("");
    const [teacherSearchQuery, setTeacherSearchQuery] = useState("");
    const [selectedTeacher, setSelectedTeacher] =
        useState<AdminTeacherRow | null>(null);

    const filteredStudents = useMemo(() => {
        const q = studentSearchQuery.trim().toLowerCase();
        if (!q) {
            return [];
        }
        return students.filter((s) => s.fullName.toLowerCase().includes(q));
    }, [students, studentSearchQuery]);

    const filteredTeachers = useMemo(() => {
        const q = teacherSearchQuery.trim().toLowerCase();
        if (!q) {
            return [];
        }
        return teachers.filter((t) => t.fullName.toLowerCase().includes(q));
    }, [teachers, teacherSearchQuery]);

    const filteredSubjects = useMemo(() => {
        const q = subjectSearchQuery.trim().toLowerCase();
        if (!q) {
            return [];
        }
        return subjects.filter((s) => s.name.toLowerCase().includes(q));
    }, [subjects, subjectSearchQuery]);

    const handleTeacherSearchChange = useCallback((value: string) => {
        setTeacherSearchQuery(value);
        setSelectedTeacher(null);
    }, []);

    const handleSubjectSearchChange = useCallback((value: string) => {
        setSubjectSearchQuery(value);
        setSelectedSubject(null);
    }, []);

    const handleSubjectSelect = useCallback((subject: AdminSubjectRow) => {
        setSelectedSubject(subject);
        setEditSubjectName(subject.name);
        setEditSubjectHours(
            subject.total_hours != null ? String(subject.total_hours) : "",
        );
    }, []);

    const reloadAll = useCallback(async () => {
        const [s, t, sub] = await Promise.all([
            adminGetStudents(),
            adminGetTeachers(),
            adminGetSubjects(),
        ]);
        if (s.ok) {
            setStudents(s.data);
        } else if (s.unauthorized) {
            router.replace("/");
            return;
        } else {
            flash("load", "err", s.error);
        }
        if (t.ok) {
            setTeachers(t.data);
        } else if (t.unauthorized) {
            router.replace("/");
            return;
        } else {
            flash("load", "err", t.error);
        }
        if (sub.ok) {
            setSubjects(
                sub.data.map((row) => ({
                    ...row,
                    total_hours: row.total_hours ?? row.totalHours ?? null,
                })),
            );
        } else if (sub.unauthorized) {
            router.replace("/");
            return;
        } else {
            flash("load", "err", sub.error);
        }
    }, [router, flash]);

    useEffect(() => {
        const user = getStoredUser();
        if (!user) {
            router.replace("/");
            return;
        }
        if (!isAdminRole(user.role)) {
            router.replace("/schedule");
            return;
        }
        const readyTimer = window.setTimeout(() => {
            setReady(true);
            void reloadAll();
        }, 0);
        return () => window.clearTimeout(readyTimer);
    }, [router, reloadAll]);

    useEffect(() => {
        return () => {
            for (const id of Object.values(flashTimers.current)) {
                if (id !== undefined) window.clearTimeout(id);
            }
            flashTimers.current = {};
        };
    }, []);

    const handleImport = async () => {
        const r = await adminImportStudents(importText);
        if (!r.ok) {
            if (r.unauthorized) {
                router.replace("/");
                return;
            }
            flash("import", "err", r.error);
            return;
        }
        flash(
            "import",
            "ok",
            `Импорт выполнен: добавлено ${r.data.addedCount}, ошибок ${r.data.errorsCount}.`,
        );
        setImportText("");
        await reloadAll();
    };

    const handleAddStudent = async () => {
        if (!singleName.trim() || !singleGroup.trim()) {
            flash("addStudent", "err", "Укажите ФИО и группу.");
            return;
        }
        const r = await adminAddStudent(singleName.trim(), singleGroup.trim());
        if (!r.ok) {
            if (r.unauthorized) {
                router.replace("/");
                return;
            }
            flash("addStudent", "err", r.error);
            return;
        }
        flash("addStudent", "ok", "Студент добавлен.");
        setSingleName("");
        setSingleGroup("");
        await reloadAll();
    };

    const handleDeleteStudent = async (id: number) => {
        if (!confirm("Удалить студента?")) return;
        const r = await adminDeleteStudent(id);
        if (!r.ok) {
            if (r.unauthorized) {
                router.replace("/");
                return;
            }
            flash("studentsList", "err", r.error);
            return;
        }
        flash("studentsList", "ok", "Студент удалён.");
        await reloadAll();
    };

    const handleAddTeacher = async () => {
        if (!teacherLogin.trim() || !teacherName.trim()) {
            flash("teachersAdd", "err", "Укажите логин и ФИО преподавателя.");
            return;
        }
        const pwdTrim = teacherPassword.trim();
        if (pwdTrim.length > 0 && pwdTrim.length < 6) {
            flash(
                "teachersAdd",
                "err",
                "Пароль не задан: если вводите свой пароль, нужно не менее 6 символов. Иначе оставьте поле пустым — будет пароль по умолчанию.",
            );
            return;
        }
        const r = await adminAddTeacher({
            login: teacherLogin.trim(),
            fullName: teacherName.trim(),
            password: pwdTrim || undefined,
        });
        if (!r.ok) {
            if (r.unauthorized) {
                router.replace("/");
                return;
            }
            flash("teachersAdd", "err", r.error);
            return;
        }
        flash("teachersAdd", "ok", "Преподаватель добавлен.");
        setTeacherLogin("");
        setTeacherName("");
        setTeacherPassword("");
        await reloadAll();
    };

    const handleDeleteTeacher = async (id: number) => {
        if (!confirm("Удалить преподавателя?")) return;
        const r = await adminDeleteTeacher(id);
        if (!r.ok) {
            if (r.unauthorized) {
                router.replace("/");
                return;
            }
            flash("teachersActions", "err", r.error);
            return;
        }
        flash("teachersActions", "ok", "Преподаватель удалён.");
        setSelectedTeacher(null);
        setTeacherSearchQuery("");
        await reloadAll();
    };

    const handleAddSubject = async () => {
        if (!newSubjectName.trim()) {
            flash("subjectsAdd", "err", "Укажите название предмета.");
            return;
        }
        const hours = newSubjectHours.trim()
            ? Number.parseInt(newSubjectHours.trim(), 10)
            : null;
        const r = await adminAddSubject({
            name: newSubjectName.trim(),
            totalHours: hours !== null && !Number.isNaN(hours) ? hours : null,
        });
        if (!r.ok) {
            if (r.unauthorized) {
                router.replace("/");
                return;
            }
            flash("subjectsAdd", "err", r.error);
            return;
        }
        flash("subjectsAdd", "ok", "Предмет добавлен.");
        setNewSubjectName("");
        setNewSubjectHours("");
        await reloadAll();
    };

    const handleSaveSelectedSubject = async () => {
        if (!selectedSubject) {
            return;
        }
        const name = editSubjectName.trim();
        if (!name) {
            flash("subjectsEdit", "err", "Укажите название предмета.");
            return;
        }
        const hRaw = editSubjectHours.trim();
        const totalHours = hRaw === "" ? null : Number.parseInt(hRaw, 10);
        const r = await adminUpdateSubject(selectedSubject.id, {
            name,
            totalHours:
                totalHours !== null && !Number.isNaN(totalHours)
                    ? totalHours
                    : null,
        });
        if (!r.ok) {
            if (r.unauthorized) {
                router.replace("/");
                return;
            }
            flash("subjectsEdit", "err", r.error);
            return;
        }
        flash("subjectsEdit", "ok", "Предмет обновлён.");
        setSelectedSubject(null);
        await reloadAll();
    };

    const handleDeleteSubject = async (id: number) => {
        if (!confirm("Удалить предмет? Связанные данные могут пострадать."))
            return;
        const r = await adminDeleteSubject(id);
        if (!r.ok) {
            if (r.unauthorized) {
                router.replace("/");
                return;
            }
            flash("subjectsEdit", "err", r.error);
            return;
        }
        flash("subjectsEdit", "ok", "Предмет удалён.");
        setSelectedSubject(null);
        setSubjectSearchQuery("");
        await reloadAll();
    };

    const handleChangeLogin = async (
        userId: number,
        flashKey: "teachersActions" | "account",
        currentLogin?: string,
    ) => {
        const next = prompt("Новый логин", currentLogin ?? "");
        if (next === null || next.trim() === "") return;
        if (currentLogin !== undefined && next.trim() === currentLogin) return;
        const r = await adminChangeLogin(userId, next.trim());
        if (!r.ok) {
            if (r.unauthorized) {
                router.replace("/");
                return;
            }
            flash(flashKey, "err", r.error);
            return;
        }
        flash(flashKey, "ok", "Логин изменён.");
        if (flashKey === "teachersActions") {
            setSelectedTeacher(null);
        }
        await reloadAll();
    };

    const handleChangePassword = async (
        userId: number,
        flashKey: "teachersActions" | "account",
    ) => {
        const pwd = prompt("Новый пароль (минимум 6 символов)");
        if (pwd === null) return;
        if (pwd.length < 6) {
            flash(
                flashKey,
                "err",
                "Пароль не изменён: введено меньше 6 символов. Задайте пароль не короче 6 символов или отмените.",
            );
            return;
        }
        const r = await adminChangePassword(userId, pwd);
        if (!r.ok) {
            if (r.unauthorized) {
                router.replace("/");
                return;
            }
            flash(flashKey, "err", r.error);
            return;
        }
        flash(flashKey, "ok", "Пароль изменён.");
        if (flashKey === "teachersActions") {
            setSelectedTeacher(null);
        }
    };

    if (!ready) {
        return (
            <div className="min-h-screen flex items-center justify-center text-text/80 text-body">
                Загрузка…
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5 p-4 md:p-8 pb-44 md:pb-52 mx-auto w-full max-w-3xl relative z-[5]">
            <header className="pl-1">
                <h1 className="text-h2 text-text font-bold">Админ-панель</h1>
                <p className="text-body text-text/70 mt-1">
                    Управление студентами, преподавателями и предметами
                </p>
                <BlockNotice flash={flashes.load} />
            </header>

            <GlassCard intensity="medium" className="p-4 md:p-5">
                <SectionTitle>Импорт студентов</SectionTitle>
                <p className="text-caption text-text/60 mb-2">
                    Каждая строка: <span className="text-accent/90">ФИО</span>,
                    разделитель запятая или таб,{" "}
                    <span className="text-accent/90">название группы</span>.
                    Группа создаётся при отсутствии.
                </p>
                <textarea
                    className={`${inputClass} min-h-[120px] resize-y font-mono text-caption`}
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder={
                        "Иванов Иван Иванович,ИВТ-21\nПетров Пётр,ИВТ-21"
                    }
                />
                <BlockNotice flash={flashes.import} />
                <button
                    type="button"
                    className={`${btnPrimary} mt-3 w-full sm:w-auto`}
                    onClick={() => void handleImport()}
                >
                    Загрузить список
                </button>
            </GlassCard>

            <GlassCard intensity="medium" className="p-4 md:p-5">
                <SectionTitle>Добавить студента</SectionTitle>
                <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                        <label className={labelClass}>ФИО</label>
                        <input
                            className={`${inputClass} mt-1`}
                            value={singleName}
                            onChange={(e) => setSingleName(e.target.value)}
                            placeholder="Фамилия Имя Отчество"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Группа</label>
                        <input
                            className={`${inputClass} mt-1`}
                            value={singleGroup}
                            onChange={(e) => setSingleGroup(e.target.value)}
                            placeholder="ИВТ-21"
                        />
                    </div>
                </div>
                <BlockNotice flash={flashes.addStudent} />
                <button
                    type="button"
                    className={`${btnPrimary} mt-3`}
                    onClick={() => void handleAddStudent()}
                >
                    Добавить
                </button>
            </GlassCard>

            <GlassCard intensity="medium" className="p-4 md:p-5">
                <SectionTitle>Студенты</SectionTitle>
                <p className="text-caption text-text/60 mb-2">
                    Введите часть ФИО — в таблице появятся совпадения, можно
                    удалить запись.
                </p>
                <label className={labelClass}>Поиск по ФИО</label>
                <input
                    type="search"
                    className={`${inputClass} mt-1 mb-3`}
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    placeholder="Например: Иванов"
                    autoComplete="off"
                />
                <BlockNotice flash={flashes.studentsList} />
                <div className="max-h-64 overflow-auto rounded-lg border border-primary/10">
                    {studentSearchQuery.trim() === "" ? (
                        <p className="p-4 text-caption text-text/50">
                            Введите запрос в поле поиска.
                        </p>
                    ) : filteredStudents.length === 0 ? (
                        <p className="p-4 text-caption text-text/50">
                            Ничего не найдено.
                        </p>
                    ) : (
                        <table className="w-full text-left text-body-sm">
                            <thead className="sticky top-0 bg-primary/15 backdrop-blur-md text-caption uppercase text-text/60">
                                <tr>
                                    <th className="p-2 pl-3">ФИО</th>
                                    <th className="p-2">Группа</th>
                                    <th className="p-2 w-24" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/10">
                                {filteredStudents.map((s) => (
                                    <tr
                                        key={s.id}
                                        className="hover:bg-primary/5"
                                    >
                                        <td className="p-2 pl-3 text-text">
                                            {s.fullName}
                                        </td>
                                        <td className="p-2 text-text/80">
                                            {s.groupName}
                                        </td>
                                        <td className="p-2 text-right">
                                            <button
                                                type="button"
                                                className={btnDanger}
                                                onClick={() =>
                                                    void handleDeleteStudent(
                                                        s.id,
                                                    )
                                                }
                                            >
                                                Удалить
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </GlassCard>

            <GlassCard intensity="medium" className="p-4 md:p-5">
                <SectionTitle>Преподаватели</SectionTitle>
                <p className="text-caption text-text/60 mb-3">
                    Сначала найдите преподавателя по ФИО, нажмите на строку —
                    затем появятся действия: смена логина, пароля, удаление.
                </p>
                <div className="grid gap-3 sm:grid-cols-3 mb-4">
                    <div className="sm:col-span-1">
                        <label className={labelClass}>Логин</label>
                        <input
                            className={`${inputClass} mt-1`}
                            value={teacherLogin}
                            onChange={(e) => setTeacherLogin(e.target.value)}
                        />
                    </div>
                    <div className="sm:col-span-1">
                        <label className={labelClass}>ФИО</label>
                        <input
                            className={`${inputClass} mt-1`}
                            value={teacherName}
                            onChange={(e) => setTeacherName(e.target.value)}
                        />
                    </div>
                    <div className="sm:col-span-1">
                        <label className={labelClass}>Пароль</label>
                        <input
                            type="password"
                            className={`${inputClass} mt-1`}
                            value={teacherPassword}
                            onChange={(e) => setTeacherPassword(e.target.value)}
                            placeholder="по умолчанию default123"
                        />
                    </div>
                </div>
                <BlockNotice flash={flashes.teachersAdd} />
                <button
                    type="button"
                    className={btnPrimary}
                    onClick={() => void handleAddTeacher()}
                >
                    Добавить преподавателя
                </button>

                <div className="mt-6 border-t border-primary/10 pt-5">
                    <label className={labelClass}>
                        Поиск преподавателя по ФИО
                    </label>
                    <input
                        type="search"
                        className={`${inputClass} mt-1`}
                        value={teacherSearchQuery}
                        onChange={(e) =>
                            handleTeacherSearchChange(e.target.value)
                        }
                        placeholder="Например: Петров"
                        autoComplete="off"
                    />

                    <div className="mt-3 space-y-2 max-h-52 overflow-auto rounded-lg border border-primary/10 p-1">
                        {teacherSearchQuery.trim() === "" ? (
                            <p className="p-3 text-caption text-text/50">
                                Введите часть ФИО, чтобы увидеть список.
                            </p>
                        ) : filteredTeachers.length === 0 ? (
                            <p className="p-3 text-caption text-text/50">
                                Ничего не найдено.
                            </p>
                        ) : (
                            filteredTeachers.map((t) => {
                                const active = selectedTeacher?.id === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setSelectedTeacher(t)}
                                        className={`w-full rounded-lg px-3 py-2.5 text-left transition-colors ${
                                            active
                                                ? "bg-accent/20 border border-accent/40"
                                                : "hover:bg-primary/10 border border-transparent"
                                        }`}
                                    >
                                        <div className="text-body font-medium text-text">
                                            {t.fullName}
                                        </div>
                                        <div className="text-caption text-text/55">
                                            {t.login}
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {selectedTeacher ? (
                        <div className="mt-4 rounded-xl border border-accent/25 bg-accent/5 p-4">
                            <p className="text-caption text-text/60 mb-1">
                                Выбрано
                            </p>
                            <p className="text-body font-semibold text-text">
                                {selectedTeacher.fullName}
                            </p>
                            <p className="text-caption text-text/55 mb-3">
                                {selectedTeacher.login}
                            </p>
                            <p className="text-caption text-text/50 mb-2">
                                Действия
                            </p>
                            <BlockNotice flash={flashes.teachersActions} />
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    className={btnGhost}
                                    onClick={() =>
                                        void handleChangeLogin(
                                            selectedTeacher.id,
                                            "teachersActions",
                                            selectedTeacher.login,
                                        )
                                    }
                                >
                                    Сменить логин
                                </button>
                                <button
                                    type="button"
                                    className={btnGhost}
                                    onClick={() =>
                                        void handleChangePassword(
                                            selectedTeacher.id,
                                            "teachersActions",
                                        )
                                    }
                                >
                                    Сменить пароль
                                </button>
                                <button
                                    type="button"
                                    className={btnDanger}
                                    onClick={() =>
                                        void handleDeleteTeacher(
                                            selectedTeacher.id,
                                        )
                                    }
                                >
                                    Удалить
                                </button>
                            </div>
                            <button
                                type="button"
                                className="mt-3 text-caption text-accent/90 hover:underline"
                                onClick={() => setSelectedTeacher(null)}
                            >
                                Снять выбор
                            </button>
                        </div>
                    ) : null}
                </div>

                {teachers.length === 0 ? (
                    <p className="mt-3 text-caption text-text/50">
                        В системе пока нет преподавателей.
                    </p>
                ) : null}
            </GlassCard>

            <GlassCard intensity="medium" className="p-4 md:p-5">
                <SectionTitle>Предметы</SectionTitle>
                <p className="text-caption text-text/60 mb-3">
                    Добавление — вверху. Чтобы изменить название, часы или
                    удалить предмет: найдите его по названию, нажмите на строку,
                    затем сохраните или удалите.
                </p>
                <BlockNotice flash={flashes.subjectsAdd} />
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end mb-6 pb-6 border-b border-primary/10">
                    <div className="flex-1">
                        <label className={labelClass}>Новый предмет</label>
                        <input
                            className={`${inputClass} mt-1`}
                            value={newSubjectName}
                            onChange={(e) => setNewSubjectName(e.target.value)}
                            placeholder="Название"
                        />
                    </div>
                    <div className="w-full sm:w-28">
                        <label className={labelClass}>Часы</label>
                        <input
                            className={`${inputClass} mt-1`}
                            value={newSubjectHours}
                            onChange={(e) => setNewSubjectHours(e.target.value)}
                            placeholder="72"
                        />
                    </div>
                    <button
                        type="button"
                        className={`${btnPrimary} h-[46px] w-full shrink-0 sm:w-auto`}
                        onClick={() => void handleAddSubject()}
                    >
                        Добавить
                    </button>
                </div>

                <label className={labelClass}>Поиск предмета по названию</label>
                <input
                    type="search"
                    className={`${inputClass} mt-1`}
                    value={subjectSearchQuery}
                    onChange={(e) => handleSubjectSearchChange(e.target.value)}
                    placeholder="Например: Математика"
                    autoComplete="off"
                />

                <div className="mt-3 space-y-2 max-h-52 overflow-auto rounded-lg border border-primary/10 p-1">
                    {subjectSearchQuery.trim() === "" ? (
                        <p className="p-3 text-caption text-text/50">
                            Введите часть названия, чтобы увидеть список.
                        </p>
                    ) : filteredSubjects.length === 0 ? (
                        <p className="p-3 text-caption text-text/50">
                            Ничего не найдено.
                        </p>
                    ) : (
                        filteredSubjects.map((sub) => {
                            const active = selectedSubject?.id === sub.id;
                            return (
                                <button
                                    key={sub.id}
                                    type="button"
                                    onClick={() => handleSubjectSelect(sub)}
                                    className={`w-full rounded-lg px-3 py-2.5 text-left transition-colors ${
                                        active
                                            ? "bg-accent/20 border border-accent/40"
                                            : "hover:bg-primary/10 border border-transparent"
                                    }`}
                                >
                                    <div className="text-body font-medium text-text">
                                        {sub.name}
                                    </div>
                                    <div className="text-caption text-text/55">
                                        {sub.total_hours != null
                                            ? `${sub.total_hours} ч.`
                                            : "часы не заданы"}
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>

                {selectedSubject ? (
                    <div className="mt-4 rounded-xl border border-accent/25 bg-accent/5 p-4">
                        <p className="text-caption text-text/60 mb-1">
                            Редактирование
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>Название</label>
                                <input
                                    className={`${inputClass} mt-1`}
                                    value={editSubjectName}
                                    onChange={(e) =>
                                        setEditSubjectName(e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Часы</label>
                                <input
                                    className={`${inputClass} mt-1`}
                                    value={editSubjectHours}
                                    onChange={(e) =>
                                        setEditSubjectHours(e.target.value)
                                    }
                                    placeholder="необязательно"
                                />
                            </div>
                        </div>
                        <BlockNotice flash={flashes.subjectsEdit} />
                        <div className="mt-3 flex flex-wrap gap-2">
                            <button
                                type="button"
                                className={btnPrimary}
                                onClick={() => void handleSaveSelectedSubject()}
                            >
                                Сохранить изменения
                            </button>
                            <button
                                type="button"
                                className={btnDanger}
                                onClick={() =>
                                    void handleDeleteSubject(selectedSubject.id)
                                }
                            >
                                Удалить предмет
                            </button>
                        </div>
                        <button
                            type="button"
                            className="mt-3 text-caption text-accent/90 hover:underline"
                            onClick={() => setSelectedSubject(null)}
                        >
                            Снять выбор
                        </button>
                    </div>
                ) : null}

                {subjects.length === 0 ? (
                    <p className="mt-3 text-caption text-text/50">
                        В системе пока нет предметов.
                    </p>
                ) : null}
            </GlassCard>

            <GlassCard
                intensity="medium"
                className="p-4 md:p-5 mb-6 scroll-mt-8 !overflow-visible"
            >
                <SectionTitle>Ваш аккаунт</SectionTitle>
                <p className="text-caption text-text/60 mb-4">
                    Смена логина и пароля для текущего администратора.
                </p>
                <BlockNotice flash={flashes.account} />
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap relative z-10 isolate">
                    <button
                        type="button"
                        className={btnAccount}
                        onClick={() => {
                            const u = getStoredUser();
                            if (u) {
                                void handleChangeLogin(u.userId, "account");
                            }
                        }}
                    >
                        Сменить свой логин
                    </button>
                    <button
                        type="button"
                        className={btnAccount}
                        onClick={() => {
                            const u = getStoredUser();
                            if (u) {
                                void handleChangePassword(u.userId, "account");
                            }
                        }}
                    >
                        Сменить свой пароль
                    </button>
                </div>
            </GlassCard>
        </div>
    );
}
