import { HomeIcon, CreditCardIcon, UserIcon, SettingsIcon } from "lucide-react";

interface FooterProps {
  activeTab: 'home' | 'loans' | 'profile' | 'settings';
  onTabChange: (tab: 'home' | 'loans' | 'profile' | 'settings') => void;
}

export default function Footer({ activeTab, onTabChange }: FooterProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 py-2 px-4 pb-6 safe-bottom">
      <div className="flex justify-between items-center max-w-md mx-auto">
        <NavItem 
          icon={<HomeIcon size={20} />} 
          label="Inicio" 
          active={activeTab === 'home'} 
          onClick={() => onTabChange('home')}
        />
        <NavItem 
          icon={<CreditCardIcon size={20} />} 
          label="Préstamos" 
          active={activeTab === 'loans'} 
          onClick={() => onTabChange('loans')}
        />
        <NavItem 
          icon={<UserIcon size={20} />} 
          label="Perfil" 
          active={activeTab === 'profile'} 
          onClick={() => onTabChange('profile')}
        />
        <NavItem 
          icon={<SettingsIcon size={20} />} 
          label="Ajustes" 
          active={activeTab === 'settings'} 
          onClick={() => onTabChange('settings')}
        />
      </div>
    </footer>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, active = false, onClick }: NavItemProps) {
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
