import {
  UserIcon,
  Mail,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Shield,
  LogOut,
  ChevronRightIcon,
  CameraIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfileSection() {
  // Datos de ejemplo del usuario
  const user = {
    name: "Carlos Martínez",
    email: "carlos.martinez@ejemplo.com",
    phone: "52 55 1234 5678",
    address: "Av. Principal #123, Col. Centro, CDMX",
    avatarUrl: "", // URL opcional para la foto
  };

  return (
    <div className="animate-in fade-in-50 slide-in-from-bottom-5 duration-300 p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-5">Mi Perfil</h2>
        
        <div className="flex items-center mb-6">
          <div className="relative mr-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="text-xl">
                {user.name.split(' ').map(name => name[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <Button 
              size="icon" 
              variant="secondary" 
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-md"
            >
              <CameraIcon className="h-4 w-4" />
            </Button>
          </div>
          
          <div>
            <h2 className="text-lg font-bold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">Cliente desde febrero 2025</p>
          </div>
        </div>
      </div>
      
      <Card className="mobile-card mb-6">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium mb-3">Información personal</h3>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <UserIcon className="h-5 w-5 text-primary mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">Nombre completo</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-primary mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium">{user.email}</p>
                <p className="text-xs text-muted-foreground">Correo electrónico</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Phone className="h-5 w-5 text-primary mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium">{user.phone}</p>
                <p className="text-xs text-muted-foreground">Teléfono</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-primary mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium">{user.address}</p>
                <p className="text-xs text-muted-foreground">Dirección</p>
              </div>
            </div>
            
            <Button variant="outline" className="w-full justify-between mt-2">
              Editar información <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mobile-card mb-6">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium mb-3">Mis documentos</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm">Identificación oficial</span>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm">Comprobante de domicilio</span>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm">Información bancaria</span>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mobile-card mb-6">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium mb-3">Seguridad</h3>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-primary/10 p-2 rounded-full mr-3">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm">Cambiar contraseña</span>
            </div>
            <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
      
      <Button variant="outline" className="w-full flex items-center justify-center" onClick={() => {}}>
        <LogOut className="h-4 w-4 mr-2" />
        Cerrar sesión
      </Button>
    </div>
  );
} 