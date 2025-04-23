import { Card, CardContent } from "@/components/ui/card";
import { 
  BadgeCheckIcon, 
  ArrowRightIcon, 
  ShieldCheckIcon, 
  DollarSignIcon, 
  CreditCardIcon, 
  ClockIcon,
  CalendarIcon,
  CheckCircleIcon,
  StarIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import CreditApplicationForm from "@/components/CreditApplicationForm";
import { ContentContainer, PageContainer, SectionContainer, SectionHeader } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function HomeSection() {
  // Monto preaprobado fijo
  const preapprovedAmount = 5000;
  // Estado para controlar si se muestra el formulario de solicitud
  const [showApplication, setShowApplication] = useState(false);

  // Función para regresar a la vista principal
  const handleBack = () => {
    setShowApplication(false);
  };

  // Si estamos mostrando el formulario de solicitud
  if (showApplication) {
    return <CreditApplicationForm onLogout={handleBack} />;
  }

  return (
    <PageContainer>
      <ContentContainer>
        <div className="flex justify-between items-center mb-5">
          <SectionHeader 
            title="¡Hola, Carlos!" 
            subtitle="Bienvenido a PrestaFirme"
          />
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            Activo
          </Badge>
        </div>
        
        {/* Tarjeta con el monto preaprobado */}
        <SectionContainer>
          <Card className="overflow-hidden border-0 shadow-md">
            <div className="bg-gradient-to-r from-primary/90 to-primary text-primary-foreground p-5 pb-14 relative">
              <div className="absolute inset-0 overflow-hidden">
                <svg className="absolute bottom-0 left-0 w-full opacity-10" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0,1000 C150,950 300,900 450,850 C600,800 750,750 900,700 C1050,650 1200,600 1350,550 C1500,500 1650,450 1800,400 C1950,350 2100,300 2250,250 C2400,200 2550,150 2700,100 C2850,50 3000,0 3150,-50 L3150,1050 L0,1050 Z" fill="currentColor"></path>
                </svg>
              </div>
              
              <div className="flex justify-between items-start">
                <div className="relative">
                  <div className="flex items-center mb-1">
                    <Badge variant="outline" className="bg-white/20 border-white/30 gap-1 py-0 h-5">
                      <StarIcon className="h-3 w-3" />
                      Preaprobado
                    </Badge>
                  </div>
                  <h3 className="text-xs font-medium opacity-90 mb-1">Tu línea de crédito disponible</h3>
                  <div className="text-3xl font-bold">
                    {formatCurrency(preapprovedAmount)}
                  </div>
                </div>
                <div className="relative bg-white/20 rounded-full h-10 w-10 flex items-center justify-center">
                  <BadgeCheckIcon className="h-6 w-6" />
                </div>
              </div>
            </div>
            
            <div className="px-5 py-4 -mt-8 relative">
              <Button 
                className="w-full mb-4 bg-white text-primary hover:bg-white/90 hover:text-primary border shadow-md"
                onClick={() => setShowApplication(true)}
              >
                Solicitar ahora <ArrowRightIcon className="h-4 w-4 ml-2" />
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-accent rounded-lg p-3">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-primary mr-2" />
                    <p className="text-xs text-muted-foreground">Plazo</p>
                  </div>
                  <p className="text-sm font-medium mt-1">12-36 meses</p>
                </div>
                <div className="bg-accent rounded-lg p-3">
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 text-primary mr-2" />
                    <p className="text-xs text-muted-foreground">Tasa</p>
                  </div>
                  <p className="text-sm font-medium mt-1">1.2% mensual</p>
                </div>
              </div>
            </div>
          </Card>
        </SectionContainer>
        
        {/* Resumen de beneficios */}
        <Card className="mb-5 border-0 bg-gradient-to-br from-accent to-accent/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Solicitud 100% digital</h3>
                <p className="text-xs text-muted-foreground">Sin papeleo ni trámites complicados</p>
              </div>
            </div>
            <Separator className="my-3 opacity-30" />
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Aprobación inmediata</span>
              <span className="text-muted-foreground">Sin comisiones ocultas</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Tarjetas informativas */}
        <SectionContainer>
          <h3 className="text-sm font-medium mb-3">Beneficios exclusivos</h3>
          <div className="grid grid-cols-2 gap-3">
            <Card className="border shadow-sm hover:border-primary/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-2 rounded-full mb-2">
                    <DollarSignIcon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-medium mb-1">Sin comisiones</h3>
                  <p className="text-xs text-muted-foreground">Transparencia total</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border shadow-sm hover:border-primary/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-2 rounded-full mb-2">
                    <CreditCardIcon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-medium mb-1">Depósito inmediato</h3>
                  <p className="text-xs text-muted-foreground">En minutos</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </SectionContainer>
        
        <Card className="bg-accent border-0 shadow-sm">
          <CardContent className="p-3">
            <div className="flex gap-3 items-center">
              <div className="bg-white p-2 rounded-full">
                <ShieldCheckIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-medium">¿Necesitas ayuda?</h4>
                <p className="text-xs text-muted-foreground">Contacta a nuestro equipo de soporte</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </ContentContainer>
    </PageContainer>
  );
} 