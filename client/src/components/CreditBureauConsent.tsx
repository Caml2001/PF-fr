import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ShieldCheckIcon } from "lucide-react";

interface CreditBureauConsentProps {
  onConsent: () => void;
  onCancel: () => void;
}

export default function CreditBureauConsent({ onConsent, onCancel }: CreditBureauConsentProps) {
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isChecked) {
      setError("Debes autorizar la consulta para continuar");
      return;
    }
    
    onConsent();
  };

  return (
    <Card className="animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
      <CardContent className="pt-6">
        <div className="flex items-center mb-6">
          <ShieldCheckIcon className="h-8 w-8 text-primary mr-2" />
          <h2 className="text-xl font-semibold">Autorización de Buró de Crédito</h2>
        </div>
        
        <div className="bg-muted/30 p-4 rounded-lg mb-6">
          <p className="text-sm mb-4">
            Para continuar con tu solicitud, necesitamos consultar tu historial crediticio en Buró de Crédito.
            Esto nos permitirá ofrecerte el monto preaprobado más adecuado según tu perfil.
          </p>
          
          <p className="text-sm mb-4">
            Esta consulta no afectará tu calificación crediticia y es completamente segura.
          </p>
          
          <div className="text-sm italic border-l-2 border-primary/50 pl-3 py-1">
            De acuerdo con la Ley para Regular las Sociedades de Información Crediticia, autorizas
            a MicroPréstamos a realizar una consulta de tu historial crediticio.
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="flex items-start space-x-2 mb-4">
            <Checkbox 
              id="consent" 
              checked={isChecked} 
              onCheckedChange={(checked) => {
                setIsChecked(checked as boolean);
                setError("");
              }} 
              className="mt-1"
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="consent"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Autorizo a MicroPréstamos a consultar mi historial crediticio
              </Label>
              {error && <p className="text-destructive text-sm">{error}</p>}
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onCancel}
              type="button"
            >
              Cancelar
            </Button>
            
            <Button 
              type="submit" 
              className="flex-1"
            >
              Continuar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}