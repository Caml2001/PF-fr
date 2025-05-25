import { FileText, Home } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { PageContainer, ContentContainer } from "./Layout";
import { useLocation } from 'wouter';

interface IneReviewStatusProps {
  onGoHome: () => void;
}

export default function IneReviewStatus({ onGoHome }: IneReviewStatusProps) {
  const [location, navigate] = useLocation();

  const handleGoHome = () => {
    navigate('/home');
  };

  return (
    <PageContainer className="flex items-center justify-center min-h-screen p-4">
      <ContentContainer className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center bg-blue-500/10 p-4 rounded-full mb-4">
            <FileText size={64} className="text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Cuenta en Revisión
          </h1>
          <p className="text-muted-foreground text-lg">
            Tu identificación está siendo verificada
          </p>
        </div>

        <Card className="overflow-hidden border-0 shadow-lg rounded-xl">
          <CardContent className="p-8 text-center">
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-blue-800 mb-3">
                  ¿Qué está pasando?
                </h3>
                <p className="text-blue-700 leading-relaxed">
                  Tu Identificación Oficial (INE) está actualmente en proceso de 
                  revisión manual por nuestro equipo de verificación.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-green-800 mb-3">
                  ¿Qué sigue?
                </h3>
                <p className="text-green-700 leading-relaxed">
                  Te notificaremos por correo electrónico una vez que el proceso 
                  de verificación haya concluido. Esto generalmente toma entre 24-48 horas.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Mientras tanto...
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Puedes explorar tu dashboard y familiarizarte con la plataforma. 
                  Las funciones de solicitud de crédito estarán disponibles una vez 
                  que tu cuenta sea verificada.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <Button 
                onClick={handleGoHome}
                className="w-full py-4 text-lg rounded-xl"
                size="lg"
              >
                <Home className="h-5 w-5 mr-2" />
                Ir al Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </ContentContainer>
    </PageContainer>
  );
}