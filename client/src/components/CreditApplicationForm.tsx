import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { 
  LogOut, 
  Info,
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon
} from "lucide-react";
import { PageContainer, ContentContainer, PageHeader, SectionContainer, SectionHeader } from "./Layout";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Sheet } from "@silk-hq/components";

interface CreditApplicationFormProps {
  onLogout: () => void;
}

export default function CreditApplicationForm({ onLogout }: CreditApplicationFormProps) {
  const [amount, setAmount] = useState(1000);
  const [paymentTerm, setPaymentTerm] = useState("7");
  const minAmount = 0;
  const maxAmount = 4000;
  
  // Calcular la comisión (1.5%)
  const commission = amount * 0.015;
  // Calcular el monto a recibir
  const amountToReceive = amount - commission;
  
  // Obtener la fecha límite (28 de abril de 2025 en este caso)
  const deadlineDate = "28 de abril de 2025";
  
  // Mapeo de términos de pago a texto descriptivo
  const paymentTermLabels: Record<string, string> = {
    "7": "1 sem",
    "14": "2 sem",
    "21": "3 sem",
    "30": "1 mes"
  };

  // Estado para el bottom sheet de cuentas
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const accounts = [
    { value: "cuenta1", label: "BBVA ****1234" },
    { value: "cuenta2", label: "Santander ****5678" },
    { value: "cuenta3", label: "Banorte ****9101" },
  ];

  return (
    <PageContainer>
      <ContentContainer>
        <PageHeader 
          title="Solicitud de crédito" 
          onBack={onLogout} 
        />
        
        <SectionContainer>
          <SectionHeader
            title="Personaliza tu préstamo"
            subtitle="Selecciona el plazo y monto que necesitas"
          />
          
          <Card className="overflow-hidden mb-4">
            <div className="bg-primary/10 p-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs text-muted-foreground">Solicitud de préstamo</span>
                  <h3 className="text-xl font-bold">$ {amount.toLocaleString('es-MX')}.00</h3>
                </div>
                <Badge>Preaprobado</Badge>
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Monto del crédito</h3>
                <Slider 
                  min={minAmount}
                  max={maxAmount}
                  step={100}
                  value={[amount]}
                  onValueChange={(values) => setAmount(values[0])}
                  className="my-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>${minAmount.toLocaleString('es-MX')}</span>
                  <span>${maxAmount.toLocaleString('es-MX')}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Plazo de pago (días)</h3>
                <div className="grid grid-cols-4 gap-2">
                  {["7", "14", "21", "30"].map(term => (
                    <button
                      key={term}
                      className={`border rounded-lg p-2 text-center transition-all ${
                        paymentTerm === term 
                          ? "border-primary bg-primary/5 text-primary" 
                          : "border-border"
                      }`}
                      onClick={() => setPaymentTerm(term)}
                    >
                      <div className="font-medium text-sm">{term}</div>
                      <div className="text-xs text-muted-foreground">{paymentTermLabels[term]}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-accent rounded-lg p-3 mb-4 flex items-start">
                <div className="bg-primary/10 h-7 w-7 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fecha límite de pago</p>
                  <p className="font-medium">{deadlineDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Desglose del préstamo</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Monto solicitado</span>
                  <span>${amount.toLocaleString('es-MX')}.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Comisión (1.5%)</span>
                  <span>${commission.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Recibirás</span>
                  <span className="text-primary">${amountToReceive.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </SectionContainer>
        
        <SectionContainer>
          <h3 className="text-sm font-medium mb-3">Cuenta de depósito</h3>
          <Card className="overflow-hidden mb-4">
            <CardContent className="p-4">
              <button
                className="w-full border border-border rounded-lg px-4 py-3 text-left flex items-center justify-between bg-white hover:bg-accent transition-colors"
                onClick={() => setAccountSheetOpen(true)}
                type="button"
              >
                <span className={selectedAccount ? "" : "text-muted-foreground"}>
                  {selectedAccount
                    ? accounts.find(acc => acc.value === selectedAccount)?.label
                    : "Selecciona una cuenta"}
                </span>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <Sheet.Root open={accountSheetOpen} onOpenChange={setAccountSheetOpen} license="commercial">
                <Sheet.Portal>
                  <Sheet.View nativeEdgeSwipePrevention={true}>
                    <Sheet.Backdrop themeColorDimming="auto" />
                    <Sheet.Content className="rounded-t-3xl shadow-2xl p-0 overflow-hidden bg-white">
                      <Sheet.BleedingBackground className="rounded-t-3xl bg-white" />
                      <div className="py-6 px-4">
                        <div className="mb-4 text-center">
                          <span className="block text-lg font-semibold text-primary">Selecciona una cuenta</span>
                        </div>
                        <div className="space-y-3">
                          {accounts.map(acc => (
                            <button
                              key={acc.value}
                              className={`w-full text-left px-6 py-5 rounded-2xl border border-border transition-colors flex items-center justify-between text-lg font-medium shadow-sm ${selectedAccount === acc.value ? "bg-primary/10 border-primary scale-[1.04]" : "bg-white hover:bg-accent"}`}
                              style={{ minHeight: 64 }}
                              onClick={() => {
                                setSelectedAccount(acc.value);
                                setAccountSheetOpen(false);
                              }}
                            >
                              <span>{acc.label}</span>
                              {selectedAccount === acc.value && (
                                <CheckIcon className="ml-4 h-5 w-5 text-primary align-text-bottom" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </Sheet.Content>
                  </Sheet.View>
                </Sheet.Portal>
              </Sheet.Root>
            </CardContent>
          </Card>
          
          <Card className="bg-accent border-0">
            <CardContent className="p-3">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-xs">
                  Al solicitar este préstamo, aceptas los términos y condiciones y autorizas 
                  el uso de tus datos conforme a nuestra política de privacidad.
                </p>
              </div>
            </CardContent>
          </Card>
        </SectionContainer>
        
        <Button className="w-full" size="lg">
          Solicitar préstamo <ArrowRightIcon className="h-4 w-4 ml-2" />
        </Button>
      </ContentContainer>
    </PageContainer>
  );
}