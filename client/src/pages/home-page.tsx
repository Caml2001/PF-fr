import React, { useState } from "react";
import SimpleNavigation from "@/components/SimpleNavigation";
import { HomeTab, LoansTab, ProfileTab, SettingsTab } from "@/components/TabContent";

type TabState = "home" | "loans" | "profile" | "settings";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabState>("home");
  const [username, setUsername] = useState("Juan");
  
  const handleLogout = () => {
    console.log("Logging out...");
    // Implementar lógica de logout aquí
  };
  
  const handleApplyCredit = () => {
    console.log("Applying for credit...");
    // Implementar lógica para solicitar crédito
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      {/* Contenido principal */}
      <main className="flex-1 max-w-md mx-auto w-full bg-muted/30">
        {activeTab === "home" && (
          <HomeTab 
            username={username} 
            onLogout={handleLogout} 
            onApplyCredit={handleApplyCredit} 
          />
        )}
        {activeTab === "loans" && <LoansTab />}
        {activeTab === "profile" && <ProfileTab />}
        {activeTab === "settings" && <SettingsTab onLogout={handleLogout} />}
      </main>
      
      {/* Navegación */}
      <SimpleNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}