import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { KeyMaterial } from "@/types/key-material";
import { HashFunctions, type HashFunction } from "@/types/crypto";
import { useCurrentUser } from "@/hooks/useCurrentUser ";
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
import type { SignatureDTO } from "@/types/signature";
import { Textarea } from "@/components/ui/textarea";


// 🧪 Schéma de validation
const schema = z.object({
  publicKeyRef: z.string().min(1, "Clé publique requise"),
  message: z.string().min(1, "Message original requis"),
  signature: z.string().min(1, "Signature à vérifier requise"),
  hashFunction: z.enum(Object.values(HashFunctions) as [HashFunction, ...HashFunction[]]),
});

type FormValues = z.infer<typeof schema>;

export default function VerifySignatureForm() {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [keys, setKeys] = useState<KeyMaterial[]>([]);
  const [selectedKey, setSelectedKey] = useState<KeyMaterial | null>(null);
  const { data: currentUser, isLoading, isError } = useCurrentUser();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      publicKeyRef: "",
      message: "",
      signature: "",
      hashFunction: HashFunctions.SHA256,
    },
  });

  // 🔑 Charger les clés publiques
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
      const dto: SignatureDTO = {
        publicKeyRef: data.publicKeyRef,
        message: data.message,
        signature: data.signature,
        algorithm: selectedKey.algorithm,
        hashFunction: data.hashFunction,
        performedById: currentUser.id,
      };

      const result = await CryptoService.verifyMessage(dto);
      setIsValid(result.isValid ?? null);

      if (result.isValid) {
        toast.success("✅ Signature valide");
      } else {
        toast.error("❌ Signature invalide");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Erreur de vérification");
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
          🔎 Vérification de signature
        </h2>

        {isLoading && <p className="text-gray-500">Chargement de l’utilisateur…</p>}
        {isError && <p className="text-red-500">❌ Erreur de chargement utilisateur</p>}
        {keys.length === 0 && !isError && <p className="text-gray-500">🔄 Chargement des clés…</p>}

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
              name="message"
              render={({ field }) => (
                <FormItem className="md:col-span-2 bg-gray-50 p-4 border border-[#c7c7cc] rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                  <FormLabel>Message original</FormLabel>
                  <FormControl>
                    <Textarea className="focus:shadow-[0_0_3px_1px]"
                      {...field}
                      placeholder="Texte original signé"
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
              name="signature"
              render={({ field }) => (
                <FormItem className="md:col-span-2 bg-gray-50 p-4 border border-[#c7c7cc] rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                  <FormLabel>Signature</FormLabel>
                  <FormControl>
                    <Textarea className="focus:shadow-[0_0_3px_1px]"
                      {...field}
                      placeholder="Signature à vérifier"
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
              {form.formState.isSubmitting ? "⏳ Vérification…" : "Vérifier"}
            </Button>
          </form>
        </Form>

        {isValid !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`p-4 rounded-md text-sm space-y-2 shadow-[0_0_3px_1px] ${isValid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
          >
            <strong>Résultat :</strong>
            <div>{isValid ? "✅ Signature valide" : "❌ Signature invalide"}</div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );

}
