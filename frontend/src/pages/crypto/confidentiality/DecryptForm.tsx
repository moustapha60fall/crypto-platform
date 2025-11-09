import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import type { SymmetricCryptoDTO } from "@/types/symmetric"
import { useCurrentUser } from "@/hooks/useCurrentUser "
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { KeyMaterial } from "@/types/key-material"
import { CryptoService, getSymmetricKeysForCurrentUser } from "@/services/cryptoService"
import { SymmetricModes, type SymmetricMode } from "@/types/crypto"
import { resolvePadding } from "@/utils/cryptoUtils"
import { Textarea } from "@/components/ui/textarea"

const schema = z.object({
    keyRef: z.string().min(1, "Référence de clé requise"),
    outputData: z.string().min(1, "Données chiffrées requises"),
    mode: z.enum(Object.values(SymmetricModes) as [SymmetricMode, ...SymmetricMode[]]),
});

type FormValues = z.infer<typeof schema>;

export default function DecryptFormSymmetric() {
    const [input, setInput] = useState<string | null>(null);
    const [keys, setKeys] = useState<KeyMaterial[]>([]);
    const [selectedKey, setSelectedKey] = useState<KeyMaterial | null>(null);
    const { data: currentUser, isLoading, isError } = useCurrentUser();

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            keyRef: "",
            outputData: "",
            mode: SymmetricModes.CBC,
        },
    });

    useEffect(() => {
        getSymmetricKeysForCurrentUser()
            .then(setKeys)
            .catch(() => {
                toast.error("Impossible de charger les clés");
                setKeys([]);
            });
    }, []);

    const handleKeyChange = (keyRef: string) => {
        form.setValue("keyRef", keyRef);
        const found = keys.find((k) => k.keyRef === keyRef) ?? null;
        setSelectedKey(found);
    };

    const onSubmit = async (data: FormValues) => {
        if (!currentUser?.id) return toast.error("Utilisateur non chargé");
        if (!selectedKey) return toast.error("Clé symétrique invalide");

        try {
            const dto: SymmetricCryptoDTO = {
                keyRef: data.keyRef,
                outputData: data.outputData, // base64 déjà fourni
                performedById: currentUser.id,
                mode: data.mode,
                algorithm: selectedKey.algorithm,
                padding: resolvePadding(data.mode),
            };

            const response = await CryptoService.decryptSymmetric(dto);
            setInput(response.inputData ?? null);
            toast.success("Déchiffrement réussi");
        } catch (err: any) {
            console.error(err);

            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Erreur de déchiffrement";

            toast.error(msg);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <Card className="p-6 bg-[#fcfcfc] border border-[#c7c7cc] rounded shadow-[0_0_3px_1px_rgba(0,0,0,0.2)] space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center m-0">
                    🔓 Déchiffrement Symétrique
                </h2>

                {isLoading && <p className="text-gray-500">Chargement de l’utilisateur…</p>}
                {isError && <p className="text-red-500">Erreur de chargement utilisateur</p>}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                            control={form.control}
                            name="keyRef"
                            render={({ field }) => (
                                <FormItem className="bg-gray-50 p-4 bg-[#fcfcfc] dark:bg-[#1a1a1a] 
              border border-[#c7c7cc] dark:border-gray-700 
              rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                                    <FormLabel>Clé</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={handleKeyChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choisir une clé" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {keys.map((k) => (
                                                    <SelectItem key={k.keyRef} value={k.keyRef} className="focus:shadow-[0_0_3px_1px]">
                                                        {k.name} ({k.algorithm})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="mode"
                            render={({ field }) => (
                                <FormItem className="bg-gray-50 p-4 bg-[#fcfcfc] dark:bg-[#1a1a1a] 
              border border-[#c7c7cc] dark:border-gray-700 
              rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                                    <FormLabel>Mode</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choisir le mode" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(SymmetricModes).map((m) => (
                                                    <SelectItem key={m} value={m} className="focus:shadow-[0_0_3px_1px]">
                                                        {m}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormDescription>
                                        Padding attendu : <code>{resolvePadding(form.watch("mode"))}</code>
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="outputData"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2 bg-gray-50 p-4 bg-[#fcfcfc] dark:bg-[#1a1a1a] 
              border border-[#c7c7cc] dark:border-gray-700 
              rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                                    <FormLabel>Données chiffrées (base64)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Base64 à déchiffrer"
                                            inputMode="text"
                                            autoComplete="off"
                                            className="focus:shadow-[0_0_3px_1px]"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="md:col-span-2 py-2 px-4 rounded transition"
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting ? "⏳ Déchiffrement…" : "Déchiffrer"}
                        </Button>
                    </form>
                </Form>

                {input && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-green-100 dark:bg-[#1a1a1a] shadow-[0_0_3px_1px] p-3 rounded-lg text-sm space-y-2"
                    >
                        <strong>Résultat déchiffré :</strong>
                        <div className="dark:bg-[#1a1a1a] shadow-[0_0_3px_1px] text-gray-800 whitespace-pre-wrap break-words max-h-26 overflow-y-auto p-1.25 mt-1 bg-white rounded">
                            {input}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    navigator.clipboard.writeText(input);
                                    toast.success("Copiée");
                                }}
                                className="mt-2 bg-[#fcfcfc] dark:bg-[#1a1a1a] shadow-[0_0_3px_1px]"
                            >
                                Copier
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    const blob = new Blob([input], { type: "text/plain" });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement("a");
                                    a.href = url;
                                    a.download = "dechiffrement.txt";
                                    a.click();
                                    URL.revokeObjectURL(url);
                                }}
                                className="mt-2 bg-[#fcfcfc] dark:bg-[#1a1a1a] shadow-[0_0_3px_1px]"
                            >
                                Télécharger
                            </Button>
                        </div>
                    </motion.div>
                )}
            </Card>
        </motion.div>
    );

}
