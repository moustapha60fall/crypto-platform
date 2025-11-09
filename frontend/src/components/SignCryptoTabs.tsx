import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SignFileEncryptForm from "@/pages/crypto/authenticity/SignatureFileForm";
import SignatureForm from "@/pages/crypto/authenticity/SignatureForm";
import VerifySignatureFileForm from "@/pages/crypto/authenticity/VerifySignatureFileForm";
import VerifySignatureForm from "@/pages/crypto/authenticity/VerifySignatureForm";

export default function SignCryptoTabs() {
    return (
        <div className="space-y-1">
            <Tabs defaultValue="sign-text" className="space-y-1">
                <TabsList className="w-full grid grid-cols-4 gap-2 h-24 p-6 bg-[#fcfcfc] border border-[#c7c7cc] rounded shadow-[0_0_3px_1px_rgba(0,0,0,0.2)]">
                    <TabsTrigger
                        value="sign-text"
                        className="h-12 bg-[#fcfcfc] shadow-[0_0_3px_1px] text-center"
                    >
                        Signer texte
                    </TabsTrigger>
                    <TabsTrigger
                        value="verify-text"
                        className="h-12 bg-[#fcfcfc] shadow-[0_0_3px_1px] text-center"
                    >
                        Vérifier texte
                    </TabsTrigger>
                    <TabsTrigger
                        value="sign-file"
                        className="h-12 bg-[#fcfcfc] shadow-[0_0_3px_1px] text-center"
                    >
                        Signer fichier
                    </TabsTrigger>
                    <TabsTrigger
                        value="verify-file"
                        className="h-12 bg-[#fcfcfc] shadow-[0_0_3px_1px] text-center"
                    >
                        Vérifier fichier
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="sign-text">
                    <SignatureForm />
                </TabsContent>

                <TabsContent value="verify-text">
                    <VerifySignatureForm />
                </TabsContent>

                <TabsContent value="sign-file">
                    <SignFileEncryptForm />
                </TabsContent>

                <TabsContent value="verify-file">
                    <VerifySignatureFileForm />
                </TabsContent>
            </Tabs>
        </div>
    );
}
