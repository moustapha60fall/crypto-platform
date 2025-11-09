import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import AsymmetricKeysPage from "@/pages/crypto/keys/AsymmetricKeysPage"
import MyKeysPage from "@/pages/crypto/keys/MyKeysPage"
import SymmetricKeysPage from "@/pages/crypto/keys/SymmetricKeysPage"

export default function ListKeysTabs() {
    return (
        <div className="space-y-1">
            <Tabs defaultValue="all" className="space-y-1">
                <TabsList className="w-full grid grid-cols-3 gap-2 h-20 p-4 bg-[#fcfcfc] border border-[#c7c7cc] rounded shadow-[0_0_3px_1px_rgba(0,0,0,0.2)]">
                    <TabsTrigger
                        value="all"
                        className="h-12 bg-[#fcfcfc] shadow-[0_0_3px_1px] text-center"
                    >
                        Toutes les clés
                    </TabsTrigger>
                    <TabsTrigger
                        value="symmetric"
                        className="h-12 bg-[#fcfcfc] shadow-[0_0_3px_1px] text-center"
                    >
                        Clés symétriques
                    </TabsTrigger>
                    <TabsTrigger
                        value="asymmetric"
                        className="h-12 bg-[#fcfcfc] shadow-[0_0_3px_1px] text-center"
                    >
                        Clés asymétriques
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                    <MyKeysPage />
                </TabsContent>

                <TabsContent value="symmetric">
                    <SymmetricKeysPage />
                </TabsContent>

                <TabsContent value="asymmetric">
                    <AsymmetricKeysPage />
                </TabsContent>
            </Tabs>
        </div>
    )
}
