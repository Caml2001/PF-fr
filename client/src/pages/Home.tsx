import { useState } from "react";
import AuthForm from "../components/AuthForm";
import CreditBureauConsent from "../components/CreditBureauConsent";
import Dashboard from "../components/Dashboard";
import Footer from "../components/Footer";
import OnboardingFlow, { OnboardingData } from "../components/OnboardingFlow";
import CreditApplicationForm from "../components/CreditApplicationForm";

// Definimos los estados de flujo posibles
type FlowState = "auth" | "onboarding" | "consent" | "dashboard" | "apply";

export default function Home() {
  const [flowState, setFlowState] = useState<FlowState>("auth");
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
  };

  // Manejar el logout
  const handleLogout = () => {
    setFlowState("auth");
    setUserData({ username: "", isNewUser: false });
    setOnboardingData(null);
  };

  // Manejar la solicitud de crédito
  const handleApplyCredit = () => {
    setFlowState("apply");
  };
  
  // Renderizar el componente adecuado según el estado del flujo
  const renderContent = () => {
    switch (flowState) {
      case "auth":
        return <AuthForm onLogin={handleLogin} onStartSignup={handleStartSignup} />;
      case "onboarding":
        return <OnboardingFlow onComplete={handleOnboardingComplete} onCancel={handleOnboardingCancel} />;
      case "consent":
        return <CreditBureauConsent onConsent={handleConsent} onCancel={handleLogout} />;
      case "dashboard":
        return <Dashboard 
                username={userData.username} 
                onLogout={handleLogout} 
                onApplyCredit={handleApplyCredit} 
               />;
      case "apply":
        return <CreditApplicationForm onLogout={handleLogout} />;
      default:
        return <AuthForm onLogin={handleLogin} onStartSignup={handleStartSignup} />;
    }
  };

  return (
    <div className="bg-accent min-h-screen py-4 md:py-8 pb-20">
      <div className="mobile-container">
        <main className="mobile-content">
          {renderContent()}
        </main>
        <Footer />
      </div>
    </div>
  );
}
