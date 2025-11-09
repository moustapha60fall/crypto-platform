import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { CryptoService, getASymmetricKeysPubForCurrentUser, getSymmetricKeysForCurrentUser } from "@/services/cryptoService";
import { CryptoAlgorithms, PaddingTypes } from "@/types/crypto";
import type { KeyMaterial } from "@/types/key-material";
import { useCurrentUser } from "@/hooks/useCurrentUser ";
import type { WrappedKeyDTO } from "@/types/wrapped-key";

// ====================================
// Schéma du formulaire
// ====================================
const schema = z.object({
    wrappingKeyRef: z.string().min(1, "Clé RSA publique requise"),
    targetKeyRef: z.string().min(1, "Clé AES à envelopper requise"),
    algorithm: z.literal(CryptoAlgorithms.RSA),
    padding: z.enum([PaddingTypes.OAEP, PaddingTypes.PKCS1_V1_5, PaddingTypes.NONE]),
});

type FormValues = z.infer<typeof schema>;

// ====================================
// Composant principal Asys → Sys
// ====================================
export default function WrappingAsysSysForm() {
    const [wrappedKey, setWrappedKey] = useState<string | null>(null);
    const [symmetricKeys, setSymmetricKeys] = useState<KeyMaterial[]>([]);
    const [publicKeys, setPublicKeys] = useState<KeyMaterial[]>([]);
    const { data: currentUser, isLoading, isError } = useCurrentUser();

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            wrappingKeyRef: "",
            targetKeyRef: "",
            algorithm: CryptoAlgorithms.RSA,
            padding: PaddingTypes.OAEP,
        },
    });

    // Charger les clés
    useEffect(() => {
        getSymmetricKeysForCurrentUser()
            .then(setSymmetricKeys)
            .catch(() => toast.error("Erreur chargement clés AES"));
        getASymmetricKeysPubForCurrentUser()
            .then(setPublicKeys)
            .catch(() => toast.error("Erreur chargement clés RSA"));
    }, []);

    // Soumission
    const onSubmit = async (data: FormValues) => {
        if (!currentUser?.id) return toast.error("Utilisateur non disponible");

        try {
            const dto: WrappedKeyDTO = {
                algorithm: data.algorithm,
                padding: data.padding,
                wrappingKeyRef: data.wrappingKeyRef,
                targetKeyRef: data.targetKeyRef,
                targetKeyType: "SECRET_KEY",
                performedById: currentUser.id,
            };

            console.log("Données envoyées pour enveloppement :", dto);

            const result = await CryptoService.wrapKey(dto);
            setWrappedKey(result.wrappedKeyBase64 ?? null);
            toast.success("Clé AES enveloppée avec succès par clé RSA");
        } catch (err: any) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Erreur lors de l’enveloppement");
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
                    🔒 Enveloppement Asym → Sym (RSA → AES)
                </h2>

                {isLoading && <p className="text-gray-500">Chargement…</p>}
                {isError && <p className="text-red-500">Erreur utilisateur</p>}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                            control={form.control}
                            name="targetKeyRef"
                            render={({ field }) => (
                                <FormItem className="bg-gray-50 p-4 bg-[#fcfcfc] dark:bg-[#1a1a1a]
              border border-[#c7c7cc] dark:border-gray-700
              rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                                    <FormLabel>Clé AES à envelopper</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner une clé AES" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {symmetricKeys.map((k) => (
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
                            name="wrappingKeyRef"
                            render={({ field }) => (
                                <FormItem className="bg-gray-50 p-4 bg-[#fcfcfc] dark:bg-[#1a1a1a]
              border border-[#c7c7cc] dark:border-gray-700
              rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                                    <FormLabel>Clé RSA publique (enveloppement)</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner une clé RSA publique" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {publicKeys.map((k) => (
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
                            name="padding"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2 bg-gray-50 p-4 bg-[#fcfcfc] dark:bg-[#1a1a1a]
              border border-[#c7c7cc] dark:border-gray-700
              rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                                    <FormLabel>Padding RSA</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choisir le padding RSA" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[PaddingTypes.OAEP, PaddingTypes.PKCS1_V1_5, PaddingTypes.NONE].map((p) => (
                                                    <SelectItem key={p} value={p} className="focus:shadow-[0_0_3px_1px]">
                                                        {p}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
                            {form.formState.isSubmitting ? "⏳ Enveloppement…" : "Envelopper"}
                        </Button>
                    </form>
                </Form>

                {wrappedKey && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-green-100 dark:bg-[#1a1a1a] shadow-[0_0_3px_1px] p-3 rounded-lg text-sm space-y-2 break-words"
                    >
                        <strong>Clé AES enveloppée :</strong>
                        <div className="dark:bg-[#1a1a1a] shadow-[0_0_3px_1px] text-gray-800 whitespace-pre-wrap break-words max-h-26 overflow-y-auto p-1.25 mt-1 bg-white rounded">
                            {wrappedKey}
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                navigator.clipboard.writeText(wrappedKey);
                                toast.success("Copiée");
                            }}
                            className="mt-2 bg-[#fcfcfc] dark:bg-[#1a1a1a] shadow-[0_0_3px_1px]"
                        >
                            Copier
                        </Button>
                    </motion.div>
                )}
            </Card>
        </motion.div>
    );

}
