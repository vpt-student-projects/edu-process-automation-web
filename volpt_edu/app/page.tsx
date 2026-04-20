import LandingPage from "@/components/LandingPage";
import LoginPage from "@/components/LoginPage";

export default function AuthSplitPage() {
    return (
        // Контейнер на весь экран, разделенный на две колонки
        <main className="min-h-screen flex flex-col md:flex-row">
            <section className="md:w-2/3 w-full min-h-screen flex border-b md:border-b-0 md:border-r border-primary/10">
                <LandingPage />
            </section>

            <section className="w-full min-h-screen md:w-1/3 flex justify-center p-2 md:p-12">
                <LoginPage />
            </section>
        </main>
    );
}
