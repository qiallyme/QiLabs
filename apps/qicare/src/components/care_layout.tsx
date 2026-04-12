import React from "react";

export default function CareLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
            <main>
                {children}
            </main>
        </div>
    );
}
