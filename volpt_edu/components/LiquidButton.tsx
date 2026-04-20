import React from "react";

interface LiquidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost";
    fullWidth?: boolean;
}

const LiquidButton: React.FC<LiquidButtonProps> = ({
    children,
    variant = "primary",
    fullWidth = false,
    className = "",
    ...props
}) => {
    const baseClasses =
        "relative px-6 py-3 rounded-full font-semibold transition-colors duration-200 flex items-center justify-center gap-2 overflow-hidden";

    const variants = {
        primary:
            "bg-white text-text hover:bg-accent hover:text-white border border-transparent",
        secondary:
            "bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-md",
        ghost: "bg-transparent text-white/80 hover:text-white hover:bg-white/5",
    };

    return (
        <button
            className={`${baseClasses} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
            {...props}
        >
            <span className="relative z-20 flex items-center gap-2">
                {children}
            </span>
        </button>
    );
};

export default LiquidButton;
