import { Loan, ScheduleItem } from "@/lib/api/loanService";
import { formatCurrency } from "@/lib/utils";
import { PageContainer, ContentContainer, PageHeader } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, CheckCircleIcon, ClockIcon, AlertCircleIcon, CircleDotIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface LoanPaymentScheduleProps {
  loan: Loan;
  onBack: () => void;
}

// Tipo extendido para items con los nuevos campos del backend
interface EnrichedScheduleItem extends ScheduleItem {
  daysOverdue?: number;
}

export default function LoanPaymentSchedule({ loan, onBack }: LoanPaymentScheduleProps) {
  // Comprobar si hay elementos de cronograma disponibles
  if (!loan.scheduleItems || loan.scheduleItems.length === 0) {
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

  // Castear items para acceder a campos extendidos
  const scheduleItems = loan.scheduleItems as EnrichedScheduleItem[];

  // Usar summary del backend si está disponible, sino calcular localmente
  const hasBackendSummary = !!loan.summary?.balance;

  // Calcular estadísticas del schedule
  const paidCount = scheduleItems.filter((item) => item.status === 'paid').length;
  const overdueCount = scheduleItems.filter((item) => item.status === 'overdue').length;
  const currentItem = scheduleItems.find((item) => item.status === 'current');
  const nextPendingItem = scheduleItems.find((item) => item.status === 'pending');

  // El próximo pago es el item current, o el primer overdue, o el primer pending
  const nextDueItem = currentItem
    || scheduleItems.find((item) => item.status === 'overdue')
    || nextPendingItem;

  // Balance: usar el del backend si está disponible
  const remainingBalance = hasBackendSummary
    ? loan.summary!.balance.totalMinor / 100
    : scheduleItems.reduce((sum, item) => {
        if (item.status === 'paid') return sum;
        return sum + (item.remainingBalance ?? item.total ?? 0);
      }, 0);

  const summary = {
    nextAmount: nextDueItem?.total ?? 0,
    nextDate: nextDueItem?.date ?? 'Sin fecha',
    remaining: remainingBalance,
    totalPayments: scheduleItems.length,
    paidCount,
    overdueCount
  };

  // Badge de status mejorado
  const statusBadge = (item: EnrichedScheduleItem) => {
    switch (item.status) {
      case 'paid':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            Pagado
          </Badge>
        );
      case 'partially_paid':
        return (
          <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">
            <ClockIcon className="h-3 w-3 mr-1" />
            Parcial
          </Badge>
        );
      case 'overdue':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertCircleIcon className="h-3 w-3 mr-1" />
            {item.daysOverdue ? `${item.daysOverdue}d atraso` : 'Vencido'}
          </Badge>
        );
      case 'current':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <CircleDotIcon className="h-3 w-3 mr-1" />
            Actual
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="secondary" className="bg-slate-100 text-slate-800">
            Pendiente
          </Badge>
        );
    }
  };

  // Estilo del item según su status
  const getItemStyle = (item: EnrichedScheduleItem) => {
    switch (item.status) {
      case 'paid':
        return 'border-green-200 bg-green-50/50';
      case 'overdue':
        return 'border-red-300 bg-red-50';
      case 'current':
        return 'border-blue-300 bg-blue-50';
      case 'partially_paid':
        return 'border-amber-300 bg-amber-50/50';
      default:
        return 'border-border bg-muted/30';
    }
  };

  return (
    <PageContainer>
      <ContentContainer className="max-w-2xl">
        <PageHeader title="Tabla de Pagos" onBack={onBack} />

        <div className="mb-4 space-y-2">
          <h2 className="text-lg font-semibold">Préstamo #{loan.id.slice(-4)}</h2>
          <p className="text-sm text-muted-foreground">Monto: {formatCurrency(loan.amount)}</p>
        </div>

        {/* Alerta de mora si aplica */}
        {loan.summary?.overdueInfo?.isOverdue && (
          <Card className="mb-4 border-red-200 bg-red-50">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <AlertCircleIcon className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    {loan.summary.overdueInfo.dpd} días de atraso
                  </p>
                  <p className="text-xs text-red-700">
                    Monto vencido: {formatCurrency(loan.summary.overdueInfo.totalOverdueMinor / 100)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-4">
          <CardContent className="p-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Saldo pendiente</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.remaining)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.paidCount} de {summary.totalPayments} pagos completados
              </p>
            </div>
            {summary.overdueCount > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Pagos vencidos</p>
                <p className="text-2xl font-bold text-red-600">{summary.overdueCount}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base">Calendario</h3>
              <p className="text-xs text-muted-foreground">{summary.totalPayments} pagos</p>
            </div>
            <div className="space-y-2">
              {scheduleItems.map((item) => (
                <div
                  key={item.paymentNumber || `${item.date}-${item.total}`}
                  className={`rounded-lg border px-3 py-2 flex items-center justify-between ${getItemStyle(item)}`}
                >
                  <div>
                    <p className="text-xs text-muted-foreground">Pago {item.paymentNumber || '-'}</p>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{item.date || '-'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{formatCurrency(item.total || 0)}</div>
                    {/* Mostrar monto pagado si es parcial */}
                    {item.status === 'partially_paid' && item.totalPaid && item.totalPaid > 0 && (
                      <p className="text-xs text-amber-700">
                        Pagado: {formatCurrency(item.totalPaid)}
                      </p>
                    )}
                    <div className="mt-1">
                      {statusBadge(item)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4 overflow-hidden">
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">Resumen de pagos</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Monto solicitado</span>
                <span>{formatCurrency(loan.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Interés total</span>
                <span>{formatCurrency(loan.details?.totalInterest || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Comisión</span>
                <span>{formatCurrency(loan.commissionAmount)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Total a pagar</span>
                <span>{formatCurrency(loan.details?.totalAmount || 0)}</span>
              </div>

              {/* Mostrar desglose del balance actual si viene del backend */}
              {hasBackendSummary && (
                <>
                  <Separator className="my-2" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Balance actual</p>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Principal pendiente</span>
                    <span>{formatCurrency(loan.summary!.balance.principalMinor / 100)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Intereses pendientes</span>
                    <span>{formatCurrency(loan.summary!.balance.interestMinor / 100)}</span>
                  </div>
                  {loan.summary!.balance.feesMinor > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Comisiones pendientes</span>
                      <span>{formatCurrency(loan.summary!.balance.feesMinor / 100)}</span>
                    </div>
                  )}
                  {loan.summary!.balance.penaltiesMinor > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span className="text-sm">Mora acumulada</span>
                      <span>{formatCurrency(loan.summary!.balance.penaltiesMinor / 100)}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total adeudado</span>
                    <span>{formatCurrency(loan.summary!.balance.totalMinor / 100)}</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </ContentContainer>
    </PageContainer>
  );
} 
