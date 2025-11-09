import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { HashFunctions } from "@/types/crypto";
import { CryptoService, getSymmetricKeysForCurrentUser } from "@/services/cryptoService";
import type { KeyMaterial } from "@/types/key-material";
import type { FileCryptoResponseDTO } from "@/types/file-crypto-response";

// 🧪 Validation schema
const schema = z.object({
    keyId: z.number().int().positive("Clé requise"),
    inputFile: z.instanceof(File, { message: "Fichier requis" }),
    hashFunction: z.enum(Object.values(HashFunctions) as [string, ...string[]]),
});

type HmacFileFormValues = z.infer<typeof schema>;

export default function HmacFileForm() {
    const [keys, setKeys] = useState<KeyMaterial[]>([]);
    const [output, setOutput] = useState<FileCryptoResponseDTO | null>(null);

    const form = useForm<HmacFileFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            keyId: undefined as unknown as number,
            inputFile: undefined as unknown as File,
            hashFunction: HashFunctions.SHA256,
        },
    });

    // 🔑 Charger les clés symétriques
    useEffect(() => {
        getSymmetricKeysForCurrentUser()
            .then(setKeys)
            .catch(() => {
                toast.error("Erreur lors du chargement des clés");
                setKeys([]);
            });
    }, []);

    const onSubmit = async (data: HmacFileFormValues) => {
        try {
            const result = await CryptoService.computeHmacFile(
                data.inputFile,
                data.keyId,
                data.hashFunction
            );
            setOutput(result);
            toast.success("HMAC du fichier généré");
        } catch (err) {
            console.error("Erreur HMAC :", err);
            toast.error("Erreur lors du calcul HMAC du fichier");
            setOutput(null);
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
                    📁 Calcul HMAC sur fichier
                </h2>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                            control={form.control}
                            name="keyId"
                            render={({ field }) => (
                                <FormItem className="bg-gray-50 p-4 bg-[#fcfcfc] dark:bg-[#1a1a1a]
              border border-[#c7c7cc] dark:border-gray-700
              rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                                    <FormLabel>Clé secrète</FormLabel>
                                    <FormControl>
                                        <Select
                                            onValueChange={(val) => field.onChange(Number(val))}
                                            value={field.value?.toString()}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choisir une clé" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {keys.map((k) => (
                                                    <SelectItem key={k.id} value={k.id.toString()} className="focus:shadow-[0_0_3px_1px]">
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
                            name="hashFunction"
                            render={({ field }) => (
                                <FormItem className="bg-gray-50 p-4 bg-[#fcfcfc] dark:bg-[#1a1a1a]
              border border-[#c7c7cc] dark:border-gray-700
              rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
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
                                    <FormLabel>Fichier</FormLabel>
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

                        <Button
                            type="submit"
                            className="md:col-span-2 py-2 px-4 rounded transition"
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting ? "⏳ Calcul…" : "Calculer HMAC"}
                        </Button>
                    </form>
                </Form>

                {output && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-green-100 dark:bg-[#1a1a1a] shadow-[0_0_3px_1px] p-3 rounded-lg text-sm space-y-2"
                    >
                        <strong>Résultat :</strong>
                        <div>📄 Fichier d'entrée : <code>{output.inputFile}</code></div>
                        <div>🔐 Fichier de sortie : <code>{output.outputFile}</code></div>
                        <div>🛡️ Opération : <code>{output.operation}</code></div>

                        {output.outputFile && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => CryptoService.downloadFile(output.outputFile)}
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
