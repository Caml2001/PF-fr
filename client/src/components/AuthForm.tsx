import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { ContentContainer, PageContainer, SectionContainer } from "./Layout";

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

  return (
    <PageContainer className="flex items-center justify-center min-h-screen p-2 md:p-4">
      <ContentContainer className="w-full max-w-md px-2 md:px-4">
        <div className="py-4 md:py-6">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl font-bold mb-1">
              {activeTab === "login" ? "Bienvenido de vuelta" : "Únete a PrestaFirme"}
            </h2>
            <p className="text-muted-foreground text-base">
              {activeTab === "login" 
                ? "Accede a tu cuenta para continuar"
                : "Crea tu cuenta en segundos y solicita tu crédito"
              }
            </p>
          </div>
          
          <Card className="overflow-hidden border-0 shadow-md rounded-xl">
            <CardContent className="p-6">
              {activeTab === "login" ? (
                <>
                  <form onSubmit={handleLoginSubmit}>
                    <SectionContainer>
                      <Label htmlFor="username" className="text-base font-medium block mb-2">
                        Correo electrónico o teléfono
                      </Label>
                      <Input 
                        id="username" 
                        type="text" 
                        placeholder="ejemplo@correo.com o 5555555555"
                        value={loginData.username}
                        onChange={handleLoginChange}
                        className={`rounded-xl py-6 text-base ${errors.login.username ? "border-destructive" : ""}`}
                      />
                      {errors.login.username && <p className="text-destructive text-sm mt-2">{errors.login.username}</p>}
                    </SectionContainer>
                    
                    <SectionContainer>
                      <Label htmlFor="password" className="text-base font-medium block mb-2">
                        Contraseña
                      </Label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="Tu contraseña"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        className={`rounded-xl py-6 text-base ${errors.login.password ? "border-destructive" : ""}`}
                      />
                      {errors.login.password && <p className="text-destructive text-sm mt-2">{errors.login.password}</p>}
                    </SectionContainer>
                    
                    <Button type="submit" className="w-full py-6 text-base rounded-xl mt-2">
                      Iniciar sesión
                    </Button>
                    
                    <div className="mt-6 text-center">
                      <p className="text-base text-muted-foreground">
                        ¿No tienes una cuenta?{" "}
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-primary text-base"
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
                  <div className="p-5 mb-6 bg-accent/40 rounded-xl text-center">
                    <p className="text-base mb-3">
                      Para crear tu cuenta necesitarás:
                    </p>
                    <ul className="text-base text-left space-y-3">
                      <li className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-sm text-primary">
                          1
                        </div>
                        <span>Tu identificación oficial (INE)</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-sm text-primary">
                          2
                        </div>
                        <span>Tu CURP</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-sm text-primary">
                          3
                        </div>
                        <span>Comprobante de domicilio</span>
                      </li>
                    </ul>
                  </div>
                  
                  <Button 
                    className="w-full py-6 text-base rounded-xl"
                    onClick={onStartSignup}
                    type="button"
                  >
                    Comenzar registro
                  </Button>
                  
                  <div className="mt-6 text-center">
                    <p className="text-base text-muted-foreground">
                      ¿Ya tienes una cuenta?{" "}
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-primary text-base"
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
      </ContentContainer>
    </PageContainer>
  );
}