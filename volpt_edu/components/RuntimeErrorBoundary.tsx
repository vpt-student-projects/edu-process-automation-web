"use client";

import React from "react";
import { reportRuntimeError } from "@/lib/monitoring/runtimeMonitor";
import { PageState } from "@/components/shared/PageState";

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
}

export class RuntimeErrorBoundary extends React.Component<Props, State> {
    state: State = { hasError: false };

    componentDidMount() {
        window.addEventListener("unhandledrejection", this.onUnhandledRejection);
        window.addEventListener("error", this.onWindowError);
    }

    componentWillUnmount() {
        window.removeEventListener(
            "unhandledrejection",
            this.onUnhandledRejection,
        );
        window.removeEventListener("error", this.onWindowError);
    }

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error) {
        void reportRuntimeError({
            message: error.message,
            stack: error.stack,
            context: { source: "react-error-boundary" },
        });
    }

    onUnhandledRejection = (event: PromiseRejectionEvent) => {
        void reportRuntimeError({
            message:
                event.reason instanceof Error
                    ? event.reason.message
                    : String(event.reason),
            stack: event.reason instanceof Error ? event.reason.stack : undefined,
            context: { source: "unhandledrejection" },
        });
    };

    onWindowError = (event: ErrorEvent) => {
        void reportRuntimeError({
            message: event.message,
            stack: event.error?.stack,
            context: { source: "window-error" },
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4">
                    <PageState
                        variant="error"
                        title="Произошла ошибка интерфейса"
                        description="Мы уже получили технический отчёт. Обновите страницу и попробуйте снова."
                    />
                </div>
            );
        }

        return this.props.children;
    }
}
