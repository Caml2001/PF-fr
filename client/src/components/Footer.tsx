import { HomeIcon, CreditCardIcon, UserIcon, SettingsIcon } from "lucide-react";
import React from "react";

interface FooterProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

export default function Footer({ activeSection, onNavigate }: FooterProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 py-2 px-4">
      <div className="flex justify-between items-center max-w-md mx-auto">
        <SimpleNavItem 
          label="Inicio" 
          active={activeSection === "inicio"} 
          onClick={() => onNavigate("inicio")} 
        />
        <SimpleNavItem 
          label="Préstamos" 
          active={activeSection === "prestamos"} 
          onClick={() => onNavigate("prestamos")} 
        />
        <SimpleNavItem 
          label="Perfil" 
          active={activeSection === "perfil"} 
          onClick={() => onNavigate("perfil")} 
        />
        <SimpleNavItem 
          label="Ajustes" 
          active={activeSection === "ajustes"} 
          onClick={() => onNavigate("ajustes")} 
        />
      </div>
    </div>
  );
}

interface SimpleNavItemProps {
  label: string; 
  active?: boolean;
  onClick?: () => void;
}

function SimpleNavItem({ label, active = false, onClick }: SimpleNavItemProps) {
  return (
    <div className="flex flex-col items-center cursor-pointer" onClick={onClick}>
      <div className={`p-2 ${active ? 'text-primary' : 'text-muted-foreground'}`}>
        {label === "Inicio" && <HomeIcon size={20} />}
        {label === "Préstamos" && <CreditCardIcon size={20} />}
        {label === "Perfil" && <UserIcon size={20} />}
        {label === "Ajustes" && <SettingsIcon size={20} />}
      </div>
      <span className={`text-xs ${active ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </div>
  );
}
