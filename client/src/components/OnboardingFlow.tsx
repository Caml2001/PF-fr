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
  firstName: string;
  middleName: string;
  lastName: string;
  secondLastName: string;
  street: string;
  number: string;
  postalCode: string;
  city: string;
  state: string;
  curp: string;
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
    firstName: "",
    middleName: "",
    lastName: "",
    secondLastName: "",
    street: "",
    number: "",
    postalCode: "",
    city: "",
    state: "",
    curp: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Configuración de los pasos
  const steps: Record<StepKey, StepConfig> = {
    "name": {
      title: "¿Cómo te llamas?",
      subtitle: "Introduce tus nombres y apellidos"
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
        if (!userData.firstName.trim()) {
          newErrors.firstName = "Por favor, introduce tu primer nombre";
        }
        // Segundo nombre puede ser opcional, pero puedes descomentar para hacerlo obligatorio
        // if (!userData.middleName.trim()) {
        //   newErrors.middleName = "Por favor, introduce tu segundo nombre";
        // }
        if (!userData.lastName.trim()) {
          newErrors.lastName = "Por favor, introduce tu apellido paterno";
        }
        if (!userData.secondLastName.trim()) {
          newErrors.secondLastName = "Por favor, introduce tu apellido materno";
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
        }
        break;
      case "address":
        if (!userData.street.trim()) {
          newErrors.street = "Por favor, introduce la calle";
        }
        if (!userData.number.trim()) {
          newErrors.number = "Por favor, introduce el número";
        }
        if (!userData.postalCode.trim()) {
          newErrors.postalCode = "Por favor, introduce el código postal";
        }
        if (!userData.city.trim()) {
          newErrors.city = "Por favor, introduce la ciudad";
        }
        if (!userData.state.trim()) {
          newErrors.state = "Por favor, introduce el estado o provincia";
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
              <Label htmlFor="firstName" className="text-sm font-medium">
                Primer nombre
              </Label>
              <Input
                id="firstName"
                placeholder="Ej. Juan"
                value={userData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                className={`mobile-input ${errors.firstName ? "border-destructive" : ""}`}
              />
              {errors.firstName && <p className="text-destructive text-sm">{errors.firstName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="middleName" className="text-sm font-medium">
                Segundo nombre
              </Label>
              <Input
                id="middleName"
                placeholder="Ej. Pablo"
                value={userData.middleName}
                onChange={(e) => handleChange("middleName", e.target.value)}
                className={`mobile-input ${errors.middleName ? "border-destructive" : ""}`}
              />
              {errors.middleName && <p className="text-destructive text-sm">{errors.middleName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium">
                Apellido paterno
              </Label>
              <Input
                id="lastName"
                placeholder="Ej. Pérez"
                value={userData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                className={`mobile-input ${errors.lastName ? "border-destructive" : ""}`}
              />
              {errors.lastName && <p className="text-destructive text-sm">{errors.lastName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondLastName" className="text-sm font-medium">
                Apellido materno
              </Label>
              <Input
                id="secondLastName"
                placeholder="Ej. García"
                value={userData.secondLastName}
                onChange={(e) => handleChange("secondLastName", e.target.value)}
                className={`mobile-input ${errors.secondLastName ? "border-destructive" : ""}`}
              />
              {errors.secondLastName && <p className="text-destructive text-sm">{errors.secondLastName}</p>}
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
              <Label htmlFor="street" className="text-sm font-medium">Calle</Label>
              <Input
                id="street"
                placeholder="Ej. Av. Reforma"
                value={userData.street}
                onChange={(e) => handleChange("street", e.target.value)}
                className={`mobile-input ${errors.street ? "border-destructive" : ""}`}
              />
              {errors.street && <p className="text-destructive text-sm">{errors.street}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="number" className="text-sm font-medium">Número</Label>
              <Input
                id="number"
                placeholder="Ej. 123"
                value={userData.number}
                onChange={(e) => handleChange("number", e.target.value)}
                className={`mobile-input ${errors.number ? "border-destructive" : ""}`}
              />
              {errors.number && <p className="text-destructive text-sm">{errors.number}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode" className="text-sm font-medium">Código postal</Label>
              <Input
                id="postalCode"
                placeholder="Ej. 12345"
                value={userData.postalCode}
                onChange={(e) => handleChange("postalCode", e.target.value)}
                className={`mobile-input ${errors.postalCode ? "border-destructive" : ""}`}
              />
              {errors.postalCode && <p className="text-destructive text-sm">{errors.postalCode}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium">Ciudad</Label>
              <Input
                id="city"
                placeholder="Ej. Ciudad de México"
                value={userData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                className={`mobile-input ${errors.city ? "border-destructive" : ""}`}
              />
              {errors.city && <p className="text-destructive text-sm">{errors.city}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state" className="text-sm font-medium">Estado/Provincia</Label>
              <Input
                id="state"
                placeholder="Ej. CDMX"
                value={userData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                className={`mobile-input ${errors.state ? "border-destructive" : ""}`}
              />
              {errors.state && <p className="text-destructive text-sm">{errors.state}</p>}
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
                <p className="font-medium">{`${userData.firstName} ${userData.middleName} ${userData.lastName} ${userData.secondLastName}`.replace(/ +/g, " ").trim()}</p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground">CURP</p>
                <p className="font-medium">{userData.curp}</p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground">Dirección</p>
                <p className="font-medium">
                  {`${userData.street} ${userData.number}, CP ${userData.postalCode}, ${userData.city}, ${userData.state}`.replace(/ +/g, " ").trim()}
                </p>
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
        <h2 className="text-xl font-bold text-primary">
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