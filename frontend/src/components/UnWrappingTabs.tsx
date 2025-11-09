"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UnwrappingAsysSysForm from "@/pages/crypto/confidentiality/UnwrappingForm";
import UnwrappingSysAsysForm from "@/pages/crypto/confidentiality/UnwrappingSysAsysForm";
import UnwrappingSysSysForm from "@/pages/crypto/confidentiality/UnwrappingSysSysForm";

export default function UnWrappingTabs() {
    return (
        <div className="space-y-1">
            <Tabs defaultValue="asys-sys" className="space-y-1">
                <TabsList className="w-full grid grid-cols-3 gap-2 h-20 p-4 bg-[#fcfcfc] border border-[#c7c7cc] rounded shadow-[0_0_3px_1px_rgba(0,0,0,0.2)]">
                    <TabsTrigger
                        value="asys-sys"
                        className="h-12 bg-[#fcfcfc] shadow-[0_0_3px_1px] text-center text-sm font-medium"
                    >
                        asys_sys (RSA → AES)
                    </TabsTrigger>
                    <TabsTrigger
                        value="sys-asys"
                        className="h-12 bg-[#fcfcfc] shadow-[0_0_3px_1px] text-center text-sm font-medium"
                    >
                        sys_asys (AES → RSA)
                    </TabsTrigger>
                    <TabsTrigger
                        value="sys-sys"
                        className="h-12 bg-[#fcfcfc] shadow-[0_0_3px_1px] text-center text-sm font-medium"
                    >
                        sys_sys (AES → AES)
                    </TabsTrigger>
                </TabsList>

                {/* RSA → AES : désenveloppement avec clé privée RSA */}
                <TabsContent value="asys-sys">
                    <UnwrappingAsysSysForm />
                </TabsContent>

                {/* AES → RSA : désenveloppement avec clé AES */}
                <TabsContent value="sys-asys">
                    <UnwrappingSysAsysForm />
                </TabsContent>

                {/* AES → AES : désenveloppement avec clé AES */}
                <TabsContent value="sys-sys">
                    <UnwrappingSysSysForm />
                </TabsContent>
            </Tabs>
        </div>
    );
}
