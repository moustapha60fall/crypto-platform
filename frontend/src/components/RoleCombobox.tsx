"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import type { RoleResponse } from "@/types/role-response"

type RoleComboboxProps = {
    availableRoles: RoleResponse[]
    currentRoles: RoleResponse[]
    onUpdate: (roles: RoleResponse[]) => void
}

export default function RoleCombobox({
    availableRoles,
    currentRoles,
    onUpdate,
}: RoleComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [selectedRoles, setSelectedRoles] = React.useState<RoleResponse[]>(currentRoles)

    const toggleRole = (role: RoleResponse) => {
        setSelectedRoles((prev) =>
            prev.some((r) => r.idRole === role.idRole)
                ? prev.filter((r) => r.idRole !== role.idRole)
                : [...prev, role]
        )
    }

    const displayText =
        selectedRoles.length > 0
            ? selectedRoles.map((r) => r.nomRole).join(", ")
            : "Sélectionner les rôles..."

    return (
        <div className="space-y-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[250px] justify-between"
                    >
                        {displayText}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0">
                    <Command>
                        <CommandInput placeholder="Rechercher un rôle..." />
                        <CommandList>
                            <CommandEmpty>Aucun rôle trouvé.</CommandEmpty>
                            <CommandGroup>
                                {availableRoles.map((role) => (
                                    <CommandItem
                                        key={role.idRole}
                                        value={role.nomRole}
                                        onSelect={() => toggleRole(role)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedRoles.some((r) => r.idRole === role.idRole)
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                        {role.nomRole}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            <Button
                onClick={() => onUpdate(selectedRoles)}
                className="w-[250px]"
                variant="default"
            >
                Mettre à jour les rôles
            </Button>
        </div>
    )
}
