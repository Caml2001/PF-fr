import * as React from "react";
import Dashboard from "./Dashboard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  CalendarIcon, 
  ChevronRight, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  ShieldCheck,
  Bell,
  Moon,
  Shield,
  HelpCircle,
  LogOut
} from "lucide-react";

// Componente para la pestaña Préstamos
export function LoansTab() {
  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold">Mis Préstamos</div>
      
      <div className="space-y-4">
        <Card className="mobile-card cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">$5,000</CardTitle>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Activo</Badge>
            </div>
            <CardDescription className="flex items-center mt-1">
              <CalendarIcon size={14} className="mr-1" />
              15 de mayo de 2025
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-2 flex justify-between items-center">
            <div className="text-sm">1 pago pendiente</div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </CardFooter>
        </Card>
        
        <Card className="mobile-card cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">$3,000</CardTitle>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Pagado</Badge>
            </div>
            <CardDescription className="flex items-center mt-1">
              <CalendarIcon size={14} className="mr-1" />
              5 de abril de 2025
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-2 flex justify-between items-center">
            <div className="text-sm">Préstamo completado</div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </CardFooter>
        </Card>
        
        <Card className="mobile-card cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">$2,000</CardTitle>
              <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Atrasado</Badge>
            </div>
            <CardDescription className="flex items-center mt-1">
              <CalendarIcon size={14} className="mr-1" />
              30 de marzo de 2025
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-2 flex justify-between items-center">
            <div className="text-sm">1 pago pendiente</div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

// Componente para la pestaña Perfil
export function ProfileTab() {
  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold">Mi Perfil</div>

      <Card className="mobile-card">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-white text-lg">
                  JP
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">Juan Pérez López</CardTitle>
                <CardDescription className="mt-1">
                  <div className="flex items-center text-green-600 text-sm font-medium gap-1">
                    <ShieldCheck size={16} />
                    <span>Verificado</span>
                  </div>
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="mobile-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Información personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Teléfono */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone size={18} />
              <span>Teléfono</span>
            </div>
            <div className="flex items-center gap-2">
              <span>55 1234 5678</span>
            </div>
          </div>
          <Separator />

          {/* Email */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail size={18} />
              <span>Correo electrónico</span>
            </div>
            <div className="flex items-center gap-2">
              <span>juan.perez@example.com</span>
            </div>
          </div>
          <Separator />

          {/* Dirección */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin size={18} />
              <span>Dirección</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-right max-w-[180px] truncate">Calle Principal #123, Col. Centro, CDMX</span>
            </div>
          </div>
          <Separator />

          {/* CURP */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User size={18} />
              <span>CURP</span>
            </div>
            <div className="flex items-center gap-2">
              <span>PELJ850512HDFRZN02</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mobile-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Métodos de pago</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard size={18} />
              <span>Tarjeta terminación 4567</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para la pestaña Ajustes
export function SettingsTab({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold">Ajustes</div>

      <Card className="mobile-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Notificaciones</CardTitle>
          <CardDescription>Configura las notificaciones que recibes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Todas las notificaciones */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-muted-foreground" />
              <span>Todas las notificaciones</span>
            </div>
          </div>
          <Separator />

          {/* Recordatorios de pago */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm pl-6">Recordatorios de pago</span>
            </div>
          </div>
          <Separator />

          {/* Promociones y ofertas */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm pl-6">Promociones y ofertas</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mobile-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Apariencia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Modo oscuro */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Moon size={18} className="text-muted-foreground" />
              <span>Modo oscuro</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mobile-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Seguridad y Soporte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Privacidad y seguridad */}
          <div className="flex justify-between items-center cursor-pointer">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-muted-foreground" />
              <span>Privacidad y seguridad</span>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </div>
          <Separator />

          {/* Ayuda y soporte */}
          <div className="flex justify-between items-center cursor-pointer">
            <div className="flex items-center gap-2">
              <HelpCircle size={18} className="text-muted-foreground" />
              <span>Ayuda y soporte</span>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card 
        className="mobile-card bg-muted hover:bg-muted/80 cursor-pointer" 
        onClick={onLogout}
      >
        <CardContent className="py-4">
          <div className="flex justify-center items-center gap-2 text-destructive">
            <LogOut size={18} />
            <span className="font-medium">Cerrar sesión</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para la pestaña Home
export function HomeTab({ username, onLogout, onApplyCredit }: {
  username: string;
  onLogout: () => void;
  onApplyCredit: () => void;
}) {
  return (
    <Dashboard 
      username={username}
      onLogout={onLogout}
      onApplyCredit={onApplyCredit}
    />
  );
}