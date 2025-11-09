// CryptoTabs.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import EncryptForm from "../pages/crypto/confidentiality/EncryptForm"
import DecryptForm from "../pages/crypto/confidentiality/DecryptForm"
import FileEncryptForm from "@/pages/crypto/confidentiality/FileEncryptForm"
import FileDecryptForm from "@/pages/crypto/confidentiality/FileDecryptForm"

export default function CryptoTabs() {
    return (
        <div className="space-y-1">
            <Tabs defaultValue="encrypt" className="space-y-1">
                <TabsList className="w-full grid grid-cols-4 gap-2 h-24 p-6 bg-[#fcfcfc] border border-[#c7c7cc] rounded shadow-[0_0_3px_1px_rgba(0,0,0,0.2)]">
                    <TabsTrigger
                        value="encrypt"
                        className="h-12 bg-[#fcfcfc] shadow-[0_0_3px_1px] text-center"
                    >
                        Chiffrer texte
                    </TabsTrigger>
                    <TabsTrigger
                        value="decrypt"
                        className="h-12 bg-[#fcfcfc] shadow-[0_0_3px_1px] text-center"
                    >
                        Déchiffrer texte
                    </TabsTrigger>
                    <TabsTrigger
                        value="file-encrypt"
                        className="h-12 bg-[#fcfcfc] shadow-[0_0_3px_1px] text-center"
                    >
                        Chiffrer fichier
                    </TabsTrigger>
                    <TabsTrigger
                        value="file-decrypt"
                        className="h-12 bg-[#fcfcfc] shadow-[0_0_3px_1px] text-center"
                    >
                        Déchiffrer fichier
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="encrypt">
                    <EncryptForm />
                </TabsContent>

                <TabsContent value="decrypt">
                    <DecryptForm />
                </TabsContent>

                <TabsContent value="file-encrypt">
                    <FileEncryptForm />
                </TabsContent>

                <TabsContent value="file-decrypt">
                    <FileDecryptForm />
                </TabsContent>
            </Tabs>
        </div>
    )
}
