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
  Loader2,
  AlertCircle
} from "lucide-react";
import { PageContainer, ContentContainer, PageHeader, SectionContainer, SectionHeader } from "./Layout";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Sheet } from "@silk-hq/components";
import { getLoanProducts, LoanProduct, applyForCredit, LoanApplicationData, LoanResponse } from "../lib/api/creditService";

interface CreditApplicationFormProps {
  onLogout: () => void;
}

// Componente de Skeleton Loader para el formulario
const SkeletonLoader = () => {
  return (
    <>
      <SectionContainer>
        <div className="h-6 w-48 bg-accent rounded-md animate-pulse mb-1"></div>
        <div className="h-4 w-64 bg-accent rounded-md animate-pulse mb-6"></div>
        
        <Card className="overflow-hidden mb-4">
          <div className="bg-primary/5 p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="h-3 w-32 bg-accent rounded-md animate-pulse mb-1"></div>
                <div className="h-5 w-20 bg-accent rounded-md animate-pulse"></div>
              </div>
              <div className="h-6 w-24 bg-accent rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <CardContent className="p-4">
            <div className="mb-4">
              <div className="h-4 w-32 bg-accent rounded-md animate-pulse mb-3"></div>
              <div className="h-5 w-full bg-accent rounded-md animate-pulse mb-4"></div>
              <div className="flex justify-between">
                <div className="h-3 w-8 bg-accent rounded-md animate-pulse"></div>
                <div className="h-3 w-8 bg-accent rounded-md animate-pulse"></div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="h-4 w-32 bg-accent rounded-md animate-pulse mb-3"></div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-16 bg-accent rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>
            
            <div className="h-20 bg-accent rounded-lg animate-pulse mb-4"></div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden mb-4">
          <CardContent className="p-4">
            <div className="h-5 w-40 bg-accent rounded-md animate-pulse mb-3"></div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-4 w-32 bg-accent rounded-md animate-pulse"></div>
                <div className="h-4 w-16 bg-accent rounded-md animate-pulse"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-accent rounded-md animate-pulse"></div>
                <div className="h-4 w-16 bg-accent rounded-md animate-pulse"></div>
              </div>
              <div className="h-px w-full bg-accent animate-pulse my-2"></div>
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-accent rounded-md animate-pulse"></div>
                <div className="h-4 w-20 bg-accent rounded-md animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </SectionContainer>
      
      <SectionContainer>
        <div className="h-4 w-32 bg-accent rounded-md animate-pulse mb-3"></div>
        <Card className="overflow-hidden mb-4">
          <CardContent className="p-4">
            <div className="h-10 w-full bg-accent rounded-md animate-pulse"></div>
          </CardContent>
        </Card>
        
        <div className="h-20 bg-accent rounded-lg animate-pulse"></div>
      </SectionContainer>
      
      <div className="h-12 w-full bg-accent rounded-md animate-pulse"></div>
    </>
  );
};

export default function CreditApplicationForm({ onLogout }: CreditApplicationFormProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loanProducts, setLoanProducts] = useState<LoanProduct[]>([]);
  const [expressProducts, setExpressProducts] = useState<LoanProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<LoanProduct | null>(null);
  const [amount, setAmount] = useState(1000);
  const [paymentTerm, setPaymentTerm] = useState("7");
  const [minAmount, setMinAmount] = useState(0);
  const [maxAmount, setMaxAmount] = useState(4000);
  
  // Estado para optimistic UI
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);
  const [optimisticLoan, setOptimisticLoan] = useState<LoanResponse | null>(null);
  
  // Cargar productos de préstamo
  useEffect(() => {
    const fetchLoanProducts = async () => {
      try {
        setLoading(true);
        setError(null);
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
        setError("No se pudieron cargar los productos disponibles. Por favor, intenta nuevamente.");
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

  // Crear datos optimistas
  const createOptimisticLoan = (): LoanResponse => {
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + parseInt(paymentTerm));
    
    return {
      id: "temp-" + Date.now(),
      status: "processing",
      principal: amount,
      interestRate: selectedProduct?.minRate || 0,
      term: parseInt(paymentTerm) / 7, // Convertir días a semanas
      commissionAmount: commission,
      disbursedAmount: amountToReceive,
      startDate: today.toISOString(),
      dueDate: dueDate.toISOString(),
      productName: selectedProduct?.name || "Crédito Express",
      createdAt: today.toISOString(),
    };
  };

  // Manejar la solicitud de préstamo
  const handleSubmit = async () => {
    if (!selectedProduct || !selectedAccount) {
      setError("Por favor selecciona una cuenta para recibir el depósito");
      return;
    }
    
    // Formato correcto según la API
    const loanRequest: LoanApplicationData = {
      productId: selectedProduct.id,
      principal: amount,
      // Para productos express, el term debe coincidir con el fixedTerm del producto
      term: selectedProduct.fixedTerm // Ya está en semanas, no necesitamos convertir
    };
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Crear y mostrar datos optimistas inmediatamente
      const optimistic = createOptimisticLoan();
      setOptimisticLoan(optimistic);
      setIsSubmitSuccessful(true);
      
      // Enviar solicitud real
      const response = await applyForCredit(loanRequest);
      
      // En un caso real, redireccionaríamos a la página de préstamos después de un período corto
      setTimeout(() => {
        window.location.href = "/loans";
      }, 2000);
      
    } catch (error: any) {
      console.error("Error al enviar solicitud:", error);
      setIsSubmitSuccessful(false);
      setOptimisticLoan(null);
      
      // Manejar mensajes de error del servidor
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("No se pudo procesar tu solicitud. Intenta nuevamente.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Si hay un error de carga
  if (error && !isSubmitSuccessful) {
    return (
      <PageContainer>
        <ContentContainer>
          <PageHeader 
            title="Solicitud de crédito" 
            onBack={onLogout} 
          />
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ocurrió un error</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Intentar nuevamente
            </Button>
          </div>
        </ContentContainer>
      </PageContainer>
    );
  }

  // Si se envió exitosamente la solicitud (optimistic UI)
  if (isSubmitSuccessful && optimisticLoan) {
    return (
      <PageContainer>
        <ContentContainer>
          <PageHeader 
            title="Solicitud enviada" 
            onBack={onLogout} 
          />
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">¡Préstamo solicitado con éxito!</h3>
            <p className="text-muted-foreground mb-6">
              Tu solicitud está siendo procesada. Serás redirigido automáticamente.
            </p>
            
            <Card className="w-full mb-6">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Detalles del préstamo</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Producto</span>
                    <span>{optimisticLoan.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monto</span>
                    <span>${optimisticLoan.principal.toLocaleString('es-MX')}.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">A recibir</span>
                    <span>${optimisticLoan.disbursedAmount.toLocaleString('es-MX')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Plazo</span>
                    <span>{optimisticLoan.term} {optimisticLoan.term === 1 ? 'semana' : 'semanas'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground mt-2">Redirigiendo a préstamos...</p>
          </div>
        </ContentContainer>
      </PageContainer>
    );
  }

  // Si está cargando, mostrar skeleton loader
  if (loading) {
    return (
      <PageContainer>
        <ContentContainer>
          <PageHeader 
            title="Solicitud de crédito" 
            onBack={onLogout} 
          />
          <SkeletonLoader />
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
        
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-4 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        
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