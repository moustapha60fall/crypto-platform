import { useState } from "react";
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
import { HashFunctions } from "@/types/crypto";
import { CryptoService } from "@/services/cryptoService";
import { Textarea } from "@/components/ui/textarea";

// 🧪 Validation schema
const schema = z.object({
  message: z.string().min(1, "Message requis"),
  hashFunction: z.enum(Object.values(HashFunctions) as [string, ...string[]]),
});

type FormValues = z.infer<typeof schema>;

export default function HashForm() {
  const [output, setOutput] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      message: "",
      hashFunction: HashFunctions.SHA256,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const result = await CryptoService.hashMessage(data.message, data.hashFunction);
      setOutput(result);
      toast.success("✅ Hash généré avec succès");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Erreur lors du hachage");
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
          🔎 Hachage de message
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="md:col-span-2 bg-gray-50 p-4 bg-[#fcfcfc] dark:bg-[#1a1a1a]
              border border-[#c7c7cc] dark:border-gray-700
              rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea className="focus:shadow-[0_0_3px_1px]"
                      {...field}
                      placeholder="Texte à hacher"
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
                    Sortie encodée en <code>Base64</code>
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
              {form.formState.isSubmitting ? "⏳ Hachage…" : "Générer le hash"}
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
            <strong>Hash :</strong>
            <div className="dark:bg-[#1a1a1a] shadow-[0_0_3px_1px] text-gray-800 whitespace-pre-wrap break-words max-h-26 overflow-y-auto p-1.25 mt-1 bg-white rounded">
              {output}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(output);
                toast.success("Hash copié");
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
