import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRightIcon,
  CalendarIcon,
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  DollarSignIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import CreditApplicationForm from "@/components/CreditApplicationForm";
import AdvancePaymentForm from "@/components/AdvancePaymentForm";
import { ContentContainer, PageContainer, PageHeader, SectionContainer, SectionHeader } from "@/components/Layout";
import TopNavMenu from "@/components/TopNavMenu";

// Datos de ejemplo de préstamos
const loans = [
  {
    id: 1,
    amount: 5000,
    status: "active",
    startDate: "15 feb 2025",
    endDate: "15 feb 2026",
    term: 12,
    nextPayment: {
      date: "15 mayo 2025",
      amount: 458.33,
      status: "pending"
    },
    interestRate: 1.2,
    payments: [
      { id: 1, date: "15 mar 2025", amount: 458.33, status: "paid" },
      { id: 2, date: "15 abr 2025", amount: 458.33, status: "paid" },
      { id: 3, date: "15 may 2025", amount: 458.33, status: "pending" },
      { id: 4, date: "15 jun 2025", amount: 458.33, status: "pending" },
      { id: 5, date: "15 jul 2025", amount: 458.33, status: "pending" },
      { id: 6, date: "15 ago 2025", amount: 458.33, status: "pending" },
      { id: 7, date: "15 sep 2025", amount: 458.33, status: "pending" },
      { id: 8, date: "15 oct 2025", amount: 458.33, status: "pending" },
      { id: 9, date: "15 nov 2025", amount: 458.33, status: "pending" },
      { id: 10, date: "15 dic 2025", amount: 458.33, status: "pending" },
      { id: 11, date: "15 ene 2026", amount: 458.33, status: "pending" },
      { id: 12, date: "15 feb 2026", amount: 458.33, status: "pending" },
    ]
  },
  {
    id: 2,
    amount: 10000,
    status: "completed",
    startDate: "10 ene 2024",
    endDate: "10 ene 2025",
    term: 12,
    interestRate: 1.0,
    payments: [
      { id: 1, date: "10 feb 2024", amount: 883.33, status: "paid" },
      { id: 2, date: "10 mar 2024", amount: 883.33, status: "paid" },
      { id: 3, date: "10 abr 2024", amount: 883.33, status: "paid" },
      { id: 4, date: "10 may 2024", amount: 883.33, status: "paid" },
      { id: 5, date: "10 jun 2024", amount: 883.33, status: "paid" },
      { id: 6, date: "10 jul 2024", amount: 883.33, status: "paid" },
      { id: 7, date: "10 ago 2024", amount: 883.33, status: "paid" },
      { id: 8, date: "10 sep 2024", amount: 883.33, status: "paid" },
      { id: 9, date: "10 oct 2024", amount: 883.33, status: "paid" },
      { id: 10, date: "10 nov 2024", amount: 883.33, status: "paid" },
      { id: 11, date: "10 dic 2024", amount: 883.33, status: "paid" },
      { id: 12, date: "10 ene 2025", amount: 883.33, status: "paid" },
    ]
  }
];

type Loan = typeof loans[0];
type Payment = typeof loans[0]['payments'][0];

export default function LoansSection() {
  // Estado para controlar qué préstamo está seleccionado para ver detalles
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  // Estado para controlar si estamos viendo la vista de pagos
  const [showPayments, setShowPayments] = useState(false);
  // Estado para controlar si se muestra el formulario de solicitud
  const [showApplication, setShowApplication] = useState(false);
  // Estado para controlar si se muestra el formulario de adelanto de pago
  const [showAdvancePayment, setShowAdvancePayment] = useState(false);

  // Función para volver a la vista principal de préstamos
  const handleBack = () => {
    if (showPayments) {
      setShowPayments(false);
    } else if (showApplication) {
      setShowApplication(false);
    } else if (showAdvancePayment) {
      setShowAdvancePayment(false);
    } else {
      setSelectedLoan(null);
    }
  };

  // Función para mostrar la vista de pagos
  const handleViewPayments = () => {
    setShowPayments(true);
  };

  // Función para mostrar el formulario de solicitud
  const handleApplyLoan = () => {
    setShowApplication(true);
  };

  // Función para mostrar el formulario de adelanto de pago
  const handleAdvancePayment = () => {
    setShowAdvancePayment(true);
  };

  // Calcular el monto pendiente para un préstamo
  const calculatePendingAmount = (loan: Loan): number => {
    const pendingPayments = loan.payments.filter(p => p.status === "pending");
    return pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  // Si estamos mostrando el formulario de solicitud
  if (showApplication) {
    return <CreditApplicationForm onLogout={handleBack} />;
  }

  // Si estamos mostrando el formulario de adelanto de pago
  if (showAdvancePayment && selectedLoan) {
    const pendingAmount = calculatePendingAmount(selectedLoan);
    return (
      <AdvancePaymentForm 
        loanId={selectedLoan.id} 
        pendingAmount={pendingAmount} 
        onBack={handleBack} 
      />
    );
  }

  // Renderiza la lista de préstamos
  const renderLoansList = () => {
    return (
      <>
        <SectionHeader 
          title="Mis Préstamos"
          action={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                Ver historial
              </Button>
              {/* Menú Silk solo en navegador (no PWA) */}
              {!window.matchMedia('(display-mode: standalone)').matches && !(window.navigator as any).standalone && (
                <TopNavMenu />
              )}
            </div>
          }
        />
        
        <SectionContainer>
          <div className="space-y-4">
            {loans.map((loan) => (
              <Card 
                key={loan.id} 
                className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setSelectedLoan(loan)}
              >
                <CardContent className="p-0">
                  <div className={`p-4 ${loan.status === 'active' ? 'bg-primary/10' : 'bg-muted/50'}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs text-muted-foreground">Préstamo #{loan.id}</span>
                        <h3 className="text-xl font-bold">{formatCurrency(loan.amount)}</h3>
                      </div>
                      
                      <Badge variant={loan.status === 'active' ? "default" : "secondary"}>
                        {loan.status === 'active' ? 'Activo' : 'Completado'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center text-muted-foreground">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        <span className="text-xs">Plazo: {loan.term} meses</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        <span className="text-xs">{loan.startDate}</span>
                      </div>
                    </div>
                    
                    {loan.status === 'active' && loan.nextPayment && (
                      <div className="bg-accent rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <span className="text-xs text-muted-foreground">Próximo pago</span>
                          <p className="font-medium">{formatCurrency(loan.nextPayment.amount)}</p>
                          <span className="text-xs">{loan.nextPayment.date}</span>
                        </div>
                        <ChevronRightIcon className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </SectionContainer>
        
        <Card className="border-dashed border-2 border-primary/30">
          <CardContent className="p-4 flex justify-center items-center">
            <div className="text-center">
              <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <CreditCardIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium text-sm mb-1">¿Necesitas otro préstamo?</h3>
              <p className="text-xs text-muted-foreground mb-3">Puedes solicitar un nuevo crédito</p>
              <Button size="sm" className="text-xs" onClick={handleApplyLoan}>
                Solicitar <ArrowRightIcon className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    );
  };

  // Renderiza los detalles de un préstamo específico
  const renderLoanDetails = () => {
    if (!selectedLoan) return null;
    
    return (
      <>
        <PageHeader title="Detalles del Préstamo" onBack={handleBack} />
        
        <SectionContainer>
          <Card className="overflow-hidden">
            <div className={`p-4 ${selectedLoan.status === 'active' ? 'bg-primary/10' : 'bg-muted/50'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs text-muted-foreground">Préstamo #{selectedLoan.id}</span>
                  <h3 className="text-xl font-bold">{formatCurrency(selectedLoan.amount)}</h3>
                </div>
                
                <Badge variant={selectedLoan.status === 'active' ? "default" : "secondary"}>
                  {selectedLoan.status === 'active' ? 'Activo' : 'Completado'}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Fecha inicio</p>
                  <p className="font-medium">{selectedLoan.startDate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fecha fin</p>
                  <p className="font-medium">{selectedLoan.endDate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Plazo</p>
                  <p className="font-medium">{selectedLoan.term} meses</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tasa</p>
                  <p className="font-medium">{selectedLoan.interestRate}% mensual</p>
                </div>
              </div>
              
              {selectedLoan.status === 'active' && selectedLoan.nextPayment && (
                <div className="bg-accent rounded-lg p-3 mb-4">
                  <p className="text-xs text-muted-foreground">Próximo pago</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{formatCurrency(selectedLoan.nextPayment.amount)}</p>
                      <span className="text-xs">{selectedLoan.nextPayment.date}</span>
                    </div>
                    <Badge variant="outline">Pendiente</Badge>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={handleViewPayments}
                >
                  <span>Ver pagos</span>
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
                
                {selectedLoan.status === 'active' && (
                  <Button 
                    className="w-full justify-between"
                    onClick={handleAdvancePayment}
                  >
                    <span>Adelantar pago</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </SectionContainer>
        
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">Resumen del préstamo</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Monto solicitado</span>
                <span>{formatCurrency(selectedLoan.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Interés total</span>
                <span>{formatCurrency(selectedLoan.amount * selectedLoan.interestRate / 100 * selectedLoan.term)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Total a pagar</span>
                <span>{formatCurrency(selectedLoan.amount + selectedLoan.amount * selectedLoan.interestRate / 100 * selectedLoan.term)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    );
  };

  // Renderiza la vista de pagos
  const renderPayments = () => {
    if (!selectedLoan) return null;
    
    return (
      <>
        <PageHeader title="Pagos del préstamo" onBack={handleBack} />
        
        <div className="mb-4 flex justify-between items-center">
          <div>
            <span className="text-xs text-muted-foreground">Préstamo #{selectedLoan.id}</span>
            <h3 className="text-lg font-bold">{formatCurrency(selectedLoan.amount)}</h3>
          </div>
          <Badge variant={selectedLoan.status === 'active' ? "default" : "secondary"}>
            {selectedLoan.status === 'active' ? 'Activo' : 'Completado'}
          </Badge>
        </div>
        
        <SectionContainer>
          <div className="space-y-3">
            {selectedLoan.payments.map((payment) => (
              <Card key={payment.id}>
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{formatCurrency(payment.amount)}</p>
                      <span className="text-xs text-muted-foreground">Pago {payment.id} • {payment.date}</span>
                    </div>
                    
                    {payment.status === 'paid' ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        <span className="text-xs">Pagado</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-amber-600">
                        <AlertCircleIcon className="h-4 w-4 mr-1" />
                        <span className="text-xs">Pendiente</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </SectionContainer>
        
        {selectedLoan.status === 'active' && (
          <div className="mt-6">
            <Button className="w-full" onClick={handleAdvancePayment}>
              <DollarSignIcon className="h-4 w-4 mr-2" />
              Adelantar pago
            </Button>
          </div>
        )}
      </>
    );
  };

  return (
    <PageContainer>
      <ContentContainer>
        {!selectedLoan && renderLoansList()}
        {selectedLoan && !showPayments && renderLoanDetails()}
        {selectedLoan && showPayments && renderPayments()}
      </ContentContainer>
    </PageContainer>
  );
} 