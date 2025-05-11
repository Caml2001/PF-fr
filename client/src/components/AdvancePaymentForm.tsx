import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { InfoIcon, CheckCircleIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ContentContainer, PageContainer, PageHeader, SectionContainer } from "@/components/Layout";

interface AdvancePaymentFormProps {
  loanId: string;
  pendingAmount: number;
  onBack: () => void;
}

export default function AdvancePaymentForm({ loanId, pendingAmount, onBack }: AdvancePaymentFormProps) {
  const [paymentOption, setPaymentOption] = useState<'nextPayment' | 'customAmount' | 'fullAmount'>('nextPayment');
  const [customAmount, setCustomAmount] = useState<string>("");
  const [step, setStep] = useState<'form' | 'confirmation' | 'success'>('form');
  const [selectedMethod, setSelectedMethod] = useState<'transfer' | 'card'>('transfer');
  
  // Cálculo de montos
  const nextPaymentAmount = 458.33; // En una aplicación real, esto vendría de los props
  const fullAmount = pendingAmount;
  
  // Calcular la cantidad a pagar basada en la opción seleccionada
  const getPaymentAmount = () => {
    switch (paymentOption) {
      case 'nextPayment':
        return nextPaymentAmount;
      case 'customAmount':
        return customAmount ? parseFloat(customAmount) : 0;
      case 'fullAmount':
        return fullAmount;
      default:
        return 0;
    }
  };

  // Manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('confirmation');
  };

  // Confirmar el pago
  const handleConfirm = () => {
    // Aquí iría la lógica para procesar el pago
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
                      <p className="font-medium mt-1">{formatCurrency(nextPaymentAmount)}</p>
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
                </CardContent>
              </Card>
            </div>
          </RadioGroup>
        </SectionContainer>

        <Button type="submit" className="w-full" disabled={paymentOption === 'customAmount' && (!customAmount || parseFloat(customAmount) <= 0)}>
          Continuar
        </Button>
      </form>
    );
  };

  // Renderizar la vista de confirmación
  const renderConfirmation = () => {
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

        {selectedMethod === 'transfer' && (
          <SectionContainer>
            <Card className="bg-accent mb-0">
              <CardContent className="p-4">
                <div className="flex items-start">
                  <InfoIcon className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">Datos para transferencia</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Banco: BBVA<br />
                      Cuenta: 012 3456 7890 1234<br />
                      CLABE: 01234567890123456<br />
                      A nombre de: PrestaFirme S.A. de C.V.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </SectionContainer>
        )}

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
          Hemos recibido tu solicitud de pago por {formatCurrency(getPaymentAmount())}
        </p>
        
        <SectionContainer>
          <Card className="bg-accent text-left mb-0">
            <CardContent className="p-4">
              <div className="flex items-start">
                <InfoIcon className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  {selectedMethod === 'transfer' ? (
                    <p className="text-sm">
                      Una vez que realices la transferencia, tu pago será procesado en un plazo de 24 horas hábiles.
                    </p>
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
          <PageHeader title="Adelantar pago" onBack={onBack} />
        )}
        
        {step === 'form' && renderForm()}
        {step === 'confirmation' && renderConfirmation()}
        {step === 'success' && renderSuccess()}
      </ContentContainer>
    </PageContainer>
  );
} 