"use client"

import { useEffect, useState } from "react"
import { userService } from "@/services/userService"
import { CleService } from "@/services/cle-service"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"

import type { KeyMaterial } from "@/types/key-material"
import type { AppUser } from "@/types/app-user"
import type { KeyShareDTO } from "@/types/Key-share"
import { useCurrentUser } from "@/hooks/useCurrentUser "

export default function ShareKeyPage() {
    const [users, setUsers] = useState<AppUser[]>([])
    const [keys, setKeys] = useState<KeyMaterial[]>([])
    const [selectedUser, setSelectedUser] = useState<string | null>(null)
    const [selectedKey, setSelectedKey] = useState<number | null>(null)
    const [openUser, setOpenUser] = useState(false)
    const [openKey, setOpenKey] = useState(false)
    const { data: currentUser, isLoading, isError } = useCurrentUser();

    // Charger utilisateurs et clés
    useEffect(() => {
        userService
            .getAllUsers(0, 50)
            .then((data: AppUser[]) => setUsers(data))
            .catch(() => toast.error("Erreur lors du chargement des utilisateurs."))

        CleService.getAllKeys()
            .then((data: KeyMaterial[]) => setKeys(data))
            .catch(() => toast.error("Erreur lors du chargement des clés."))
    }, [])

    // Partage de clé
    const handleShare = async () => {
        // Vérification basique
        if (!selectedUser || !selectedKey) {
            toast.error("Veuillez sélectionner une clé et un utilisateur.")
            return
        }

        // Vérifier que l’utilisateur courant est bien chargé
        if (isLoading) {
            toast.info("Chargement des informations utilisateur…")
            return
        }

        if (isError || !currentUser) {
            toast.error("Impossible de récupérer les informations de l’utilisateur connecté.")
            return
        }

        try {
            // 🔐 Construire le DTO proprement
            const shareDto: KeyShareDTO = {
                keyMaterialId: selectedKey,
                sharedByUserId: currentUser.id,
                sharedWithUserId: selectedUser,
            }

            await CleService.shareKey(shareDto)
            toast.success("Clé partagée avec succès")

            // Réinitialiser les sélections
            setSelectedUser(null)
            setSelectedKey(null)
        } catch (err) {
            console.error(err)
            toast.error("Erreur lors du partage de la clé.")
        }
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">🔗 Partager une clé</h2>

            <Card className="p-6 space-y-4">
                {/* Sélection de clé */}
                <div>
                    <label className="block font-medium mb-2">Sélectionner une clé :</label>
                    <Popover open={openKey} onOpenChange={setOpenKey}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openKey}
                                className="w-full justify-between"
                            >
                                {selectedKey
                                    ? keys.find((k) => k.id === selectedKey)?.name
                                    : "Choisir une clé..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                            <Command>
                                <CommandInput placeholder="Rechercher une clé..." />
                                <CommandList>
                                    <CommandEmpty>Aucune clé trouvée.</CommandEmpty>
                                    <CommandGroup>
                                        {keys.map((key) => (
                                            <CommandItem
                                                key={key.id}
                                                value={String(key.id)}
                                                onSelect={() => {
                                                    setSelectedKey(key.id)
                                                    setOpenKey(false)
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedKey === key.id ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {key.name} — {key.algorithm}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Sélection d’utilisateur */}
                <div>
                    <label className="block font-medium mb-2">Sélectionner un utilisateur :</label>
                    <Popover open={openUser} onOpenChange={setOpenUser}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openUser}
                                className="w-full justify-between"
                            >
                                {selectedUser
                                    ? users.find((u) => u.id === selectedUser)?.username
                                    : "Choisir un utilisateur..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                            <Command>
                                <CommandInput placeholder="Rechercher un utilisateur..." />
                                <CommandList>
                                    <CommandEmpty>Aucun utilisateur trouvé.</CommandEmpty>
                                    <CommandGroup>
                                        {users.map((user) => (
                                            <CommandItem
                                                key={user.id}
                                                value={user.id}
                                                onSelect={() => {
                                                    setSelectedUser(user.id)
                                                    setOpenUser(false)
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedUser === user.id ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {user.username} ({user.firstName} {user.lastName})
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Bouton de partage */}
                <Button
                    onClick={handleShare}
                    variant="default"
                    className="w-full mt-2"
                    disabled={!selectedUser || !selectedKey}
                >
                    Partager la clé
                </Button>
            </Card>
        </div>
    )
}
