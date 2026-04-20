import React, { ReactNode } from "react";

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    intensity?: "low" | "medium" | "high";
    onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className = "",
    intensity = "medium",
    onClick,
}) => {
    // Config for different glass depths
    const intensityStyles = {
        low: {
            bg: "bg-primary/[0.05]",
            blur: "backdrop-blur-md",
            border: "border-primary/[0.1]",
            shadow: "shadow-sm",
        },
        medium: {
            bg: "bg-primary/[0.08]",
            blur: "backdrop-blur-xl",
            border: "border-primary/[0.15]",
            shadow: "shadow-md",
        },
        high: {
            bg: "bg-primary/[0.12]",
            blur: "backdrop-blur-2xl",
            border: "border-primary/[0.2]",
            shadow: "shadow-lg",
        },
    };

    const current = intensityStyles[intensity];

    const baseClasses = `
    relative
    rounded-[2rem]
    border
    transition-colors duration-200 ease-out
    overflow-hidden
  `;

    // Removed the complex inner box-shadows for a flatter, cleaner look
    const interactiveClasses = onClick
        ? "cursor-pointer hover:bg-white/[0.15]"
        : "";

    return (
        <div
            className={`
        ${baseClasses}
        ${current.bg}
        ${current.blur}
        ${current.border}
        ${current.shadow}
        ${interactiveClasses}
        ${className}
      `}
            onClick={onClick}
        >
            <div className=" h-full w-full relative z-10">{children}</div>
        </div>
    );
};

export default GlassCard;
