import React, { useState, useEffect } from "react";
import HomeSection from "./sections/HomeSection";
import LoansSection from "./sections/LoansSection";
import ProfileSection from "./sections/ProfileSection";
import SettingsSection from "./sections/SettingsSection";
import AuthForm from "./components/AuthForm";
import OnboardingFlow from "./components/OnboardingFlow";
import { HomeIcon, DollarSignIcon, UserIcon, SettingsIcon } from "lucide-react";
import { ContentContainer, PageContainer } from "./components/Layout";

type Section = "home" | "loans" | "profile" | "settings";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [currentSection, setCurrentSection] = useState<Section>("home");
  
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
      case "home":
        return <HomeSection />;
      case "loans":
        return <LoansSection />;
      case "profile":
        return <ProfileSection />;
      case "settings":
        return <SettingsSection />;
      default:
        return <HomeSection />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pb-16">
        {renderCurrentSection()}
      </main>
      
      {/* Navegación fija en la parte inferior */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
        <ContentContainer>
          <div className="flex justify-around py-2">
            <NavButton
              icon={<HomeIcon className="h-5 w-5" />}
              label="Inicio"
              isActive={currentSection === "home"}
              onClick={() => setCurrentSection("home")}
            />
            <NavButton
              icon={<DollarSignIcon className="h-5 w-5" />}
              label="Préstamos"
              isActive={currentSection === "loans"}
              onClick={() => setCurrentSection("loans")}
            />
            <NavButton
              icon={<UserIcon className="h-5 w-5" />}
              label="Perfil"
              isActive={currentSection === "profile"}
              onClick={() => setCurrentSection("profile")}
            />
            <NavButton
              icon={<SettingsIcon className="h-5 w-5" />}
              label="Ajustes"
              isActive={currentSection === "settings"}
              onClick={() => setCurrentSection("settings")}
            />
          </div>
        </ContentContainer>
      </nav>
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
