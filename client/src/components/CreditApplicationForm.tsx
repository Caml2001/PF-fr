import { useState, useEffect } from "react";
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
  CheckIcon,
  Loader2
} from "lucide-react";
import { PageContainer, ContentContainer, PageHeader, SectionContainer, SectionHeader } from "./Layout";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Sheet } from "@silk-hq/components";
import { getLoanProducts, LoanProduct, applyForCredit } from "../lib/api/creditService";

interface CreditApplicationFormProps {
  onLogout: () => void;
}

export default function CreditApplicationForm({ onLogout }: CreditApplicationFormProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loanProducts, setLoanProducts] = useState<LoanProduct[]>([]);
  const [expressProducts, setExpressProducts] = useState<LoanProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<LoanProduct | null>(null);
  const [amount, setAmount] = useState(1000);
  const [paymentTerm, setPaymentTerm] = useState("7");
  const [minAmount, setMinAmount] = useState(0);
  const [maxAmount, setMaxAmount] = useState(4000);
  
  // Cargar productos de préstamo
  useEffect(() => {
    const fetchLoanProducts = async () => {
      try {
        setLoading(true);
        const products = await getLoanProducts();
        
        // Filtrar productos express
        const expressProducts = products.filter(product => product.isExpressProduct);
        setLoanProducts(products);
        setExpressProducts(expressProducts);
        
        // Seleccionar el primer producto express por defecto
        if (expressProducts.length > 0) {
          const defaultProduct = expressProducts.find(p => p.fixedTerm === 1) || expressProducts[0];
          setSelectedProduct(defaultProduct);
          setMinAmount(defaultProduct.minAmount);
          setMaxAmount(defaultProduct.maxAmount);
          setAmount(Math.min(1000, defaultProduct.maxAmount));
          setPaymentTerm(String((defaultProduct.fixedTerm || 1) * 7));
        }
      } catch (error) {
        console.error("Error al cargar productos de préstamo:", error);
        console.error("No se pudieron cargar los productos de préstamo");
      } finally {
        setLoading(false);
      }
    };
    
    fetchLoanProducts();
  }, []);
  
  // Actualizar producto seleccionado cuando cambia el plazo
  useEffect(() => {
    if (expressProducts.length > 0) {
      const weeksTerm = parseInt(paymentTerm) / 7;
      const product = expressProducts.find(p => p.fixedTerm === weeksTerm);
      
      if (product) {
        setSelectedProduct(product);
        setMinAmount(product.minAmount);
        setMaxAmount(product.maxAmount);
        
        // Ajustar monto si excede los límites del nuevo producto
        if (amount > product.maxAmount) {
          setAmount(product.maxAmount);
        } else if (amount < product.minAmount) {
          setAmount(product.minAmount);
        }
      }
    }
  }, [paymentTerm, expressProducts, amount]);
  
  // Calcular la comisión basada en el producto seleccionado
  const commission = selectedProduct ? (amount * (selectedProduct.commissionRate / 100)) : 0;
  
  // Calcular el monto a recibir
  const amountToReceive = amount - commission;
  
  // Calcular la fecha límite de pago
  const calculateDeadlineDate = () => {
    if (!paymentTerm) return "";
    
    const days = parseInt(paymentTerm);
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + days);
    
    // Formatear fecha en español
    return deadline.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  const deadlineDate = calculateDeadlineDate();
  
  // Mapeo de términos de pago a texto descriptivo
  const paymentTermLabels: Record<string, string> = {
    "7": "1 sem",
    "14": "2 sem",
    "21": "3 sem",
    "30": "1 mes"
  };

  // Estado para el selector de cuentas
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const accounts = [
    { value: "cuenta1", label: "BBVA ****1234" },
    { value: "cuenta2", label: "Santander ****5678" },
    { value: "cuenta3", label: "Banorte ****9101" },
  ];

  // Manejar la solicitud de préstamo
  const handleSubmit = async () => {
    if (!selectedProduct || !selectedAccount) {
      console.error("Por favor selecciona una cuenta para recibir el depósito");
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Datos de la solicitud
      const applicationData = {
        productId: selectedProduct.id,
        amount: amount,
        term: parseInt(paymentTerm),
        accountId: selectedAccount
      };
      
      // Enviar solicitud
      await applyForCredit(applicationData);
      
      // Mostrar mensaje de éxito y redireccionar
      console.log("Solicitud enviada correctamente");
      // En un caso real, redireccionaríamos a la página de préstamos
      window.alert("Solicitud enviada correctamente. Serás redirigido a la página de préstamos.");
      // Como no podemos usar navigate, podríamos usar window.location.href = "/loans";
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      console.error("No se pudo procesar tu solicitud. Intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  // Si está cargando, mostrar indicador
  if (loading) {
    return (
      <PageContainer>
        <ContentContainer>
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="mt-4 text-muted-foreground">Cargando productos disponibles...</p>
          </div>
        </ContentContainer>
      </PageContainer>
    );
  }

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
                <Badge>{selectedProduct?.name || "Crédito Express"}</Badge>
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
                  {expressProducts.length > 0 ? (
                    expressProducts
                      .sort((a, b) => (a.fixedTerm || 0) - (b.fixedTerm || 0))
                      .map(product => {
                        const term = String((product.fixedTerm || 0) * 7);
                        return (
                          <button
                            key={product.id}
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
                        );
                      })
                  ) : (
                    ["7", "14", "21", "30"].map(term => (
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
                    ))
                  )}
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
                  <span className="text-sm text-muted-foreground">
                    Comisión ({selectedProduct ? (selectedProduct.commissionRate + '%') : '1.5%'})
                  </span>
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
              <select
                className="w-full border border-border rounded-lg px-4 py-3 bg-white"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
              >
                <option value="">Selecciona una cuenta</option>
                {accounts.map(acc => (
                  <option key={acc.value} value={acc.value}>
                    {acc.label}
                  </option>
                ))}
              </select>
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
        
        <Button 
          className="w-full" 
          size="lg"
          onClick={handleSubmit}
          disabled={submitting || !selectedAccount}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
              Procesando...
            </>
          ) : (
            <>
              Solicitar préstamo <ArrowRightIcon className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </ContentContainer>
    </PageContainer>
  );
}