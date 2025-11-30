import { Loan } from "@/lib/api/loanService";
import { formatCurrency } from "@/lib/utils";
import { PageContainer, ContentContainer, PageHeader } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, CheckCircleIcon, ClockIcon, AlertCircleIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface LoanPaymentScheduleProps {
  loan: Loan;
  onBack: () => void;
}

export default function LoanPaymentSchedule({ loan, onBack }: LoanPaymentScheduleProps) {
  // Debug logs solo en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log('LoanPaymentSchedule - loan id:', loan.id);
    console.log('LoanPaymentSchedule - scheduleItems count:', loan.scheduleItems?.length || 0);
  }
  
  // Comprobar si hay elementos de cronograma disponibles
  if (!loan.scheduleItems || loan.scheduleItems.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.log('LoanPaymentSchedule - No hay items de cronograma disponibles');
    }
    return (
      <PageContainer>
        <ContentContainer className="max-w-2xl">
          <PageHeader title="Tabla de Pagos" onBack={onBack} />
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-muted-foreground">No hay información de pagos disponible</p>
            </CardContent>
          </Card>
        </ContentContainer>
      </PageContainer>
    );
  }

  const nextDueItem = loan.scheduleItems.find(
    (item) => !item.paid && !item.partiallyPaid && item.status !== 'paid'
  ) || loan.scheduleItems.find((item) => item.status === 'pending');
  const paidCount = loan.scheduleItems.filter((item) => item.paid || item.status === 'paid').length;
  const remainingBalance = loan.scheduleItems.reduce((sum, item) => {
    if (item.paid || item.status === 'paid') return sum;
    const due = item.remainingBalance ?? Math.max((item.total ?? 0) - (item.totalPaid ?? 0), 0);
    return sum + due;
  }, 0);

  const summary = {
    nextAmount: nextDueItem?.total ?? 0,
    nextDate: nextDueItem?.date ?? 'Sin fecha',
    remaining: remainingBalance,
    totalPayments: loan.scheduleItems.length,
    paidCount
  };

  const statusBadge = (item: typeof loan.scheduleItems[number]) => {
    if (item.paid || item.status === 'paid') {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircleIcon className="h-4 w-4 mr-1" />
          Pagado
        </Badge>
      );
    }
    if (item.partiallyPaid) {
      return (
        <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">
          Parcial
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-slate-100 text-slate-800">
        Pendiente
      </Badge>
    );
  };

  return (
    <PageContainer>
      <ContentContainer className="max-w-2xl">
        <PageHeader title="Tabla de Pagos" onBack={onBack} />

        <div className="mb-4 space-y-2">
          <h2 className="text-lg font-semibold">Préstamo #{loan.id.slice(-4)}</h2>
          <p className="text-sm text-muted-foreground">Monto: {formatCurrency(loan.amount)}</p>
        </div>

        <Card className="mb-4">
          <CardContent className="p-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Saldo pendiente</p>
              {loan.details ? (
                <>
                  <p className="text-2xl font-bold">{formatCurrency(summary.remaining)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {summary.paidCount} de {summary.totalPayments} pagos completados
                  </p>
                </>
              ) : (
                <>
                  <Skeleton className="h-7 w-28 mb-1" />
                  <Skeleton className="h-3 w-40" />
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base">Calendario</h3>
              <p className="text-xs text-muted-foreground">{summary.totalPayments} pagos</p>
            </div>
            <div className="space-y-2">
              {loan.scheduleItems.map((item) => {
                const isNext = nextDueItem && item.paymentNumber === nextDueItem.paymentNumber;
                return (
                  <div
                    key={item.paymentNumber || `${item.date}-${item.total}`}
                    className={`rounded-lg border px-3 py-2 flex items-center justify-between ${isNext ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'}`}
                  >
                    <div>
                      <p className="text-xs text-muted-foreground">Pago {item.paymentNumber || '-'}</p>
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{item.date || '-'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{formatCurrency(item.total || 0)}</div>
                      <div className="mt-1 flex items-center justify-end gap-2">
                        {statusBadge(item)}
                        {isNext && (
                          <Badge variant="outline" className="text-primary border-primary/40 bg-white">
                            Próximo
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4 overflow-hidden">
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">Resumen de pagos</h3>
            {loan.details ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Monto solicitado</span>
                  <span>{formatCurrency(loan.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Interés total</span>
                  <span>{formatCurrency(loan.details.totalInterest || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Comisión</span>
                  <span>{formatCurrency(loan.commissionAmount)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total a pagar</span>
                  <span>{formatCurrency(loan.details.totalAmount || 0)}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-36" />
                <Separator className="my-2" />
                <Skeleton className="h-5 w-32" />
              </div>
            )}
          </CardContent>
        </Card>
      </ContentContainer>
    </PageContainer>
  );
} 
