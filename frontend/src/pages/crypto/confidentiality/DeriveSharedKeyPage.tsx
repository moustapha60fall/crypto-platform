"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CryptoService, getASymmetricKeysPrivForCurrentUser } from "@/services/cryptoService";
import { Card } from "@/components/ui/card";

const deriveSchema = z.object({
  privateKeyRef: z.string().min(5, "Référence de la clé privée requise"),
  peerPublicKeyBase64: z.string().min(10, "Clé publique distante requise"),
});
type DeriveValues = z.infer<typeof deriveSchema>;

export default function DeriveSharedKeyPage() {
  const [sharedKey, setSharedKey] = useState<string | null>(null);
  const [privateKeys, setPrivateKeys] = useState<{ keyRef: string; name: string; algorithm: string }[]>([]);

  const form = useForm<DeriveValues>({
    resolver: zodResolver(deriveSchema),
    defaultValues: {
      privateKeyRef: "",
      peerPublicKeyBase64: "",
    },
  });

  // 🔑 Charger les clés privées de l’utilisateur
  useEffect(() => {
    getASymmetricKeysPrivForCurrentUser()
      .then(setPrivateKeys)
      .catch(() => toast.error("Erreur lors du chargement des clés privées"));
  }, []);

  const handleKeyChange = (keyRef: string) => {
    form.setValue("privateKeyRef", keyRef);
  };

  const onSubmit = async (data: DeriveValues) => {
    try {
      const result = await CryptoService.deriveSharedKey(data.privateKeyRef, data.peerPublicKeyBase64);
      setSharedKey(result.sharedKey);
      toast.success("Clé partagée dérivée avec succès");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Erreur lors de la dérivation de la clé partagée");
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
          🔄 Dériver une clé partagée
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="privateKeyRef"
              render={({ field }) => (
                <FormItem className="bg-gray-50 p-4 border border-[#c7c7cc] rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                  <FormLabel>Clé privée locale</FormLabel>
                  <FormControl>
                    <Select onValueChange={handleKeyChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="-- Sélectionner une clé --" />
                      </SelectTrigger>
                      <SelectContent>
                        {privateKeys.map((k) => (
                          <SelectItem key={k.keyRef} value={k.keyRef} className="focus:shadow-[0_0_3px_1px]">
                            {k.name} • {k.algorithm}
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
              name="peerPublicKeyBase64"
              render={({ field }) => (
                <FormItem className="md:col-span-2 bg-gray-50 p-4 border border-[#c7c7cc] rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                  <FormLabel>Clé publique distante (Base64)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Collez ici la clé publique distante en Base64"
                      rows={4}
                      {...field}
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
              {form.formState.isSubmitting ? "⏳ Dérivation…" : "Dériver la clé partagée"}
            </Button>
          </form>
        </Form>

        {sharedKey && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-green-100 dark:bg-[#1a1a1a] p-4 rounded-lg shadow-[0_0_3px_1px] text-sm space-y-2"
          >
            <h3 className="font-semibold text-green-900">🔐 Clé partagée dérivée</h3>
            <code className="break-all text-xs bg-white dark:bg-[#1a1a1a] p-2 rounded block shadow-[inset_0_0_2px_1px_rgba(0,0,0,0.1)]">
              {sharedKey}
            </code>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );

}
