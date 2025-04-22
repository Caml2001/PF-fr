import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AuthFormProps {
  onAuth: (username: string, isNewUser: boolean) => void;
}

export default function AuthForm({ onAuth }: AuthFormProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [loginData, setLoginData] = useState({
    username: "",
    password: ""
  });
  const [signupData, setSignupData] = useState({
    username: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({
    login: { username: "", password: "" },
    signup: { username: "", password: "", confirmPassword: "" }
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

  // Manejar cambios en el formulario de registro
  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSignupData(prev => ({ ...prev, [id]: value }));
    setErrors(prev => ({
      ...prev,
      signup: { ...prev.signup, [id]: "" }
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
      onAuth(loginData.username, false);
    } else {
      setErrors(prev => ({ ...prev, login: newErrors }));
    }
  };

  // Manejar el envío del formulario de registro
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = { username: "", password: "", confirmPassword: "" };
    let isValid = true;
    
    if (!signupData.username.trim() || !validateContact(signupData.username.trim())) {
      newErrors.username = "Por favor ingresa un correo o teléfono válido";
      isValid = false;
    }
    
    if (!signupData.password.trim() || signupData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
      isValid = false;
    }
    
    if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
      isValid = false;
    }
    
    if (isValid) {
      onAuth(signupData.username, true);
    } else {
      setErrors(prev => ({ ...prev, signup: newErrors }));
    }
  };

  return (
    <Card className="animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
      <CardContent className="pt-6">
        <Tabs 
          defaultValue="login" 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as "login" | "signup")}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
            <TabsTrigger value="signup">Crear cuenta</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLoginSubmit}>
              <div className="mb-4">
                <Label htmlFor="username" className="mb-1">
                  Correo electrónico o teléfono
                </Label>
                <Input 
                  id="username" 
                  type="text" 
                  placeholder="ejemplo@correo.com o 5555555555"
                  value={loginData.username}
                  onChange={handleLoginChange}
                  className={errors.login.username ? "border-destructive" : ""}
                />
                {errors.login.username && <p className="text-destructive text-sm mt-1">{errors.login.username}</p>}
              </div>
              
              <div className="mb-4">
                <Label htmlFor="password" className="mb-1">
                  Contraseña
                </Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Tu contraseña"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  className={errors.login.password ? "border-destructive" : ""}
                />
                {errors.login.password && <p className="text-destructive text-sm mt-1">{errors.login.password}</p>}
              </div>
              
              <Button type="submit" className="w-full mt-2">
                Iniciar sesión
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignupSubmit}>
              <div className="mb-4">
                <Label htmlFor="username" className="mb-1">
                  Correo electrónico o teléfono
                </Label>
                <Input 
                  id="username" 
                  type="text" 
                  placeholder="ejemplo@correo.com o 5555555555"
                  value={signupData.username}
                  onChange={handleSignupChange}
                  className={errors.signup.username ? "border-destructive" : ""}
                />
                {errors.signup.username && <p className="text-destructive text-sm mt-1">{errors.signup.username}</p>}
              </div>
              
              <div className="mb-4">
                <Label htmlFor="password" className="mb-1">
                  Contraseña
                </Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Mínimo 6 caracteres"
                  value={signupData.password}
                  onChange={handleSignupChange}
                  className={errors.signup.password ? "border-destructive" : ""}
                />
                {errors.signup.password && <p className="text-destructive text-sm mt-1">{errors.signup.password}</p>}
              </div>
              
              <div className="mb-4">
                <Label htmlFor="confirmPassword" className="mb-1">
                  Confirmar contraseña
                </Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="Repite tu contraseña"
                  value={signupData.confirmPassword}
                  onChange={handleSignupChange}
                  className={errors.signup.confirmPassword ? "border-destructive" : ""}
                />
                {errors.signup.confirmPassword && <p className="text-destructive text-sm mt-1">{errors.signup.confirmPassword}</p>}
              </div>
              
              <Button type="submit" className="w-full mt-2">
                Crear cuenta
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}