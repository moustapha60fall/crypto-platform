"use client"

import HeroEleves from "@/components/HeroEleves";
import PillCard from "@/components/PillCard";
import { SectionADecouvrir } from "@/components/SectionADecouvrir";
import { SectionAdultes } from "@/components/SectionAdultes";
import SectionExplorer from "@/components/SectionExplorer";
import { getSectionWidth, navSections } from "@/data/data";

// 🔁 Rendu automatique des sections
const renderSection = (section: any) => (

    <section key={section.title}>
        <div className="mb-8">
            <div className="flex justify-left mb-2">
                <h2 className="text-3xl font-bold text-slate-800 text-left">
                    {section.title}
                </h2>
            </div>
        </div>
        <div
            className={`${getSectionWidth(
                section.title
            )} flex flex-wrap items-center justify-center gap-2 max-w-[75rem] mx-auto`}
        >
            {section.items.map((item: any, i: number) => (
                <PillCard key={i} {...item} />
            ))}
        </div>
    </section>
)

export default function HomePage() {
    return (
        <>
            <div className="min-h-screen bg-[#fcfcfc] text-slate-800">
                <HeroEleves />
                {/* Section flottante */}
                <div className="relative left-1/2 transform -translate-x-1/2 translate-y-[-2rem] w-full max-w-7xl">
                    <SectionExplorer />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-16">
                    {navSections.map((section) => renderSection(section))}
                    <SectionADecouvrir />
                    <SectionAdultes />
                </div>
            </div>
        </>
    )
}
