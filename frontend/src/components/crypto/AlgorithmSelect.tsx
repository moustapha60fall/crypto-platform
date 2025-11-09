// src/components/common/AlgorithmSelect.tsx
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { UseFormReturn } from "react-hook-form"
import { CryptoAlgorithms, type CryptoAlgorithm } from "@/types/crypto"

type AlgorithmVariant = "hash" | "signature" | "mac" | "all"

interface AlgorithmSelectProps {
    form: UseFormReturn<any>
    name: string
    label?: string
    variant?: AlgorithmVariant
}

export default function AlgorithmSelect({
    form,
    name,
    label = "Algorithme",
    variant = "all",
}: AlgorithmSelectProps) {
    const value = form.watch(name)

    // Filtrage selon le variant
    const filteredAlgorithms = Object.values(CryptoAlgorithms).filter((algo) => {
        switch (variant) {
            case "hash":
                return algo.startsWith("SHA") || algo.startsWith("MD") // exemple
            case "signature":
                return algo.includes("RSA") || algo.includes("ECDSA")
            case "mac":
                return algo.includes("HMAC")
            case "all":
            default:
                return true
        }
    })

    return (
        <div>
            <Label htmlFor={name}>{label}</Label>
            <Select
                value={value}
                onValueChange={(val) => form.setValue(name, val as CryptoAlgorithm)}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Choisir un algorithme" />
                </SelectTrigger>
                <SelectContent>
                    {filteredAlgorithms.map((algo) => (
                        <SelectItem key={algo} value={algo}>
                            {algo}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {form.formState.errors[name] && (
                <p className="text-sm text-red-500">
                    {String(form.formState.errors[name]?.message)}
                </p>
            )}
        </div>
    )
}
