import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { CryptoService, getASymmetricKeysPrivForCurrentUser } from "@/services/cryptoService";
import type { KeyMaterial } from "@/types/key-material";
import type { FileSignatureResponseDTO } from "@/types/file-signature-response";
import { HashFunctions, type CryptoAlgorithm, type HashFunction } from "@/types/crypto";

// ------------------------
// Schéma de validation
// ------------------------
const schema = z.object({
    privateKeyRef: z.string().min(1, "Clé privée requise"),
    inputFile: z.instanceof(File, { message: "Fichier requis" }),
    hashFunction: z.enum(Object.values(HashFunctions) as [HashFunction, ...HashFunction[]]),
    base64Output: z.boolean(),
});

type SignFileFormValues = z.infer<typeof schema>;

export default function SignFileEncryptForm() {
    const [keys, setKeys] = useState<KeyMaterial[]>([]);
    const [selectedKey, setSelectedKey] = useState<KeyMaterial | null>(null);
    const [result, setResult] = useState<FileSignatureResponseDTO | null>(null);

    const form = useForm<SignFileFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            privateKeyRef: "",
            inputFile: undefined as unknown as File,
            hashFunction: HashFunctions.SHA256,
            base64Output: true,
        },
    });

    // Charger les clés privées
    useEffect(() => {
        getASymmetricKeysPrivForCurrentUser()
            .then(setKeys)
            .catch(() => {
                toast.error("Impossible de charger les clés privées");
                setKeys([]);
            });
    }, []);

    const handleKeyChange = (keyRef: string) => {
        form.setValue("privateKeyRef", keyRef);
        const found = keys.find((k) => k.keyRef === keyRef) ?? null;
        setSelectedKey(found);
    };

    const onSubmit = async (data: SignFileFormValues) => {
        if (!selectedKey) return toast.error("Clé privée invalide");

        try {
            const res = await CryptoService.signFile(
                data.privateKeyRef,
                data.inputFile,
                selectedKey.algorithm as CryptoAlgorithm,
                data.hashFunction
            );
            setResult(res);
            toast.success("Fichier signé avec succès");
        } catch (err) {
            console.error("Erreur signature :", err);
            toast.error("Erreur lors de la signature du fichier");
            setResult(null);
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
                    📁 Signature de fichier asymétrique
                </h2>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                            control={form.control}
                            name="privateKeyRef"
                            render={({ field }) => (
                                <FormItem className="bg-gray-50 p-4 border border-[#c7c7cc] rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                                    <FormLabel>Clé privée</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={handleKeyChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choisir une clé privée" />
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
                            name="inputFile"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2 bg-gray-50 p-4 border border-[#c7c7cc] rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                                    <FormLabel>Fichier à signer</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="file"
                                            onChange={(e) => field.onChange(e.target.files?.[0])}
                                            className="focus:shadow-[0_0_3px_1px]"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="hashFunction"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2 bg-gray-50 p-4 border border-[#c7c7cc] rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                                    <FormLabel>Fonction de hachage</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choisir la fonction de hachage" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(HashFunctions).map((h) => (
                                                    <SelectItem key={h} value={h} className="focus:shadow-[0_0_3px_1px]">
                                                        {h}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormDescription>
                                        Algorithme utilisé : <code>{selectedKey?.algorithm || "?"}</code>
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="md:col-span-2 py-2 px-4 rounded transition"
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting ? "⏳ Signature…" : "Signer le fichier"}
                        </Button>
                    </form>
                </Form>

                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-green-100 dark:bg-[#1a1a1a] shadow-[0_0_3px_1px] p-3 rounded-lg text-sm space-y-2"
                    >
                        <strong>Résultat :</strong>
                        <div>📄 Fichier d'entrée : <code>{result.inputFile}</code></div>
                        <div>✍️ Fichier signé : <code>{result.outputFile}</code></div>
                        <div>🛡️ Opération : <code>{result.operation}</code></div>

                        {result.outputFile && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => CryptoService.downloadFile(result.outputFile)}
                                className="mt-2 bg-[#fcfcfc] dark:bg-[#1a1a1a] shadow-[0_0_3px_1px]"
                            >
                                Télécharger le fichier signé
                            </Button>
                        )}
                    </motion.div>
                )}
            </Card>
        </motion.div>
    );

}

