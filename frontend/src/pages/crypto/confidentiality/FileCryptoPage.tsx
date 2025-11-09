"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FileEncryptForm from "./FileEncryptForm"
import FileDecryptForm from "./FileDecryptForm"

export default function FileCryptoPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🔐 File Encryption / Decryption</h1>

      <Tabs defaultValue="encrypt" className="w-full">
        {/* Onglets */}
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="encrypt">Encrypt</TabsTrigger>
          <TabsTrigger value="decrypt">Decrypt</TabsTrigger>
        </TabsList>

        {/* Contenu Encrypt */}
        <TabsContent value="encrypt">
          <FileEncryptForm />
        </TabsContent>

        {/* Contenu Decrypt */}
        <TabsContent value="decrypt">
          <FileDecryptForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
