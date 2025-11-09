"use client"

import { NavLink } from "react-router-dom"
import avatarImg from "@/assets/admin.jpg"
import spriteImg from "@/assets/sprite.png"
import epImg from "@/assets/ep.png"

type CryptoNavProps = {
  service:
  | "confidentiality"
  | "integrity"
  | "authenticity"
  | "non-repudiation"
  | "keys"
  | "algorithmes"
}

const navConfig: Record<CryptoNavProps["service"], { to: string; label: string }[]> = {
  confidentiality: [
    { to: "pair", label: "Opération Asymétrique" },
    { to: "aes", label: "Opération Symétrique" },
    { to: "wrap", label: "Enveloppement de Clé" },
    { to: "unwrap", label: "Désenveloppement de Clé" }
  ],
  integrity: [
    { to: "hash", label: "Hachage sans Clé" },
    { to: "hmac", label: "Hachage avec Clé" },
  ],
  authenticity: [
    { to: "sign", label: "Signature" },
    { to: "verify", label: "Vérification" },
  ],
  "non-repudiation": [
    { to: "audit", label: "Audit Logs" },
    { to: "timestamp", label: "Timestamp" },
    { to: "pki", label: "PKI" },
  ],
  keys: [
    { to: "list", label: "Liste des clés" },
    { to: "generate", label: "Générer une clés" },
    { to: "shared", label: "Partages de clés"}
  ],
  algorithmes: [
    { to: "", label: "Algorithmes supportés", },
    { to: "nouveau", label: "Ajouter un algorithme", },
  ],
}

export default function CryptoNav({ service }: CryptoNavProps) {
  const items = navConfig[service]

  return (
    <aside className="w-full max-w-[240px] space-y-4">
      {/* Avatar */}
      <div className="bg-[#fcfcfc] border border-[#c7c7cc] rounded-[3px] shadow-[0_0_3px_1px] h-[168px] mb-[10px] flex items-center justify-center relative">
        <div className="w-[145px] h-[145px] absolute flex items-center justify-center border-[3px] border-[#c7c7cc] bg-[#fcfcfc] rounded-full">
          <img
            src={avatarImg}
            alt="Avatar administrateur"
            className="w-[135px] h-[135px] rounded-full"
          />
        </div>
      </div>
      {/* Menu */}
      <nav className="border border-[#c7c7cc] shadow-[0_0_3px_1px] rounded overflow-hidden w-full">
        <ul className="m-0 p-0 list-none">
          {items.map(({ to, label }) => {
            const fullPath = `/crypto/${service}/${to}`
            return (
              <li key={to}>
                <NavLink to={fullPath}>
                  {({ isActive }) => (
                    <div
                      className={`relative flex items-center pl-5 pr-4 text-[0.938em] font-semibold min-h-[60px] leading-[60px] border-b border-[#c7c7cc] transition ${isActive
                        ? "bg-[#fcfcfc] text-[#373b3f]"
                        : "bg-[#27ccc3] text-[#fcfcfc] hover:bg-[#fcfcfc] hover:text-[#373b3f]"
                        }`}
                    >
                      <span>{label}</span>
                      {isActive && (
                        <span
                          className="absolute top-[24px] right-[15px] w-[12px] h-[17px] block"
                          style={{
                            backgroundImage: `url(${spriteImg})`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "-910px -121px",
                          }}
                        />
                      )}
                    </div>
                  )}
                </NavLink>
              </li>
            )
          })}
          {/* Bloc fixe */}
          <li className="bg-[#373b3f] h-[60px] flex items-center justify-between px-5">
            <span className="text-[#fcfcfc] font-semibold text-sm text-shadow-[1px_1px_1px_#131313]">
              Info Utilisateurs
            </span>
            <div className="flex gap-2">
              <NavLink
                to="/admin"
                className="w-[57px] h-[60px] block border-l border-[#fcfcfc]"
                style={{
                  backgroundImage: `url(${epImg})`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "-87px 5px",
                }}
              />
            </div>
          </li>
        </ul>
      </nav>
    </aside>
  )
}
