import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion } from "framer-motion"
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import type { KeyMaterial } from "@/types/key-material";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser ";
import { Card } from "@/components/ui/card";
import type { AsymmetricCryptoDTO } from "@/types/asymmetric";
import { CryptoService, getASymmetricKeysPubForCurrentUser } from "@/services/cryptoService";
import { base64EncodeUtf8, resolveDefaultPadding } from "@/utils/cryptoUtils";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  publicKeyRef: z.string().min(1, "Clé publique requise"),
  inputData: z.string().min(1, "Texte à chiffrer requis"),
});

type FormValues = z.infer<typeof schema>;

export default function AsysEncryptForm() {
  const [output, setOutput] = useState<string | null>(null);
  const [keys, setKeys] = useState<KeyMaterial[]>([]);
  const [selectedKey, setSelectedKey] = useState<KeyMaterial | null>(null);
  const { data: currentUser, isLoading, isError } = useCurrentUser();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      publicKeyRef: "",
      inputData: "",
    },
  });

  // 🔑 Charger les clés publiques asymétriques
  useEffect(() => {
    getASymmetricKeysPubForCurrentUser()
      .then(setKeys)
      .catch(() => {
        toast.error("Impossible de charger les clés");
        setKeys([]);
      });
  }, []);

  const handleKeyChange = (keyRef: string) => {
    form.setValue("publicKeyRef", keyRef);
    const found = keys.find((k) => k.keyRef === keyRef) ?? null;
    setSelectedKey(found);
  };

  const onSubmit = async (data: FormValues) => {
    if (!currentUser?.id) return toast.error("Utilisateur non chargé");
    if (!selectedKey) return toast.error("Clé publique invalide");

    try {
      const dto: AsymmetricCryptoDTO = {
        publicKeyRef: data.publicKeyRef,
        inputData: base64EncodeUtf8(data.inputData),
        performedById: currentUser.id,
        algorithm: selectedKey.algorithm,
        padding: resolveDefaultPadding(selectedKey.algorithm),
      };

      const result = await CryptoService.encryptAsymmetric(dto);
      setOutput(result.outputData ?? null);
      toast.success("Chiffrement réussi");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Erreur de chiffrement asymétrique";
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
          🔐 Chiffrement Asymétrique
        </h2>

        {isLoading && <p className="text-gray-500">Chargement de l’utilisateur…</p>}
        {isError && <p className="text-red-500">Erreur de chargement utilisateur</p>}

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
              name="inputData"
              render={({ field }) => (
                <FormItem className="md:col-span-2 bg-gray-50 p-4 bg-[#fcfcfc] dark:bg-[#1a1a1a] 
              border border-[#c7c7cc] dark:border-gray-700 
              rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                  <FormLabel>Données à chiffrer</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Texte brut à chiffrer"
                      inputMode="text"
                      autoComplete="off"
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
              {form.formState.isSubmitting ? "⏳ Chiffrement…" : "Chiffrer"}
            </Button>
          </form>
        </Form>

        {output && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-green-100 dark:bg-[#1a1a1a] shadow-[0_0_3px_1px] p-3 rounded-lg text-sm space-y-2 break-words"
          >
            <strong>Résultat :</strong>
            <div className="dark:bg-[#1a1a1a] shadow-[0_0_3px_1px] text-gray-800 whitespace-pre-wrap break-words max-h-26 overflow-y-auto p-1.25 mt-1 bg-white rounded">
              {output}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(output);
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
