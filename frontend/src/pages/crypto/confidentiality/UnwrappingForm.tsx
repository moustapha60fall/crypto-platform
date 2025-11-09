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

import { CryptoAlgorithms, PaddingTypes, type PaddingType } from "@/types/crypto";
import type { KeyMaterial } from "@/types/key-material";
import { useCurrentUser } from "@/hooks/useCurrentUser ";
import type { WrappedKeyDTO } from "@/types/wrapped-key";
import { validateAlgorithmPaddingCompatibility } from "@/utils/cryptoUtils";
import { CryptoService, getASymmetricKeysPrivForCurrentUser } from "@/services/cryptoService";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
    unwrappingKeyRef: z.string().min(1, "Clé de désenveloppement requise"),
    algorithm: z.enum([CryptoAlgorithms.RSA, CryptoAlgorithms.AES]),
    padding: z.enum(Object.values(PaddingTypes) as [PaddingType, ...PaddingType[]]),
    wrappedKeyBase64: z.string().min(1, "Clé enveloppée (base64) requise"),
    targetKeyType: z.string().optional(), // ex: "AES"
});

type FormValues = z.infer<typeof schema>;

export default function UnwrappingAsysSysForm() {
    const [unwrappedKeyBase64, setUnwrappedKeyBase64] = useState<string | null>(null);
    const [privateKeys, setPrivateKeys] = useState<KeyMaterial[]>([]);
    const { data: currentUser, isLoading, isError } = useCurrentUser();

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            unwrappingKeyRef: "",
            algorithm: CryptoAlgorithms.RSA,
            padding: PaddingTypes.OAEP,
            wrappedKeyBase64: "",
            targetKeyType: "AES",
        },
    });

    // Charger les clés privées de l’utilisateur
    useEffect(() => {
        getASymmetricKeysPrivForCurrentUser()
            .then(setPrivateKeys)
            .catch(() => toast.error("Erreur chargement des clés privées"));
    }, []);

    // Adapter le padding automatiquement si algo change
    useEffect(() => {
        const algo = form.watch("algorithm");
        const currentPadding = form.watch("padding");

        try {
            validateAlgorithmPaddingCompatibility(algo, currentPadding);
        } catch {
            const defaultPad =
                algo === CryptoAlgorithms.RSA ? PaddingTypes.OAEP : PaddingTypes.PKCS5Padding;
            form.setValue("padding", defaultPad);
        }
    }, [form.watch("algorithm")]);

    // Soumission du formulaire => unwrapping
    const onSubmit = async (data: FormValues) => {
        if (!currentUser?.id) return toast.error("Utilisateur non disponible");

        try {
            validateAlgorithmPaddingCompatibility(data.algorithm, data.padding);

            const dto: WrappedKeyDTO = {
                algorithm: data.algorithm,
                padding: data.padding,
                wrappingKeyRef: data.unwrappingKeyRef, // côté back utilise ce champ pour la clé privée
                targetKeyRef: "", // facultatif ici — on fournit wrappedKeyBase64 directement
                targetKeyType: data.targetKeyType,
                wrappedKeyBase64: data.wrappedKeyBase64,
                performedById: currentUser.id,
            };

            const result = await CryptoService.unwrapKey(dto);
            // back doit renvoyer unwrappedKeyBase64 dans result
            setUnwrappedKeyBase64(result.unwrappedKeyBase64 ?? null);
            toast.success("✅ Clé désenveloppée avec succès");
        } catch (err: any) {
            console.error(err);
            if (err instanceof Error && err.message.includes("Padding"))
                toast.error(`⚠️ ${err.message}`);
            else
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
                    🔓 Désenveloppement de Clé (Unwrap)
                </h2>

                {isLoading && <p className="text-gray-500">Chargement de l’utilisateur…</p>}
                {isError && <p className="text-red-500">❌ Erreur de chargement utilisateur</p>}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                            control={form.control}
                            name="unwrappingKeyRef"
                            render={({ field }) => (
                                <FormItem className="bg-gray-50 p-4 bg-[#fcfcfc] dark:bg-[#1a1a1a]
              border border-[#c7c7cc] dark:border-gray-700
              rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                                    <FormLabel>Clé de désenveloppement (privée)</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner une clé privée" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {privateKeys.map((k) => (
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
              rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
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

                        <FormField
                            control={form.control}
                            name="wrappedKeyBase64"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2 bg-gray-50 p-4 bg-[#fcfcfc] dark:bg-[#1a1a1a]
              border border-[#c7c7cc] dark:border-gray-700
              rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                                    <FormLabel>Clé enveloppée (base64)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Collez la clé enveloppée en base64 ici"
                                            rows={6}
                                            {...field}
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
                                <FormItem className="md:col-span-2 bg-gray-50 p-4 bg-[#fcfcfc] dark:bg-[#1a1a1a]
              border border-[#c7c7cc] dark:border-gray-700
              rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                                    <FormLabel>Type de la clé cible (optionnel)</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Type (ex: AES)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="AES">AES</SelectItem>
                                                <SelectItem value="DES">DES</SelectItem>
                                                <SelectItem value="DESEDE">DESEDE</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
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
                        <strong>Clé désenveloppée (base64) :</strong>
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
