import React from "react";
import { HomeIcon, CreditCardIcon, UserIcon, SettingsIcon } from "lucide-react";

type Tab = "home" | "loans" | "profile" | "settings";

interface SimpleNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function SimpleNavigation({ activeTab, onTabChange }: SimpleNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 py-2 px-4 pb-6 safe-bottom">
      <div className="flex justify-between items-center max-w-md mx-auto">
        <NavButton 
          icon={<HomeIcon size={20} />} 
          label="Inicio" 
          active={activeTab === 'home'} 
          onClick={() => onTabChange('home')}
        />
        <NavButton 
          icon={<CreditCardIcon size={20} />} 
          label="Préstamos" 
          active={activeTab === 'loans'} 
          onClick={() => onTabChange('loans')}
        />
        <NavButton 
          icon={<UserIcon size={20} />} 
          label="Perfil" 
          active={activeTab === 'profile'} 
          onClick={() => onTabChange('profile')}
        />
        <NavButton 
          icon={<SettingsIcon size={20} />} 
          label="Ajustes" 
          active={activeTab === 'settings'} 
          onClick={() => onTabChange('settings')}
        />
      </div>
    </div>
  );
}

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavButton({ icon, label, active, onClick }: NavButtonProps) {
  return (
    <button 
      className="flex flex-col items-center focus:outline-none"
      onClick={onClick}
    >
      <div className={`p-2 ${active ? 'text-primary' : 'text-muted-foreground'}`}>
        {icon}
      </div>
      <span className={`text-xs ${active ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </button>
  );
}