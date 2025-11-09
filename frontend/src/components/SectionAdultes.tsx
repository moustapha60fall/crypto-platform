"use client";

import { Link } from "react-router-dom";
import { ArrowRightCircle } from "lucide-react";

export function SectionAdultes() {
    return (
        <section className="mt-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bloc Services cryptographiques */}
                <Link
                    to="/crypto"
                    className="bg-green-300 text-white rounded-xl p-6 flex items-center justify-between hover:bg-green-200 transition group"
                >
                    <div className="flex flex-col gap-2">
                        <span className="text-2xl font-bold">Explorer les services</span>
                        <span className="text-sm opacity-80">
                            Confidentialité, Intégrité, Authenticité, Non-répudiation
                        </span>
                    </div>
                    <ArrowRightCircle className="w-8 h-8 text-white group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Bloc Espace utilisateur */}
                <Link
                    to="/user"
                    className="bg-green-300 text-white rounded-xl p-6 flex items-center justify-between hover:bg-green-200 transition group"
                >
                    <div className="flex flex-col gap-2">
                        <span className="text-2xl font-bold">Mon espace personnel</span>
                        <span className="text-sm opacity-80">
                            Suivez vos clés, opérations et progression
                        </span>
                    </div>
                    <ArrowRightCircle className="w-8 h-8 text-white group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </section>
    );
}
