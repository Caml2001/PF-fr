import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { InfoIcon, CheckCircleIcon, CopyIcon, CheckIcon, AlertCircleIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ContentContainer, PageContainer, PageHeader, SectionContainer } from "@/components/Layout";
import { payLoanWithCard, PaymentOption, PaymentType, LoanSummary, StripePaymentResponse } from "@/lib/api/loanService";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";

interface AdvancePaymentFormProps {
  loanId: string;
  paymentOptions: PaymentOption[];
  summary?: LoanSummary;
  onBack: () => void;
  startInTransferReview?: boolean;
  onPaymentSuccess?: (response: StripePaymentResponse) => void;
}

export default function AdvancePaymentForm({
  loanId,
  paymentOptions,
  summary,
  onBack,
  startInTransferReview,
  onPaymentSuccess
}: AdvancePaymentFormProps) {
  const [, navigate] = useLocation();

  // Encontrar la primera opción disponible como default
  const getDefaultOption = (): PaymentType => {
    // Prioridad: next_payment > overdue > full > custom
    const priority: PaymentType[] = ['next_payment', 'overdue', 'full', 'custom'];
    for (const type of priority) {
      const option = paymentOptions.find(o => o.type === type && o.available);
      if (option) return type;
    }
    return 'custom';
  };

  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType>(getDefaultOption());
  const [customAmount, setCustomAmount] = useState<string>("");
  const [step, setStep] = useState<'form' | 'confirmation' | 'success' | 'transfer-info'>(
    startInTransferReview ? 'transfer-info' : 'form'
  );
  const [selectedMethod, setSelectedMethod] = useState<'transfer' | 'card'>(startInTransferReview ? 'transfer' : 'transfer');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<StripePaymentResponse | null>(null);

  useEffect(() => {
    if (startInTransferReview) {
      setStep('transfer-info');
      setSelectedMethod('transfer');
    }
  }, [startInTransferReview]);

  // Actualizar opción seleccionada cuando lleguen las paymentOptions
  useEffect(() => {
    if (paymentOptions && paymentOptions.length > 0) {
      const defaultOption = getDefaultOption();
      setSelectedPaymentType(defaultOption);
    }
  }, [paymentOptions]);

  const handleHeaderBack = () => {
    if (step === 'transfer-info') {
      setStep('form');
      navigate(`/loans/${loanId}/advance-payment`);
      return;
    }
    onBack();
  };
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Obtener opciones del backend
  const getOptionByType = (type: PaymentType): PaymentOption | undefined => {
    return paymentOptions.find(o => o.type === type);
  };

  const fullOption = getOptionByType('full');
  const overdueOption = getOptionByType('overdue');
  const nextPaymentOption = getOptionByType('next_payment');
  const customOption = getOptionByType('custom');

  // Calcular el monto total pendiente (para transferencia)
  const totalPendingMinor = summary?.balance?.totalMinor || 0;
  const concept = loanId.slice(0, 8);

  const handleCopy = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 1500);
  };

  // Obtener el monto a pagar basado en la opción seleccionada (en pesos, no centavos)
  const getPaymentAmount = (): number => {
    const option = getOptionByType(selectedPaymentType);
    if (selectedPaymentType === 'custom') {
      return customAmount ? parseFloat(customAmount) : 0;
    }
    return option ? option.amountMinor / 100 : 0;
  };

  // Obtener el monto en centavos para enviar al backend
  const getPaymentAmountMinor = (): number => {
    if (selectedPaymentType === 'custom') {
      return customAmount ? Math.round(parseFloat(customAmount) * 100) : 0;
    }
    const option = getOptionByType(selectedPaymentType);
    return option?.amountMinor || 0;
  };

  // Verificar si la opción seleccionada está disponible
  const isSelectedOptionAvailable = (): boolean => {
    if (selectedPaymentType === 'custom') {
      return customOption?.available !== false && getPaymentAmountMinor() > 0;
    }
    const option = getOptionByType(selectedPaymentType);
    return option?.available === true;
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSelectedOptionAvailable()) {
      setErrorMessage('Esta opción de pago no está disponible');
      return;
    }

    const amountMinor = getPaymentAmountMinor();
    if (amountMinor <= 0) {
      setErrorMessage('El monto debe ser mayor a 0');
      return;
    }

    if (selectedMethod === 'transfer') {
      setErrorMessage(null);
      setStep('transfer-info');
      navigate(`/loans/${loanId}/advance-payment/continue`);
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage(null);

      // Enviar type al backend, y amountMinor solo si es custom
      const result = await payLoanWithCard(
        loanId,
        selectedPaymentType,
        selectedPaymentType === 'custom' ? amountMinor : undefined
      );

      setPaymentResult(result);
      onPaymentSuccess?.(result);
      setStep('success');
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message;
      setErrorMessage(apiMessage || 'No pudimos procesar el pago con tarjeta. Intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirmar el pago
  const handleConfirm = () => {
    setStep('success');
  };

  // Renderizar una opción de pago
  const renderPaymentOption = (option: PaymentOption) => {
    const isSelected = selectedPaymentType === option.type;
    const isDisabled = !option.available;

    return (
      <Card
        key={option.type}
        className={`border ${isSelected ? 'border-primary' : 'border-border'} ${isDisabled ? 'opacity-60' : ''}`}
      >
        <CardContent className="p-3">
          <div className="flex items-start">
            <RadioGroupItem
              value={option.type}
              id={option.type}
              className="mt-1"
              disabled={isDisabled}
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <Label htmlFor={option.type} className={`font-medium ${isDisabled ? 'text-muted-foreground' : ''}`}>
                  {option.label}
                </Label>
                {option.type !== 'custom' && (
                  <span className={`font-medium ${isDisabled ? 'text-muted-foreground' : ''}`}>
                    {formatCurrency(option.amountMinor / 100)}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-xs">{option.description}</p>
              {isDisabled && option.unavailableReason && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <AlertCircleIcon className="h-3 w-3" />
                  {option.unavailableReason}
                </p>
              )}
              {option.type === 'custom' && isSelected && (
                <div className="mt-2">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="text-right"
                    min={1}
                    max={totalPendingMinor / 100}
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Renderizar la vista de formulario
  const renderForm = () => {
    // Si no hay opciones de pago, mostrar loading
    if (!paymentOptions || paymentOptions.length === 0) {
      return (
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-3"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Card key={i} className="border">
                  <CardContent className="p-3">
                    <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Ordenar las opciones: overdue primero si existe, luego next_payment, full, custom
    const orderedOptions = [...paymentOptions].sort((a, b) => {
      const order: Record<PaymentType, number> = { overdue: 0, next_payment: 1, full: 2, custom: 3 };
      return (order[a.type] ?? 4) - (order[b.type] ?? 4);
    });

    return (
      <form onSubmit={handleSubmit}>
        {/* Mostrar alerta si hay mora */}
        {summary?.overdueInfo?.isOverdue && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircleIcon className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Tienes {summary.overdueInfo.dpd} días de atraso
                </p>
                <p className="text-xs text-red-700">
                  Monto vencido: {formatCurrency(summary.overdueInfo.totalOverdueMinor / 100)}
                </p>
              </div>
            </div>
          </div>
        )}

        <SectionContainer>
          <h3 className="text-lg font-medium mb-3">¿Cuánto deseas pagar?</h3>
          <RadioGroup
            value={selectedPaymentType}
            onValueChange={(value) => setSelectedPaymentType(value as PaymentType)}
          >
            <div className="space-y-3">
              {orderedOptions.map(renderPaymentOption)}
            </div>
          </RadioGroup>
        </SectionContainer>

        <SectionContainer>
          <h3 className="text-lg font-medium mb-3">Método de pago</h3>
          <RadioGroup value={selectedMethod} onValueChange={(value) => setSelectedMethod(value as any)}>
            <div className="space-y-3">
              <Card className={`border ${selectedMethod === 'transfer' ? 'border-primary' : 'border-border'}`}>
                <CardContent className="p-3">
                  <div className="flex items-center">
                    <RadioGroupItem value="transfer" id="transfer" />
                    <Label htmlFor="transfer" className="ml-3 font-medium">
                      Transferencia bancaria
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Recibirás instrucciones para transferir
                  </p>
                </CardContent>
              </Card>

              <Card className={`border ${selectedMethod === 'card' ? 'border-primary' : 'border-border'}`}>
                <CardContent className="p-3">
                  <div className="flex items-center">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="ml-3 font-medium">
                      Tarjeta de crédito/débito
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Pago inmediato con tarjeta. Si desea cambiar su tarjeta domiciliada, vaya a la sección de perfil.
                  </p>
                </CardContent>
              </Card>
            </div>
          </RadioGroup>
        </SectionContainer>

        {errorMessage && (
          <p className="text-sm text-red-600 mb-3">{errorMessage}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isProcessing || !isSelectedOptionAvailable()}
        >
          {isProcessing ? 'Procesando...' : selectedMethod === 'transfer' ? 'Continuar con transferencia' : 'Continuar'}
        </Button>
      </form>
    );
  };

  // Renderizar la vista de confirmación
  const renderConfirmation = () => {
    // Solo aplica para tarjeta
    return (
      <>
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-1">Confirma tu pago</h3>
          <p className="text-muted-foreground text-sm">Verifica los detalles antes de confirmar</p>
        </div>

        <SectionContainer>
          <Card className="mb-0">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Préstamo #</span>
                <span>{loanId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monto a pagar</span>
                <span className="font-medium">{formatCurrency(getPaymentAmount())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Método de pago</span>
                <span>{selectedMethod === 'transfer' ? 'Transferencia bancaria' : 'Tarjeta'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </SectionContainer>

        <div className="flex space-x-2">
          <Button variant="outline" className="flex-1" onClick={() => setStep('form')}>
            Regresar
          </Button>
          <Button className="flex-1" onClick={handleConfirm}>
            Confirmar pago
          </Button>
        </div>
      </>
    );
  };

  // Renderizar la vista de éxito
  const renderSuccess = () => {
    return (
      <div className="text-center py-6">
        <div className="bg-primary/10 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircleIcon className="h-10 w-10 text-primary" />
        </div>
        
        <h3 className="text-xl font-bold mb-2">¡Pago registrado!</h3>
        <p className="text-muted-foreground mb-6">
          Hemos recibido tu pago por {formatCurrency(getPaymentAmount())}
        </p>
        
        <SectionContainer>
          <Card className="bg-accent text-left mb-0">
            <CardContent className="p-4">
              <div className="flex items-start">
                <InfoIcon className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm">
                    Tu pago con tarjeta será procesado inmediatamente.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </SectionContainer>
        
        <Button className="w-full" onClick={onBack}>
          Volver a mis préstamos
        </Button>
      </div>
    );
  };

  return (
    <PageContainer>
      <ContentContainer>
        {step !== 'success' && (
          <PageHeader title="Adelantar pago" onBack={handleHeaderBack} />
        )}
        
        {step === 'form' && renderForm()}
        {step === 'confirmation' && renderConfirmation()}
        {step === 'transfer-info' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Transferencia bancaria</h3>
              <p className="text-sm text-muted-foreground">
                Usa estos datos exactamente. El concepto identifica tu pago.
              </p>
            </div>

            <div className="rounded-xl bg-primary/5 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Banco', value: 'STP', mono: false },
                  { label: 'CLABE', value: '646680177602733217', mono: false },
                  { label: 'Beneficiario', value: 'SaltoPay', mono: false },
                  { label: 'Monto a pagar', value: formatCurrency(getPaymentAmount()), mono: false },
                  { label: 'Concepto', value: concept, mono: false }
                ].map((item) => (
                  <div key={item.label} className="col-span-2 sm:col-span-1">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{item.label}</p>
                    <div className="rounded-md bg-white px-3 py-2 font-sm flex items-center justify-between gap-2 shadow-sm">
                      <span className={item.mono ? 'font-mono text-sm' : 'font-medium'}>{item.value}</span>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-primary transition"
                        onClick={() => handleCopy(item.label, String(item.value))}
                        aria-label={`Copiar ${item.label}`}
                      >
                        {copiedField === item.label ? (
                          <CheckIcon className="h-4 w-4 text-primary" />
                        ) : (
                          <CopyIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Envía tu comprobante a <span className="font-semibold text-foreground">alejandro@saltopay.com</span> o al WhatsApp <span className="font-semibold text-foreground">449 387 6463</span>.
              </p>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setStep('form');
                  navigate(`/loans/${loanId}/advance-payment`);
                }}
              >
                Regresar
              </Button>
              <Button className="flex-1" onClick={onBack}>
                Listo
              </Button>
            </div>
          </div>
        )}
        {step === 'success' && renderSuccess()}
      </ContentContainer>
    </PageContainer>
  );
} 
