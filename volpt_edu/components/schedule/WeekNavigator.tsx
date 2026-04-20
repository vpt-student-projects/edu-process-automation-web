import { ChevronLeft, ChevronRight } from "lucide-react";
import GlassCard from "@/components/GlassCard";

interface Props {
    weekRange: string;
    onPrev: () => void;
    onNext: () => void;
}

export function WeekNavigator({ weekRange, onPrev, onNext }: Props) {
    return (
        <GlassCard className="!rounded-full" intensity="low">
            <div className="flex items-center gap-2 p-2 px-2">
                <button
                    onClick={onPrev}
                    className="p-2 rounded-full hover:bg-primary/10 transition-colors"
                >
                    <ChevronLeft className="text-text w-5 h-5" />
                </button>
                <span className="text-text text-body font-medium text-center tracking-wide whitespace-nowrap">
                    {weekRange}
                </span>
                <button
                    onClick={onNext}
                    className="p-2 rounded-full hover:bg-primary/10 transition-colors"
                >
                    <ChevronRight className="text-text w-5 h-5" />
                </button>
            </div>
        </GlassCard>
    );
}
