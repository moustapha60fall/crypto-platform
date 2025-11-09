"use client"

import { motion } from "framer-motion"

export default function ConfidentialityIndex() {
    return (
        <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >

            <div className="md:col-span-2 space-y-4">
                <h1 className="text-2xl font-bold text-blue-700">Service de Confidentialité</h1>
                <p className="text-muted-foreground">
                    Ce module vous permet de chiffrer et déchiffrer des données à l’aide d’algorithmes symétriques et asymétriques.
                    Vous pouvez également générer des clés sécurisées pour vos opérations.
                </p>
            </div>
        </motion.div>
    )
}

