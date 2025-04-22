import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { 
  LogOut, 
  Info, 
  ChevronDown 
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

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
  
  return (
    <div className="animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary">Solicitud de crédito</h2>
          <p className="text-muted-foreground text-sm">Personaliza tu préstamo</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onLogout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
      
      <Card className="mobile-card overflow-hidden">
        <CardContent className="p-6">
          {/* Plazo de pago */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-primary mb-3">Plazo de pago</h3>
            <div className="grid grid-cols-4 gap-2">
              {["7", "14", "21", "30"].map(term => (
                <button
                  key={term}
                  className={`border rounded-lg p-3 text-center transition-all ${
                    paymentTerm === term 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-border"
                  }`}
                  onClick={() => setPaymentTerm(term)}
                >
                  <div className="font-bold">{term} días</div>
                  <div className="text-xs text-muted-foreground">{paymentTermLabels[term]}</div>
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Fecha límite: {deadlineDate}
            </p>
          </div>
          
          {/* Monto del crédito */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-primary mb-3">Monto del crédito</h3>
            <div className="border border-border rounded-lg p-4 mb-3">
              <div className="text-primary text-3xl font-bold">$ {amount.toLocaleString('es-MX')}.00</div>
            </div>
            
            <Slider 
              min={minAmount}
              max={maxAmount}
              step={100}
              value={[amount]}
              onValueChange={(values) => setAmount(values[0])}
              className="my-4"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>${minAmount.toLocaleString('es-MX')}</span>
              <span>${maxAmount.toLocaleString('es-MX')}</span>
            </div>
          </div>
          
          {/* Cuenta de depósito */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-primary mb-3">Cuenta de depósito</h3>
            <Select defaultValue="">
              <SelectTrigger className="w-full border-border h-14">
                <SelectValue placeholder="Selecciona una cuenta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cuenta1">BBVA ****1234</SelectItem>
                <SelectItem value="cuenta2">Santander ****5678</SelectItem>
                <SelectItem value="cuenta3">Banorte ****9101</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Desglose */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm">Comisión (1.5%)</div>
              <div className="font-medium">${commission.toFixed(2)}</div>
            </div>
            
            <div className="border-t border-border pt-3 flex justify-between items-center">
              <div className="font-medium text-lg">Recibirás</div>
              <div className="text-primary text-2xl font-bold">${amountToReceive.toFixed(2)}</div>
            </div>
          </div>
          
          {/* Aviso */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg mb-6">
            <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              El pago debe realizarse antes del {deadlineDate}
            </p>
          </div>
          
          {/* Botón de solicitud */}
          <Button className="w-full mobile-button h-14 text-base">
            Solicitar ${amount.toLocaleString('es-MX')}.00
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}