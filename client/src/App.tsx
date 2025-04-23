import React, { useState } from "react";
import HomeSection from "./sections/HomeSection";
import LoansSection from "./sections/LoansSection";
import ProfileSection from "./sections/ProfileSection";
import SettingsSection from "./sections/SettingsSection";
import { HomeIcon, DollarSignIcon, UserIcon, SettingsIcon } from "lucide-react";
import { ContentContainer } from "./components/Layout";

type Section = "home" | "loans" | "profile" | "settings";

export default function App() {
  const [currentSection, setCurrentSection] = useState<Section>("home");
  
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
