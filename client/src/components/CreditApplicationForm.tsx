import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InfoCircledIcon } from "@radix-ui/react-icons";

interface CreditApplicationFormProps {
  onLogout: () => void;
}

export default function CreditApplicationForm({ onLogout }: CreditApplicationFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    curp: "",
    amount: ""
  });
  
  const [errors, setErrors] = useState({
    fullName: "",
    curp: "",
    amount: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    
    // For CURP, convert to uppercase
    if (id === "curp") {
      setFormData(prev => ({ ...prev, [id]: value.toUpperCase() }));
    } else {
      setFormData(prev => ({ ...prev, [id]: value }));
    }
    
    // Clear error on change
    setErrors(prev => ({ ...prev, [id]: "" }));
  };

  const validateForm = () => {
    const newErrors = {
      fullName: "",
      curp: "",
      amount: ""
    };
    let isValid = true;

    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Este campo es obligatorio";
      isValid = false;
    }

    // Validate CURP (18 characters, letters and numbers)
    if (!formData.curp.trim() || !/^[A-Z0-9]{18}$/.test(formData.curp.trim())) {
      newErrors.curp = "Ingresa un CURP válido (18 caracteres)";
      isValid = false;
    }

    // Validate amount
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 500) {
      newErrors.amount = "El monto debe ser mayor a $500";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Log for backend integration
      console.log('Credit application data:', {
        fullName: formData.fullName,
        curp: formData.curp,
        amount: parseFloat(formData.amount)
      });
      
      // Reset form
      setFormData({
        fullName: "",
        curp: "",
        amount: ""
      });
      
      // Show success message
      alert('¡Solicitud enviada con éxito! Pronto recibirás una respuesta.');
    }
  };

  return (
    <Card className="animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Solicitud de crédito</h2>
          <Button 
            variant="ghost" 
            className="text-sm text-muted-foreground hover:text-primary"
            onClick={onLogout}
          >
            Cerrar sesión
          </Button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="fullName" className="mb-1">
              Nombre completo
            </Label>
            <Input 
              id="fullName" 
              type="text" 
              placeholder="Nombre y apellidos"
              value={formData.fullName}
              onChange={handleChange}
              className={errors.fullName ? "border-destructive" : ""}
            />
            {errors.fullName && <p className="text-destructive text-sm mt-1">{errors.fullName}</p>}
          </div>
          
          <div className="mb-4">
            <Label htmlFor="curp" className="mb-1">
              CURP
            </Label>
            <Input 
              id="curp" 
              type="text" 
              placeholder="ABCD123456HDFXYZ01"
              maxLength={18}
              value={formData.curp}
              onChange={handleChange}
              className={`uppercase ${errors.curp ? "border-destructive" : ""}`}
            />
            {errors.curp && <p className="text-destructive text-sm mt-1">{errors.curp}</p>}
          </div>
          
          <div className="mb-4">
            <Label htmlFor="amount" className="mb-1">
              Monto solicitado (MXN)
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-muted-foreground">$</span>
              </div>
              <Input 
                id="amount" 
                type="number" 
                placeholder="5,000"
                min="500"
                max="50000"
                value={formData.amount}
                onChange={handleChange}
                className={`pl-7 ${errors.amount ? "border-destructive" : ""}`}
              />
            </div>
            {errors.amount && <p className="text-destructive text-sm mt-1">{errors.amount}</p>}
            <div className="text-xs text-muted-foreground mt-1">Préstamos desde $500 hasta $50,000 MXN</div>
          </div>
          
          <div className="py-3 px-4 bg-primary-50 rounded-md mb-4">
            <div className="flex items-start">
              <InfoCircledIcon className="w-5 h-5 text-primary-700 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-primary-800">
                Tu información está segura. Solo usaremos estos datos para procesar tu solicitud de crédito.
              </p>
            </div>
          </div>
          
          <Button type="submit" className="w-full">
            Solicitar crédito
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
