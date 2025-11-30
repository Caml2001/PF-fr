import { PageContainer, ContentContainer, SectionHeader } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon, StoreIcon } from "lucide-react";

export default function PartnersSection() {
  const partners = [
    {
      name: "Drunkers.Store",
      description: "Compra ahora y paga después en tu tienda aliada. Solo BNPL por el momento.",
      logo: "https://drunkers.store/src/logo_prin.png",
      url: "https://drunkers.store/"
    }
  ];

  return (
    <PageContainer>
      <ContentContainer className="space-y-4">
        <SectionHeader 
          title="Comercios aliados"
          subtitle="Compra con SaltoPay en tiendas participantes"
        />

        {partners.map((partner) => (
          <Card key={partner.name} className="overflow-hidden">
            <CardContent className="p-4 space-y-3">
              <div className="h-20 w-full rounded-xl bg-muted flex items-center justify-center overflow-hidden border">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <StoreIcon className="h-4 w-4" />
                  Aliado BNPL
                </p>
                <h3 className="text-lg font-semibold">{partner.name}</h3>
                <p className="text-sm text-muted-foreground">{partner.description}</p>
              </div>
              <Button asChild className="w-full">
                <a href={partner.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 justify-center">
                  Ir a la tienda <ExternalLinkIcon className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              ¿Quieres sumar tu comercio? Escríbenos a{" "}
              <a className="text-primary font-semibold" href="mailto:alejandro@saltopay.com">
                alejandro@saltopay.com
              </a>{" "}
              o al WhatsApp <a className="text-primary font-semibold" href="https://wa.me/524493876463">449 387 6463</a>.
            </p>
          </CardContent>
        </Card>
      </ContentContainer>
    </PageContainer>
  );
}
