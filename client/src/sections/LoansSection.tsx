import { useState, useEffect } from "react";
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
  RefreshCwIcon,
  HourglassIcon,
  TableIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import CreditApplicationForm from "@/components/CreditApplicationForm";
import AdvancePaymentForm from "@/components/AdvancePaymentForm";
import { ContentContainer, PageContainer, PageHeader, SectionContainer, SectionHeader } from "@/components/Layout";
import TopNavMenu from "@/components/TopNavMenu";
import useLoans from "@/hooks/useLoans";
import { Loan, Payment } from "@/lib/api/loanService";
import { Skeleton } from "@/components/ui/skeleton";
import LoanPaymentSchedule from "@/components/LoanPaymentSchedule";
import { useLocation } from "wouter";

// Función para renderizar el estado del préstamo
const LoanStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'active':
      return (
        <Badge variant="default">
          <CheckCircleIcon className="h-3 w-3 mr-1" />
          Activo
        </Badge>
      );
    case 'completed':
      return (
        <Badge variant="secondary">
          <CheckCircleIcon className="h-3 w-3 mr-1" />
          Completado
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
          <HourglassIcon className="h-3 w-3 mr-1" />
          Pendiente
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

interface LoansSectionProps {
  loanId?: string;
  view?: 'payments' | 'schedule' | 'advance-payment';
}

export default function LoansSection({ loanId, view }: LoansSectionProps = {}) {
  const [location, navigate] = useLocation();
  
  // Hook para gestionar préstamos con optimistic UI
  const {
    loans,
    isLoading,
    isRefreshing,
    error,
    selectedLoan,
    selectLoan,
    clearSelection,
    refreshLoans,
    isInitialized
  } = useLoans();

  // Efecto para cargar el préstamo seleccionado por ID de ruta
  useEffect(() => {
    if (loanId && (!selectedLoan || selectedLoan.id !== loanId)) {
      selectLoan(loanId);
    } else if (!loanId && selectedLoan) {
      clearSelection();
    }
  }, [loanId, selectedLoan]);

  // Función para volver a la vista principal de préstamos o a los detalles
  const handleBack = () => {
    if (view) {
      // Si estamos en una sub-vista, volver a los detalles del préstamo
      navigate(`/loans/${loanId}`);
    } else if (loanId) {
      // Si estamos en los detalles, volver a la lista
      navigate('/loans');
    }
  };

  // Función para mostrar la vista de pagos
  const handleViewPayments = () => {
    if (selectedLoan) {
      navigate(`/loans/${selectedLoan.id}/payments`);
    }
  };

  // Función para mostrar la tabla de amortización
  const handleViewPaymentSchedule = () => {
    if (selectedLoan) {
      navigate(`/loans/${selectedLoan.id}/schedule`);
    }
  };

  // Función para mostrar el formulario de solicitud
  const handleApplyLoan = () => {
    navigate('/apply');
  };

  // Función para mostrar el formulario de adelanto de pago
  const handleAdvancePayment = () => {
    if (selectedLoan) {
      navigate(`/loans/${selectedLoan.id}/advance-payment`);
    }
  };

  // Función de recarga de datos
  const handleRefresh = () => {
    refreshLoans(true); // Mostrar el loader
  };

  // Calcular el monto pendiente para un préstamo
  const calculatePendingAmount = (loan: Loan): number => {
    if (!loan.payments || loan.payments.length === 0) return 0;
    const pendingPayments = loan.payments.filter(p => p.status === "pending");
    return pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  // Si estamos mostrando el formulario de solicitud
  if (location === '/apply') {
    return <CreditApplicationForm onLogout={() => navigate('/loans')} />;
  }

  // Si estamos mostrando el formulario de adelanto de pago
  if (view === 'advance-payment' && selectedLoan) {
    const pendingAmount = calculatePendingAmount(selectedLoan);
    return (
      <AdvancePaymentForm
        loanId={selectedLoan.id}
        pendingAmount={pendingAmount}
        onBack={handleBack}
      />
    );
  }

  // Renderiza el estado de carga o error
  const renderLoadingOrError = () => {
    if (isLoading && !isInitialized) {
      return (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <Card key={i} className="overflow-hidden">
              <div className="p-4 bg-muted/30">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-16 w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }
    
    if (error) {
      return (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 text-center">
            <AlertCircleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-700">{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={handleRefresh}>
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    if (isInitialized && loans.length === 0) {
      return (
        <Card className="bg-accent/50 border-0">
          <CardContent className="p-4 text-center">
            <CreditCardIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-40" />
            <p className="text-muted-foreground">No tienes préstamos activos</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={handleRefresh}>
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    return null;
  };

  // Renderiza la lista de préstamos
  const renderLoansList = () => {
    return (
      <>
        <SectionHeader 
          title="Mis Préstamos"
          action={
            <div className="flex items-center gap-2">
              {isRefreshing && (
                <div className="text-xs text-muted-foreground flex items-center">
                  <RefreshCwIcon className="h-3 w-3 mr-1 animate-spin" />
                  Actualizando...
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={handleRefresh}
                disabled={isLoading || isRefreshing}
              >
                <RefreshCwIcon className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              {/* Menú Silk solo en navegador (no PWA) */}
              {!window.matchMedia('(display-mode: standalone)').matches && !(window.navigator as any).standalone && (
                <TopNavMenu />
              )}
            </div>
          }
        />
        
        <SectionContainer>
          {renderLoadingOrError()}
          
          {(!isLoading || isInitialized) && !error && loans.length > 0 && (
            <div className="space-y-4">
              {loans.map((loan) => (
                <Card 
                  key={loan.id} 
                  className={`overflow-hidden cursor-pointer transition-all hover:border-primary/50 hover:shadow-md ${selectedLoan?.id === loan.id ? 'border-primary shadow-sm' : ''}`}
                  onClick={() => {
                    selectLoan(loan);
                    navigate(`/loans/${loan.id}`);
                  }}
                >
                  <CardContent className="p-0">
                    <div className={`p-4 ${
                      loan.status === 'active' 
                        ? 'bg-primary/10' 
                        : loan.status === 'pending' 
                          ? 'bg-amber-50' 
                          : 'bg-muted/50'
                    }`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-xs text-muted-foreground">Préstamo #{loan.id.slice(-4)}</span>
                          <h3 className="text-xl font-bold">{formatCurrency(loan.amount)}</h3>
                        </div>
                        
                        <LoanStatusBadge status={loan.status} />
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center text-muted-foreground">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          <span className="text-xs">Plazo: {loan.term} {loan.term === 1 ? 'semana' : 'semanas'}</span>
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
                      
                      {loan.status === 'pending' && (
                        <div className="bg-amber-50 rounded-lg p-3 flex justify-between items-center border border-amber-200">
                          <div>
                            <span className="text-xs text-amber-800">Pendiente de aprobación</span>
                            <p className="font-medium text-amber-900">Solicitado el {loan.startDate}</p>
                          </div>
                          <HourglassIcon className="h-5 w-5 text-amber-500" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {loans.length > 0 && (
            <Button 
              variant="outline" 
              className="w-full mt-4 flex items-center justify-center" 
              onClick={handleApplyLoan}
            >
              <CreditCardIcon className="h-4 w-4 mr-2" />
              Solicitar nuevo préstamo
            </Button>
          )}
        </SectionContainer>
      </>
    );
  };

  // Renderiza los detalles de un préstamo específico
  const renderLoanDetails = () => {
    if (!selectedLoan) return null;
    
    // Log para depuración
    console.log('Estado del préstamo:', selectedLoan.status);
    console.log('Préstamo seleccionado:', selectedLoan);
    
    // Calcular totales si no están disponibles en details
    const totalInterest = selectedLoan.details?.totalInterest || 
      (selectedLoan.amount * selectedLoan.interestRate / 100 * (selectedLoan.term / 52));
    
    const totalAmount = selectedLoan.details?.totalAmount || 
      (selectedLoan.amount + totalInterest + selectedLoan.commissionAmount);
    
    return (
      <>
        <PageHeader title="Detalles del Préstamo" onBack={handleBack} />
        
        <SectionContainer>
          <Card className="overflow-hidden">
            <div className={`p-4 ${
              selectedLoan.status === 'active' 
                ? 'bg-primary/10' 
                : selectedLoan.status === 'pending' 
                  ? 'bg-amber-50' 
                  : 'bg-muted/50'
            }`}>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs text-muted-foreground">Préstamo #{selectedLoan.id.slice(-4)}</span>
                  <h3 className="text-xl font-bold">{formatCurrency(selectedLoan.amount)}</h3>
                </div>
                
                <LoanStatusBadge status={selectedLoan.status} />
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
                  <p className="font-medium">{selectedLoan.term} {selectedLoan.term === 1 ? 'semana' : 'semanas'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tasa</p>
                  <p className="font-medium">{selectedLoan.interestRate.toFixed(2)}% anual</p>
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
              
              {selectedLoan.status === 'pending' && (
                <div className="bg-amber-50 rounded-lg p-3 mb-4 border border-amber-200">
                  <p className="text-xs text-amber-800">Estado de solicitud</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-amber-900">Pendiente de aprobación</p>
                      <span className="text-xs text-amber-800">Solicitado el {selectedLoan.startDate}</span>
                    </div>
                    <HourglassIcon className="h-5 w-5 text-amber-500" />
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={handleViewPayments}
                >
                  <span>Ver historial de pagos</span>
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={handleViewPaymentSchedule}
                >
                  <div className="flex items-center">
                    <TableIcon className="h-4 w-4 mr-2" />
                    <span>Ver tabla de pagos</span>
                  </div>
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
                <span className="text-sm text-muted-foreground">Comisión</span>
                <span>{formatCurrency(selectedLoan.commissionAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Interés total</span>
                <span>{formatCurrency(totalInterest)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Total a pagar</span>
                <span>{formatCurrency(totalAmount)}</span>
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
            <span className="text-xs text-muted-foreground">Préstamo #{selectedLoan.id.slice(-4)}</span>
            <h3 className="text-lg font-bold">{formatCurrency(selectedLoan.amount)}</h3>
          </div>
          <LoanStatusBadge status={selectedLoan.status} />
        </div>
        
        <SectionContainer>
          {selectedLoan.status === 'pending' ? (
            <Card className="bg-amber-50 border border-amber-200">
              <CardContent className="p-4 text-center">
                <p className="text-amber-800">El historial de pagos estará disponible una vez que se apruebe el préstamo</p>
              </CardContent>
            </Card>
          ) : selectedLoan.payments && selectedLoan.payments.length > 0 ? (
            <div className="space-y-3">
              {selectedLoan.payments.map((payment) => (
                <Card key={payment.id}>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{formatCurrency(payment.amount)}</p>
                        <span className="text-xs text-muted-foreground">Pago • {payment.date}</span>
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
          ) : (
            <Card className="bg-accent/50 border-0">
              <CardContent className="p-4 text-center">
                <p className="text-muted-foreground">No hay pagos registrados aún</p>
              </CardContent>
            </Card>
          )}
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

  // Log para depuración
  console.log('Estados:', {
    selectedLoan: selectedLoan ? {
      id: selectedLoan.id,
      status: selectedLoan.status,
      scheduleItems: selectedLoan.scheduleItems ? selectedLoan.scheduleItems.length : 0
    } : null,
    loanId,
    view
  });

  return (
    <PageContainer>
      <ContentContainer>
        {!loanId && renderLoansList()}
        {loanId && selectedLoan && !view && renderLoanDetails()}
        {loanId && selectedLoan && view === 'payments' && renderPayments()}
        {loanId && selectedLoan && view === 'schedule' && (
          <LoanPaymentSchedule loan={selectedLoan} onBack={handleBack} />
        )}
      </ContentContainer>
    </PageContainer>
  );
} 