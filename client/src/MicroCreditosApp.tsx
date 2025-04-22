import React, { useState } from 'react';
import { HomeIcon, CreditCardIcon, UserIcon, SettingsIcon, LogOutIcon } from "lucide-react";

// Componente de navegación simplificado
function SimpleNavigation({ activeTab, onTabChange }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 py-2 px-4 pb-6">
      <div className="flex justify-between items-center max-w-md mx-auto">
        <button 
          className="flex flex-col items-center"
          onClick={() => onTabChange('home')}
        >
          <div className={`p-2 ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-500'}`}>
            <HomeIcon size={20} />
          </div>
          <span className={`text-xs ${activeTab === 'home' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
            Inicio
          </span>
        </button>
        
        <button 
          className="flex flex-col items-center"
          onClick={() => onTabChange('loans')}
        >
          <div className={`p-2 ${activeTab === 'loans' ? 'text-blue-600' : 'text-gray-500'}`}>
            <CreditCardIcon size={20} />
          </div>
          <span className={`text-xs ${activeTab === 'loans' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
            Préstamos
          </span>
        </button>
        
        <button 
          className="flex flex-col items-center"
          onClick={() => onTabChange('profile')}
        >
          <div className={`p-2 ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-500'}`}>
            <UserIcon size={20} />
          </div>
          <span className={`text-xs ${activeTab === 'profile' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
            Perfil
          </span>
        </button>
        
        <button 
          className="flex flex-col items-center"
          onClick={() => onTabChange('settings')}
        >
          <div className={`p-2 ${activeTab === 'settings' ? 'text-blue-600' : 'text-gray-500'}`}>
            <SettingsIcon size={20} />
          </div>
          <span className={`text-xs ${activeTab === 'settings' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
            Ajustes
          </span>
        </button>
      </div>
    </div>
  );
}

// Sección de préstamos
function LoansTab() {
  const mockLoans = [
    {
      id: "loan1",
      amount: 2500,
      dueDate: "2023-12-15",
      paymentsLeft: 2,
      totalPayments: 4,
      status: "active",
      nextPaymentAmount: 625
    },
    {
      id: "loan2",
      amount: 5000,
      dueDate: "2023-11-30",
      paymentsLeft: 0,
      totalPayments: 4,
      status: "paid",
      nextPaymentAmount: 0
    }
  ];

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold mb-4">Mis Préstamos</h1>
      
      <div className="space-y-4">
        {mockLoans.map(loan => (
          <div 
            key={loan.id} 
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium">${loan.amount.toLocaleString()}</h3>
                <p className="text-xs text-gray-500">
                  Vence: {new Date(loan.dueDate).toLocaleDateString()}
                </p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                loan.status === 'active' ? 'bg-blue-100 text-blue-700' : 
                loan.status === 'paid' ? 'bg-green-100 text-green-700' : 
                'bg-red-100 text-red-700'
              }`}>
                {loan.status === 'active' ? 'Activo' : 
                 loan.status === 'paid' ? 'Pagado' : 'Atrasado'}
              </div>
            </div>
            
            <div className="mt-2">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ 
                    width: `${(loan.totalPayments - loan.paymentsLeft) / loan.totalPayments * 100}%` 
                  }}
                />
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500">
                  Pagos restantes: {loan.paymentsLeft} de {loan.totalPayments}
                </span>
                {loan.status === 'active' && (
                  <span className="text-xs font-medium">
                    Siguiente pago: ${loan.nextPaymentAmount}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Sección de perfil
function ProfileTab() {
  const profile = {
    fullName: "Juan Pérez Rodríguez",
    email: "juan.perez@ejemplo.com",
    phone: "55 1234 5678",
    address: "Calle Reforma 123, Col. Centro, CDMX",
    curp: "PERJ850101HDFXXX01",
    verificationStatus: "verified"
  };

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold mb-4">Mi Perfil</h1>
      
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <span className="text-xl font-bold text-blue-500">
              {profile.fullName.split(' ').map(name => name[0]).join('').substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="font-bold text-lg">{profile.fullName}</h2>
            <div className="text-xs inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-700">
              {profile.verificationStatus === 'verified' ? 'Verificado' : 
               profile.verificationStatus === 'pending' ? 'Pendiente' : 'No verificado'}
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <h3 className="text-xs text-gray-500 mb-1">Correo electrónico</h3>
            <p className="text-sm">{profile.email}</p>
          </div>
          <div>
            <h3 className="text-xs text-gray-500 mb-1">Teléfono</h3>
            <p className="text-sm">{profile.phone}</p>
          </div>
          <div>
            <h3 className="text-xs text-gray-500 mb-1">Dirección</h3>
            <p className="text-sm">{profile.address}</p>
          </div>
          <div>
            <h3 className="text-xs text-gray-500 mb-1">CURP</h3>
            <p className="text-sm">{profile.curp}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-medium mb-2">Métodos de pago</h3>
        <div className="p-3 border border-dashed border-gray-300 rounded-md flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center mr-3">
              <CreditCardIcon size={16} className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Tarjeta terminación 4567</p>
              <p className="text-xs text-gray-500">Expira: 12/26</p>
            </div>
          </div>
          <div className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
            Principal
          </div>
        </div>
      </div>
    </div>
  );
}

// Sección de ajustes
function SettingsTab({ onLogout }) {
  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold mb-4">Ajustes</h1>
      
      <div className="space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-medium mb-3">Notificaciones</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label htmlFor="push-notifications" className="text-sm">Notificaciones push</label>
              <div className="h-6 w-11 bg-blue-500 rounded-full relative">
                <div className="h-5 w-5 rounded-full bg-white absolute top-0.5 right-0.5 shadow"></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <label htmlFor="email-notifications" className="text-sm">Notificaciones por correo</label>
              <div className="h-6 w-11 bg-blue-500 rounded-full relative">
                <div className="h-5 w-5 rounded-full bg-white absolute top-0.5 right-0.5 shadow"></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <label htmlFor="sms-notifications" className="text-sm">Notificaciones SMS</label>
              <div className="h-6 w-11 bg-gray-300 rounded-full relative">
                <div className="h-5 w-5 rounded-full bg-white absolute top-0.5 left-0.5 shadow"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-medium mb-3">Seguridad</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label htmlFor="biometric" className="text-sm">Inicio de sesión biométrico</label>
              <div className="h-6 w-11 bg-blue-500 rounded-full relative">
                <div className="h-5 w-5 rounded-full bg-white absolute top-0.5 right-0.5 shadow"></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Cambiar contraseña</span>
              <button className="text-xs text-blue-500">Editar</button>
            </div>
          </div>
        </div>
        
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 p-3 text-red-500 bg-red-50 rounded-lg font-medium"
        >
          <LogOutIcon size={18} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

// Sección de inicio (dashboard)
function HomeTab({ username, onLogout, onApplyCredit }) {
  return (
    <div className="p-4 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hola, {username}</h1>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-xl p-5 mb-6">
        <h2 className="text-lg font-medium mb-1">Límite pre-aprobado</h2>
        <div className="text-3xl font-bold mb-3">$5,000</div>
        <button
          onClick={onApplyCredit}
          className="bg-white text-blue-500 font-medium text-sm py-2 px-4 rounded-lg w-full"
        >
          Solicitar crédito
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <h3 className="font-medium mb-3">Resumen de actividad</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Préstamos activos</span>
            <span className="font-medium">1</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Próximo pago</span>
            <span className="font-medium">15 dic - $625</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Total pagado</span>
            <span className="font-medium">$5,625</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 rounded-lg p-4">
        <h3 className="font-medium mb-2">Consejos financieros</h3>
        <p className="text-sm text-gray-600">
          Realiza tus pagos a tiempo para mantener un buen historial crediticio y
          aumentar tus posibilidades de obtener mejores condiciones en futuros préstamos.
        </p>
      </div>
    </div>
  );
}

// Componente principal de la aplicación
export default function MicroCreditosApp() {
  const [activeTab, setActiveTab] = useState('home');
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
    <div className="flex flex-col min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Contenido principal */}
      <main className="flex-1 max-w-md mx-auto w-full bg-gray-100">
        {activeTab === 'home' && (
          <HomeTab 
            username={username} 
            onLogout={handleLogout} 
            onApplyCredit={handleApplyCredit} 
          />
        )}
        {activeTab === 'loans' && <LoansTab />}
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'settings' && <SettingsTab onLogout={handleLogout} />}
      </main>
      
      {/* Navegación */}
      <SimpleNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}