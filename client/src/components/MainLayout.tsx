import { useState } from "react";
import Footer from "./Footer";
import HomeSection from "@/sections/HomeSection";
import LoansSection from "@/sections/LoansSection";
import ProfileSection from "@/sections/ProfileSection";
import SettingsSection from "@/sections/SettingsSection";

export default function MainLayout() {
  const [activeSection, setActiveSection] = useState("inicio");

  const renderSection = () => {
    switch (activeSection) {
      case "inicio":
        return <HomeSection />;
      case "prestamos":
        return <LoansSection />;
      case "perfil":
        return <ProfileSection />;
      case "ajustes":
        return <SettingsSection />;
      default:
        return <HomeSection />;
    }
  };

  return (
    <div className="min-h-screen bg-accent pb-16">
      <div className="max-w-md mx-auto">
        {renderSection()}
        <Footer activeSection={activeSection} onNavigate={setActiveSection} />
      </div>
    </div>
  );
} 