import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { useLocation } from 'wouter';
import { Card, CardContent } from "./ui/card";
import { PageContainer, ContentContainer, SectionHeader } from "./Layout";
import { getProfile } from '../lib/api/profileService';
import { forgotPassword } from '../lib/api/authService';
import { CheckCircle2, ArrowLeft, Mail } from 'lucide-react';
import { Skeleton } from "./ui/skeleton";
import TopNavMenu from "./TopNavMenu";

const ChangePasswordForm: React.FC = () => {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const handleSendResetEmail = async () => {
    if (!profile?.email) {
      setError('No se encontro el email de tu cuenta');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await forgotPassword(profile.email);
      setEmailSent(true);
    } catch (err: any) {
      setError(err.message || 'Error al enviar el email');
    } finally {
      setIsLoading(false);
    }
  };

  const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                (window.navigator as any).standalone === true;

  if (emailSent) {
    return (
      <PageContainer>
        <ContentContainer>
          <SectionHeader
            title="Cambiar contrasena"
            action={!isPWA ? <TopNavMenu /> : null}
          />

          <Card className="border-0 shadow-md rounded-xl">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-xl font-bold mb-2">Revisa tu correo</h2>
              <p className="text-muted-foreground mb-2">
                Enviamos un enlace de recuperacion a:
              </p>
              <p className="font-medium mb-4">{profile?.email}</p>
              <p className="text-sm text-muted-foreground mb-6 bg-muted/50 p-3 rounded-lg">
                No olvides revisar tu carpeta de spam o correo no deseado.
              </p>
              <Button
                className="w-full py-6 text-base rounded-xl"
                onClick={() => navigate('/profile')}
              >
                Volver al perfil
              </Button>
            </CardContent>
          </Card>
        </ContentContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentContainer>
        <SectionHeader
          title="Cambiar contrasena"
          subtitle="Te enviaremos un enlace para actualizar tu contrasena"
          action={!isPWA ? <TopNavMenu /> : null}
        />

        {profileLoading && (
          <div className="space-y-3">
            <Skeleton className="h-48 w-full" />
          </div>
        )}

        {!profileLoading && (
          <Card className="border-0 shadow-md rounded-xl">
            <CardContent className="p-6">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl mb-6">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Enviaremos el enlace a:
                  </p>
                  <p className="font-medium">{profile?.email || 'Cargando...'}</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                Al hacer clic en el boton, recibiras un correo con un enlace para crear una nueva contrasena. El enlace expira en 1 hora.
              </p>

              <Button
                className="w-full py-6 text-base rounded-xl"
                onClick={handleSendResetEmail}
                disabled={isLoading || !profile?.email}
              >
                {isLoading ? "Enviando..." : "Enviar enlace de recuperacion"}
              </Button>

              <div className="mt-6 text-center">
                <Button
                  variant="link"
                  className="p-0 h-auto text-muted-foreground text-sm hover:text-primary"
                  onClick={() => navigate('/profile')}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Volver al perfil
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </ContentContainer>
    </PageContainer>
  );
};

export default ChangePasswordForm;
