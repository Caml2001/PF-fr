import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronRight, AlertCircle, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogPortal, DialogOverlay } from "@/components/ui/dialog";

type LoanStatus = "active" | "paid" | "late";

interface Loan {
  id: string;
  amount: number;
  dueDate: string;
  createdDate: string;
  paymentsLeft: number;
  totalPayments: number;
  status: LoanStatus;
  nextPaymentAmount: number;
}

const mockLoans: Loan[] = [
  {
    id: "1",
    amount: 5000,
    dueDate: "2025-05-15",
    createdDate: "2025-04-15",
    paymentsLeft: 1,
    totalPayments: 1,
    status: "active",
    nextPaymentAmount: 5075
  },
  {
    id: "2",
    amount: 3000,
    dueDate: "2025-04-05",
    createdDate: "2025-03-22",
    paymentsLeft: 0,
    totalPayments: 1,
    status: "paid",
    nextPaymentAmount: 0
  },
  {
    id: "3",
    amount: 2000,
    dueDate: "2025-03-30",
    createdDate: "2025-03-16",
    paymentsLeft: 1,
    totalPayments: 1,
    status: "late",
    nextPaymentAmount: 2060
  }
];

export default function LoansView() {
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const handleLoanClick = (loan: Loan) => {
    setSelectedLoan(loan);
  };

  const closeDetails = () => {
    setSelectedLoan(null);
  };

  const handleEarlyPayment = () => {
    setShowPaymentDialog(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-MX', options);
  };

  const getStatusBadge = (status: LoanStatus) => {
    switch (status) {
      case "active":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Activo</Badge>;
      case "paid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Pagado</Badge>;
      case "late":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Atrasado</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold">Mis Préstamos</div>
      
      {mockLoans.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No tienes préstamos activos en este momento.
        </div>
      ) : (
        <div className="space-y-4">
          {mockLoans.map((loan) => (
            <Card key={loan.id} className="mobile-card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleLoanClick(loan)}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{formatCurrency(loan.amount)}</CardTitle>
                  {getStatusBadge(loan.status)}
                </div>
                <CardDescription className="flex items-center mt-1">
                  <CalendarIcon size={14} className="mr-1" />
                  {formatDate(loan.dueDate)}
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-2 flex justify-between items-center">
                <div className="text-sm">
                  {loan.status === "paid" 
                    ? "Préstamo completado"
                    : `${loan.paymentsLeft} pago${loan.paymentsLeft !== 1 ? 's' : ''} pendiente${loan.paymentsLeft !== 1 ? 's' : ''}`
                  }
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {selectedLoan && (
        <Dialog open={!!selectedLoan} onOpenChange={closeDetails}>
          <DialogContent className="max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center justify-between">
                <span>Detalles del Préstamo</span>
                {getStatusBadge(selectedLoan.status)}
              </DialogTitle>
              <DialogDescription>
                Solicitado el {formatDate(selectedLoan.createdDate)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monto solicitado:</span>
                <span className="font-medium">{formatCurrency(selectedLoan.amount)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha de vencimiento:</span>
                <span className="font-medium">{formatDate(selectedLoan.dueDate)}</span>
              </div>
              
              {selectedLoan.status !== "paid" && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monto a pagar:</span>
                  <span className="font-bold">{formatCurrency(selectedLoan.nextPaymentAmount)}</span>
                </div>
              )}

              {selectedLoan.status === "late" && (
                <div className="bg-red-50 p-3 rounded-md flex items-start mt-2">
                  <AlertCircle size={16} className="text-red-500 mr-2 mt-0.5" />
                  <div className="text-sm text-red-700">
                    Tu pago está atrasado. Realiza el pago lo antes posible para evitar cargos adicionales.
                  </div>
                </div>
              )}
              
              {selectedLoan.status === "paid" && (
                <div className="bg-green-50 p-3 rounded-md flex items-start mt-2">
                  <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5" />
                  <div className="text-sm text-green-700">
                    ¡Préstamo completamente pagado! Gracias por tu puntualidad.
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter className="flex-col sm:flex-col gap-2">
              {selectedLoan.status === "active" && (
                <>
                  <Button className="w-full" onClick={handleEarlyPayment}>
                    Pagar Ahora
                  </Button>
                  <Button variant="outline" className="w-full" onClick={closeDetails}>
                    Cerrar
                  </Button>
                </>
              )}
              
              {selectedLoan.status === "late" && (
                <>
                  <Button className="w-full bg-red-600 hover:bg-red-700" onClick={handleEarlyPayment}>
                    Pagar Inmediatamente
                  </Button>
                  <Button variant="outline" className="w-full" onClick={closeDetails}>
                    Cerrar
                  </Button>
                </>
              )}
              
              {selectedLoan.status === "paid" && (
                <Button variant="outline" className="w-full" onClick={closeDetails}>
                  Cerrar
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Confirmar Pago</DialogTitle>
            <DialogDescription>
              Estás a punto de realizar el pago de tu préstamo
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex justify-between font-medium">
              <span>Monto a pagar:</span>
              <span>{selectedLoan ? formatCurrency(selectedLoan.nextPaymentAmount) : ""}</span>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700">
              El monto será cargado a tu método de pago predeterminado.
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button className="w-full" onClick={() => setShowPaymentDialog(false)}>
              Confirmar Pago
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setShowPaymentDialog(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}