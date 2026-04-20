"use client";

type PageStateVariant = "empty" | "error";

interface Props {
    title: string;
    description: string;
    variant?: PageStateVariant;
    className?: string;
}

export function PageState({
    title,
    description,
    variant = "empty",
    className = "",
}: Props) {
    const tone =
        variant === "error"
            ? "border-red-400/20 bg-red-500/10 text-red-100"
            : "border-primary/20 bg-primary/10 text-text/90";

    return (
        <div
            className={`rounded-2xl border px-6 py-10 text-center backdrop-blur-md ${tone} ${className}`}
        >
            <h3 className="text-h4 mb-2">{title}</h3>
            <p className="text-body text-text/80">{description}</p>
        </div>
    );
}
