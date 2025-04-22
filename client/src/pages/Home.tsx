import { useState } from "react";
import AuthForm from "../components/AuthForm";
import CreditBureauConsent from "../components/CreditBureauConsent";
import Dashboard from "../components/Dashboard";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Definimos los estados de flujo posibles
type FlowState = "auth" | "consent" | "dashboard";

export default function Home() {
  const [flowState, setFlowState] = useState<FlowState>("auth");
  const [userData, setUserData] = useState({
    username: "",
    isNewUser: false
  });

  // Manejar la autenticación (login o registro)
  const handleAuth = (username: string, isNewUser: boolean) => {
    setUserData({ username, isNewUser });
    setFlowState("consent");
  };

  // Manejar el consentimiento de buró de crédito
  const handleConsent = () => {
    setFlowState("dashboard");
  };

  // Manejar el logout
  const handleLogout = () => {
    setFlowState("auth");
    setUserData({ username: "", isNewUser: false });
  };

  // Renderizar el componente adecuado según el estado del flujo
  const renderContent = () => {
    switch (flowState) {
      case "auth":
        return <AuthForm onAuth={handleAuth} />;
      case "consent":
        return <CreditBureauConsent onConsent={handleConsent} onCancel={handleLogout} />;
      case "dashboard":
        return <Dashboard username={userData.username} onLogout={handleLogout} />;
      default:
        return <AuthForm onAuth={handleAuth} />;
    }
  };

  return (
    <div className="bg-accent min-h-screen py-4 md:py-8">
      <div className="mobile-container">
        <div className="mobile-header">
          <Header />
        </div>
        
        <main className="mobile-content">
          {renderContent()}
        </main>
        
        <div className="px-4 py-3 bg-white mt-auto border-t border-border/30">
          <Footer />
        </div>
      </div>
    </div>
  );
}
