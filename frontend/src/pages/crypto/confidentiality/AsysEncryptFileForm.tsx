import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion } from "framer-motion"
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { KeyMaterial } from "@/types/key-material";

import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { resolveDefaultPadding } from "@/utils/cryptoUtils";
import { CryptoService, getASymmetricKeysPubForCurrentUser } from "@/services/cryptoService";
import type { FileCryptoResponseDTO } from "@/types/file-crypto-response";
import { Card } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";

const schema = z.object({
    publicKeyRef: z.string().min(1, "Clé publique requise"),
    inputFile: z.instanceof(File, { message: "Fichier requis" }),
});

type AsysFileEncryptFormValues = z.infer<typeof schema>;

export default function AsysFileEncryptForm() {
    const [keys, setKeys] = useState<KeyMaterial[]>([]);
    const [selectedKey, setSelectedKey] = useState<KeyMaterial | null>(null);
    const [result, setResult] = useState<FileCryptoResponseDTO | null>(null);

    const form = useForm<AsysFileEncryptFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            publicKeyRef: "",
            inputFile: undefined as unknown as File,
        },
    });

    useEffect(() => {
        getASymmetricKeysPubForCurrentUser()
            .then(setKeys)
            .catch(() => {
                toast.error("Impossible de charger les clés publiques");
                setKeys([]);
            });
    }, []);

    const handleKeyChange = (keyRef: string) => {
        form.setValue("publicKeyRef", keyRef);
        const found = keys.find((k) => k.keyRef === keyRef) ?? null;
        setSelectedKey(found);
    };

    const onSubmit = async (data: AsysFileEncryptFormValues) => {
        if (!selectedKey) return toast.error("Clé publique invalide");

        try {
            const algo = selectedKey.algorithm;
            const padding = resolveDefaultPadding(algo);

            const res = await CryptoService.encryptAsymmetricFile(
                data.publicKeyRef,
                data.inputFile,
                algo,
                padding
            );

            setResult(res);
            toast.success("Fichier chiffré avec succès");
        } catch (err) {
            console.error("Erreur chiffrement :", err);
            toast.error("Erreur lors du chiffrement du fichier");
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
                    📁 Chiffrement de fichier asymétrique
                </h2>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                            control={form.control}
                            name="publicKeyRef"
                            render={({ field }) => (
                                <FormItem className="bg-gray-50 p-4 bg-[#fcfcfc] dark:bg-[#1a1a1a] 
              border border-[#c7c7cc] dark:border-gray-700 
              rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                                    <FormLabel>Clé publique</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={handleKeyChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choisir une clé publique" />
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
                                <FormItem className="md:col-span-2 bg-gray-50 p-4 bg-[#fcfcfc] dark:bg-[#1a1a1a] 
              border border-[#c7c7cc] dark:border-gray-700 
              rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                                    <FormLabel>Fichier clair (input)</FormLabel>
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

                        {selectedKey && (
                            <div className="md:col-span-2 text-sm text-muted-foreground px-1">
                                Padding appliqué : <code>{resolveDefaultPadding(selectedKey.algorithm)}</code>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="md:col-span-2 py-2 px-4 rounded transition"
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting ? "⏳ Chiffrement…" : "Chiffrer le fichier"}
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
                        <div>🔐 Fichier de sortie : <code>{result.outputFile}</code></div>
                        <div>🛡️ Opération : <code>{result.operation}</code></div>

                        {result.outputFile && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => CryptoService.downloadFile(result.outputFile)}
                                className="mt-2 bg-[#fcfcfc] dark:bg-[#1a1a1a] shadow-[0_0_3px_1px]"
                            >
                                Télécharger le fichier chiffré
                            </Button>
                        )}
                    </motion.div>
                )}
            </Card>
        </motion.div>
    );

}
