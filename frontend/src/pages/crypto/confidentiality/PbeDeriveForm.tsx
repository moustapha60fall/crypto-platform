import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrentUser } from "@/hooks/useCurrentUser ";
import type { KeyMaterial } from "@/types/key-material";
import { CleService } from "@/services/cle-service";
import type { PbeDeriveKeyDTO } from "@/types/pbe";
import { Card } from "@/components/ui/card";

const schema = z.object({
  name: z.string().min(2, "Nom requis"),
  masterkeyRef: z.string().min(1, "Référence de la clé maîtresse requise"),
  keySize: z.number().int().positive("Taille invalide"),
  derivationAlgorithm: z.enum(["HKDF", "PBKDF2"]),
});

type FormValues = z.infer<typeof schema>;

export default function DeriveSymmetricKeyPage() {
  const [derivedKey, setDerivedKey] = useState<KeyMaterial | null>(null);
  const [availableKeys, setAvailableKeys] = useState<KeyMaterial[]>([]);
  const { data: currentUser, isSuccess } = useCurrentUser();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      masterkeyRef: "",
      keySize: 256,
      derivationAlgorithm: "HKDF",
    },
  });

  useEffect(() => {
    if (isSuccess && currentUser?.id) {
      CleService.getByOwner(currentUser.id).then((data) => {
        setAvailableKeys(data.filter((k) => k.keyType === "SYMMETRIC"));
      });
    }
  }, [isSuccess]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (!currentUser?.id) return;

      const dto: PbeDeriveKeyDTO = {
        name: values.name,
        masterkeyRef: values.masterkeyRef,
        keySize: values.keySize,
        derivationAlgorithm: values.derivationAlgorithm,
        ownerId: currentUser.id,
      };

      const result = await CleService.deriveKey(dto);
      setDerivedKey(result);
      toast.success("Clé dérivée avec succès");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Erreur lors de la dérivation");
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
          🔁 Dériver une clé symétrique
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="bg-gray-50 p-4 bg-[#fcfcfc] dark:bg-[#1a1a1a]
              border border-[#c7c7cc] dark:border-gray-700
              rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                  <FormLabel>Nom de la clé dérivée</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom de la clé dérivée" {...field} className="focus:shadow-[0_0_3px_1px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="masterkeyRef"
              render={({ field }) => (
                <FormItem className="bg-gray-50 p-4 bg-[#fcfcfc] dark:bg-[#1a1a1a]
              border border-[#c7c7cc] dark:border-gray-700
              rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                  <FormLabel>Clé maîtresse</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une clé maîtresse" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableKeys.map((k) => (
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
              name="keySize"
              render={({ field }) => (
                <FormItem className="bg-gray-50 p-4 bg-[#fcfcfc] dark:bg-[#1a1a1a]
              border border-[#c7c7cc] dark:border-gray-700
              rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                  <FormLabel>Taille (bits)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="256" {...field} className="focus:shadow-[0_0_3px_1px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="derivationAlgorithm"
              render={({ field }) => (
                <FormItem className="bg-gray-50 p-4 bg-[#fcfcfc] dark:bg-[#1a1a1a]
              border border-[#c7c7cc] dark:border-gray-700
              rounded-[3px] hover:shadow-[0_0_3px_1px] transition md:col-span-2">
                  <FormLabel>Algorithme de dérivation</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un algorithme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HKDF">HKDF</SelectItem>
                        <SelectItem value="PBKDF2">PBKDF2</SelectItem>
                      </SelectContent>
                    </Select>
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
              {form.formState.isSubmitting ? "⏳ Dérivation…" : "Dériver la clé"}
            </Button>
          </form>
        </Form>

        {derivedKey && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-green-100 dark:bg-[#1a1a1a] shadow-[0_0_3px_1px] p-4 rounded-lg text-sm space-y-2"
          >
            <strong>✅ Clé dérivée</strong>
            <ul className="space-y-1">
              <li><strong>ID :</strong> {derivedKey.id}</li>
              <li><strong>Nom :</strong> {derivedKey.name}</li>
              <li><strong>Algorithme :</strong> {derivedKey.algorithm}</li>
              <li><strong>Type :</strong> {derivedKey.keyType}</li>
              <li><strong>Référence :</strong> {derivedKey.keyRef}</li>
              <li><strong>Créée le :</strong> {derivedKey.createdAt}</li>
            </ul>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}
