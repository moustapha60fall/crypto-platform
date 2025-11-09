import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion"
import { toast } from "sonner";
import type { KeyMaterial } from "@/types/key-material";
import { SymmetricModes, type SymmetricMode } from "@/types/crypto";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CryptoService, getSymmetricKeysForCurrentUser } from "@/services/cryptoService";

const schema = z.object({
  keyId: z.number().int().positive("Clé AES requise"),
  inputFile: z.instanceof(File, { message: "Fichier requis" }),
  mode: z.enum(Object.values(SymmetricModes) as [SymmetricMode, ...SymmetricMode[]]),
});

type FileDecryptFormValues = z.infer<typeof schema>;

// ==============================
// Composant principal
// ==============================
export default function FileDecryptForm() {
  const [keys, setKeys] = useState<KeyMaterial[]>([]);
  const [result, setResult] = useState<FileCryptoResponseDTO | null>(null);

  const form = useForm<FileDecryptFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      keyId: undefined as unknown as number,
      inputFile: undefined as unknown as File,
      mode: SymmetricModes.CBC,
    },
  });

  // ==============================
  // Charger les clés AES utilisateur
  // ==============================
  useEffect(() => {
    getSymmetricKeysForCurrentUser()
      .then(setKeys)
      .catch(() => {
        toast.error("Impossible de charger les clés AES");
        setKeys([]);
      });
  }, []);

  // ==============================
  // Soumission du formulaire
  // ==============================
  const onSubmit = async (data: FileDecryptFormValues) => {
    try {
      const res = await CryptoService.decryptSymmetricFile(
        data.keyId,
        data.inputFile,
        data.mode
      );
      setResult(res);
      toast.success("Fichier déchiffré avec succès");
    } catch (err) {
      console.error("Erreur déchiffrement :", err);
      toast.error("Erreur lors du déchiffrement du fichier");
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
          🔓 Déchiffrement de fichier symétrique
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
                  <FormLabel>Clé AES</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={field.value?.toString()}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une clé AES" />
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
              name="mode"
              render={({ field }) => (
                <FormItem className="bg-gray-50 p-4 bg-[#fcfcfc] dark:bg-[#1a1a1a] 
              border border-[#c7c7cc] dark:border-gray-700 
              rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                  <FormLabel>Mode de chiffrement</FormLabel>
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
                  <FormLabel>Fichier chiffré (input)</FormLabel>
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
              {form.formState.isSubmitting ? "⏳ Déchiffrement…" : "Déchiffrer le fichier"}
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
            <div>🔓 Fichier de sortie : <code>{result.outputFile}</code></div>
            <div>🛡️ Opération : <code>{result.operation}</code></div>

            {result.outputFile && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => CryptoService.downloadFile(result.outputFile)}
                className="mt-2 bg-[#fcfcfc] dark:bg-[#1a1a1a] shadow-[0_0_3px_1px]"
              >
                Télécharger le fichier déchiffré
              </Button>
            )}
          </motion.div>
        )}
      </Card>
    </motion.div>
  );

}
