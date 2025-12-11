import React, { useState, useEffect } from 'react';
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
import { resetPassword } from '../lib/api/authService';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const ResetPasswordSchema = z.object({
  newPassword: z.string()
    .min(8, 'La contrasena debe tener al menos 8 caracteres'),
  confirmPassword: z.string()
    .min(1, 'Por favor confirma tu contrasena'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contrasenas no coinciden",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>;

const ResetPasswordForm: React.FC = () => {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tokens, setTokens] = useState<{ accessToken: string; refreshToken: string } | null>(null);
  const [tokenError, setTokenError] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(ResetPasswordSchema),
  });

  // Extraer tokens del hash del URL al montar el componente
  useEffect(() => {
    const hash = window.location.hash.substring(1); // Quitar el #
    const params = new URLSearchParams(hash);

    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken && refreshToken) {
      setTokens({ accessToken, refreshToken });
      // Limpiar el hash del URL por seguridad
      window.history.replaceState(null, '', window.location.pathname);
    } else {
      setTokenError(true);
    }
  }, []);

  const onSubmit: SubmitHandler<ResetPasswordFormData> = async (data) => {
    if (!tokens) {
      setError('Tokens de recuperacion no encontrados');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await resetPassword(tokens.accessToken, tokens.refreshToken, data.newPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la contrasena');
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar error si no hay tokens validos
  if (tokenError) {
    return (
      <PageContainer className="flex items-center justify-center min-h-screen p-2 md:p-4">
        <ContentContainer className="w-full max-w-md px-2 md:px-4">
          <div className="py-4 md:py-6">
            <Card className="overflow-hidden border-0 shadow-md rounded-xl">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <AlertCircle className="h-16 w-16 text-destructive" />
                </div>
                <h2 className="text-xl font-bold mb-2">Enlace invalido</h2>
                <p className="text-muted-foreground mb-6">
                  El enlace de recuperacion es invalido o ha expirado. Por favor solicita un nuevo enlace.
                </p>
                <Button
                  className="w-full py-6 text-base rounded-xl"
                  onClick={() => navigate('/forgot-password')}
                >
                  Solicitar nuevo enlace
                </Button>
              </CardContent>
            </Card>
          </div>
        </ContentContainer>
      </PageContainer>
    );
  }

  // Mostrar exito despues de actualizar la contrasena
  if (success) {
    return (
      <PageContainer className="flex items-center justify-center min-h-screen p-2 md:p-4">
        <ContentContainer className="w-full max-w-md px-2 md:px-4">
          <div className="py-4 md:py-6">
            <Card className="overflow-hidden border-0 shadow-md rounded-xl">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                </div>
                <h2 className="text-xl font-bold mb-2">Contrasena actualizada</h2>
                <p className="text-muted-foreground mb-6">
                  Tu contrasena ha sido actualizada exitosamente. Ya puedes iniciar sesion con tu nueva contrasena.
                </p>
                <Button
                  className="w-full py-6 text-base rounded-xl"
                  onClick={() => navigate('/login')}
                >
                  Iniciar sesion
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
            <h2 className="text-2xl font-bold mb-1">Nueva contrasena</h2>
            <p className="text-muted-foreground text-base">
              Ingresa tu nueva contrasena
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
                  <Label htmlFor="newPassword" className="text-base font-medium block mb-2">
                    Nueva contrasena
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Minimo 8 caracteres"
                    {...register("newPassword")}
                    className={`rounded-xl py-6 text-base ${errors.newPassword ? "border-destructive" : ""}`}
                    autoComplete="new-password"
                  />
                  {errors.newPassword && (
                    <p className="text-destructive text-sm mt-2">{errors.newPassword.message}</p>
                  )}
                </SectionContainer>

                <SectionContainer>
                  <Label htmlFor="confirmPassword" className="text-base font-medium block mb-2">
                    Confirmar contrasena
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repite tu contrasena"
                    {...register("confirmPassword")}
                    className={`rounded-xl py-6 text-base ${errors.confirmPassword ? "border-destructive" : ""}`}
                    autoComplete="new-password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-destructive text-sm mt-2">{errors.confirmPassword.message}</p>
                  )}
                </SectionContainer>

                <Button
                  type="submit"
                  className="w-full py-6 text-base rounded-xl mt-2"
                  disabled={isLoading || !tokens}
                >
                  {isLoading ? "Actualizando..." : "Actualizar contrasena"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </ContentContainer>
    </PageContainer>
  );
};

export default ResetPasswordForm;
