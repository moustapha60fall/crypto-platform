import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { KeyMaterial } from "@/types/key-material";
import { HashFunctions, type CryptoAlgorithm, type HashFunction } from "@/types/crypto";
import { CryptoService, getASymmetricKeysPubForCurrentUser } from "@/services/cryptoService";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { FileSignatureResponseDTO } from "@/types/file-signature-response";

// ------------------------
// Schéma de validation
// ------------------------
const schema = z.object({
    publicKeyRef: z.string().min(1, "Clé publique requise"),
    inputFile: z.instanceof(File, { message: "Fichier à vérifier requis" }),
    hashFunction: z.enum(Object.values(HashFunctions) as [HashFunction, ...HashFunction[]]),
    providedSignature: z.string().optional(),
    signatureFile: z.instanceof(File).optional(),
}).refine((data) => data.providedSignature || data.signatureFile, {
    message: "Signature requise",
    path: ["signature"],
});

type VerifyFileFormValues = z.infer<typeof schema>;

export default function VerifyFileForm() {
    const [keys, setKeys] = useState<KeyMaterial[]>([]);
    const [selectedKey, setSelectedKey] = useState<KeyMaterial | null>(null);
    const [result, setResult] = useState<FileSignatureResponseDTO | null>(null);

    const form = useForm<VerifyFileFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            publicKeyRef: "",
            inputFile: undefined as unknown as File,
            providedSignature: "",
            signatureFile: undefined,
            hashFunction: HashFunctions.SHA256,
        },
    });

    // Charger les clés publiques
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

    // Lecture du fichier .sig (optionnelle)
    const readSignatureFile = async (file?: File) => {
        if (!file) return "";
        try {
            const text = await file.text();
            return text.trim();
        } catch {
            toast.error("Impossible de lire le fichier de signature");
            return "";
        }
    };

    const onSubmit = async (data: VerifyFileFormValues) => {
        if (!selectedKey) return toast.error("Clé publique invalide");

        try {
            const sigText =
                data.providedSignature && data.providedSignature.trim().length > 0
                    ? data.providedSignature.trim()
                    : await readSignatureFile(data.signatureFile);

            if (!sigText) return toast.error("Signature vide ou illisible");

            const res = await CryptoService.verifyFile(
                data.publicKeyRef,
                data.inputFile,
                sigText,
                selectedKey.algorithm as CryptoAlgorithm,
                data.hashFunction
            );
            setResult(res);

            toast.success(res.verified ? "Signature valide" : "Signature invalide");
        } catch (err) {
            console.error("Erreur vérification :", err);
            toast.error("Erreur lors de la vérification du fichier");
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
                    🗂️ Vérification de fichier signé
                </h2>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                            control={form.control}
                            name="publicKeyRef"
                            render={({ field }) => (
                                <FormItem className="bg-gray-50 p-4 border border-[#c7c7cc] rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
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
                                <FormItem className="md:col-span-2 bg-gray-50 p-4 border border-[#c7c7cc] rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                                    <FormLabel>Fichier à vérifier</FormLabel>
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
                            name="signatureFile"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2 bg-gray-50 p-4 border border-[#c7c7cc] rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                                    <FormLabel>Fichier de signature (.sig)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="file"
                                            accept=".sig,.txt"
                                            onChange={(e) => field.onChange(e.target.files?.[0])}
                                            className="focus:shadow-[0_0_3px_1px]"
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Chargez ici la signature générée précédemment
                                    </FormDescription>
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
                            {form.formState.isSubmitting ? "⏳ Vérification…" : "Vérifier le fichier"}
                        </Button>
                    </form>
                </Form>

                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`shadow-[0_0_3px_1px] p-3 rounded-lg text-sm space-y-2 ${result.verified ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"
                            }`}
                    >
                        <strong>Résultat :</strong>
                        <div>📄 Fichier : <code>{result.inputFile}</code></div>
                        <div>🛡️ Signature valide : <code>{result.verified ? "Oui" : "Non"}</code></div>
                        <div>✍️ Opération : <code>{result.operation}</code></div>

                        {result.outputFile && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => CryptoService.downloadFile(result.outputFile)}
                                className="mt-2 bg-[#fcfcfc] dark:bg-[#1a1a1a] shadow-[0_0_3px_1px]"
                            >
                                Télécharger la signature
                            </Button>
                        )}
                    </motion.div>
                )}
            </Card>
        </motion.div>
    );

}
