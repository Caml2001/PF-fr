import { HomeIcon, CreditCardIcon, UserIcon, SettingsIcon } from "lucide-react";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 py-2 px-4 pb-6 safe-bottom">
      <div className="flex justify-between items-center max-w-md mx-auto">
        <NavItem icon={<HomeIcon size={20} />} label="Inicio" active />
        <NavItem icon={<CreditCardIcon size={20} />} label="Préstamos" />
        <NavItem icon={<UserIcon size={20} />} label="Perfil" />
        <NavItem icon={<SettingsIcon size={20} />} label="Ajustes" />
      </div>
    </footer>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function NavItem({ icon, label, active = false }: NavItemProps) {
  return (
    <div className="flex flex-col items-center">
      <div className={`p-2 ${active ? 'text-primary' : 'text-muted-foreground'}`}>
        {icon}
      </div>
      <span className={`text-xs ${active ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </div>
  );
}
