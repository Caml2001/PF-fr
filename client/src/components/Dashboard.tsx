import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CreditCardIcon, DollarSignIcon, ArrowRightIcon, BadgeCheckIcon } from "lucide-react";

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
    <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">¡Bienvenido!</h2>
          <p className="text-muted-foreground">{username}</p>
        </div>
        <Button variant="ghost" onClick={onLogout}>Cerrar sesión</Button>
      </div>
      
      {/* Tarjeta con el monto preaprobado */}
      <Card className="bg-gradient-to-r from-primary/90 to-primary text-primary-foreground shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <BadgeCheckIcon className="h-5 w-5 mr-2" /> Préstamo Preaprobado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-1">
            {formatCurrency(preapprovedAmount)}
          </div>
          <p className="text-sm opacity-90">
            ¡Felicidades! Este es tu monto preaprobado disponible ahora.
          </p>
          <Button 
            className="mt-4 bg-white text-primary hover:bg-white/90 hover:text-primary shadow"
            size="sm"
          >
            Solicitar ahora <ArrowRightIcon className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
      
      {/* Tarjetas informativas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <DollarSignIcon className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium mb-1">Sin comisiones ocultas</h3>
              <p className="text-sm text-muted-foreground">Transparencia total en nuestros préstamos</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <CreditCardIcon className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium mb-1">Depósito inmediato</h3>
              <p className="text-sm text-muted-foreground">El dinero en tu cuenta en minutos</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Separator />
      
      {/* Sección de pasos a seguir */}
      <div>
        <h3 className="text-lg font-medium mb-4">¿Qué sigue?</h3>
        <ol className="space-y-4">
          <li className="flex">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium mr-3">
              1
            </div>
            <div>
              <p className="font-medium">Solicita tu préstamo</p>
              <p className="text-sm text-muted-foreground">Confirma el monto y plazo que deseas</p>
            </div>
          </li>
          
          <li className="flex">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium mr-3">
              2
            </div>
            <div>
              <p className="font-medium">Verifica tu identidad</p>
              <p className="text-sm text-muted-foreground">Sube tu identificación y comprobante de domicilio</p>
            </div>
          </li>
          
          <li className="flex">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium mr-3">
              3
            </div>
            <div>
              <p className="font-medium">Recibe tu dinero</p>
              <p className="text-sm text-muted-foreground">El depósito se realizará a tu cuenta en minutos</p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
}