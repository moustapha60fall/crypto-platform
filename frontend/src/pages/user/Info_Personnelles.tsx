"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { userService } from "@/services/userService"
import type { AppUser } from "@/types/app-user"
import { useCurrentUser } from "@/hooks/useCurrentUser "

export default function Info_Personnelles() {
    // Récupère le profil utilisateur avec React Query
    const { data: user, isLoading, isError } = useCurrentUser()
    const [formData, setFormData] = useState<AppUser | null>(null)
    const [loading, setLoading] = useState(false)

    // Remplit le formulaire quand le user est disponible
    useEffect(() => {
        if (user) {
            setFormData({
                ...user,
            })
        }
    }, [user])

    const handleChange = (key: keyof AppUser, value: string) => {
        if (!formData) return
        setFormData((prev) => (prev ? { ...prev, [key]: value } : prev))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData) return
        try {
            setLoading(true)
            const updated = await userService.updateUser(formData.id, formData)
            toast.success(`Profil mis à jour : ${updated.firstName} ${updated.lastName}`)
        } catch (err) {
            console.error(err)
            toast.error("Erreur lors de la mise à jour du profil")
        } finally {
            setLoading(false)
        }
    }

    // États de chargement et d’erreur
    if (isLoading) {
        return <p className="text-center text-gray-500 py-8">Chargement du profil...</p>
    }

    if (isError || !formData) {
        return <p className="text-center text-red-500 py-8">Erreur lors du chargement du profil utilisateur.</p>
    }

    return (
        <Card className="border border-gray-300 shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800">
                    Informations personnelles
                </CardTitle>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5 text-sm">
                    {/* Civilité */}
                    <div className="space-y-1.5">
                        <Label>Civilité *</Label>
                        <Select
                            value={formData.civilite}
                            onValueChange={(value) => handleChange("civilite", value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choisir une civilité" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Monsieur">Monsieur</SelectItem>
                                <SelectItem value="Madame">Madame</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Nom / Prénom */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Nom *</Label>
                            <Input
                                value={formData.lastName}
                                onChange={(e) => handleChange("lastName", e.target.value)}
                                placeholder="Votre nom"
                                required
                            />
                        </div>
                        <div>
                            <Label>Prénom *</Label>
                            <Input
                                value={formData.firstName}
                                onChange={(e) => handleChange("firstName", e.target.value)}
                                placeholder="Votre prénom"
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <Label>Adresse e-mail</Label>
                        <Input
                            type="email"
                            value={formData.email ?? ""}
                            onChange={(e) => handleChange("email", e.target.value)}
                            placeholder="exemple@email.com"
                        />
                    </div>

                    {/* Téléphone */}
                    <div>
                        <Label>Téléphone mobile</Label>
                        <Input
                            type="tel"
                            value={formData.phoneNumber ?? ""}
                            onChange={(e) => handleChange("phoneNumber", e.target.value)}
                            placeholder="+221 77 123 45 67"
                        />
                    </div>

                    <div className="pt-2">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {loading ? "Enregistrement..." : "Valider"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

