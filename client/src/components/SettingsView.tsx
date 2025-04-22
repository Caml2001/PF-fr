import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Bell, Moon, Shield, HelpCircle, LogOut, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function SettingsView({ onLogout }: { onLogout: () => void }) {
  const [notifications, setNotifications] = useState({
    all: true,
    payment: true,
    promotions: false
  });
  const [darkMode, setDarkMode] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => {
      // Si es "all", actualiza todos los otros valores también
      if (key === "all") {
        const newValue = !prev.all;
        return {
          all: newValue,
          payment: newValue,
          promotions: newValue
        };
      }
      
      // Si alguna opción está desactivada, all debería ser false
      const updatedValues = {
        ...prev,
        [key]: !prev[key]
      };
      
      // Actualiza "all" basado en si todas las demás opciones están activas
      const allEnabled = Object.entries(updatedValues)
        .filter(([k]) => k !== "all")
        .every(([_, v]) => v);
      
      return {
        ...updatedValues,
        all: allEnabled
      };
    });
  };

  const handleConfirmLogout = () => {
    setConfirmLogout(false);
    onLogout();
  };

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
            <Switch 
              checked={notifications.all} 
              onCheckedChange={() => handleNotificationChange("all")}
            />
          </div>
          <Separator />

          {/* Recordatorios de pago */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm pl-6">Recordatorios de pago</span>
            </div>
            <Switch 
              checked={notifications.payment} 
              onCheckedChange={() => handleNotificationChange("payment")}
            />
          </div>
          <Separator />

          {/* Promociones y ofertas */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm pl-6">Promociones y ofertas</span>
            </div>
            <Switch 
              checked={notifications.promotions} 
              onCheckedChange={() => handleNotificationChange("promotions")}
            />
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
            <Switch 
              checked={darkMode} 
              onCheckedChange={() => setDarkMode(!darkMode)}
            />
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

      <Card className="mobile-card bg-muted hover:bg-muted/80 cursor-pointer" onClick={() => setConfirmLogout(true)}>
        <CardContent className="py-4">
          <div className="flex justify-center items-center gap-2 text-destructive">
            <LogOut size={18} />
            <span className="font-medium">Cerrar sesión</span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmLogout} onOpenChange={setConfirmLogout}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Cerrar sesión</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres cerrar sesión?
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex-col sm:flex-col gap-2 mt-4">
            <Button 
              className="w-full bg-destructive hover:bg-destructive/90" 
              onClick={handleConfirmLogout}
            >
              Cerrar sesión
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setConfirmLogout(false)}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}