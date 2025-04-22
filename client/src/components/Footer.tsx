import { HomeIcon, CreditCardIcon, UserIcon, SettingsIcon } from "lucide-react";
import React from "react";

export default function Footer() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 py-2 px-4">
      <div className="flex justify-between items-center max-w-md mx-auto">
        <SimpleNavItem label="Inicio" active={true} />
        <SimpleNavItem label="Préstamos" />
        <SimpleNavItem label="Perfil" />
        <SimpleNavItem label="Ajustes" />
      </div>
    </div>
  );
}

function SimpleNavItem({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div className="flex flex-col items-center">
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
