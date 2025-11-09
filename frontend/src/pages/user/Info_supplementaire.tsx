import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { userService } from "@/services/userService"
import { toast } from "sonner"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useCurrentUser } from "@/hooks/useCurrentUser "

const schema = z.object({
    address: z.string().optional(),
    nomVille: z.string().optional(),
    nomRegion: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function Info_supplementaire() {
    const { data: user, isLoading } = useCurrentUser()

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            address: "",
            nomVille: "",
            nomRegion: "",
        },
    })

    useEffect(() => {
        if (user) {
            form.reset({
                address: user.address ?? "",
                nomVille: user.nomVille ?? "",
                nomRegion: user.nomRegion ?? "",
            })
        }
    }, [user, form])

    const onSubmit = async (values: FormValues) => {
        if (!user?.id) return toast.error("Utilisateur non disponible")

        try {
            const updated = await userService.updateUser(user.id, {
                ...user,
                ...values,
            })
            toast.success("Profil mis à jour")
            form.reset({
                address: updated.address ?? "",
                nomVille: updated.nomVille ?? "",
                nomRegion: updated.nomRegion ?? "",
            })

        } catch (err: any) {
            console.error(err)
            toast.error("Erreur lors de la mise à jour")
        }
    }

    if (isLoading) return <p className="text-gray-500">Chargement…</p>

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Adresse, Ville, Région */}
                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Adresse</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Adresse postale" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="nomVille"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ville</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Ville" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="nomRegion"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Région</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Région" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="mt-4">
                    Enregistrer les modifications
                </Button>
            </form>
        </Form>
    )
}
