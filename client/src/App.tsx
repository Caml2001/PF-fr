import React, { useState, useEffect } from "react";
import HomeSection from "./sections/HomeSection";
import LoansSection from "./sections/LoansSection";
import ProfileSection from "./sections/ProfileSection";
import SettingsSection from "./sections/SettingsSection";
import AuthForm from "./components/AuthForm";
import OnboardingFlow from "./components/OnboardingFlow";
import { HomeIcon, DollarSignIcon, UserIcon, SettingsIcon } from "lucide-react";
import { ContentContainer, PageContainer } from "./components/Layout";
import { useIsPWA } from "./hooks/useIsPWA";

type Section = "inicio" | "prestamos" | "perfil" | "ajustes";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [currentSection, setCurrentSection] = useState<Section>("inicio");
  const isPWA = useIsPWA();

  useEffect(() => {
    // Check if there's a logged-in user in localStorage
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Función para manejar el login
  const handleLogin = (username: string) => {
    console.log("Iniciando sesión con:", username);
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  // Función para manejar el inicio del registro
  const handleStartSignup = () => {
    setIsSigningUp(true);
  };

  // Función para manejar la finalización del onboarding
  const handleOnboardingComplete = () => {
    setIsAuthenticated(true);
    setIsSigningUp(false);
    localStorage.setItem('isAuthenticated', 'true');
  };

  // Función para manejar la cancelación del onboarding
  const handleOnboardingCancel = () => {
    setIsSigningUp(false);
  };

  // Si el usuario no está autenticado y no está en proceso de registro, mostrar el formulario de auth
  if (!isAuthenticated && !isSigningUp) {
    return (
      <PageContainer>
        <ContentContainer>
          <AuthForm 
            onLogin={handleLogin} 
            onStartSignup={handleStartSignup}
          />
        </ContentContainer>
      </PageContainer>
    );
  }

  // Si el usuario está en proceso de registro, mostrar el flujo de onboarding
  if (!isAuthenticated && isSigningUp) {
    return (
      <PageContainer>
        <ContentContainer>
          <OnboardingFlow 
            onComplete={handleOnboardingComplete} 
            onCancel={handleOnboardingCancel} 
          />
        </ContentContainer>
      </PageContainer>
    );
  }

  // Renderizar la sección actual
  const renderCurrentSection = () => {
    switch (currentSection) {
      case "inicio":
        return <HomeSection setSection={setCurrentSection} />;
      case "prestamos":
        return <LoansSection />;
      case "perfil":
        return <ProfileSection />;
      case "ajustes":
        return <SettingsSection />;
      default:
        return <HomeSection setSection={setCurrentSection} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pb-16">
        {renderCurrentSection()}
      </main>
      {/* Menú inferior solo en PWA */}
      {isPWA && (
        <nav className="fixed bottom-0 left-0 right-0 bg-background border-t pb-[10px]">
          <ContentContainer>
            <div className="flex justify-around py-2">
              <NavButton
                icon={<HomeIcon className="h-5 w-5" />}
                label="Inicio"
                isActive={currentSection === "inicio"}
                onClick={() => setCurrentSection("inicio")}
              />
              <NavButton
                icon={<DollarSignIcon className="h-5 w-5" />}
                label="Préstamos"
                isActive={currentSection === "prestamos"}
                onClick={() => setCurrentSection("prestamos")}
              />
              <NavButton
                icon={<UserIcon className="h-5 w-5" />}
                label="Perfil"
                isActive={currentSection === "perfil"}
                onClick={() => setCurrentSection("perfil")}
              />
              <NavButton
                icon={<SettingsIcon className="h-5 w-5" />}
                label="Ajustes"
                isActive={currentSection === "ajustes"}
                onClick={() => setCurrentSection("ajustes")}
              />
            </div>
          </ContentContainer>
        </nav>
      )}
      {/* Sheet lateral tipo bottom sheet con Silk ahora se controla desde HomeSection */}
      {/* Ya no es necesario aquí */}
    </div>
  );
}

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function NavButton({ icon, label, isActive, onClick }: NavButtonProps) {
  return (
    <button
      className={`flex flex-col items-center justify-center px-4 py-1 rounded-md transition-colors ${
        isActive ? 'text-primary' : 'text-muted-foreground'
      }`}
      onClick={onClick}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
}
