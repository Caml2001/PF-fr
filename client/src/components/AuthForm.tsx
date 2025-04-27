import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { useLocation } from 'wouter';
import { useLogin } from '../hooks/useLogin';
import { Card, CardContent } from "./ui/card";
import { PageContainer, ContentContainer, SectionContainer } from "./Layout";

// Zod schema for validation
const LoginSchema = z.object({
  email: z.string().min(1, 'Por favor ingresa un correo válido').email('Por favor ingresa un correo válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

// Define the form data type from the schema
type LoginFormData = z.infer<typeof LoginSchema>;

interface AuthFormProps {
  onLogin: (username: string) => void;
  onStartSignup: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLogin, onStartSignup }) => {
  const [location, setLocation] = useLocation(); 
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
  });

  const loginMutation = useLogin();

  const handleLoginSubmit: SubmitHandler<LoginFormData> = async (data) => {
    loginMutation.mutate(data, {
      onSuccess: (response) => {
        console.log('Login successful via hook:', response);
        onLogin(response.user?.email || data.email); 
      },
      onError: (error) => {
        console.error('Login failed via hook:', error);
      },
    });
  };

  const handleRegisterClick = () => {
    setActiveTab("signup");
    onStartSignup(); 
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
                  <form onSubmit={handleSubmit(handleLoginSubmit)}>
                    {loginMutation.error && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertTitle>Error de Inicio de Sesión</AlertTitle>
                        <AlertDescription>
                          {loginMutation.error.message || "Ocurrió un error inesperado."}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <SectionContainer>
                      <Label htmlFor="email" className="text-base font-medium block mb-2">
                        Correo electrónico
                      </Label>
                      <Input 
                        id="email" 
                        type="text" 
                        placeholder="ejemplo@correo.com"
                        {...register("email")}
                        className={`rounded-xl py-6 text-base ${errors.email ? "border-destructive" : ""}`}
                      />
                      {errors.email && <p className="text-destructive text-sm mt-2">{errors.email.message}</p>}
                    </SectionContainer>
                    
                    <SectionContainer>
                      <Label htmlFor="password" className="text-base font-medium block mb-2">
                        Contraseña
                      </Label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="Tu contraseña"
                        {...register("password")}
                        className={`rounded-xl py-6 text-base ${errors.password ? "border-destructive" : ""}`}
                      />
                      {errors.password && <p className="text-destructive text-sm mt-2">{errors.password.message}</p>}
                    </SectionContainer>

                    <Button 
                      type="submit" 
                      className="w-full py-6 text-base rounded-xl mt-2" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Iniciando sesión..." : "Iniciar sesión"}
                    </Button>
                    
                    <div className="mt-6 text-center">
                      <p className="text-base text-muted-foreground">
                        ¿No tienes una cuenta?{" "}
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-primary text-base"
                          onClick={handleRegisterClick}
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
};

export default AuthForm;