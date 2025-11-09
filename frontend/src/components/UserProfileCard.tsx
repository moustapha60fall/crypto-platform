"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { Check, X } from "lucide-react"
import { Link } from "react-router-dom"
import type { ReactNode } from "react"


type Props = {
    utilisateurdetail: {
        lastName: string
        firstName: string
        email: string
        sessionStart: string
        imageProfil?: string
        emailVerified?: boolean
        dateBirthday?: string
        civiliteProfil?: string
        addressProfil?: string
        phoneNumber?: string
        nomVille?: string
        nomRegion?: string
        etesLogee?: boolean
        blogPosts?: boolean
        newsletter?: boolean
    }
}


export default function UserProfileCard({ utilisateurdetail }: Props) {
    const {
        lastName,
        firstName,
        email,
        sessionStart,
        imageProfil,
        emailVerified,
        dateBirthday,
        civiliteProfil,
        addressProfil,
        phoneNumber,
        nomVille,
        nomRegion,
        etesLogee,
        blogPosts,
        newsletter,
    } = utilisateurdetail

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <Card className="p-6 shadow-md">
                <CardHeader className="flex justify-between items-center mb-4">
                    <div>
                        <CardTitle className="text-xl font-bold">
                            {lastName} {firstName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{email}</p>
                    </div>
                    <div className="text-sm font-medium">
                        Session commencée : {sessionStart}
                    </div>
                </CardHeader>

                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    <div className="flex justify-center">
                        <Avatar className="w-[120px] h-[120px]">
                            <AvatarImage
                                src={
                                    imageProfil
                                        ? `http://localhost:8082/api/v1/utilisateurs/image/${imageProfil}`
                                        : "/assets/images/chapeau-de-diplômé.jpg"
                                }
                                alt="Photo de profil"
                            />
                            <AvatarFallback>👤</AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="md:col-span-2">
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-muted">
                                <InfoRow label="Email vérifié" value={emailVerified} />
                                <InfoRow label="Date de naissance" value={dateBirthday} />
                                <InfoRow label="Civilité" value={civiliteProfil} />
                                <InfoRow label="Adresse" value={addressProfil} />
                                <InfoRow
                                    label="Email"
                                    value={
                                        <a href={`mailto:${email}`} className="text-blue-600 underline">
                                            {email}
                                        </a>
                                    }
                                />
                                <InfoRow label="Téléphone" value={phoneNumber} />
                                <InfoRow label="Ville" value={nomVille} />
                                <InfoRow label="Région" value={nomRegion} />
                                <InfoRow label="Logée" value={etesLogee} />
                                <InfoRow label="Blog Posts" value={blogPosts} />
                                <InfoRow label="Newsletter" value={newsletter} />
                            </tbody>
                        </table>

                        <div className="mt-6 flex gap-4">
                            <Button asChild>
                                <Link to="#">Mon activité</Link>
                            </Button>
                            <Button asChild variant="secondary">
                                <Link to="#">Statistiques</Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: string | boolean | ReactNode | undefined
}) {
  const isBoolean = typeof value === "boolean"
  return (
    <tr>
      <td className="py-2 font-medium text-muted-foreground">{label} :</td>
      <td className="py-2">
        {isBoolean ? (
          value ? (
            <Badge variant="default" className="bg-green-500 text-white flex items-center gap-1">
              <Check className="w-4 h-4" /> Oui
            </Badge>
          ) : (
            <Badge variant="destructive" className="flex items-center gap-1">
              <X className="w-4 h-4" /> Non
            </Badge>
          )
        ) : (
          value || "—"
        )}
      </td>
    </tr>
  )
}

