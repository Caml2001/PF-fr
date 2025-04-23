import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { ShieldCheckIcon, LockIcon, AlertCircleIcon } from "lucide-react";

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
    <div className="animate-in fade-in-50 duration-300">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center bg-primary/10 p-3 rounded-full mb-2">
          <ShieldCheckIcon className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-700 text-transparent bg-clip-text inline-block">
          Autorización
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Consulta a Buró de Crédito
        </p>
      </div>
      
      <Card className="mobile-card">
        <CardContent className="p-5">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
              <AlertCircleIcon className="h-5 w-5 text-primary flex-shrink-0" />
              <p className="text-sm">
                Necesitamos consultar tu historial crediticio para ofrecerte un préstamo personalizado.
              </p>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
              <LockIcon className="h-5 w-5 text-primary flex-shrink-0" />
              <p className="text-sm">
                Esta consulta no afectará tu calificación crediticia y es completamente segura.
              </p>
            </div>
            
            <div className="p-4 border border-border/40 rounded-lg bg-white">
              <p className="text-sm text-muted-foreground">
                De acuerdo con la Ley para Regular las Sociedades de Información Crediticia, autorizas
                a MicroPréstamos a realizar una consulta de tu historial crediticio.
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="mt-6">
            <div className="flex items-start space-x-3 mb-6 bg-accent/50 p-3 rounded-lg">
              <Checkbox 
                id="consent" 
                checked={isChecked} 
                onCheckedChange={(checked) => {
                  setIsChecked(checked as boolean);
                  setError("");
                }} 
                className="mt-0.5"
              />
              <div>
                <Label
                  htmlFor="consent"
                  className="text-sm font-medium leading-tight"
                >
                  Autorizo a MicroPréstamos a consultar mi historial crediticio
                </Label>
                {error && <p className="text-destructive text-sm mt-1">{error}</p>}
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline" 
                className="flex-1 mobile-button h-12"
                onClick={onCancel}
                type="button"
              >
                Cancelar
              </Button>
              
              <Button 
                type="submit" 
                className="flex-1 mobile-button h-12"
              >
                Continuar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}