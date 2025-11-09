import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Info_Personnelles from "@/pages/user/Info_Personnelles"
import Info_supplementaire from "@/pages/user/Info_supplementaire"
import Parametres_Securite from "@/pages/user/Parametres_Securite"
import Preferences_Communucation from "@/pages/user/Preferences_Communucation"

export default function UsersTabs() {
    return (
        <div className="space-y-1">
            <Tabs defaultValue="info-personnelles" className="space-y-1">
                <TabsList className="w-full grid grid-cols-4 gap-2 h-24 p-6 bg-[#fcfcfc] border border-[#c7c7cc] rounded shadow-[0_0_3px_1px_rgba(0,0,0,0.2)]">
                    <TabsTrigger
                        value="info-personnelles"
                        className="h-12 bg-[#fcfcfc] shadow-[0_0_3px_1px] text-center"
                    >
                        Info Personnelles
                    </TabsTrigger>
                    <TabsTrigger
                        value="info-supplémentaire"
                        className="h-12 bg-[#fcfcfc] shadow-[0_0_3px_1px] text-center"
                    >
                        Info supplémentaire
                    </TabsTrigger>
                    <TabsTrigger
                        value="parametres-securite"
                        className="h-12 bg-[#fcfcfc] shadow-[0_0_3px_1px] text-center"
                    >
                        Paramètres Sécurité
                    </TabsTrigger>
                    <TabsTrigger
                        value="Preferences-Communucation"
                        className="h-12 bg-[#fcfcfc] shadow-[0_0_3px_1px] text-center"
                    >
                        Préférences Communucation
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="info-personnelles">
                    <Info_Personnelles />
                </TabsContent>

                <TabsContent value="info-supplémentaire">
                    <Info_supplementaire />
                </TabsContent>

                <TabsContent value="parametres-securite">
                    <Parametres_Securite />
                </TabsContent>

                <TabsContent value="Preferences-Communucation">
                    <Preferences_Communucation />
                </TabsContent>
            </Tabs>
        </div>
    )
}
