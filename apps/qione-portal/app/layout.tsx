import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
    title: "QiOne Portal | Intelligence-First Workspace",
    description: "Advanced multi-tenant portal powered by QiLabs. Registry-driven, config-driven, and contract-first.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
            <body className="antialiased selection:bg-blue-600 selection:text-white">
                {children}
            </body>
        </html>
    );
}
