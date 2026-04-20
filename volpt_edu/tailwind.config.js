/** @type {import('tailwindcss').Config} */

const config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./views/**/*.{js,ts,jsx,tsx,mdx}",
        "./types/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontSize: {
                h1: ["40px", { lineHeight: "48px", fontWeight: "700" }],
                h2: ["32px", { lineHeight: "40px", fontWeight: "700" }],
                h3: ["30px", { lineHeight: "36px", fontWeight: "700" }],
                h4: ["24px", { lineHeight: "32px", fontWeight: "600" }],
                h5: ["20px", { lineHeight: "28px", fontWeight: "600" }],
                h6: ["16px", { lineHeight: "24px", fontWeight: "600" }],

                "body-lg": ["18px", { lineHeight: "28px" }],
                body: ["16px", { lineHeight: "24px" }],
                "body-sm": ["14px", { lineHeight: "20px" }],
                caption: ["12px", { lineHeight: "16px" }],
            },
            fontFamily: {
                font: [
                    "Inter",
                    "Noto Sans Arabic",
                    "Roobert",
                    "Helvetica Neue",
                    "Helvetica",
                    "Arial",
                    "sans-serif",
                ],
                display: [
                    "Roobert",
                    "Tajawal",
                    "Inter",
                    "Helvetica Neue",
                    "Helvetica",
                    "Arial",
                    "sans-serif",
                ],
            },
            colors: {
                glass: {
                    100: "rgba(255, 255, 255, 0.1)",
                    200: "rgba(255, 255, 255, 0.2)",
                    300: "rgba(255, 255, 255, 0.3)",
                    border: "rgba(255, 255, 255, 0.4)",
                    text: "rgba(0, 0, 0, 0.8)",
                    textMuted: "rgba(0, 0, 0, 0.6)",
                },
                text: "#050f1a",
                background: "#ebeff4",
                primary: "#3E5062",
                secondary: "#273340",
                accent: "#297DD6",
            },

            backgroundImage: {
                aurora: "linear-gradient(125deg, #FF9A9E 0%, #FECFEF 20%, #E0C3FC 40%, #8EC5FC 60%, #E0C3FC 80%, #ffffff 100%)",
                "liquid-blob":
                    "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4), transparent 70%)",
            },
            animation: {
                float: "float 6s ease-in-out infinite",
                blob: "blob 10s infinite",
            },
            keyframes: {
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" },
                },
                blob: {
                    "0%": { transform: "translate(0px, 0px) scale(1)" },
                    "33%": { transform: "translate(30px, -50px) scale(1.1)" },
                    "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
                    "100%": { transform: "translate(0px, 0px) scale(1)" },
                },
            },
        },
    },
    plugins: [],
};
export default config;
