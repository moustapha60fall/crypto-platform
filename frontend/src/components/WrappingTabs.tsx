"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WrappingAsysSysForm from "@/pages/crypto/confidentiality/WrappingAsysSysForm";
import WrappingForm from "@/pages/crypto/confidentiality/WrappingForm";
import WrappingSysSysForm from "@/pages/crypto/confidentiality/WrappingSysSysForm";

export default function WrappingTabs() {
    return (
        <div className="space-y-1">
            <Tabs defaultValue="sys-asys" className="space-y-1">
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
                        sys_asys (AES ↔ RSA)
                    </TabsTrigger>
                    <TabsTrigger
                        value="sys-sys"
                        className="h-12 bg-[#fcfcfc] shadow-[0_0_3px_1px] text-center text-sm font-medium"
                    >
                        sys_sys (AES → AES)
                    </TabsTrigger>
                </TabsList>

                {/* sys_asys : cas général */}
                <TabsContent
                    value="asys-sys">
                    <WrappingAsysSysForm />
                </TabsContent>
                {/* asys_sys : envelopper clé asymétrique avec une clé symétrique */}
                <TabsContent
                    value="sys-asys">
                    <WrappingForm />
                </TabsContent>

                {/* sys_sys : envelopper clé symétrique avec une clé symétrique */}
                <TabsContent
                    value="sys-sys">
                    <WrappingSysSysForm />
                </TabsContent>
            </Tabs>
        </div>
    );
}
