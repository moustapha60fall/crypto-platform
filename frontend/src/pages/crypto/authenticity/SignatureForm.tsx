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
import { CryptoService, getASymmetricKeysPrivForCurrentUser } from "@/services/cryptoService";
import type { SignatureDTO } from "@/types/signature";
import type { KeyMaterial } from "@/types/key-material";
import { HashFunctions, type HashFunction } from "@/types/crypto";
import { Textarea } from "@/components/ui/textarea";

// 🧪 Schéma de validation
const schema = z.object({
  privateKeyRef: z.string().min(1, "Clé privée requise"),
  message: z.string().min(1, "Message à signer requis"),
  hashFunction: z.enum(Object.values(HashFunctions) as [HashFunction, ...HashFunction[]]),
  base64Output: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function SignatureForm() {
  const [signature, setSignature] = useState<string | null>(null);
  const [keys, setKeys] = useState<KeyMaterial[]>([]);
  const [selectedKey, setSelectedKey] = useState<KeyMaterial | null>(null);
  const { data: currentUser, isLoading, isError } = useCurrentUser();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      privateKeyRef: "",
      message: "",
      hashFunction: HashFunctions.SHA256,
      base64Output: true,
    },
  });

  // 🔑 Charger les clés privées
  useEffect(() => {
    getASymmetricKeysPrivForCurrentUser()
      .then(setKeys)
      .catch(() => {
        toast.error("Impossible de charger les clés");
        setKeys([]);
      });
  }, []);

  const handleKeyChange = (keyRef: string) => {
    form.setValue("privateKeyRef", keyRef);
    const found = keys.find((k) => k.keyRef === keyRef) ?? null;
    setSelectedKey(found);
  };

  const onSubmit = async (data: FormValues) => {
    if (!currentUser?.id) return toast.error("Utilisateur non chargé");
    if (!selectedKey) return toast.error("Clé privée invalide");

    try {
      const dto: SignatureDTO = {
        privateKeyRef: data.privateKeyRef,
        message: data.message,
        algorithm: selectedKey.algorithm,
        hashFunction: data.hashFunction,
        performedById: currentUser.id,
      };

      const result = await CryptoService.signMessage(dto);
      setSignature(result.signature ?? null);
      toast.success("Signature générée");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Erreur de signature");
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
          ✍️ Signature numérique
        </h2>

        {isLoading && <p className="text-gray-500">Chargement de l’utilisateur…</p>}
        {isError && <p className="text-red-500">Erreur de chargement utilisateur</p>}
        {keys.length === 0 && !isError && <p className="text-gray-500">🔄 Chargement des clés…</p>}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="privateKeyRef"
              render={({ field }) => (
                <FormItem className="bg-gray-50 p-4 bg-[#fcfcfc] dark:bg-[#1a1a1a]
              border border-[#c7c7cc] dark:border-gray-700
              rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
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
              name="message"
              render={({ field }) => (
                <FormItem className="md:col-span-2 bg-gray-50 p-4 bg-[#fcfcfc] dark:bg-[#1a1a1a]
              border border-[#c7c7cc] dark:border-gray-700
              rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                  <FormLabel>Message à signer</FormLabel>
                  <FormControl>
                    <Textarea className="focus:shadow-[0_0_3px_1px]"
                      {...field}
                      placeholder="Texte brut à signer"
                      inputMode="text"
                      autoComplete="off"
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
                <FormItem className="md:col-span-2 bg-gray-50 p-4 bg-[#fcfcfc] dark:bg-[#1a1a1a]
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
              {form.formState.isSubmitting ? "⏳ Signature…" : "Signer"}
            </Button>
          </form>
        </Form>

        {signature && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-green-100 dark:bg-[#1a1a1a] shadow-[0_0_3px_1px] p-3 rounded-lg text-sm space-y-2 break-words"
          >
            <strong>Signature :</strong>
            <div className="dark:bg-[#1a1a1a] shadow-[0_0_3px_1px] text-gray-800 whitespace-pre-wrap break-words max-h-26 overflow-y-auto p-1.25 mt-1 bg-white rounded">
              {signature}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(signature);
                toast.success("Signature copiée");
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
