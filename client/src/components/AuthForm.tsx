import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

interface AuthFormProps {
  onLogin: (username: string) => void;
  onStartSignup: () => void;
}

export default function AuthForm({ onLogin, onStartSignup }: AuthFormProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [loginData, setLoginData] = useState({
    username: "",
    password: ""
  });
  const [errors, setErrors] = useState({
    login: { username: "", password: "" }
  });

  // Validar correo o teléfono
  const validateContact = (value: string) => {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const isValidPhone = /^\d{10}$/.test(value);
    return isValidEmail || isValidPhone;
  };

  // Manejar cambios en el formulario de login
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setLoginData(prev => ({ ...prev, [id]: value }));
    setErrors(prev => ({
      ...prev,
      login: { ...prev.login, [id]: "" }
    }));
  };

  // Ya no necesitamos esta función ya que ahora usamos OnboardingFlow para el registro

  // Manejar el envío del formulario de login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = { username: "", password: "" };
    let isValid = true;
    
    if (!loginData.username.trim() || !validateContact(loginData.username.trim())) {
      newErrors.username = "Por favor ingresa un correo o teléfono válido";
      isValid = false;
    }
    
    if (!loginData.password.trim()) {
      newErrors.password = "La contraseña es obligatoria";
      isValid = false;
    }
    
    if (isValid) {
      onLogin(loginData.username);
    } else {
      setErrors(prev => ({ ...prev, login: newErrors }));
    }
  };

  // Iniciar el proceso de registro
  const handleSignupStart = () => {
    onStartSignup();
  };

  return (
    <div className="animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-700 text-transparent bg-clip-text inline-block">
          {activeTab === "login" ? "Bienvenido de vuelta" : "Únete a MicroPréstamos"}
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {activeTab === "login" 
            ? "Accede a tu cuenta para continuar"
            : "Crea tu cuenta en segundos y solicita tu crédito"
          }
        </p>
      </div>
      
      <Card className="mobile-card overflow-hidden">
        <CardContent className="p-6">
          {activeTab === "login" ? (
            <>
              <form onSubmit={handleLoginSubmit}>
                <div className="mb-4">
                  <Label htmlFor="username" className="mb-1 text-sm font-medium">
                    Correo electrónico o teléfono
                  </Label>
                  <Input 
                    id="username" 
                    type="text" 
                    placeholder="ejemplo@correo.com o 5555555555"
                    value={loginData.username}
                    onChange={handleLoginChange}
                    className={`mobile-input ${errors.login.username ? "border-destructive" : ""}`}
                  />
                  {errors.login.username && <p className="text-destructive text-sm mt-1">{errors.login.username}</p>}
                </div>
                
                <div className="mb-5">
                  <Label htmlFor="password" className="mb-1 text-sm font-medium">
                    Contraseña
                  </Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Tu contraseña"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    className={`mobile-input ${errors.login.password ? "border-destructive" : ""}`}
                  />
                  {errors.login.password && <p className="text-destructive text-sm mt-1">{errors.login.password}</p>}
                </div>
                
                <Button type="submit" className="w-full mobile-button h-12">
                  Iniciar sesión
                </Button>
                
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    ¿No tienes una cuenta?{" "}
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-primary"
                      onClick={() => setActiveTab("signup")}
                    >
                      Crear cuenta
                    </Button>
                  </p>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="p-4 mb-5 bg-accent/40 rounded-xl text-center">
                <p className="text-sm">
                  Para crear tu cuenta necesitarás:
                </p>
                <ul className="text-sm mt-2 text-left space-y-1.5">
                  <li className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary">
                      1
                    </div>
                    <span>Tu identificación oficial (INE)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary">
                      2
                    </div>
                    <span>Tu CURP</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary">
                      3
                    </div>
                    <span>Comprobante de domicilio</span>
                  </li>
                </ul>
              </div>
              
              <Button 
                className="w-full mobile-button h-12"
                onClick={handleSignupStart}
                type="button"
              >
                Comenzar registro
              </Button>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  ¿Ya tienes una cuenta?{" "}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-primary"
                    onClick={() => setActiveTab("login")}
                  >
                    Iniciar sesión
                  </Button>
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}