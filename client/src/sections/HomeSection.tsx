import { Card, CardContent } from "@/components/ui/card";
import {
  BadgeCheckIcon,
  ArrowRightIcon,
  CalendarIcon,
  CheckCircleIcon,
  StarIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { ContentContainer, PageContainer, SectionContainer, SectionHeader } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import TopNavMenu from "@/components/TopNavMenu";
import useCreditInfo from "@/hooks/useCreditInfo";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { useProfile } from "@/hooks/useProfile";
import { Progress } from "@/components/ui/progress";

interface HomeSectionProps {
}

export default function HomeSection() {
  // Obtener información de crédito desde el backend
  const { creditInfo, isLoading, error } = useCreditInfo();
  const [, navigate] = useLocation();
  const { data: profile } = useProfile();

  const formatName = (name?: string | null) => {
    if (!name) return null;
    return name
      .trim()
      .split(/\s+/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  };

  const greetingName = formatName(profile?.firstName);
  const usagePercent = creditInfo.limit > 0
    ? Math.min((creditInfo.used / creditInfo.limit) * 100, 100)
    : 0;

  return (
    <PageContainer>
      <ContentContainer>
        <div className="flex justify-between items-center mb-6">
          <SectionHeader 
            title={greetingName ? `¡Hola, ${greetingName}!` : "¡Hola!"} 
            subtitle="Bienvenido a SaltoPay"
          />
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 px-3 py-1 text-sm rounded-full">
              <CheckCircleIcon className="h-4 w-4 mr-1.5" />
              Activo
            </Badge>
            {/* Menú Silk Bottom Sheet como componente reutilizable */}
            {!window.matchMedia('(display-mode: standalone)').matches && !(window.navigator as any).standalone && (
              <TopNavMenu />
            )}
          </div>
        </div>
        
        <SectionContainer className="space-y-5">
          <Card className="border-0 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-primary-foreground/80">Línea disponible</p>
                  <div className="flex items-center gap-2 mt-1">
                    {isLoading ? (
                      <Skeleton className="h-10 w-32 bg-white/30" />
                    ) : error ? (
                      <span className="text-sm text-red-100">Error al cargar datos</span>
                    ) : (
                      <>
                        <h2 className="text-4xl font-bold">{formatCurrency(creditInfo.available)}</h2>
                        <BadgeCheckIcon className="h-6 w-6" />
                      </>
                    )}
                  </div>
                  <p className="text-xs text-primary-foreground/80 mt-1">
                    Actualizado automáticamente cada 5 min
                  </p>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <StarIcon className="h-4 w-4 mr-1.5" />
                  Aprobado
                </Badge>
              </div>

              <div className="space-y-2">
                <Progress value={usagePercent} className="bg-white/20" />
                <div className="flex justify-between text-xs text-primary-foreground/80">
                  <span>Usado: {formatCurrency(creditInfo.used)}</span>
                  <span>Límite: {formatCurrency(creditInfo.limit)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="space-y-3 mt-2">
            <Button 
              className="w-full shadow-sm text-base py-6 bg-primary text-primary-foreground hover:bg-primary/90"
              variant="secondary"
              onClick={() => navigate("/partners")}
            >
              Ver comercios aliados <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Button>
            <Button 
              className="w-full text-base py-6 border border-primary/60 bg-primary/10 text-primary hover:bg-primary/15"
              variant="outline"
              onClick={() => navigate("/loans")}
            >
              Ver mis préstamos
            </Button>
          </div>

          <div className="grid grid-cols-1">
            <Card className="bg-accent border-0 rounded-xl">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  <p className="text-sm text-muted-foreground">Resumen de tu cuenta</p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Límite</p>
                    {isLoading ? (
                      <Skeleton className="h-5 w-20" />
                    ) : (
                      <p className="font-medium">{formatCurrency(creditInfo.limit)}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-muted-foreground">Usado</p>
                    {isLoading ? (
                      <Skeleton className="h-5 w-20" />
                    ) : (
                      <p className="font-medium">{formatCurrency(creditInfo.used)}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-muted-foreground">Disponible</p>
                    {isLoading ? (
                      <Skeleton className="h-5 w-20" />
                    ) : (
                      <p className="font-medium">{formatCurrency(creditInfo.available)}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </SectionContainer>
        
        {/* Resumen de beneficios */}
        <Card className="border-0 bg-gradient-to-br from-accent to-accent/50 rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-4 mb-3">
              <div className="bg-primary/10 h-10 w-10 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-medium">Solicitud 100% digital</h3>
                <p className="text-sm text-muted-foreground">Sin papeleo ni trámites complicados</p>
              </div>
            </div>
            <Separator className="my-3 opacity-30" />
            <div className="flex justify-between text-sm pt-1">
              <span className="text-muted-foreground">Aprobación inmediata</span>
              <span className="text-muted-foreground">Sin comisiones ocultas</span>
            </div>
          </CardContent>
        </Card>
      </ContentContainer>
    </PageContainer>
  );
} 
