import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, Camera, Upload, FileText } from "lucide-react";

interface OnboardingFlowProps {
  onComplete: (userData: OnboardingData) => void;
  onCancel: () => void;
}

export interface OnboardingData {
  fullName: string;
  curp: string;
  address: string;
  ineDocument?: File;
  addressDocument?: File;
}

type StepKey = "name" | "ine" | "curp" | "address" | "address-document" | "review";

interface StepConfig {
  title: string;
  subtitle: string;
}

export default function OnboardingFlow({ onComplete, onCancel }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<StepKey>("name");
  const [userData, setUserData] = useState<OnboardingData>({
    fullName: "",
    curp: "",
    address: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Configuración de los pasos
  const steps: Record<StepKey, StepConfig> = {
    "name": {
      title: "¿Cómo te llamas?",
      subtitle: "Introduce tu nombre completo"
    },
    "ine": {
      title: "Identificación oficial",
      subtitle: "Sube una foto de tu INE por ambos lados"
    },
    "curp": {
      title: "Datos de identidad",
      subtitle: "Introduce tu CURP"
    },
    "address": {
      title: "¿Dónde vives?",
      subtitle: "Introduce tu dirección completa"
    },
    "address-document": {
      title: "Comprobante de domicilio",
      subtitle: "Sube un comprobante reciente (no mayor a 3 meses)"
    },
    "review": {
      title: "Revisa tus datos",
      subtitle: "Confirma que toda la información sea correcta"
    }
  };

  // Orden de los pasos
  const stepOrder: StepKey[] = ["name", "ine", "curp", "address", "address-document", "review"];
  
  // Índice del paso actual
  const currentStepIndex = stepOrder.indexOf(currentStep);
  
  // Manejar cambio de campos
  const handleChange = (field: keyof OnboardingData, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  // Manejar cambio de documentos
  const handleFileChange = (field: "ineDocument" | "addressDocument", file: File | undefined) => {
    setUserData(prev => ({ ...prev, [field]: file }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  // Validar el paso actual
  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (currentStep) {
      case "name":
        if (!userData.fullName.trim()) {
          newErrors.fullName = "Por favor, introduce tu nombre completo";
        }
        break;
      case "ine":
        if (!userData.ineDocument) {
          newErrors.ineDocument = "Por favor, sube una foto de tu INE";
        }
        break;
      case "curp":
        if (!userData.curp.trim()) {
          newErrors.curp = "Por favor, introduce tu CURP";
        } else if (!/^[A-Z]{4}\d{6}[A-Z]{6}\d{2}$/.test(userData.curp)) {
          newErrors.curp = "El formato de CURP no es válido";
        }
        break;
      case "address":
        if (!userData.address.trim()) {
          newErrors.address = "Por favor, introduce tu dirección completa";
        }
        break;
      case "address-document":
        if (!userData.addressDocument) {
          newErrors.addressDocument = "Por favor, sube un comprobante de domicilio";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navegar al siguiente paso
  const goToNextStep = () => {
    if (validateCurrentStep()) {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < stepOrder.length) {
        setCurrentStep(stepOrder[nextIndex]);
      } else {
        // Si hemos completado todos los pasos
        onComplete(userData);
      }
    }
  };

  // Navegar al paso anterior
  const goToPreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(stepOrder[prevIndex]);
    } else {
      onCancel();
    }
  };

  // Renderizar el contenido según el paso actual
  const renderStepContent = () => {
    switch (currentStep) {
      case "name":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">
                Nombre completo
              </Label>
              <Input
                id="fullName"
                placeholder="Ej. Juan Pérez García"
                value={userData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                className={`mobile-input ${errors.fullName ? "border-destructive" : ""}`}
              />
              {errors.fullName && <p className="text-destructive text-sm">{errors.fullName}</p>}
            </div>
          </div>
        );
      
      case "ine":
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-primary/20 rounded-xl p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="bg-primary/10 rounded-full p-3">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
              </div>
              
              <p className="text-sm mb-3">
                Sube una foto clara de tu INE por ambos lados
              </p>
              
              <Button 
                variant="outline" 
                className="mobile-button border-primary/40 text-primary mb-2"
                type="button"
                onClick={() => {
                  // Simular selección de archivo para demo
                  const mockFile = new File([""], "ine-frente.jpg", { type: "image/jpeg" });
                  handleFileChange("ineDocument", mockFile);
                }}
              >
                <Camera className="h-4 w-4 mr-2" /> Tomar foto
              </Button>
              <p className="text-xs text-muted-foreground">O</p>
              <input
                type="file"
                id="ineFile"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  handleFileChange("ineDocument", file);
                }}
              />
              <Button 
                variant="link" 
                type="button"
                onClick={() => document.getElementById('ineFile')?.click()}
                className="h-auto text-xs"
              >
                Seleccionar archivo
              </Button>
              
              {userData.ineDocument && (
                <div className="mt-2 bg-accent rounded-lg p-2 flex items-center">
                  <CheckIcon className="h-4 w-4 text-primary mr-2" />
                  <span className="text-sm truncate">{userData.ineDocument.name || "ID-documento.jpg"}</span>
                </div>
              )}
              
              {errors.ineDocument && <p className="text-destructive text-sm mt-2">{errors.ineDocument}</p>}
            </div>
          </div>
        );
      
      case "curp":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="curp" className="text-sm font-medium">
                CURP
              </Label>
              <Input
                id="curp"
                placeholder="Ej. MELM800101HDFNNS09"
                value={userData.curp}
                onChange={(e) => handleChange("curp", e.target.value.toUpperCase())}
                className={`mobile-input ${errors.curp ? "border-destructive" : ""}`}
              />
              <p className="text-xs text-muted-foreground">
                La Clave Única de Registro de Población consta de 18 caracteres
              </p>
              {errors.curp && <p className="text-destructive text-sm">{errors.curp}</p>}
            </div>
          </div>
        );
      
      case "address":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">
                Dirección completa
              </Label>
              <Input
                id="address"
                placeholder="Calle, número, colonia"
                value={userData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className={`mobile-input ${errors.address ? "border-destructive" : ""}`}
              />
              {errors.address && <p className="text-destructive text-sm">{errors.address}</p>}
            </div>
          </div>
        );
      
      case "address-document":
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-primary/20 rounded-xl p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="bg-primary/10 rounded-full p-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>
              
              <p className="text-sm mb-3">
                Sube un comprobante de domicilio reciente (luz, agua, teléfono)
              </p>
              
              <Button 
                variant="outline" 
                className="mobile-button border-primary/40 text-primary mb-2"
                type="button"
                onClick={() => {
                  // Simular selección de archivo para demo
                  const mockFile = new File([""], "comprobante-luz.pdf", { type: "application/pdf" });
                  handleFileChange("addressDocument", mockFile);
                }}
              >
                <Camera className="h-4 w-4 mr-2" /> Tomar foto
              </Button>
              
              <p className="text-xs text-muted-foreground">O</p>
              
              <input
                type="file"
                id="addressFile"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  handleFileChange("addressDocument", file);
                }}
              />
              <Button 
                variant="link" 
                type="button"
                onClick={() => document.getElementById('addressFile')?.click()}
                className="h-auto text-xs"
              >
                Seleccionar archivo
              </Button>
              
              {userData.addressDocument && (
                <div className="mt-2 bg-accent rounded-lg p-2 flex items-center">
                  <CheckIcon className="h-4 w-4 text-primary mr-2" />
                  <span className="text-sm truncate">{userData.addressDocument.name || "comprobante.pdf"}</span>
                </div>
              )}
              
              {errors.addressDocument && <p className="text-destructive text-sm mt-2">{errors.addressDocument}</p>}
            </div>
          </div>
        );
      
      case "review":
        return (
          <div className="space-y-4">
            <div className="bg-accent rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Nombre completo</p>
                <p className="font-medium">{userData.fullName}</p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground">CURP</p>
                <p className="font-medium">{userData.curp}</p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground">Dirección</p>
                <p className="font-medium">{userData.address}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <p className="text-xs text-muted-foreground">INE:</p>
                <div className="bg-primary/10 py-1 px-2 rounded-full flex items-center">
                  <CheckIcon className="h-3 w-3 text-primary mr-1" />
                  <span className="text-xs">Verificado</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <p className="text-xs text-muted-foreground">Comprobante de domicilio:</p>
                <div className="bg-primary/10 py-1 px-2 rounded-full flex items-center">
                  <CheckIcon className="h-3 w-3 text-primary mr-1" />
                  <span className="text-xs">Verificado</span>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  // Calcular el progreso actual
  const progress = ((currentStepIndex + 1) / stepOrder.length) * 100;

  return (
    <div className="animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-700 text-transparent bg-clip-text inline-block">
          {steps[currentStep].title}
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {steps[currentStep].subtitle}
        </p>
      </div>
      
      {/* Indicador de progreso */}
      <div className="w-full h-1.5 bg-muted rounded-full mb-6">
        <div 
          className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <Card className="mobile-card overflow-hidden">
        <CardContent className="p-6">
          {renderStepContent()}
          
          <div className="flex gap-3 mt-8">
            <Button 
              variant="outline" 
              className="flex-1 mobile-button h-12"
              onClick={goToPreviousStep}
              type="button"
            >
              {currentStepIndex === 0 ? "Cancelar" : (
                <>
                  <ArrowLeftIcon className="h-4 w-4 mr-2" /> Anterior
                </>
              )}
            </Button>
            
            <Button 
              className="flex-1 mobile-button h-12"
              onClick={goToNextStep}
              type="button"
            >
              {currentStep === "review" ? "Completar" : (
                <>
                  Siguiente <ArrowRightIcon className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}