import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

export default function StatsPage() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">📊 Statistiques cryptographiques</h2>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
                <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-2">🔐 Par primitive</h3>
                    {/* <img src="/primitive_stats_bar.png" alt="Statistiques primitives" className="rounded shadow" /> */}
                </Card>

                <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-2">📊 Par service</h3>
                    {/* <img src="/service_stats_pie.png" alt="Statistiques services" className="rounded shadow" /> */}
                </Card>
            </motion.div>
        </div>
    );
}
