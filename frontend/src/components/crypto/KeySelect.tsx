import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import type { KeyMaterial } from "@/types/key-material"
import type { UseFormReturn } from "react-hook-form"

interface KeySelectProps {
  keys: KeyMaterial[]
  form: UseFormReturn<any>
  fieldName: string
  label?: string
}

export default function KeySelect({ keys, form, fieldName, label = "Clé" }: KeySelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <Select
        onValueChange={(val) => form.setValue(fieldName, Number(val))}
        value={form.watch(fieldName)?.toString() || ""}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner une clé" />
        </SelectTrigger>
        <SelectContent>
          {Array.isArray(keys) && keys.length > 0 ? (
            keys.map((k) => (
              <SelectItem key={k.id} value={k.id.toString()}>
                {k.name} ({k.algorithm})
              </SelectItem>
            ))
          ) : (
            <div className="p-2 text-sm text-gray-500">Aucune clé disponible</div>
          )}
        </SelectContent>
      </Select>

      {/* ✅ accès correct aux erreurs */}
      {form.formState.errors[fieldName] && (
        <p className="text-red-500 text-sm">
          {String(form.formState.errors[fieldName]?.message)}
        </p>
      )}
    </div>
  )
}
