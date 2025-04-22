import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { CreditCardIcon, DollarSignIcon, ArrowRightIcon, BadgeCheckIcon, ShieldCheckIcon } from "lucide-react";

interface DashboardProps {
  username: string;
  onLogout: () => void;
}

export default function Dashboard({ username, onLogout }: DashboardProps) {
  // Monto preaprobado fijo (como solicitado)
  const preapprovedAmount = 5000;
  
  // Formatear como moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  return (
    <div className="animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-xl font-bold">¡Hola, <span className="text-primary">{username}</span>!</h2>
          <p className="text-xs text-muted-foreground">Tu crédito está listo para ser solicitado</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onLogout} className="text-xs">
          Cerrar sesión
        </Button>
      </div>
      
      {/* Tarjeta con el monto preaprobado */}
      <Card className="mobile-card overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-primary/90 to-primary text-primary-foreground p-6 pb-16 relative">
          <div className="absolute inset-0 overflow-hidden">
            <svg className="absolute bottom-0 left-0 w-full opacity-10" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,1000 C150,950 300,900 450,850 C600,800 750,750 900,700 C1050,650 1200,600 1350,550 C1500,500 1650,450 1800,400 C1950,350 2100,300 2250,250 C2400,200 2550,150 2700,100 C2850,50 3000,0 3150,-50 L3150,1050 L0,1050 Z" fill="currentColor"></path>
            </svg>
          </div>
          
          <CardTitle className="text-base font-medium flex items-center relative">
            <BadgeCheckIcon className="h-5 w-5 mr-2" /> Préstamo Preaprobado
          </CardTitle>
          
          <div className="text-3xl font-bold mt-3 mb-1 relative">
            {formatCurrency(preapprovedAmount)}
          </div>
          <p className="text-sm opacity-90 relative">
            ¡Felicidades! Este es tu monto preaprobado.
          </p>
        </div>
        
        <div className="px-6 py-5 -mt-10 relative">
          <Button 
            className="w-full h-12 mobile-button shadow-lg mb-4 bg-white text-primary hover:bg-white/90 hover:text-primary border-0"
          >
            Solicitar ahora <ArrowRightIcon className="h-4 w-4 ml-2" />
          </Button>
          
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-accent p-3 rounded-xl">
              <p className="text-primary font-medium">12-36</p>
              <p className="text-xs text-muted-foreground">Meses de plazo</p>
            </div>
            <div className="bg-accent p-3 rounded-xl">
              <p className="text-primary font-medium">1.2% </p>
              <p className="text-xs text-muted-foreground">Tasa mensual</p>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Tarjetas informativas */}
      <h3 className="text-sm font-medium mb-3">Ventajas de tu préstamo</h3>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <Card className="mobile-card border-0 shadow-sm">
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
        
        <Card className="mobile-card border-0 shadow-sm">
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
      
      {/* Sección de pasos a seguir */}
      <Card className="mobile-card border-0 shadow-sm mb-4">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium mb-3">Pasos para obtener tu préstamo</h3>
          <ol className="space-y-3">
            <li className="flex items-center">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium mr-3">
                1
              </div>
              <div>
                <p className="text-sm font-medium">Solicita tu préstamo</p>
                <p className="text-xs text-muted-foreground">Confirma monto y plazo</p>
              </div>
            </li>
            
            <li className="flex items-center">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium mr-3">
                2
              </div>
              <div>
                <p className="text-sm font-medium">Verifica tu identidad</p>
                <p className="text-xs text-muted-foreground">Sube tu documentación</p>
              </div>
            </li>
            
            <li className="flex items-center">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium mr-3">
                3
              </div>
              <div>
                <p className="text-sm font-medium">Recibe tu dinero</p>
                <p className="text-xs text-muted-foreground">Depósito en minutos</p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>
      
      <Card className="bg-accent border-0 p-3 mb-2">
        <div className="flex gap-3 items-center">
          <div className="bg-white p-2 rounded-full">
            <ShieldCheckIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-medium">¿Necesitas ayuda?</h4>
            <p className="text-xs text-muted-foreground">Contacta a nuestro equipo de soporte</p>
          </div>
        </div>
      </Card>
    </div>
  );
}