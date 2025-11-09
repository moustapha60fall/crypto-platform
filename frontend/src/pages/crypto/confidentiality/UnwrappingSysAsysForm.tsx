"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { CryptoAlgorithms, PaddingTypes, type PaddingType } from "@/types/crypto";
import type { KeyMaterial } from "@/types/key-material";
import { useCurrentUser } from "@/hooks/useCurrentUser ";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { WrappedKeyDTO } from "@/types/wrapped-key";
import { CryptoService, getSymmetricKeysForCurrentUser } from "@/services/cryptoService";
import { Textarea } from "@/components/ui/textarea";

// ====================================
// 🧾 Schéma du formulaire
// ====================================
const schema = z.object({
    unwrappingKeyRef: z.string().min(1, "Clé AES requise"),
    algorithm: z.literal(CryptoAlgorithms.AES),
    padding: z.enum(Object.values(PaddingTypes) as [PaddingType, ...PaddingType[]]),
    wrappedKeyBase64: z.string().min(1, "Clé enveloppée (base64) requise"),
    targetKeyType: z.enum(["RSA", "DSA", "ECC", "ELGAMAL"]),
});

type FormValues = z.infer<typeof schema>;

// ====================================
// 🔓 Composant principal
// ====================================
export default function UnwrappingSysAsysForm() {
    const [unwrappedKeyBase64, setUnwrappedKeyBase64] = useState<string | null>(null);
    const [symmetricKeys, setSymmetricKeys] = useState<KeyMaterial[]>([]);
    const { data: currentUser, isLoading, isError } = useCurrentUser();

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            unwrappingKeyRef: "",
            algorithm: CryptoAlgorithms.AES,
            padding: PaddingTypes.PKCS5Padding,
            wrappedKeyBase64: "",
            targetKeyType: "RSA",
        },
    });

    // Charger les clés AES
    useEffect(() => {
        getSymmetricKeysForCurrentUser()
            .then(setSymmetricKeys)
            .catch(() => toast.error("Erreur chargement clés AES"));
    }, []);

    // Soumission
    const onSubmit = async (data: FormValues) => {
        if (!currentUser?.id) return toast.error("Utilisateur non disponible");

        try {
            const dto: WrappedKeyDTO = {
                algorithm: data.algorithm,
                padding: data.padding,
                wrappingKeyRef: data.unwrappingKeyRef,
                wrappedKeyBase64: data.wrappedKeyBase64,
                targetKeyType: data.targetKeyType,
                performedById: currentUser.id,
            };

            const result = await CryptoService.unwrapKey(dto);
            setUnwrappedKeyBase64(result.unwrappedKeyBase64 ?? null);
            toast.success("✅ Clé asymétrique restaurée avec succès");
        } catch (err: any) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Erreur lors du désenveloppement");
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
                    🔓 Désenveloppement Sym → Asym (AES → RSA)
                </h2>

                {isLoading && <p className="text-gray-500">Chargement…</p>}
                {isError && <p className="text-red-500">❌ Erreur utilisateur</p>}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                            control={form.control}
                            name="unwrappingKeyRef"
                            render={({ field }) => (
                                <FormItem className="bg-gray-50 p-4 bg-[#fcfcfc] dark:bg-[#1a1a1a]
              border border-[#c7c7cc] dark:border-gray-700
              rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                                    <FormLabel>Clé AES (désenveloppement)</FormLabel>
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
                            name="wrappedKeyBase64"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2 bg-gray-50 p-4 bg-[#fcfcfc] dark:bg-[#1a1a1a]
              border border-[#c7c7cc] dark:border-gray-700
              rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                                    <FormLabel>Clé RSA enveloppée (base64)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Coller ici la clé RSA enveloppée"
                                            rows={6}
                                            className="focus:shadow-[0_0_3px_1px]"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="targetKeyType"
                            render={({ field }) => (
                                <FormItem className="bg-gray-50 p-4 bg-[#fcfcfc] dark:bg-[#1a1a1a]
              border border-[#c7c7cc] dark:border-gray-700
              rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                                    <FormLabel>Type de clé cible</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Type (ex: RSA)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="RSA">RSA</SelectItem>
                                                <SelectItem value="DSA">DSA</SelectItem>
                                                <SelectItem value="ECC">ECC</SelectItem>
                                                <SelectItem value="ELGAMAL">ELGAMAL</SelectItem>
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
                                    <FormLabel>Padding AES</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choisir le padding" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(PaddingTypes)
                                                    .filter((p) => p.includes("PKCS"))
                                                    .map((p) => (
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
                            {form.formState.isSubmitting ? "⏳ Désenveloppement…" : "Désenvelopper"}
                        </Button>
                    </form>
                </Form>

                {unwrappedKeyBase64 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-green-100 dark:bg-[#1a1a1a] shadow-[0_0_3px_1px] p-3 rounded-lg text-sm space-y-2 break-words"
                    >
                        <strong>Clé RSA restaurée :</strong>
                        <div className="dark:bg-[#1a1a1a] shadow-[0_0_3px_1px] text-gray-800 whitespace-pre-wrap break-words max-h-26 overflow-y-auto p-1.25 mt-1 bg-white rounded">
                            {unwrappedKeyBase64}
                        </div>
                        <div className="flex gap-2 mt-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    navigator.clipboard.writeText(unwrappedKeyBase64);
                                    toast.success("Copiée");
                                }}
                                className="mt-2 bg-[#fcfcfc] dark:bg-[#1a1a1a] shadow-[0_0_3px_1px]"
                            >
                                Copier
                            </Button>
                        </div>
                    </motion.div>
                )}
            </Card>
        </motion.div>
    );

}
