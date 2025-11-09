import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DeriveSharedKeyPage from "@/pages/crypto/confidentiality/DeriveSharedKeyPage";
import GenerateKeyExchangePage from "@/pages/crypto/confidentiality/GenerateKeyExchangePage";

export default function SharedTabs() {
    return (
        <div className="space-y-1">
            <Tabs defaultValue="encrypt" className="space-y-1">
                <TabsList className="w-full grid grid-cols-4 gap-2 h-24 p-6 bg-[#fcfcfc] border border-[#c7c7cc] rounded shadow-[0_0_3px_1px_rgba(0,0,0,0.2)]">
                    <TabsTrigger value="shared" className="h-12 bg-[#fcfcfc] shadow-[0_0_3px_1px] text-center">
                        Générer paire
                    </TabsTrigger>
                    <TabsTrigger value="derive" className="h-12 bg-[#fcfcfc] shadow-[0_0_3px_1px] text-center">
                        Dériver clé
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="shared">
                    <GenerateKeyExchangePage />
                </TabsContent>

                <TabsContent value="derive">
                    <DeriveSharedKeyPage />
                </TabsContent>
            </Tabs>
        </div>
    );
}
