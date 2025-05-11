import { Card, CardContent } from "@/components/ui/card";
import { 
  BadgeCheckIcon, 
  ArrowRightIcon, 
  ClockIcon,
  CalendarIcon,
  CheckCircleIcon,
  StarIcon,
  HomeIcon,
  CreditCardIcon,
  UserIcon,
  SettingsIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import CreditApplicationForm from "@/components/CreditApplicationForm";
import { ContentContainer, PageContainer, SectionContainer, SectionHeader } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";
import TopNavMenu from "@/components/TopNavMenu";
import useCreditInfo from "@/hooks/useCreditInfo";
import { Skeleton } from "@/components/ui/skeleton";

interface HomeSectionProps {
}

export default function HomeSection() {
  // Obtener información de crédito desde el backend
  const { creditInfo, isLoading, error } = useCreditInfo();

  // Navigation handler using wouter
  const [, setLocation] = useLocation();
  const handleNav = (route: string) => {
    setLocation(route);
  };

  return (
    <PageContainer>
      <ContentContainer>
        <div className="flex justify-between items-center mb-6">
          <SectionHeader 
            title="¡Hola, Carlos!" 
            subtitle="Bienvenido a PrestaFirme"
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
        
        {/* Tarjeta con el monto preaprobado */}
        <SectionContainer>
          <div className="mb-3 flex items-center">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1.5 mr-3 px-3 py-1 text-sm rounded-full">
              <StarIcon className="h-4 w-4" />
              Preaprobado
            </Badge>
            <span className="text-base text-muted-foreground">Tu línea de crédito disponible</span>
          </div>
          
          <div className="mb-5 flex items-center">
            {isLoading ? (
              <Skeleton className="h-12 w-40" />
            ) : error ? (
              <p className="text-red-500">Error al cargar datos</p>
            ) : (
              <>
                <h2 className="text-4xl font-bold mr-3">{formatCurrency(creditInfo.available)}</h2>
                <BadgeCheckIcon className="h-6 w-6 text-primary" />
              </>
            )}
          </div>
          
          <Button 
            className="w-full mb-5 shadow-sm text-base py-6 rounded-xl"
            onClick={() => handleNav("/apply")}
            disabled={isLoading || !!error || creditInfo.available <= 0}
          >
            Solicitar ahora <ArrowRightIcon className="h-5 w-5 ml-2" />
          </Button>
          
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-accent border-0 rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-primary mr-2" />
                  <p className="text-sm text-muted-foreground">Plazo</p>
                </div>
                <p className="text-base font-medium mt-1.5">12-36 meses</p>
              </CardContent>
            </Card>
            <Card className="bg-accent border-0 rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-primary mr-2" />
                  <p className="text-sm text-muted-foreground">Tasa</p>
                </div>
                <p className="text-base font-medium mt-1.5">1.2% mensual</p>
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