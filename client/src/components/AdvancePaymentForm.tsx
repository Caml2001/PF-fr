import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { InfoIcon, CheckCircleIcon, CopyIcon, CheckIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ContentContainer, PageContainer, PageHeader, SectionContainer } from "@/components/Layout";
import { payLoanWithCard } from "@/lib/api/loanService";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";

interface AdvancePaymentFormProps {
  loanId: string;
  pendingAmount: number;
  nextPaymentAmount?: number;
  onBack: () => void;
  startInTransferReview?: boolean;
}

export default function AdvancePaymentForm({ loanId, pendingAmount, nextPaymentAmount, onBack, startInTransferReview }: AdvancePaymentFormProps) {
  const [, navigate] = useLocation();
  const [paymentOption, setPaymentOption] = useState<'nextPayment' | 'customAmount' | 'fullAmount'>('nextPayment');
  const [customAmount, setCustomAmount] = useState<string>("");
  const [step, setStep] = useState<'form' | 'confirmation' | 'success' | 'transfer-info'>(
    startInTransferReview ? 'transfer-info' : 'form'
  );
  const [selectedMethod, setSelectedMethod] = useState<'transfer' | 'card'>(startInTransferReview ? 'transfer' : 'transfer');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (startInTransferReview) {
      setStep('transfer-info');
      setSelectedMethod('transfer');
    }
  }, [startInTransferReview]);

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
  
  // Cálculo de montos
  const nextPaymentToUse = Math.min(
    nextPaymentAmount && nextPaymentAmount > 0 ? nextPaymentAmount : pendingAmount,
    pendingAmount
  );
  const fullAmount = pendingAmount;
  const concept = loanId.slice(0, 8);

  const handleCopy = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 1500);
  };
  
  // Calcular la cantidad a pagar basada en la opción seleccionada
  const getPaymentAmount = () => {
    switch (paymentOption) {
      case 'nextPayment':
        return nextPaymentToUse;
      case 'customAmount':
        return customAmount ? parseFloat(customAmount) : 0;
      case 'fullAmount':
        return fullAmount;
      default:
        return 0;
    }
  };

  // Manejar el envío del formulario (solo tarjeta disponible)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = getPaymentAmount();
    if (amount <= 0) {
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
      const amountMinor = Math.round(amount * 100); // Convertir a centavos
      await payLoanWithCard(loanId, amountMinor);
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
    // Para transferencia, solo mostramos éxito/instrucciones
    setStep('success');
  };

  // Renderizar la vista de formulario
  const renderForm = () => {
    return (
      <form onSubmit={handleSubmit}>
        <SectionContainer>
          <h3 className="text-lg font-medium mb-3">¿Cuánto deseas pagar?</h3>
          <RadioGroup value={paymentOption} onValueChange={(value) => setPaymentOption(value as any)}>
            <div className="space-y-3">
              <Card className={`border ${paymentOption === 'nextPayment' ? 'border-primary' : 'border-border'}`}>
                <CardContent className="p-3">
                  <div className="flex items-start">
                    <RadioGroupItem value="nextPayment" id="nextPayment" className="mt-1" />
                <div className="ml-3">
                  <Label htmlFor="nextPayment" className="font-medium">
                    Próximo pago
                  </Label>
                  <p className="text-muted-foreground text-xs">Pagar solo el siguiente pago programado</p>
                      <p className="font-medium mt-1">{formatCurrency(nextPaymentToUse)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`border ${paymentOption === 'customAmount' ? 'border-primary' : 'border-border'}`}>
                <CardContent className="p-3">
              <div className="flex items-start">
                <RadioGroupItem value="customAmount" id="customAmount" className="mt-1" />
                <div className="ml-3 w-full">
                      <Label htmlFor="customAmount" className="font-medium">
                        Cantidad personalizada
                      </Label>
                      <p className="text-muted-foreground text-xs">Ingresa el monto que deseas pagar</p>
                      <div className="mt-2">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="text-right"
                          min={1}
                          max={fullAmount}
                          disabled={paymentOption !== 'customAmount'}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`border ${paymentOption === 'fullAmount' ? 'border-primary' : 'border-border'}`}>
                <CardContent className="p-3">
                  <div className="flex items-start">
                    <RadioGroupItem value="fullAmount" id="fullAmount" className="mt-1" />
                    <div className="ml-3">
                      <Label htmlFor="fullAmount" className="font-medium">
                        Préstamo completo
                      </Label>
                      <p className="text-muted-foreground text-xs">Liquidar todo el préstamo pendiente</p>
                      <p className="font-medium mt-1">{formatCurrency(fullAmount)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                    Pago inmediato con tarjeta
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
          disabled={isProcessing || (paymentOption === 'customAmount' && (!customAmount || parseFloat(customAmount) <= 0))}
        >
          {isProcessing ? 'Procesando...' : selectedMethod === 'transfer' ? 'Continuar con transferencia' : 'Continuar'}
        </Button>
      </form>
    );
  };

  // Renderizar la vista de confirmación
  const renderConfirmation = () => {
    if (selectedMethod === 'transfer') {
      return null;
    }

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
    if (selectedMethod === 'transfer') {
      return null;
    }

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
                  {selectedMethod === 'transfer' ? (
                    <>
                      <h4 className="font-medium text-sm">Datos para transferencia</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Banco: BBVA<br />
                        Cuenta: 012 3456 7890 1234<br />
                        CLABE: 01234567890123456<br />
                        A nombre de: PrestaFirme S.A. de C.V.<br />
                    Envía tu comprobante a <span className="font-semibold text-foreground">alejandro@saltopay.com</span> o al WhatsApp <span className="font-semibold text-foreground">449 387 6463</span> para acelerar la aplicación.
                  </p>
                    </>
                  ) : (
                    <p className="text-sm">
                      Tu pago con tarjeta será procesado inmediatamente.
                    </p>
                  )}
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
                  { label: 'Banco', value: 'BBVA', mono: false },
                  { label: 'CLABE', value: '646680177602733217', mono: false },
                  { label: 'Beneficiario', value: 'SaltoPay', mono: false },
                  { label: 'Monto a pagar', value: formatCurrency(nextPaymentToUse || fullAmount), mono: false },
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
