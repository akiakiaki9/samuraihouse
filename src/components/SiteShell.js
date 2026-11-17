"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";

export default function SiteShell({ children }) {
    const pathname = usePathname();
    const isLinksPage = pathname === "/links";

    return (
        <>
            {!isLinksPage && (
                <>
                    <Header />
                    <Navbar />
                </>
            )}

            {children}
        </>
    );
}