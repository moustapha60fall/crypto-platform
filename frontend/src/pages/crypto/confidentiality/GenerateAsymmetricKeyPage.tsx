"use client"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import type { KeyMaterial } from "@/types/key-material";
import { CryptoAlgorithms, KeyTypes } from "@/types/crypto";
import { useCurrentUser } from "@/hooks/useCurrentUser ";
import { CleService } from "@/services/cle-service";
import { Card } from "@/components/ui/card";

// --- Schéma de formulaire ---
const schema = z.object({
  name: z.string().min(2, "Nom requis pour la clé"),
  algorithm: z.enum([
    CryptoAlgorithms.RSA,
    CryptoAlgorithms.DSA,
    CryptoAlgorithms.ECDSA,
    CryptoAlgorithms.EDDSA,
    CryptoAlgorithms.ELGAMAL,
  ]),
  size: z.number().int().positive("Taille invalide"),
});

type FormValues = z.infer<typeof schema>;

export default function GenerateAsymmetricKeyPage() {
  const [keys, setKeys] = useState<KeyMaterial[]>([]);
  const [generatedAsymmetricKeys, setGeneratedAsymmetricKeys] = useState<{
    public: KeyMaterial;
    private: KeyMaterial;
  } | null>(null);

  const { data: currentUser, isSuccess } = useCurrentUser();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      algorithm: CryptoAlgorithms.RSA,
      size: 2048,
    },
  });

  // --- Charger les clés existantes ---
  const loadKeys = async () => {
    try {
      if (!currentUser?.id) return;
      const data = await CleService.getByOwner(currentUser.id);
      setKeys(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Impossible de charger les clés asymétriques");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      loadKeys();
    }
  }, [isSuccess]);

  // --- Soumission du formulaire ---
  const onSubmit = async (data: FormValues) => {
    try {
      if (!currentUser?.id) return;
      const generated = await CleService.generateKey(
        data.algorithm,
        data.size,
        data.name,
        currentUser.id
      );
      setGeneratedAsymmetricKeys({
        public: generated.public,
        private: generated.private,
      });

      toast.success("Clé asymétrique générée avec succès");
      loadKeys();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Erreur lors de la génération de la clé");
    }
  };

  // --- Taille disponible par algo ---
  const getSizesForAlgorithm = (algo: string) => {
    switch (algo) {
      case CryptoAlgorithms.RSA:
        return [1024, 2048, 3072, 4096];
      case CryptoAlgorithms.DSA:
        return [1024, 2048, 3072];
      case CryptoAlgorithms.ECDSA:
        return [256, 384, 521];
      case CryptoAlgorithms.EDDSA:
        return [256, 384, 512];
      case CryptoAlgorithms.ELGAMAL:
        return [1024, 2048, 3072];
      default:
        return [2048];
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
          🔐 Générer une clé asymétrique
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="bg-gray-50 p-4 border border-[#c7c7cc] rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                  <FormLabel>Nom de la clé</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom de la clé" {...field} className="focus:shadow-[0_0_3px_1px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="algorithm"
              render={({ field }) => (
                <FormItem className="bg-gray-50 p-4 border border-[#c7c7cc] rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                  <FormLabel>Algorithme</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un algorithme" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          CryptoAlgorithms.RSA,
                          CryptoAlgorithms.DSA,
                          CryptoAlgorithms.ECDSA,
                          CryptoAlgorithms.EDDSA,
                          CryptoAlgorithms.ELGAMAL,
                        ].map((algo) => (
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
              name="size"
              render={({ field }) => {
                const sizes = getSizesForAlgorithm(form.watch("algorithm"));
                return (
                  <FormItem className="md:col-span-2 bg-gray-50 p-4 border border-[#c7c7cc] rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                    <FormLabel>Taille (bits)</FormLabel>
                    <FormControl>
                      <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value.toString()}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une taille" />
                        </SelectTrigger>
                        <SelectContent>
                          {sizes.map((s) => (
                            <SelectItem key={s} value={s.toString()} className="focus:shadow-[0_0_3px_1px]">
                              {s} bits
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <Button
              type="submit"
              className="md:col-span-2 py-2 px-4 rounded transition"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "⏳ Génération…" : "Générer la clé"}
            </Button>
          </form>
        </Form>

        {generatedAsymmetricKeys && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-green-100 dark:bg-[#1a1a1a] p-4 rounded-lg shadow-[0_0_3px_1px] text-sm space-y-1"
          >
            <h3 className="font-semibold text-green-900 mb-2">Clés asymétriques générées</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[generatedAsymmetricKeys.public, generatedAsymmetricKeys.private].map((key) => (
                <div key={key.id} className="bg-green-100 dark:bg-[#1a1a1a] p-4 rounded-lg shadow-[0_0_3px_1px] border border-gray-300 space-y-1">
                  <h4 className="font-semibold text-green-900">{key.keyType === "ASYMMETRIC_PUBLIC" ? "Clé publique" : "Clé privée"}</h4>
                  <ul className="space-y-1">
                    <li><strong>ID :</strong> {key.id}</li>
                    <li><strong>Nom :</strong> {key.name}</li>
                    <li><strong>Algorithme :</strong> {key.algorithm}</li>
                    <li><strong>Type :</strong> {key.keyType}</li>
                    <li><strong>Créée le :</strong> {key.createdAt}</li>
                    <li><strong>Référence :</strong> {key.keyRef}</li>
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {keys.filter(k => k.keyType === KeyTypes.ASYMMETRIC_PUBLIC || k.keyType === KeyTypes.ASYMMETRIC_PRIVATE).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-100 dark:bg-[#1a1a1a] p-4 rounded-lg shadow-[0_0_3px_1px] text-sm space-y-2"
          >
            <h3 className="font-semibold text-gray-800">Clés asymétriques existantes</h3>
            <ul className="space-y-2">
              {keys
                .filter(k => k.keyType === KeyTypes.ASYMMETRIC_PUBLIC || k.keyType === KeyTypes.ASYMMETRIC_PRIVATE)
                .map(k => (
                  <li key={k.id} className="flex justify-between items-center">
                    <span>{k.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {k.algorithm} • {k.keyType}
                    </span>
                  </li>
                ))}
            </ul>
          </motion.div>
        )}

      </Card>
    </motion.div>
  );

}
