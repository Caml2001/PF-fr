import { HomeIcon, CreditCardIcon, UserIcon, SettingsIcon } from "lucide-react";

export default function Footer() {
  return (
    <footer>
      <div className="flex justify-between items-center">
        <NavItem icon={<HomeIcon size={20} />} label="Inicio" active />
        <NavItem icon={<CreditCardIcon size={20} />} label="Préstamos" />
        <NavItem icon={<UserIcon size={20} />} label="Perfil" />
        <NavItem icon={<SettingsIcon size={20} />} label="Ajustes" />
      </div>
      <div className="mt-3 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} MicroPréstamos. Todos los derechos reservados.</p>
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
