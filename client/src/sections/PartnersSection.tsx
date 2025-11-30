import { PageContainer, ContentContainer, SectionHeader, PageHeader } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon, StoreIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import apiClient from "@/lib/api/axios";
import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";

export default function PartnersSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<"idle" | "success" | "error">("idle");
  const [open, setOpen] = useState(false);
  const { data: profile } = useProfile();

  const partners = [
    {
      name: "Drunkers.Store",
      description: "Compra ahora y paga después en tu tienda aliada. Solo BNPL por el momento.",
      logo: "https://drunkers.store/src/logo_prin.png",
      url: "https://drunkers.store/"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setIsSubmitting(true);
    setFeedback("idle");
    try {
      await apiClient.post("/api/tracking/events", {
        eventName: "partner_interest",
        userId: profile?.userId || profile?.id || email,
        profileId: profile?.id || profile?.userId || name,
        properties: {
          contactName: name,
          contactEmail: email,
          message: message || "Solicitud de contacto desde aliados BNPL"
        },
        sessionId: Date.now().toString(),
        source: "web"
      });
      setFeedback("success");
      setName("");
      setEmail("");
      setMessage("");
      setOpen(false);
    } catch (error) {
      console.error("Error enviando contacto de aliado:", error);
      setFeedback("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <ContentContainer className="space-y-4">
        <PageHeader title="Comercios aliados" onBack={() => window.history.back()} />
        <SectionHeader 
          title="Compra con SaltoPay"
          subtitle="Tiendas participantes con BNPL"
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
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">¿Quieres sumar tu comercio?</h3>
                <p className="text-sm text-muted-foreground">
                  Déjanos tus datos y te contactamos para activar Buy Now Pay Later.
                </p>
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>Quiero ser aliado</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[420px] w-[95vw] rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>Quiero ser aliado</DialogTitle>
                  </DialogHeader>
                  <form className="space-y-3" onSubmit={handleSubmit}>
                    <Input
                      placeholder="Nombre de contacto"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <Input
                      type="email"
                      placeholder="Correo de contacto"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Textarea
                      placeholder="Cuéntanos sobre tu comercio (opcional)"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Enviando..." : "Enviar"}
                    </Button>
                    {feedback === "success" && (
                      <p className="text-xs text-green-600">Recibimos tu solicitud. Te contactaremos pronto.</p>
                    )}
                    {feedback === "error" && (
                      <p className="text-xs text-destructive">No pudimos enviar tu solicitud. Intenta de nuevo.</p>
                    )}
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </ContentContainer>
    </PageContainer>
  );
}
