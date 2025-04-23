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
import { Sheet } from "@silk-hq/components";

interface HomeSectionProps {
  setSection?: (section: string) => void;
}

export default function HomeSection({ setSection }: HomeSectionProps) {
  // Monto preaprobado fijo
  const preapprovedAmount = 5000;
  // Estado para controlar si se muestra el formulario de solicitud
  const [showApplication, setShowApplication] = useState(false);

  // Función para regresar a la vista principal
  const handleBack = () => {
    setShowApplication(false);
  };

  // Handlers para navegación de menú
  const handleNav = (section: string) => {
    if (setSection) {
      setSection(section);
    }
  };

  // Si estamos mostrando el formulario de solicitud
  if (showApplication) {
    return <CreditApplicationForm onLogout={handleBack} />;
  }

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
            {/* Menú Silk Bottom Sheet solo en navegador (no PWA) */}
            {!window.matchMedia('(display-mode: standalone)').matches && !(window.navigator as any).standalone && (
              <Sheet.Root license="commercial">
                <Sheet.Trigger asChild>
                  <button
                    className="ml-2 bg-background border rounded-full p-2 shadow-md hover:bg-accent transition-colors"
                    aria-label="Abrir menú"
                  >
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
                  </button>
                </Sheet.Trigger>
                <Sheet.Portal>
                  <Sheet.View nativeEdgeSwipePrevention={true}>
                    <Sheet.Backdrop themeColorDimming="auto" />
                    <Sheet.Content className="rounded-t-3xl shadow-2xl p-0 overflow-hidden bg-white">
                      <Sheet.BleedingBackground className="rounded-t-3xl bg-white" />
                      <div className="py-6 px-4">
                        <div className="mb-4 text-center">
                          <span className="block text-lg font-semibold text-primary">Menú de navegación</span>
                          <span className="block text-xs text-muted-foreground">Selecciona una sección</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <div className="flex flex-col items-center flex-1">
                            <button className="flex items-center justify-center aspect-square w-[64px] rounded-2xl bg-primary/5 hover:bg-primary/10 transition-colors shadow-sm p-2" onClick={() => handleNav("inicio")}>
                              <HomeIcon className="h-7 w-7 text-primary" />
                            </button>
                            <span className="text-xs font-medium text-primary mt-2">Inicio</span>
                          </div>
                          <div className="flex flex-col items-center flex-1">
                            <button className="flex items-center justify-center aspect-square w-[64px] rounded-2xl bg-primary/5 hover:bg-primary/10 transition-colors shadow-sm p-2" onClick={() => handleNav("prestamos")}>
                              <CreditCardIcon className="h-7 w-7 text-primary" />
                            </button>
                            <span className="text-xs font-medium text-primary mt-2">Préstamos</span>
                          </div>
                          <div className="flex flex-col items-center flex-1">
                            <button className="flex items-center justify-center aspect-square w-[64px] rounded-2xl bg-primary/5 hover:bg-primary/10 transition-colors shadow-sm p-2" onClick={() => handleNav("perfil")}>
                              <UserIcon className="h-7 w-7 text-primary" />
                            </button>
                            <span className="text-xs font-medium text-primary mt-2">Perfil</span>
                          </div>
                          <div className="flex flex-col items-center flex-1">
                            <button className="flex items-center justify-center aspect-square w-[64px] rounded-2xl bg-primary/5 hover:bg-primary/10 transition-colors shadow-sm p-2" onClick={() => handleNav("ajustes")}>
                              <SettingsIcon className="h-7 w-7 text-primary" />
                            </button>
                            <span className="text-xs font-medium text-primary mt-2">Ajustes</span>
                          </div>
                        </div>
                      </div>
                    </Sheet.Content>
                  </Sheet.View>
                </Sheet.Portal>
              </Sheet.Root>
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
            <h2 className="text-4xl font-bold mr-3">{formatCurrency(preapprovedAmount)}</h2>
            <BadgeCheckIcon className="h-6 w-6 text-primary" />
          </div>
          
          <Button 
            className="w-full mb-5 shadow-sm text-base py-6 rounded-xl"
            onClick={() => setShowApplication(true)}
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