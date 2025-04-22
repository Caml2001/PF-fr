import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { CameraIcon, UploadIcon } from "lucide-react";

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
    fullName: "",
    curp: "",
    ineDocument: "",
    address: "",
    addressDocument: "",
    username: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState<{
    login: { 
      username: string; 
      password: string; 
    },
    signup: { 
      fullName: string;
      curp: string;
      ineDocument: string;
      address: string;
      addressDocument: string;
      username: string; 
      password: string; 
      confirmPassword: string; 
    }
  }>({
    login: { 
      username: "", 
      password: "" 
    },
    signup: { 
      fullName: "",
      curp: "",
      ineDocument: "",
      address: "",
      addressDocument: "",
      username: "", 
      password: "", 
      confirmPassword: "" 
    }
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
    const { id, value, type, files } = e.target;
    
    if (type === 'file' && files && files.length > 0) {
      // Para campos de archivo, guardamos el nombre del archivo
      setSignupData(prev => ({ ...prev, [id]: files[0].name }));
    } else {
      // Para campos de texto normales
      setSignupData(prev => ({ ...prev, [id]: value }));
    }
    
    setErrors(prev => ({
      ...prev,
      signup: { ...prev.signup, [id]: "" }
    }));
  };
  
  // Manejar clic en el botón de selección de archivo
  const handleFileButtonClick = (inputId: string) => {
    document.getElementById(inputId)?.click();
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
    
    const newErrors = {
      fullName: "",
      curp: "",
      ineDocument: "",
      address: "",
      addressDocument: "",
      username: "", 
      password: "", 
      confirmPassword: ""
    };
    let isValid = true;
    
    // Validaciones para los nuevos campos
    if (!signupData.fullName.trim()) {
      newErrors.fullName = "El nombre completo es obligatorio";
      isValid = false;
    }
    
    if (!signupData.curp.trim()) {
      newErrors.curp = "La CURP es obligatoria";
      isValid = false;
    } else if (!/^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/.test(signupData.curp.trim())) {
      newErrors.curp = "Formato de CURP inválido";
      isValid = false;
    }
    
    if (!signupData.ineDocument) {
      newErrors.ineDocument = "Debes proporcionar tu identificación INE";
      isValid = false;
    }
    
    if (!signupData.address.trim()) {
      newErrors.address = "La dirección es obligatoria";
      isValid = false;
    }
    
    if (!signupData.addressDocument) {
      newErrors.addressDocument = "Debes proporcionar tu comprobante de domicilio";
      isValid = false;
    }
    
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
              <form onSubmit={handleSignupSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                <div>
                  <Label htmlFor="fullName" className="mb-1 text-sm font-medium">
                    Nombre completo
                  </Label>
                  <Input 
                    id="fullName" 
                    type="text" 
                    placeholder="Nombre(s) y apellidos"
                    value={signupData.fullName}
                    onChange={handleSignupChange}
                    className={`mobile-input ${errors.signup.fullName ? "border-destructive" : ""}`}
                  />
                  {errors.signup.fullName && <p className="text-destructive text-sm mt-1">{errors.signup.fullName}</p>}
                </div>
                
                <div>
                  <Label htmlFor="curp" className="mb-1 text-sm font-medium">
                    CURP
                  </Label>
                  <Input 
                    id="curp" 
                    type="text" 
                    placeholder="Clave Única de Registro de Población"
                    value={signupData.curp}
                    onChange={handleSignupChange}
                    className={`mobile-input ${errors.signup.curp ? "border-destructive" : ""}`}
                  />
                  {errors.signup.curp && <p className="text-destructive text-sm mt-1">{errors.signup.curp}</p>}
                </div>
                
                <div>
                  <Label htmlFor="ineDocument" className="mb-1 text-sm font-medium">
                    INE (foto o archivo)
                  </Label>
                  <div className={`border ${errors.signup.ineDocument ? "border-destructive" : "border-input"} rounded-xl p-4 text-center`}>
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <CameraIcon className="h-5 w-5 text-primary" />
                      </div>
                      <Label 
                        htmlFor="ineDocument" 
                        className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                      >
                        Subir foto de INE
                      </Label>
                      <Input 
                        id="ineDocument" 
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={handleSignupChange}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="text-xs mt-2"
                        onClick={() => handleFileButtonClick('ineDocument')}
                      >
                        <UploadIcon className="h-3 w-3 mr-1" />
                        Seleccionar archivo
                      </Button>
                    </div>
                  </div>
                  {errors.signup.ineDocument && <p className="text-destructive text-sm mt-1">{errors.signup.ineDocument}</p>}
                </div>
                
                <div>
                  <Label htmlFor="address" className="mb-1 text-sm font-medium">
                    Domicilio
                  </Label>
                  <Input 
                    id="address" 
                    type="text" 
                    placeholder="Dirección completa (calle, número, colonia, etc.)"
                    value={signupData.address}
                    onChange={handleSignupChange}
                    className={`mobile-input ${errors.signup.address ? "border-destructive" : ""}`}
                  />
                  {errors.signup.address && <p className="text-destructive text-sm mt-1">{errors.signup.address}</p>}
                </div>
                
                <div>
                  <Label htmlFor="addressDocument" className="mb-1 text-sm font-medium">
                    Comprobante de domicilio
                  </Label>
                  <div className={`border ${errors.signup.addressDocument ? "border-destructive" : "border-input"} rounded-xl p-4 text-center`}>
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <UploadIcon className="h-5 w-5 text-primary" />
                      </div>
                      <Label 
                        htmlFor="addressDocument" 
                        className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                      >
                        Subir comprobante
                      </Label>
                      <Input 
                        id="addressDocument" 
                        type="file" 
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={handleSignupChange}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="text-xs mt-2"
                        onClick={() => handleFileButtonClick('addressDocument')}
                      >
                        <UploadIcon className="h-3 w-3 mr-1" />
                        Seleccionar archivo
                      </Button>
                    </div>
                  </div>
                  {errors.signup.addressDocument && <p className="text-destructive text-sm mt-1">{errors.signup.addressDocument}</p>}
                </div>
                
                <div>
                  <Label htmlFor="username" className="mb-1 text-sm font-medium">
                    Correo electrónico o teléfono
                  </Label>
                  <Input 
                    id="username" 
                    type="text" 
                    placeholder="ejemplo@correo.com o 5555555555"
                    value={signupData.username}
                    onChange={handleSignupChange}
                    className={`mobile-input ${errors.signup.username ? "border-destructive" : ""}`}
                  />
                  {errors.signup.username && <p className="text-destructive text-sm mt-1">{errors.signup.username}</p>}
                </div>
                
                <div>
                  <Label htmlFor="password" className="mb-1 text-sm font-medium">
                    Contraseña
                  </Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Mínimo 6 caracteres"
                    value={signupData.password}
                    onChange={handleSignupChange}
                    className={`mobile-input ${errors.signup.password ? "border-destructive" : ""}`}
                  />
                  {errors.signup.password && <p className="text-destructive text-sm mt-1">{errors.signup.password}</p>}
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword" className="mb-1 text-sm font-medium">
                    Confirmar contraseña
                  </Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="Repite tu contraseña"
                    value={signupData.confirmPassword}
                    onChange={handleSignupChange}
                    className={`mobile-input ${errors.signup.confirmPassword ? "border-destructive" : ""}`}
                  />
                  {errors.signup.confirmPassword && <p className="text-destructive text-sm mt-1">{errors.signup.confirmPassword}</p>}
                </div>
                
                <Button type="submit" className="w-full mobile-button h-12 mt-6">
                  Crear cuenta
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
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}