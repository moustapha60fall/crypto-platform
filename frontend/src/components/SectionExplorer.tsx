"use client";

import { explorerSection } from "@/data/data";
import { NavLink } from "react-router-dom";

export default function SectionExplorer() {
    return (
        <section className="relative w-full max-w-5xl mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-[75rem] mx-auto">
                {explorerSection.items.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className="w-[20rem] block focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl"
                    >
                        <div
                            className="p-2 rounded-full bg-green-50 hover:scale-[1.02] transition-transform duration-300 ease-out"
                            style={{
                                borderLeft: `6px solid ${item.color}`,
                                borderBottom: `3px solid ${item.color}`,
                                borderRight: `6px solid ${item.color}`,
                                borderTop: `3px solid ${item.color}`,
                            }}
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className="flex items-center justify-center rounded-full"
                                    style={{
                                        backgroundColor: item.color,
                                        width: "3rem",
                                        height: "3rem",
                                    }}
                                >
                                    <item.icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <span className="block text-lg font-semibold text-slate-800">
                                        {item.title}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </NavLink>
                ))}
            </div>
        </section>
    );
}
