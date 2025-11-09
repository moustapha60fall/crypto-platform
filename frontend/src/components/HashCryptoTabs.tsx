import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HashFileForm from "@/pages/crypto/integrity/HashFileForm";
import HashForm from "@/pages/crypto/integrity/HashForm";
import HmacFileForm from "@/pages/crypto/integrity/HmacFileForm";
import HmacForm from "@/pages/crypto/integrity/HmacForm";


export default function HashCryptoTabs() {
    return (
        <div className="space-y-1">
            <Tabs defaultValue="hash-text" className="space-y-1">
                <TabsList className="w-full grid grid-cols-4 gap-2 h-24 p-6 bg-[#fcfcfc] border border-[#c7c7cc] rounded shadow-[0_0_3px_1px_rgba(0,0,0,0.2)]">
                    <TabsTrigger
                        value="hash-text"
                        className="h-12 bg-[#fcfcfc] shadow-[0_0_3px_1px] text-center"
                    >
                        Hacher texte
                    </TabsTrigger>
                    <TabsTrigger
                        value="hash-file"
                        className="h-12 bg-[#fcfcfc] shadow-[0_0_3px_1px] text-center"
                    >
                        Hacher fichier
                    </TabsTrigger>
                    <TabsTrigger
                        value="hmac-text"
                        className="h-12 bg-[#fcfcfc] shadow-[0_0_3px_1px] text-center"
                    >
                        HMAC texte
                    </TabsTrigger>
                    <TabsTrigger
                        value="hmac-file"
                        className="h-12 bg-[#fcfcfc] shadow-[0_0_3px_1px] text-center"
                    >
                        HMAC fichier
                    </TabsTrigger>
                </TabsList>

                <TabsContent
                    value="hash-text"
                    className="bg-[#fcfcfc] border border-[#c7c7cc] rounded shadow-[0_0_3px_1px_rgba(0,0,0,0.2)]"
                >
                    <HashForm />
                </TabsContent>

                <TabsContent
                    value="hash-file"
                    className="bg-[#fcfcfc] border border-[#c7c7cc] rounded shadow-[0_0_3px_1px_rgba(0,0,0,0.2)]"
                >
                    <HashFileForm />
                </TabsContent>

                <TabsContent
                    value="hmac-text"
                    className="bg-[#fcfcfc] border border-[#c7c7cc] rounded shadow-[0_0_3px_1px_rgba(0,0,0,0.2)]"
                >
                    <HmacForm />
                </TabsContent>

                <TabsContent
                    value="hmac-file"
                    className="bg-[#fcfcfc] border border-[#c7c7cc] rounded shadow-[0_0_3px_1px_rgba(0,0,0,0.2)]"
                >
                    <HmacFileForm />
                </TabsContent>
            </Tabs>
        </div>
    );
}
