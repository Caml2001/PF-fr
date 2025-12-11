import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { useLocation } from 'wouter';
import { Card, CardContent } from "./ui/card";
import { PageContainer, ContentContainer, SectionContainer } from "./Layout";
import { forgotPassword } from '../lib/api/authService';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

const ForgotPasswordSchema = z.object({
  email: z.string().min(1, 'Por favor ingresa un correo').email('Por favor ingresa un correo valido'),
});

type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>;

const ForgotPasswordForm: React.FC = () => {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const onSubmit: SubmitHandler<ForgotPasswordFormData> = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      await forgotPassword(data.email);
      setEmailSent(true);
    } catch (err: any) {
      setError(err.message || 'Error al enviar el email de recuperacion');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <PageContainer className="flex items-center justify-center min-h-screen p-2 md:p-4">
        <ContentContainer className="w-full max-w-md px-2 md:px-4">
          <div className="py-4 md:py-6">
            <Card className="overflow-hidden border-0 shadow-md rounded-xl">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                </div>
                <h2 className="text-xl font-bold mb-2">Revisa tu correo</h2>
                <p className="text-muted-foreground mb-4">
                  Si existe una cuenta con ese correo, recibiras un enlace para restablecer tu contrasena.
                </p>
                <p className="text-sm text-muted-foreground mb-6 bg-muted/50 p-3 rounded-lg">
                  No olvides revisar tu carpeta de spam o correo no deseado.
                </p>
                <Button
                  className="w-full py-6 text-base rounded-xl"
                  onClick={() => navigate('/login')}
                >
                  Volver al inicio de sesion
                </Button>
              </CardContent>
            </Card>
          </div>
        </ContentContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="flex items-center justify-center min-h-screen p-2 md:p-4">
      <ContentContainer className="w-full max-w-md px-2 md:px-4">
        <div className="py-4 md:py-6">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl font-bold mb-1">Recuperar contrasena</h2>
            <p className="text-muted-foreground text-base">
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contrasena
            </p>
          </div>

          <Card className="overflow-hidden border-0 shadow-md rounded-xl">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)}>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <SectionContainer>
                  <Label htmlFor="email" className="text-base font-medium block mb-2">
                    Correo electronico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    {...register("email")}
                    className={`rounded-xl py-6 text-base ${errors.email ? "border-destructive" : ""}`}
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="text-destructive text-sm mt-2">{errors.email.message}</p>
                  )}
                </SectionContainer>

                <Button
                  type="submit"
                  className="w-full py-6 text-base rounded-xl mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Enviar enlace de recuperacion"}
                </Button>

                <div className="mt-6 text-center">
                  <Button
                    variant="link"
                    className="p-0 h-auto text-muted-foreground text-sm hover:text-primary"
                    onClick={() => navigate('/login')}
                    type="button"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Volver al inicio de sesion
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </ContentContainer>
    </PageContainer>
  );
};

export default ForgotPasswordForm;
