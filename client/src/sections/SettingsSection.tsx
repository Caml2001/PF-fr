import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  BellIcon,
  MoonIcon,
  Globe,
  HelpCircleIcon,
  FileTextIcon,
  ShieldIcon,
  InfoIcon,
  ChevronRightIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SettingsSection() {
  // Estados para los diferentes ajustes
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [language, setLanguage] = useState("es");

  return (
    <div className="animate-in fade-in-50 slide-in-from-bottom-5 duration-300 p-4">
      <h2 className="text-xl font-bold mb-5">Ajustes</h2>
      
      <Card className="mobile-card mb-6">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium mb-3">Preferencias</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BellIcon className="h-5 w-5 text-primary mr-3" />
                <Label htmlFor="notifications" className="text-sm cursor-pointer">
                  Notificaciones
                </Label>
              </div>
              <Switch 
                id="notifications" 
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MoonIcon className="h-5 w-5 text-primary mr-3" />
                <Label htmlFor="dark-mode" className="text-sm cursor-pointer">
                  Modo oscuro
                </Label>
              </div>
              <Switch 
                id="dark-mode" 
                checked={darkModeEnabled}
                onCheckedChange={setDarkModeEnabled}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Globe className="h-5 w-5 text-primary mr-3" />
                <span className="text-sm">Idioma</span>
              </div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Seleccionar idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mobile-card mb-6">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium mb-3">Legal y soporte</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center cursor-pointer">
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <FileTextIcon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm">Términos y condiciones</span>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center cursor-pointer">
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <ShieldIcon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm">Política de privacidad</span>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center cursor-pointer">
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <HelpCircleIcon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm">Centro de ayuda</span>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mobile-card mb-6">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium mb-3">Acerca de</h3>
          
          <div className="flex justify-between items-center cursor-pointer">
            <div className="flex items-center">
              <div className="bg-primary/10 p-2 rounded-full mr-3">
                <InfoIcon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <span className="text-sm block">Versión de la aplicación</span>
                <span className="text-xs text-muted-foreground">1.0.0</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center text-xs text-muted-foreground mt-6">
        <p>© 2025 PréstaFirme. Todos los derechos reservados.</p>
        <p className="mt-1">Desarrollado con ❤️ por Carlos Martínez</p>
      </div>
    </div>
  );
} 