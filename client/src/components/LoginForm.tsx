import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface LoginFormProps {
  onLogin: (contact: string) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [contact, setContact] = useState("");
  const [error, setError] = useState("");

  const validateContact = (value: string) => {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const isValidPhone = /^\d{10}$/.test(value);
    return isValidEmail || isValidPhone;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedContact = contact.trim();
    
    if (!trimmedContact || !validateContact(trimmedContact)) {
      setError("Por favor ingresa un correo o teléfono válido");
      return;
    }
    
    onLogin(trimmedContact);
  };

  return (
    <Card className="animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-6 text-center">Iniciar sesión</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="contact" className="mb-1">
              Correo electrónico o número telefónico
            </Label>
            <Input 
              id="contact" 
              type="text" 
              placeholder="ejemplo@correo.com o 5555555555"
              value={contact}
              onChange={(e) => {
                setContact(e.target.value);
                setError("");
              }}
              className={error ? "border-destructive" : ""}
            />
            {error && <p className="text-destructive text-sm mt-1">{error}</p>}
          </div>
          
          <Button type="submit" className="w-full mt-4">
            Continuar
          </Button>
          
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>¿Aún no tienes cuenta? <a href="#" className="text-primary hover:underline">Regístrate</a></p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
