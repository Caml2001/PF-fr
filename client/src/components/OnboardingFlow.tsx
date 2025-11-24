import { useState, ChangeEvent, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, Camera, Upload, Loader2 } from "lucide-react";
import { useRegister } from '../hooks/useRegister';
import { useSubmitPhone } from '../hooks/useSubmitPhone';
import { useVerifyOtp } from '../hooks/useVerifyOtp';
import { useUploadIne } from '../hooks/useUploadIne';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import { useSubmitPersonalData } from '../hooks/useSubmitPersonalData';
import { type SignupData } from '../lib/api/authService';
import { type ProfileUploadResponse, type ProfileData } from '../lib/api/profileService';
import ProfileReview from '../components/ProfileReview';
import CreditBureauConsent from './CreditBureauConsent';
import ProcessingOverlay from "./ProcessingOverlay";
import apiClient from '../lib/api/axios';
import { login } from '../lib/api/authService';
import { fetchOnboardingStatus, completeOnboarding } from '../lib/api/onboardingService';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';

interface OnboardingFlowProps {
  onComplete: () => void;
  onCancel: () => void;
  initialStep?: string;
}

export interface OnboardingData {
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  otp: string;
  firstName: string;
  middleName: string;
  lastName: string;
  motherLastName: string;
  birthDate: string;
  sex: string;
  ineFrontFile?: File;
  ineBackFile?: File;
  curp: string;
  street: string;
  number: string;
  colonia: string;
  municipality: string;
  state: string;
  postalCode: string;
  bureauConsent?: boolean;
}

type StepKey = "account" | "phone" | "otp" | "name" | "ine" | "review" | "bureauConsent" | "done";

// Mapeo entre las rutas URL y las claves de pasos internas
const urlToStepMap: Record<string, StepKey> = {
  "account": "account",
  "phone": "phone",
  "otp": "otp",
  "personal": "name",
  "ine": "ine",
  "review": "review",
  "bureau": "bureauConsent",
  "complete": "done"
};

// Mapeo inverso para convertir claves de pasos a rutas URL
const stepToUrlMap: Record<StepKey, string> = {
  "account": "account",
  "phone": "phone",
  "otp": "otp",
  "name": "personal",
  "ine": "ine",
  "review": "review",
  "bureauConsent": "bureau",
  "done": "complete"
};

interface StepConfig {
  title: string;
  subtitle: string;
}

export default function OnboardingFlow({ onComplete, onCancel, initialStep }: OnboardingFlowProps) {
  const [location, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState<StepKey>("account");
  const [userData, setUserData] = useState<OnboardingData>({
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    otp: "",
    firstName: "",
    middleName: "",
    lastName: "",
    motherLastName: "",
    birthDate: "",
    sex: "",
    ineFrontFile: undefined,
    ineBackFile: undefined,
    curp: "",
    street: "",
    number: "",
    colonia: "",
    municipality: "",
    state: "",
    postalCode: "",
    bureauConsent: undefined,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof OnboardingData, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [reviewProfile, setReviewProfile] = useState<ProfileData | null>(null);

  const queryClient = useQueryClient();

  const registerMutation = useRegister();
  const submitPhoneMutation = useSubmitPhone();
  const verifyOtpMutation = useVerifyOtp();
  const uploadIneMutation = useUploadIne();
  const updateProfileMutation = useUpdateProfile();
  const submitPersonalDataMutation = useSubmitPersonalData();

  const isLoading = 
    registerMutation.isPending ||
    submitPhoneMutation.isPending ||
    verifyOtpMutation.isPending ||
    uploadIneMutation.isPending ||
    updateProfileMutation.isPending ||
    submitPersonalDataMutation.isPending;

  // Estado de carga específico para la llamada a completeOnboarding si se hace directamente
  const [isCompletingOnboarding, setIsCompletingOnboarding] = useState(false);
  
  const isLoadingWithOnboarding = isLoading || isCompletingOnboarding;

  // Inicializar el paso desde la URL
  useEffect(() => {
    if (initialStep && urlToStepMap[initialStep]) {
      setCurrentStep(urlToStepMap[initialStep]);
    }
  }, [initialStep]);

  // Actualizar la URL cuando cambia el paso
  useEffect(() => {
    const urlStep = stepToUrlMap[currentStep];
    navigate(`/register/${urlStep}`, { replace: true });
  }, [currentStep, navigate]);

  const steps: Record<StepKey, StepConfig> = {
    "account": {
      title: "Crea tu cuenta",
      subtitle: "Necesitamos tu correo y una contraseña segura"
    },
    "phone": {
      title: "Número de Teléfono",
      subtitle: "Ingresa tu número para enviarte un código de verificación"
    },
    "otp": {
      title: "Verificación",
      subtitle: "Introduce el código que te enviamos por SMS"
    },
    "name": {
      title: "¿Cómo te llamas?",
      subtitle: "Introduce tus nombres y apellidos completos"
    },
    "ine": {
      title: "Identificación Oficial (INE)",
      subtitle: "Sube una foto clara de tu INE por ambos lados"
    },
    "review": {
      title: "Confirma tus datos",
      subtitle: "Revisa y corrige tus datos antes de continuar"
    },
    "bureauConsent": {
      title: "Autorización buró de crédito",
      subtitle: "Autoriza la consulta a buró de crédito para continuar"
    },
    "done": {
      title: "¡Listo!",
      subtitle: "Tu registro se ha completado exitosamente."
    }
  };

  const stepOrder: StepKey[] = ["account", "phone", "otp", "name", "ine", "review", "bureauConsent", "done"];

  const currentStepIndex = stepOrder.indexOf(currentStep);

  const handleChange = (field: keyof OnboardingData, value: string | boolean) => {
    setUserData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
    setApiError(null);
  };

  const handleFileChange = (field: "ineFrontFile" | "ineBackFile", file: File | undefined) => {
    setUserData(prev => ({ ...prev, [field]: file }));
    setErrors(prev => ({ ...prev, [field]: "" }));
    setApiError(null);
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Partial<Record<keyof OnboardingData, string>> = {};
    let isValid = true;

    switch (currentStep) {
      case "account":
        if (!userData.email.trim() || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(userData.email)) {
          newErrors.email = "Por favor, introduce un correo válido";
          isValid = false;
        }
        if (!userData.password || userData.password.length < 8) { 
          newErrors.password = "La contraseña debe tener al menos 8 caracteres";
          isValid = false;
        }
        if (userData.password !== userData.confirmPassword) {
          newErrors.confirmPassword = "Las contraseñas no coinciden";
          isValid = false;
        }
        break;
      case "phone":
        if (!userData.phoneNumber.trim() || !/^\d{10}$/.test(userData.phoneNumber)) {
          newErrors.phoneNumber = "Por favor, introduce un número de teléfono válido (10 dígitos)";
          isValid = false;
        }
        break;
      case "otp":
        if (!userData.otp.trim() || !/^\d{6}$/.test(userData.otp)) {
          newErrors.otp = "Por favor, introduce el código de 6 dígitos";
          isValid = false;
        }
        break;
      case "name":
        if (!userData.firstName.trim()) { newErrors.firstName = "Introduce tu primer nombre"; isValid = false; }
        if (!userData.middleName.trim()) { newErrors.middleName = "Introduce tu segundo nombre"; isValid = false; }
        if (!userData.lastName.trim()) { newErrors.lastName = "Introduce tu apellido paterno"; isValid = false; }
        if (!userData.motherLastName.trim()) { newErrors.motherLastName = "Introduce tu apellido materno"; isValid = false; }
        if (!userData.birthDate) { newErrors.birthDate = "Selecciona tu fecha de nacimiento"; isValid = false; }
        if (!userData.sex) { newErrors.sex = "Selecciona tu sexo"; isValid = false; }
        break;
      case "ine":
        if (!userData.ineFrontFile) { newErrors.ineFrontFile = "Sube la foto frontal de tu INE"; isValid = false; }
        if (!userData.ineBackFile) { newErrors.ineBackFile = "Sube la foto trasera de tu INE"; isValid = false; }
        break;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleError = (error: any, defaultMessage: string) => {
    console.error(`Error in step ${currentStep}:`, error);
    const message = error?.response?.data?.error || error?.message || defaultMessage;
    setApiError(message);
  };

  const moveToNext = () => {
    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < stepOrder.length) {
      setCurrentStep(stepOrder[nextStepIndex]);
    } else {
      onComplete();
    }
  };

  const goToNextStep = async () => {
    if (!validateCurrentStep()) {
      return;
    }
    setApiError(null);

    try {
      switch (currentStep) {
        case "account":
          try {
            await registerMutation.mutateAsync({ email: userData.email, password: userData.password });
            moveToNext();
          } catch (error: any) {
            // Debug: Log del error completo
            console.log('Error en signup:', {
              status: error?.response?.status,
              data: error?.response?.data,
              message: error?.message
            });
            
            // Si el usuario ya existe, intentar hacer signin
            if (error?.message === "User already registered") {
              try {
                console.log('Usuario ya existe, intentando login automático...');
                const loginResponse = await login({ email: userData.email, password: userData.password });
                
                console.log('Login automático exitoso:', loginResponse);
                
                if (loginResponse.accessToken) {
                  // Verificar el estado de onboarding
                  const statusResponse = await fetchOnboardingStatus();
                  console.log('Estado de onboarding:', statusResponse);
                  
                  if (statusResponse.status === 'PROFILE_COMPLETE_BUREAU_CONSENT_GIVEN' ||
                      statusResponse.status === 'PROFILE_COMPLETE_BUREAU_CONSENT_DENIED' ||
                      statusResponse.status === 'BNPL_READY') {
                    // Usuario ya completó onboarding, ir al dashboard
                    console.log('Onboarding completo, navegando a /home');
                    window.location.href = '/home';
                    return;
                  } else {
                    // Caso especial: INE en revisión va a pantalla dedicada
                    if (statusResponse.status === 'INE_REVIEW') {
                      console.log('INE en revisión, navegando a /account/review');
                      window.location.href = '/account/review';
                      return;
                    }
                    
                    // Usuario necesita completar onboarding, determinar paso
                    const statusToStepMap: Record<string, StepKey> = {
                      'PHONE_PENDING': 'phone',
                      'OTP_PENDING': 'otp',
                      'REGISTERED_BASIC': 'name',
                      'PROFILE_PENDING': 'ine',
                      'INE_PENDING': 'review'
                    };
                    
                    const targetStep = statusToStepMap[statusResponse.status] || 'name';
                    console.log('Navegando al paso:', targetStep, 'basado en estado:', statusResponse.status);
                    setCurrentStep(targetStep);
                  }
                } else {
                  console.log('Login exitoso pero sin accessToken');
                }
              } catch (loginError) {
                // Si el login falla, mostrar error original de signup
                console.log('Error en login automático:', loginError);
                throw error;
              }
            } else {
              // Cualquier otro error de signup
              throw error;
            }
          }
          break;
        case "phone":
          await submitPhoneMutation.mutateAsync(userData.phoneNumber);
          moveToNext();
          break;
        case "otp":
          await verifyOtpMutation.mutateAsync({ otp: userData.otp, phoneNumber: userData.phoneNumber });
          moveToNext();
          break;
        case "name":
          await submitPersonalDataMutation.mutateAsync({
            firstName: userData.firstName,
            middleName: userData.middleName || undefined,
            lastName: userData.lastName,
            motherLastName: userData.motherLastName,
            birthDate: userData.birthDate,
            sex: userData.sex,
          });
          moveToNext();
          break;
        case "ine":
          if (!userData.ineFrontFile || !userData.ineBackFile) {
            setApiError("Ambos lados de la INE son requeridos.");
            return;
          }
          const ineResponse: ProfileUploadResponse = await uploadIneMutation.mutateAsync({ 
            ineFrontFile: userData.ineFrontFile, 
            ineBackFile: userData.ineBackFile 
          });
          
          if (ineResponse && ineResponse.profile) {
            queryClient.setQueryData(['profile'], ineResponse.profile);
            console.log('Perfil actualizado en React Query cache después de subir INE.');
            setReviewProfile(ineResponse.profile);
            console.log('Estado local reviewProfile actualizado.');
          } else {
            console.warn('No se recibió el perfil en la respuesta de la subida de INE.');
          }
          moveToNext();
          break;
        case "review":
          moveToNext();
          break;
        case "bureauConsent":
          if (typeof userData.bureauConsent !== 'boolean') {
            setApiError("Por favor, indica tu decisión sobre la consulta al buró de crédito.");
            return;
          }
          setIsCompletingOnboarding(true);
          try {
            const response = await completeOnboarding(userData.bureauConsent);
            
            // Si la respuesta contiene un token, actualizamos el estado de autenticación
            if (response.token) {
              console.log('Token de acceso final actualizado');
              // El token ya se guarda en completeOnboarding, no necesitamos hacerlo aquí
            }
            
            if (response.statusInfo === 'INE_REVIEW') {
              // INE en revisión, navegar a pantalla dedicada
              window.location.href = '/account/review';
              return;
            } else {
              // Caso normal, navegar al dashboard
              window.location.href = '/home';
              return;
            }
          } catch (error) {
            handleError(error, "Error al procesar tu consentimiento.");
          } finally {
            setIsCompletingOnboarding(false);
          }
          break;
        case "done":
          onComplete();
          break;
        default:
          moveToNext();
          break;
      }
    } catch (error: any) {
      handleError(error, `Error en el paso ${steps[currentStep]?.title || currentStep}.`);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(stepOrder[currentStepIndex - 1]);
    } else {
      onCancel();
    }
  };

  const renderStepContent = () => {
    if (currentStep === "review") {
      return (
        <ProfileReview
          profile={reviewProfile || {}}
          onComplete={() => goToNextStep()}
        />
      );
    }
    if (currentStep === "bureauConsent") {
      return (
        <CreditBureauConsent
          onConsent={(consentValue: boolean) => {
            handleChange("bureauConsent", consentValue);
          }}
          onCancel={() => {
            console.log("onCancel llamado desde CreditBureauConsent");
          }}
        />
      );
    }
    if (currentStep === "done") {
      return (
        <div className="flex flex-col items-center justify-center min-h-[250px] text-center">
          <h3 className="text-2xl font-bold text-primary mb-2">¡Registro completo!</h3>
          <p className="text-muted-foreground mb-6">Gracias por registrarte. Pronto nos pondremos en contacto contigo.</p>
          <CheckIcon className="h-12 w-12 text-green-500 mb-4" />
        </div>
      );
    }
    return (
      <form onSubmit={(e) => { e.preventDefault(); goToNextStep(); }} className="space-y-4" autoComplete="on">
        {apiError && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4 text-center">
            {apiError}
          </div>
        )}

        {(() => {
          switch (currentStep) {
            case "account":
              return (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={userData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="tu@correo.com"
                      className={`${errors.email ? "border-destructive" : ""}`}
                      autoComplete="email"
                    />
                    {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input 
                      id="password" 
                      type="password"
                      value={userData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className={`${errors.password ? "border-destructive" : ""}`}
                      autoComplete="new-password"
                    />
                    {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password"
                      value={userData.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      placeholder="Repite la contraseña"
                      className={`${errors.confirmPassword ? "border-destructive" : ""}`}
                      autoComplete="new-password"
                    />
                    {errors.confirmPassword && <p className="text-destructive text-sm mt-1">{errors.confirmPassword}</p>}
                  </div>
                </>
              );
            case "phone":
              return (
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Número de teléfono</Label>
                  <Input 
                    id="phoneNumber" 
                    type="tel" 
                    value={userData.phoneNumber}
                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                    placeholder="10 dígitos"
                    maxLength={10}
                    className={`${errors.phoneNumber ? "border-destructive" : ""}`}
                    autoComplete="tel"
                  />
                  {errors.phoneNumber && <p className="text-destructive text-sm mt-1">{errors.phoneNumber}</p>}
                </div>
              );
            case "otp":
              return (
                <div className="space-y-2">
                  <Label htmlFor="otp">Código de verificación (SMS)</Label>
                  <Input 
                    id="otp" 
                    type="text" 
                    inputMode="numeric" 
                    pattern="[0-9]*" 
                    value={userData.otp}
                    onChange={(e) => handleChange("otp", e.target.value)}
                    placeholder="6 dígitos"
                    maxLength={6}
                    className={`${errors.otp ? "border-destructive" : ""}`}
                    autoComplete="one-time-code"
                  />
                  {errors.otp && <p className="text-destructive text-sm mt-1">{errors.otp}</p>}
                </div>
              );
            case "name":
              return (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Primer Nombre</Label>
                    <Input 
                      id="firstName" 
                      value={userData.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      placeholder="Ej. Juan"
                      className={errors.firstName ? "border-destructive" : ""}
                      autoComplete="given-name"
                    />
                    {errors.firstName && <p className="text-destructive text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middleName">Segundo Nombre</Label>
                    <Input 
                      id="middleName" 
                      value={userData.middleName}
                      onChange={(e) => handleChange("middleName", e.target.value)}
                      placeholder="Ej. Carlos"
                      className={errors.middleName ? "border-destructive" : ""}
                      autoComplete="additional-name"
                    />
                    {errors.middleName && <p className="text-destructive text-sm mt-1">{errors.middleName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido Paterno</Label>
                    <Input 
                      id="lastName" 
                      value={userData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      placeholder="Ej. Pérez"
                      className={errors.lastName ? "border-destructive" : ""}
                      autoComplete="family-name"
                    />
                    {errors.lastName && <p className="text-destructive text-sm mt-1">{errors.lastName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="motherLastName">Apellido Materno</Label>
                    <Input 
                      id="motherLastName" 
                      value={userData.motherLastName}
                      onChange={(e) => handleChange("motherLastName", e.target.value)}
                      placeholder="Ej. García"
                      className={errors.motherLastName ? "border-destructive" : ""}
                      autoComplete="family-name"
                    />
                    {errors.motherLastName && <p className="text-destructive text-sm mt-1">{errors.motherLastName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Fecha de nacimiento</Label>
                    <Input 
                      id="birthDate" 
                      type="date" 
                      value={userData.birthDate}
                      onChange={(e) => handleChange("birthDate", e.target.value)}
                      className={errors.birthDate ? "border-destructive" : ""}
                      autoComplete="bday"
                    />
                    {errors.birthDate && <p className="text-destructive text-sm mt-1">{errors.birthDate}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sex">Sexo</Label>
                    <select
                      id="sex"
                      value={userData.sex}
                      onChange={(e) => handleChange("sex", e.target.value)}
                      className={`w-full rounded border px-3 py-2 ${errors.sex ? "border-destructive" : "border-input"}`}
                      autoComplete="sex"
                    >
                      <option value="">Selecciona</option>
                      <option value="H">Hombre</option>
                      <option value="M">Mujer</option>
                    </select>
                    {errors.sex && <p className="text-destructive text-sm mt-1">{errors.sex}</p>}
                  </div>
                </>
              );
            case "ine": 
              return (
                <>
                  <div className="border-2 border-dashed border-primary/20 rounded-xl p-4 text-center space-y-2">
                    <Label htmlFor="ineFrontFile" className="text-sm font-medium block">INE (Frente)</Label>
                    <input
                      type="file"
                      id="ineFrontFile"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        handleFileChange("ineFrontFile", file);
                      }}
                    />
                    <Button 
                      variant="outline" 
                      type="button"
                      onClick={() => document.getElementById('ineFrontFile')?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" /> {userData.ineFrontFile ? 'Cambiar Foto' : 'Subir Foto Frontal'}
                    </Button>
                    {userData.ineFrontFile && (
                      <div className="mt-2 bg-accent rounded-lg p-2 flex items-center justify-center text-xs">
                        <CheckIcon className="h-4 w-4 text-primary mr-1 flex-shrink-0" />
                        <span className="truncate">{userData.ineFrontFile.name}</span>
                      </div>
                    )}
                    {errors.ineFrontFile && <p className="text-destructive text-sm mt-1">{errors.ineFrontFile}</p>}
                  </div>

                  <div className="border-2 border-dashed border-primary/20 rounded-xl p-4 text-center space-y-2">
                    <Label htmlFor="ineBackFile" className="text-sm font-medium block">INE (Reverso)</Label>
                    <input
                      type="file"
                      id="ineBackFile"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        handleFileChange("ineBackFile", file);
                      }}
                    />
                    <Button 
                      variant="outline" 
                      type="button"
                      onClick={() => document.getElementById('ineBackFile')?.click()}
                      className="w-full"
                    >
                       <Upload className="h-4 w-4 mr-2" /> {userData.ineBackFile ? 'Cambiar Foto' : 'Subir Foto Trasera'}
                    </Button>
                     {userData.ineBackFile && (
                      <div className="mt-2 bg-accent rounded-lg p-2 flex items-center justify-center text-xs">
                        <CheckIcon className="h-4 w-4 text-primary mr-1 flex-shrink-0" />
                        <span className="truncate">{userData.ineBackFile.name}</span>
                      </div>
                    )}
                    {errors.ineBackFile && <p className="text-destructive text-sm mt-1">{errors.ineBackFile}</p>}
                  </div>
                </>
              );
            default:
              return <div>Paso desconocido</div>;
          }
        })()}
      </form>
    );
  };

  const progress = ((currentStepIndex + 1) / stepOrder.length) * 100;

  return (
    <div className="animate-in fade-in-50 duration-300">
      {uploadIneMutation.isPending && currentStep === "ine" && (
        <ProcessingOverlay message="Estamos procesando tu INE" />
      )}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-primary">
          {steps[currentStep].title}
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {steps[currentStep].subtitle}
        </p>
      </div>
      
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
              disabled={isLoadingWithOnboarding} 
            >
              {isLoadingWithOnboarding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {currentStep === "bureauConsent" 
                ? (isLoadingWithOnboarding ? 'Procesando...' : 'Continuar') 
                : (isLoadingWithOnboarding ? 'Procesando...' : 
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