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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useCurrentUser } from "@/hooks/useCurrentUser ";
import { CryptoService, getSymmetricKeysForCurrentUser } from "@/services/cryptoService";
import { SymmetricModes, type SymmetricMode } from "@/types/crypto";
import type { SymmetricCryptoDTO } from "@/types/symmetric";
import type { KeyMaterial } from "@/types/key-material";
import { resolvePadding } from "@/utils/cryptoUtils";
import { Textarea } from "@/components/ui/textarea";

// Validation schema
const schema = z.object({
  keyRef: z.string().min(1, "Clé requise"),
  inputData: z.string().min(1, "Texte à chiffrer requis"),
  mode: z.enum(Object.values(SymmetricModes) as [SymmetricMode, ...SymmetricMode[]]),
});

type FormValues = z.infer<typeof schema>;

export default function EncryptFormSymmetric() {
  const [output, setOutput] = useState<string | null>(null);
  const [keys, setKeys] = useState<KeyMaterial[]>([]);
  const [selectedKey, setSelectedKey] = useState<KeyMaterial | null>(null);
  const { data: currentUser, isLoading, isError } = useCurrentUser();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      keyRef: "",
      inputData: "",
      mode: SymmetricModes.CBC,
    },
  });

  useEffect(() => {
    getSymmetricKeysForCurrentUser()
      .then(setKeys)
      .catch(() => {
        toast.error("Erreur lors du chargement des clés");
        setKeys([]);
      });
  }, []);

  const handleKeyChange = (keyRef: string) => {
    form.setValue("keyRef", keyRef);
    const found = keys.find((k) => k.keyRef === keyRef) ?? null;
    setSelectedKey(found);
  };

  const onSubmit = async (data: FormValues) => {
    if (!currentUser?.id) return toast.error("Utilisateur non disponible");
    if (!selectedKey) return toast.error("Clé non sélectionnée");

    try {
      const dto: SymmetricCryptoDTO = {
        keyRef: data.keyRef,
        inputData: btoa(unescape(encodeURIComponent(data.inputData))),
        performedById: currentUser.id,
        mode: data.mode,
        algorithm: selectedKey.algorithm,
        padding: resolvePadding(data.mode),
      };

      const result = await CryptoService.encryptSymmetric(dto);
      setOutput(result.outputData ?? null);
      toast.success("Chiffrement effectué");
    } catch (err: any) {
      console.error(err);

      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Erreur de déchiffrement";

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
          🔐 Chiffrement Symétrique
        </h2>

        {isLoading && <p className="text-gray-500">Chargement de l’utilisateur…</p>}
        {isError && <p className="text-red-500">Erreur de chargement utilisateur</p>}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="keyRef"
              render={({ field }) => (
                <FormItem className="bg-gray-50 p-4 bg-[#fcfcfc] dark:bg-[#1a1a1a] 
               border border-[#c7c7cc] dark:border-gray-700 
               rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                  <FormLabel>Clé</FormLabel>
                  <FormControl>
                    <Select onValueChange={handleKeyChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une clé" />
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
              name="mode"
              render={({ field }) => (
                <FormItem className="bg-gray-50 p-4 bg-[#fcfcfc] dark:bg-[#1a1a1a] 
               border border-[#c7c7cc] dark:border-gray-700 
               rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                  <FormLabel>Mode</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un mode" />
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
                  <FormDescription>
                    Padding utilisé : <code>{resolvePadding(form.watch("mode"))}</code>
                  </FormDescription>
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
                  <FormLabel>Données</FormLabel>
                  <FormControl>
                    <Textarea className="focus:shadow-[0_0_3px_1px]"
                      {...field}
                      placeholder="Texte à chiffrer"
                      inputMode="text"
                      autoComplete="off"
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
              {form.formState.isSubmitting ? "⏳ Chiffrement…" : "Chiffrer"}
            </Button>
          </form>
        </Form>

        {output && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-green-100 dark:bg-[#1a1a1a] shadow-[0_0_3px_1px] p-3 rounded-lg text-sm"
          >
            <strong>Résultat :</strong>
            <div
              className="dark:bg-[#1a1a1a] shadow-[0_0_3px_1px] text-gray-800 whitespace-pre-wrap break-words max-h-26 overflow-y-auto p-1.25 mt-1 bg-white rounded"
            >
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
