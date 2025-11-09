import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AsysDecryptForm from "@/pages/crypto/confidentiality/AsysDecryptForm";
import AsysEncryptForm from "@/pages/crypto/confidentiality/AsysEncryptForm";
import AsysEncryptFileForm from "@/pages/crypto/confidentiality/AsysEncryptFileForm";
import AsysDecryptFileForm from "@/pages/crypto/confidentiality/AsysDecryptFileForm";

export default function AsymmetricCryptoTabs() {
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
          <AsysEncryptForm />
        </TabsContent>

        <TabsContent value="decrypt">
          <AsysDecryptForm />
        </TabsContent>

        <TabsContent value="file-encrypt">
          <AsysEncryptFileForm />
        </TabsContent>

        <TabsContent value="file-decrypt">
          <AsysDecryptFileForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
