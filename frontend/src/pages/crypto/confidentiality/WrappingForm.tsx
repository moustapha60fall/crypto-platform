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
import { CryptoAlgorithms, PaddingTypes, type PaddingType } from "@/types/crypto";
import type { KeyMaterial } from "@/types/key-material";
import { useCurrentUser } from "@/hooks/useCurrentUser ";
import type { WrappedKeyDTO } from "@/types/wrapped-key";
import { validateAlgorithmPaddingCompatibility } from "@/utils/cryptoUtils";

// ====================================
// Schéma du formulaire
// ====================================
const schema = z.object({
    wrappingKeyRef: z.string().min(1, "Clé d’enveloppement requise"),
    targetKeyRef: z.string().min(1, "Clé cible requise"),
    algorithm: z.enum([CryptoAlgorithms.RSA, CryptoAlgorithms.AES]),
    padding: z.enum(Object.values(PaddingTypes) as [PaddingType, ...PaddingType[]]),
});

type FormValues = z.infer<typeof schema>;

// ====================================
// Composant principal sys-asys
// ====================================
export default function WrappingForm() {
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

    // Charger les clés existantes
    useEffect(() => {
        getSymmetricKeysForCurrentUser()
            .then(setSymmetricKeys)
            .catch(() => toast.error("Erreur chargement clés symétriques"));
        getASymmetricKeysPubForCurrentUser()
            .then(setPublicKeys)
            .catch(() => toast.error("Erreur chargement clés publiques"));
    }, []);

    // Adapter le padding automatiquement si algo change
    useEffect(() => {
        const algo = form.watch("algorithm");
        const currentPadding = form.watch("padding");

        try {
            validateAlgorithmPaddingCompatibility(algo, currentPadding);
        } catch {
            const defaultPad =
                algo === CryptoAlgorithms.RSA
                    ? PaddingTypes.OAEP
                    : PaddingTypes.PKCS5Padding;
            form.setValue("padding", defaultPad);
        }
    }, [form.watch("algorithm")]);

    // Soumission
    const onSubmit = async (data: FormValues) => {
        if (!currentUser?.id) return toast.error("Utilisateur non disponible");

        try {
            validateAlgorithmPaddingCompatibility(data.algorithm, data.padding);

            const dto: WrappedKeyDTO = {
                algorithm: data.algorithm,
                padding: data.padding,
                wrappingKeyRef: data.wrappingKeyRef,
                targetKeyRef: data.targetKeyRef,
                targetKeyType: "AES",
                performedById: currentUser.id,
            };

            const result = await CryptoService.wrapKey(dto);
            setWrappedKey(result.wrappedKeyBase64 ?? null);
            toast.success("Clé enveloppée avec succès");
        } catch (err: any) {
            console.error(err);
            if (err instanceof Error && err.message.includes("Padding"))
                toast.error(`${err.message}`);
            else
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
                    🧷 Enveloppement de Clé
                </h2>

                {isLoading && <p className="text-gray-500">Chargement de l’utilisateur…</p>}
                {isError && <p className="text-red-500">Erreur de chargement utilisateur</p>}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                            control={form.control}
                            name="targetKeyRef"
                            render={({ field }) => (
                                <FormItem className="bg-gray-50 p-4 bg-[#fcfcfc] dark:bg-[#1a1a1a]
              border border-[#c7c7cc] dark:border-gray-700
              rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                                    <FormLabel>Clé à envelopper</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner une clé symétrique" />
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
                                    <FormLabel>Clé d’enveloppement</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner une clé publique" />
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
                            name="algorithm"
                            render={({ field }) => (
                                <FormItem className="bg-gray-50 p-4 bg-[#fcfcfc] dark:bg-[#1a1a1a]
              border border-[#c7c7cc] dark:border-gray-700
              rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                                    <FormLabel>Algorithme</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choisir un algorithme" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[CryptoAlgorithms.RSA, CryptoAlgorithms.AES].map((algo) => (
                                                    <SelectItem key={algo} value={algo} className="focus:shadow-[0_0_3px_1px]">
                                                        {algo}
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
                                <FormItem className="bg-gray-50 p-4 bg-[#fcfcfc] dark:bg-[#1a1a1a]
              border border-[#c7c7cc] dark:border-gray-700
              rounded-[3px] hover:shadow-[0_0_3px_1px] transition md:col-span-2">
                                    <FormLabel>Padding</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choisir un padding" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(PaddingTypes).map((p) => (
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
                        <strong>Clé enveloppée :</strong>
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
