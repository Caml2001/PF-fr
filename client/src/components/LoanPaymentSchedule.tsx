import { useState } from "react";
import { Loan } from "@/lib/api/loanService";
import { formatCurrency } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageContainer, ContentContainer, PageHeader } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
        <ContentContainer>
          <PageHeader title="Tabla de Pagos" onBack={onBack} />
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground">No hay información de pagos disponible</p>
            </CardContent>
          </Card>
        </ContentContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentContainer>
        <PageHeader title="Tabla de Pagos" onBack={onBack} />
        
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Préstamo #{loan.id.slice(-4)}</h2>
          <p className="text-sm text-muted-foreground">Monto: {formatCurrency(loan.amount)}</p>
        </div>
        
        <Card>
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No.</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loan.scheduleItems.map((item) => (
                    <TableRow key={item.paymentNumber || Math.random()}>
                      <TableCell className="font-medium">{item.paymentNumber || '-'}</TableCell>
                      <TableCell>{item.date || '-'}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.total || 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        {loan.details && (
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
            </CardContent>
          </Card>
        )}
      </ContentContainer>
    </PageContainer>
  );
} 