import React from "react";
import { HomeIcon, CreditCardIcon, UserIcon, SettingsIcon, LogOut } from "lucide-react";

// Componente simple de navegación inferior
export function SimpleFooter({ activeTab, onTabChange }: {
  activeTab: 'home' | 'loans' | 'profile' | 'settings';
  onTabChange: (tab: 'home' | 'loans' | 'profile' | 'settings') => void;
}) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 py-2 px-4 pb-6 safe-bottom">
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
    </footer>
  );
}

// Componente botón de navegación
function NavButton({ icon, label, active, onClick }: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
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

// Componente pestaña inicio
export function HomeTabSimple({ username, onLogout, onApplyCredit }: {
  username: string;
  onLogout: () => void;
  onApplyCredit: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center mt-4">
        <h1 className="text-2xl font-bold">Hola, {username}</h1>
        <p className="text-muted-foreground mt-2">Bienvenido/a a MicroPréstamos</p>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Tienes un préstamo pre-aprobado</h2>
          <p className="text-4xl font-bold text-primary mt-3">$5,000</p>
          <p className="text-sm text-muted-foreground mt-2">Hasta 30 días sin intereses</p>
        </div>
        
        <div className="mt-6">
          <button 
            className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium"
            onClick={onApplyCredit}
          >
            Solicitar préstamo
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente pestaña préstamos
export function LoansTabSimple() {
  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold">Mis Préstamos</div>
      
      <div className="space-y-4">
        {/* Préstamo activo */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-border">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold">$5,000</h3>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              Activo
            </span>
          </div>
          <div className="flex items-center mt-1 text-sm text-muted-foreground">
            <span>Vencimiento: 15 de mayo de 2025</span>
          </div>
          <div className="flex justify-between items-center mt-3">
            <p className="text-sm">1 pago pendiente</p>
          </div>
        </div>
        
        {/* Préstamo pagado */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-border">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold">$3,000</h3>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              Pagado
            </span>
          </div>
          <div className="flex items-center mt-1 text-sm text-muted-foreground">
            <span>Vencimiento: 5 de abril de 2025</span>
          </div>
          <div className="flex justify-between items-center mt-3">
            <p className="text-sm">Préstamo completado</p>
          </div>
        </div>
        
        {/* Préstamo atrasado */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-border">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold">$2,000</h3>
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
              Atrasado
            </span>
          </div>
          <div className="flex items-center mt-1 text-sm text-muted-foreground">
            <span>Vencimiento: 30 de marzo de 2025</span>
          </div>
          <div className="flex justify-between items-center mt-3">
            <p className="text-sm">1 pago pendiente</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente pestaña perfil
export function ProfileTabSimple() {
  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold">Mi Perfil</div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-border">
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white text-lg font-medium">
            JP
          </div>
          <div>
            <h3 className="text-lg font-semibold">Juan Pérez López</h3>
            <div className="flex items-center text-green-600 text-sm font-medium mt-1">
              <span>Verificado</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border">
        <h3 className="text-lg font-semibold p-4 pb-2">Información personal</h3>
        <div className="px-4 pb-4 space-y-4">
          {/* Teléfono */}
          <div className="flex justify-between items-center">
            <div className="text-muted-foreground">
              <span>Teléfono</span>
            </div>
            <div className="font-medium">
              <span>55 1234 5678</span>
            </div>
          </div>
          <hr className="border-border" />

          {/* Email */}
          <div className="flex justify-between items-center">
            <div className="text-muted-foreground">
              <span>Correo electrónico</span>
            </div>
            <div className="font-medium">
              <span>juan.perez@example.com</span>
            </div>
          </div>
          <hr className="border-border" />

          {/* Dirección */}
          <div className="flex justify-between items-center">
            <div className="text-muted-foreground">
              <span>Dirección</span>
            </div>
            <div className="font-medium">
              <span className="text-right max-w-[180px] truncate">Calle Principal #123</span>
            </div>
          </div>
          <hr className="border-border" />

          {/* CURP */}
          <div className="flex justify-between items-center">
            <div className="text-muted-foreground">
              <span>CURP</span>
            </div>
            <div className="font-medium">
              <span>PELJ850512HDFRZN02</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border">
        <h3 className="text-lg font-semibold p-4 pb-2">Métodos de pago</h3>
        <div className="px-4 pb-4">
          <div className="flex justify-between items-center">
            <div className="text-muted-foreground">
              <span>Tarjeta terminación 4567</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente pestaña ajustes
export function SettingsTabSimple({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold">Ajustes</div>

      <div className="bg-white rounded-xl shadow-sm border border-border">
        <h3 className="text-lg font-semibold p-4 pb-2">Notificaciones</h3>
        <div className="px-4 pb-4 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <span>Todas las notificaciones</span>
            </div>
          </div>
          <hr className="border-border" />

          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm pl-4">Recordatorios de pago</span>
            </div>
          </div>
          <hr className="border-border" />

          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm pl-4">Promociones y ofertas</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border">
        <h3 className="text-lg font-semibold p-4 pb-2">Apariencia</h3>
        <div className="px-4 pb-4">
          <div className="flex justify-between items-center">
            <div>
              <span>Modo oscuro</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border">
        <h3 className="text-lg font-semibold p-4 pb-2">Seguridad y Soporte</h3>
        <div className="px-4 pb-4 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <span>Privacidad y seguridad</span>
            </div>
            <div className="text-muted-foreground">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <hr className="border-border" />

          <div className="flex justify-between items-center">
            <div>
              <span>Ayuda y soporte</span>
            </div>
            <div className="text-muted-foreground">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <button 
        className="w-full py-3 bg-muted hover:bg-muted/80 text-destructive font-medium rounded-xl"
        onClick={onLogout}
      >
        <div className="flex justify-center items-center gap-2">
          <LogOut size={18} />
          <span>Cerrar sesión</span>
        </div>
      </button>
    </div>
  );
}