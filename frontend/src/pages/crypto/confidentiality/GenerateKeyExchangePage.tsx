"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { KeyMaterial } from "@/types/key-material";
import { CryptoService } from "@/services/cryptoService";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CleService } from "@/services/cle-service";
import type { AppUser } from "@/types/app-user";
import { userService } from "@/services/userService";
import { useCurrentUser } from "@/hooks/useCurrentUser ";
import { Card } from "@/components/ui/card";

const schema = z.object({
    namePrefix: z.string().min(2, "Nom requis pour la clé"),
    algorithm: z.enum(["DH", "ECDH"]),
});
type FormValues = z.infer<typeof schema>;

export default function GenerateKeyExchangePage() {
    const [keys, setKeys] = useState<KeyMaterial[]>([]);
    const [generatedKeys, setGeneratedKeys] = useState<{ public: KeyMaterial; private: KeyMaterial } | null>(null);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);

    const { data: currentUser, isLoading: loadingCurrentUser } = useCurrentUser();

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            namePrefix: "",
            algorithm: "ECDH",
        },
    });

    // 🔹 Charger la liste des utilisateurs disponibles
    useEffect(() => {
        async function fetchUsers() {
            try {
                const res = await userService.getAllUsers(0, 50);
                setUsers(res.content || res); // support pagination ou simple liste
            } catch (err) {
                console.error(err);
                toast.error("Impossible de charger la liste des utilisateurs");
            } finally {
                setLoadingUsers(false);
            }
        }
        fetchUsers();
    }, []);

    const onSubmit = async (data: FormValues) => {
        try {
            const pair = await CryptoService.generateKeyPair(data.algorithm, data.namePrefix);
            setGeneratedKeys(pair);
            toast.success("✅ Paire de clés générée avec succès");
            setKeys((prev) => [...prev, pair.public, pair.private]);
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || "Erreur lors de la génération de la paire de clés");
        }
    };

    const handleShare = async () => {
        if (!generatedKeys?.public?.id || !currentUser?.id || selectedUsers.length === 0) {
            toast.error("Sélectionnez au moins un utilisateur.");
            return;
        }

        try {
            await Promise.all(
                selectedUsers.map((userId) =>
                    CleService.shareKey({
                        keyMaterialId: generatedKeys.public.id,
                        sharedByUserId: currentUser.id,
                        sharedWithUserId: userId,
                        encodedKey: generatedKeys.public.encodedKey,
                        algorithm: generatedKeys.public.algorithm
                    })
                )
            );

            toast.success("🔐 Clé partagée avec les utilisateurs sélectionnés !");
            setShareModalOpen(false);
            setSelectedUsers([]);
        } catch (err: any) {
            toast.error("Erreur lors du partage : " + err.message);
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
                    🔑 Générer une paire de clés DH/ECDH
                </h2>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                            control={form.control}
                            name="namePrefix"
                            render={({ field }) => (
                                <FormItem className="bg-gray-50 p-4 border border-[#c7c7cc] rounded-[3px] hover:shadow-[0_0_3px_1px] transition">
                                    <FormLabel>Nom préfixe</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Préfixe pour la clé" {...field} className="focus:shadow-[0_0_3px_1px]" />
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
                                                <SelectItem value="ECDH">ECDH (recommandé)</SelectItem>
                                                <SelectItem value="DH">DH</SelectItem>
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
                            {form.formState.isSubmitting ? "⏳ Génération…" : "Générer la paire"}
                        </Button>
                    </form>
                </Form>

                {generatedKeys && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-green-100 dark:bg-[#1a1a1a] p-4 rounded-lg shadow-[0_0_3px_1px] text-sm space-y-4"
                    >
                        <h3 className="font-semibold text-green-900">✅ Paire générée</h3>

                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Clé publique (Base64) :</span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setShareModalOpen(true)}
                                    className="mb-4 bg-[#fcfcfc] dark:bg-[#1a1a1a] shadow-[0_0_3px_1px]"
                                >
                                    Partager
                                </Button>
                            </div>
                            <textarea
                                readOnly
                                value={generatedKeys.public.encodedKey ?? ""}
                                className="w-full text-xs bg-white dark:bg-[#1a1a1a] border rounded-md p-2 break-all font-mono shadow-[inset_0_0_2px_1px_rgba(0,0,0,0.1)]"
                                rows={4}
                            />
                            <p className="text-xs text-muted-foreground">
                                Cette clé publique peut être partagée avec d'autres utilisateurs pour l'échange ECDH.
                            </p>
                        </div>

                        <div>
                            <strong>Clé privée :</strong> {generatedKeys.private.keyRef}
                            <p className="text-xs text-muted-foreground">
                                La clé privée reste stockée localement dans le KMS.
                            </p>
                        </div>
                    </motion.div>
                )}

                {keys.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gray-100 dark:bg-[#1a1a1a] p-4 rounded-lg shadow-[0_0_3px_1px] text-sm space-y-2"
                    >
                        <h3 className="font-semibold text-gray-800">📦 Clés existantes</h3>
                        <ul className="space-y-2">
                            {keys.map((k) => (
                                <li key={k.keyRef} className="flex justify-between items-center">
                                    <span>{k.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {k.algorithm} • {k.keyType}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}

                <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>🔗 Partager la clé publique</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            {loadingUsers || loadingCurrentUser ? (
                                <p className="text-sm">Chargement des utilisateurs...</p>
                            ) : (
                                <div className="space-y-2">
                                    {users.map((u) => (
                                        <label key={u.id} className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                value={u.id}
                                                checked={selectedUsers.includes(u.id)}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setSelectedUsers((prev) =>
                                                        checked ? [...prev, u.id] : prev.filter((id) => id !== u.id)
                                                    );
                                                }}
                                            />
                                            {u.username} ({u.email})
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setShareModalOpen(false)}>
                                Annuler
                            </Button>
                            <Button onClick={handleShare} disabled={selectedUsers.length === 0}>
                                Partager
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </Card>
        </motion.div>
    );

}
