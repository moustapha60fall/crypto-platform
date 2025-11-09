"use client"

import { useLocation } from "react-router-dom"
import { SlashIcon } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Link } from "react-router-dom"
import React from "react"

// 🔍 Alias lisibles pour les segments
const labelMap: Record<string, string> = {
  crypto: "Cryptographie",
  confidentiality: "Confidentialité",
  integrity: "Intégrité",
  authenticity: "Authenticité",
  "non-repudiation": "Non-Répudiation",
  keys: "Gestion des clés",
  algorithmes: "Algorithmes",
  file: "Fichier",
  operation: "Opération",
  pbe: "Dérivation PBE",
  hash: "Hash",
  hmac: "HMAC",
  "hash-page": "Vue combinée",
  sign: "Signature",
  verify: "Vérification",
  list: "Liste",
  manage: "Gestion",
  generate: "Générer",
  aes: "AES",
  pair: "RSA/ECC",
  audit: "Audit",
  timestamp: "Timestamp",
  pki: "PKI",
}

export default function CryptoBreadcrumb() {
  const location = useLocation()
  const segments = location.pathname.split("/").filter(Boolean)

  // Ne pas afficher sur la racine
  if (segments.length === 0 || segments[0] !== "crypto") return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Accueil */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">Accueil</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Séparateur après Accueil */}
        <BreadcrumbSeparator>
          <SlashIcon className="w-4 h-4" />
        </BreadcrumbSeparator>

        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/")
          const label = labelMap[segment] || segment
          const isLast = index === segments.length - 1

          return (
            <React.Fragment key={href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={href}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {!isLast && (
                <BreadcrumbSeparator>
                  <SlashIcon className="w-4 h-4" />
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
