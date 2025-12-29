import { useEffect, useState, useCallback } from "react";
import { loadStripe, Stripe, StripeElements } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CreditCardIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  Loader2Icon,
  TrashIcon,
  RefreshCwIcon
} from "lucide-react";
import {
  getCard,
  setupCard,
  confirmCard,
  deleteCard,
  formatCardBrand,
  formatExpiry,
  CardInfo
} from "@/lib/api/cardService";

// Inicializar Stripe con la clave pública
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

// Estilos para el CardElement de Stripe
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#1f2937",
      fontFamily: '"Inter", system-ui, sans-serif',
      fontSmoothing: "antialiased",
      lineHeight: "24px",
      "::placeholder": {
        color: "#9ca3af",
      },
    },
    invalid: {
      color: "#ef4444",
      iconColor: "#ef4444",
    },
  },
  hidePostalCode: true, // En México no usamos postal code para validación
};

// Log para debug
const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
if (!STRIPE_KEY) {
  console.warn("[ChangeCardForm] VITE_STRIPE_PUBLIC_KEY no está configurada");
}

// Props del componente
interface ChangeCardFormProps {
  onSuccess?: (card: CardInfo) => void;
  onCancel?: () => void;
  showDeleteOption?: boolean;
}

// Componente interno que usa los hooks de Stripe
function CardFormInner({
  onSuccess,
  onCancel,
  currentCard,
  onCardDeleted,
  showDeleteOption = true
}: ChangeCardFormProps & {
  currentCard: CardInfo | null;
  onCardDeleted: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(!currentCard);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Obtener clientSecret cuando el usuario quiere agregar/cambiar tarjeta
  const initializeSetup = useCallback(async () => {
    try {
      setErrorMessage(null);
      const response = await setupCard();
      setClientSecret(response.clientSecret);
    } catch (error: any) {
      console.error("Error initializing card setup:", error);
      setErrorMessage(
        error?.response?.data?.message ||
        "No pudimos iniciar el proceso. Intenta de nuevo."
      );
    }
  }, []);

  // Inicializar setup cuando entramos en modo edición
  useEffect(() => {
    if (isEditing && !clientSecret) {
      initializeSetup();
    }
  }, [isEditing, clientSecret, initializeSetup]);

  // Manejar el submit del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      setErrorMessage("Stripe no está listo. Intenta de nuevo.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setErrorMessage("No se encontró el elemento de tarjeta.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Confirmar con Stripe
      const { error: stripeError, setupIntent } = await stripe.confirmCardSetup(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        // Mapear errores comunes de Stripe a español
        const errorMessages: Record<string, string> = {
          card_declined: "La tarjeta fue rechazada. Verifica los datos o usa otra tarjeta.",
          expired_card: "La tarjeta está vencida.",
          incorrect_cvc: "El código de seguridad es incorrecto.",
          processing_error: "Error al procesar. Intenta de nuevo.",
          incorrect_number: "El número de tarjeta es incorrecto.",
          invalid_expiry_month: "El mes de expiración es inválido.",
          invalid_expiry_year: "El año de expiración es inválido.",
        };

        setErrorMessage(
          errorMessages[stripeError.code || ""] ||
          stripeError.message ||
          "Error al validar la tarjeta."
        );
        setIsProcessing(false);
        return;
      }

      if (!setupIntent || setupIntent.status !== "succeeded") {
        setErrorMessage("La validación de la tarjeta no fue exitosa.");
        setIsProcessing(false);
        return;
      }

      // 2. Confirmar en nuestro backend
      const response = await confirmCard(setupIntent.id);

      if (response.success) {
        setShowSuccess(true);
        setIsEditing(false);
        setClientSecret(null);

        // Notificar éxito después de un breve delay
        setTimeout(() => {
          setShowSuccess(false);
          onSuccess?.(response.card);
        }, 2000);
      }
    } catch (error: any) {
      console.error("Error confirming card:", error);
      setErrorMessage(
        error?.response?.data?.message ||
        "No pudimos guardar la tarjeta. Intenta de nuevo."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Manejar eliminación de tarjeta
  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await deleteCard();
      setShowDeleteConfirm(false);
      onCardDeleted();
    } catch (error: any) {
      console.error("Error deleting card:", error);
      setErrorMessage(
        error?.response?.data?.message ||
        "No pudimos eliminar la tarjeta. Intenta de nuevo."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setIsEditing(false);
    setClientSecret(null);
    setErrorMessage(null);
    if (!currentCard) {
      onCancel?.();
    }
  };

  // Vista de éxito
  if (showSuccess) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-3" />
          <h3 className="font-semibold text-green-800">Tarjeta guardada</h3>
          <p className="text-sm text-green-700 mt-1">
            Tu nueva tarjeta ha sido registrada correctamente.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Vista de tarjeta actual (no editando)
  if (!isEditing && currentCard) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCardIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">
                {formatCardBrand(currentCard.brand)} **** {currentCard.last4}
              </p>
              <p className="text-sm text-muted-foreground">
                Vence {formatExpiry(currentCard.expiryMonth, currentCard.expiryYear)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setIsEditing(true)}
          >
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Cambiar tarjeta
          </Button>

          {showDeleteOption && (
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Dialog de confirmación para eliminar */}
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar tarjeta</AlertDialogTitle>
              <AlertDialogDescription>
                Si eliminas tu tarjeta, los pagos automáticos dejarán de funcionar.
                Tendrás que agregar una nueva tarjeta para continuar con los cobros.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  "Eliminar"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}
      </div>
    );
  }

  // Loading mientras se obtiene clientSecret
  if (isEditing && !clientSecret) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Preparando formulario...</span>
        </div>
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}
      </div>
    );
  }

  // Vista de formulario para agregar/cambiar tarjeta
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          {currentCard ? "Nueva tarjeta" : "Datos de la tarjeta"}
        </label>

        <div className="p-3 border rounded-lg bg-white min-h-[44px]">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Ingresa el número, fecha de vencimiento y CVV de tu tarjeta.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      <div className="flex gap-2">
        {(currentCard || onCancel) && (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleCancelEdit}
            disabled={isProcessing}
          >
            Cancelar
          </Button>
        )}

        <Button
          type="submit"
          className="flex-1"
          disabled={!stripe || !clientSecret || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <CreditCardIcon className="h-4 w-4 mr-2" />
              {currentCard ? "Guardar nueva tarjeta" : "Agregar tarjeta"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// Componente principal que envuelve con el Provider de Stripe
export default function ChangeCardForm(props: ChangeCardFormProps) {
  const [currentCard, setCurrentCard] = useState<CardInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Cargar tarjeta actual al montar
  const loadCard = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const response = await getCard();
      setCurrentCard(response.hasCard && response.card ? response.card : null);
    } catch (error: any) {
      console.error("Error loading card:", error);
      setLoadError("No pudimos cargar la información de tu tarjeta.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCard();
  }, [loadCard]);

  // Manejar eliminación de tarjeta
  const handleCardDeleted = useCallback(() => {
    setCurrentCard(null);
  }, []);

  // Manejar éxito
  const handleSuccess = useCallback((card: CardInfo) => {
    setCurrentCard(card);
    props.onSuccess?.(card);
  }, [props.onSuccess]);

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Cargando...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (loadError) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <AlertCircleIcon className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-sm text-red-700">{loadError}</p>
            <Button variant="outline" className="mt-4" onClick={loadCard}>
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CardFormInner
        {...props}
        currentCard={currentCard}
        onCardDeleted={handleCardDeleted}
        onSuccess={handleSuccess}
      />
    </Elements>
  );
}
