import { useState } from "react";
import AuthForm from "../components/AuthForm";
import CreditBureauConsent from "../components/CreditBureauConsent";
import OnboardingFlow, { OnboardingData } from "../components/OnboardingFlow";
import CreditApplicationForm from "../components/CreditApplicationForm";
import { 
  SimpleFooter, 
  HomeTabSimple as HomeTab, 
  LoansTabSimple as LoansTab, 
  ProfileTabSimple as ProfileTab, 
  SettingsTabSimple as SettingsTab 
} from "../components/SimpleTabs";

// Definimos los estados de flujo posibles
type FlowState = "auth" | "onboarding" | "consent" | "dashboard" | "apply";
type TabState = "home" | "loans" | "profile" | "settings";

export default function Home() {
  const [flowState, setFlowState] = useState<FlowState>("auth");
  const [activeTab, setActiveTab] = useState<TabState>("home");
  const [userData, setUserData] = useState({
    username: "",
    isNewUser: false
  });
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);

  // Manejar inicio de sesión
  const handleLogin = (username: string) => {
    setUserData({ username, isNewUser: false });
    setFlowState("consent");
  };
  
  // Manejar inicio del proceso de registro
  const handleStartSignup = () => {
    setFlowState("onboarding");
  };
  
  // Manejar completado del onboarding
  const handleOnboardingComplete = (data: OnboardingData) => {
    setOnboardingData(data);
    setUserData({ username: data.fullName, isNewUser: true });
    setFlowState("consent");
  };
  
  // Manejar cancelación del onboarding
  const handleOnboardingCancel = () => {
    setFlowState("auth");
  };

  // Manejar el consentimiento de buró de crédito
  const handleConsent = () => {
    setFlowState("dashboard");
    setActiveTab("home");
  };

  // Manejar el logout
  const handleLogout = () => {
    setFlowState("auth");
    setUserData({ username: "", isNewUser: false });
    setOnboardingData(null);
    setActiveTab("home");
  };

  // Manejar la solicitud de crédito
  const handleApplyCredit = () => {
    setFlowState("apply");
  };
  
  // Manejar cambio de pestañas
  const handleTabChange = (tab: TabState) => {
    // Solo permitimos cambiar pestañas si estamos autenticados
    if (flowState !== "auth" && flowState !== "onboarding" && flowState !== "consent") {
      // Si estamos en "apply", volvemos a "dashboard" primero
      if (flowState === "apply") {
        setFlowState("dashboard");
      }
      
      setActiveTab(tab);
    }
  };
  
  // Renderizar el componente adecuado según el estado del flujo y pestaña activa
  const renderContent = () => {
    // Si no estamos autenticados, mostramos el flujo de auth/onboarding/consent
    if (flowState === "auth") {
      return <AuthForm onLogin={handleLogin} onStartSignup={handleStartSignup} />;
    }
    
    if (flowState === "onboarding") {
      return <OnboardingFlow onComplete={handleOnboardingComplete} onCancel={handleOnboardingCancel} />;
    }
    
    if (flowState === "consent") {
      return <CreditBureauConsent onConsent={handleConsent} onCancel={handleLogout} />;
    }
    
    if (flowState === "apply") {
      return <CreditApplicationForm onLogout={() => {
        setFlowState("dashboard");
        setActiveTab("home");
      }} />;
    }
    
    // Si estamos en el dashboard, mostrar la pestaña correcta
    switch (activeTab) {
      case "home":
        return <HomeTab 
                username={userData.username} 
                onLogout={handleLogout} 
                onApplyCredit={handleApplyCredit} 
               />;
      case "loans":
        return <LoansTab />;
      case "profile":
        return <ProfileTab />;
      case "settings":
        return <SettingsTab onLogout={handleLogout} />;
      default:
        return <HomeTab 
                username={userData.username} 
                onLogout={handleLogout} 
                onApplyCredit={handleApplyCredit} 
               />;
    }
  };

  // Determinar si la pestaña actual está activa (para el footer)
  const getActiveTab = (): TabState => {
    if (flowState === "auth" || flowState === "onboarding" || flowState === "consent" || flowState === "apply") {
      return "home";
    }
    
    return activeTab;
  };

  return (
    <div className="bg-accent min-h-screen py-4 md:py-8">
      <div className="mobile-container">
        <main className="mobile-content pb-24">
          {renderContent()}
        </main>
        <SimpleFooter 
          activeTab={getActiveTab()} 
          onTabChange={handleTabChange} 
        />
      </div>
    </div>
  );
}
