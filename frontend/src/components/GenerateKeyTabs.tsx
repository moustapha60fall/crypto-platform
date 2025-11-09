import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import GenerateAsymmetricKeyPage from "@/pages/crypto/confidentiality/GenerateAsymmetricKeyPage"
import GenerateSymmetricKeyPage from "@/pages/crypto/confidentiality/GenerateSymmetricKeyPage"
import DeriveSymmetricKeyPage from "@/pages/crypto/confidentiality/PbeDeriveForm"

export default function GenerateKeyTabs() {
    return (
        <div className="space-y-1">
            <Tabs defaultValue="symmetric" className="space-y-2">
                <TabsList className="w-full grid grid-cols-3 gap-2 h-20 p-4 bg-[#fcfcfc] border border-[#c7c7cc] rounded shadow-[0_0_3px_1px_rgba(0,0,0,0.2)]">
                    <TabsTrigger
                        value="symmetric"
                        className="h-12 bg-[#fcfcfc] shadow-[0_0_3px_1px] text-center text-sm font-medium hover:bg-[#f0f0f0] transition-all"
                    >
                        Symmetric Key
                    </TabsTrigger>
                    <TabsTrigger
                        value="asymmetric"
                        className="h-12 bg-[#fcfcfc] shadow-[0_0_3px_1px] text-center text-sm font-medium hover:bg-[#f0f0f0] transition-all"
                    >
                        Asymmetric Key
                    </TabsTrigger>
                    <TabsTrigger
                        value="exchange"
                        className="h-12 bg-[#fcfcfc] shadow-[0_0_3px_1px] text-center text-sm font-medium hover:bg-[#f0f0f0] transition-all"
                    >
                        Dériver une clé symétrique
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="symmetric" className="pt-4">
                    <GenerateSymmetricKeyPage />
                </TabsContent>

                <TabsContent value="asymmetric" className="pt-4">
                    <GenerateAsymmetricKeyPage />
                </TabsContent>

                <TabsContent value="exchange" className="pt-4">
                    <DeriveSymmetricKeyPage />
                </TabsContent>
            </Tabs>
        </div>
    )
}
