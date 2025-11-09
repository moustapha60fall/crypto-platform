import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { decouverteSection } from "@/data/data";
import { Star } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";

export function SectionADecouvrir() {
    return (
        <section>
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                        <Star className="w-6 h-6 text-yellow-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800">À découvrir</h2>
                </div>
                <p className="text-slate-600 text-sm max-w-3xl">
                    Explorez les fondations de la sécurité cryptographique : les services qu’elle garantit, les systèmes qui les implémentent, et les primitives qui les rendent possibles.
                </p>
            </div>

            <Carousel className="w-full">
                <CarouselContent>
                    {decouverteSection.items.map((item, i) => (
                        <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                            <Card className="p-4 flex flex-col gap-4 items-start" style={{ backgroundColor: item.color }}>
                                <item.icon className="w-6 h-6 text-white" />
                                <h3 className="text-white text-lg font-semibold">{item.title}</h3>
                                <p className="text-white text-sm">{item.description}</p>
                                <Link to={item.to}>
                                    <Button variant="secondary" size="sm">
                                        Explorer
                                    </Button>
                                </Link>
                            </Card>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </section>
    );
}
