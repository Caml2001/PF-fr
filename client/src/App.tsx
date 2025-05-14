import React, { useState, useEffect, useCallback, useRef } from "react";
import HomeSection from "./sections/HomeSection";
import LoansSection from "./sections/LoansSection";
import ProfileSection from "./sections/ProfileSection";
import SettingsSection from "./sections/SettingsSection";
import AuthForm from "./components/AuthForm";
import OnboardingFlow from "./components/OnboardingFlow";
import CreditApplicationForm from "./components/CreditApplicationForm";
import { HomeIcon, DollarSignIcon, UserIcon, SettingsIcon } from "lucide-react";
import { ContentContainer, PageContainer } from "./components/Layout";
import { useIsPWA } from "./hooks/useIsPWA";
import { Router, Route, Switch, useLocation, useRoute } from "wouter";
import LoanPaymentSchedule from "./components/LoanPaymentSchedule";
import AdvancePaymentForm from "./components/AdvancePaymentForm";
import ScrollToTop from "./components/ScrollToTop";

// Para depuración
const debug = (message: string) => {
  console.log(`DEBUG: ${message}`);
};

export default function App() {
  const isPWA = useIsPWA();
  const [token, setToken] = useState<string | null>(null);
  const [onboardingStatus, setOnboardingStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [location, navigate] = useLocation();
  const statusCheckRef = useRef<boolean>(false);

  // Lista de todas las rutas de onboarding
  const onboardingRoutes = [
    '/register',
    '/register/account',
    '/register/phone',
    '/register/otp',
    '/register/personal',
    '/register/ine',
    '/register/review',
    '/register/bureau',
    '/register/complete'
  ];

  // Lista completa de rutas públicas
  const publicRoutes = ['/login', ...onboardingRoutes];

  // Función memoizada para verificar el estado de onboarding
  const checkOnboardingStatus = useCallback(async () => {
    if (statusCheckRef.current) {
      debug("Evitando verificación de status duplicada");
      return;
    }

    statusCheckRef.current = true;
    setLoading(true);
    
    try {
      const { fetchOnboardingStatus } = await import('./lib/api/onboardingService');
      const res = await fetchOnboardingStatus();
      
      setOnboardingStatus(res.status);
      
      const completedStatuses = [
        'complete',
        'completed',
        'PROFILE_COMPLETE_BUREAU_CONSENT_GIVEN',
        'DUMMY_BUREAU_CHECK_COMPLETED',
        'CREDIT_REPORT_AVAILABLE_DUMMY'
      ];
      
      // Get current location instead of using it from dependency
      const currentLocation = window.location.pathname;
      
      if (completedStatuses.includes(res.status)) {
        // Solo navegamos a home si estamos en la ruta raíz (/) 
        // o en una ruta no segura
        const validSecuredPaths = ['/home', '/loans', '/profile', '/settings', '/apply'];
        if (currentLocation === '/' || !validSecuredPaths.some(path => currentLocation.startsWith(path))) {
          navigate('/home');
        }
      } else if (!onboardingRoutes.some(route => currentLocation.startsWith(route))) {
        // Solo navegamos al registro si no estamos ya en una ruta de onboarding
        navigate('/register/account');
      }
    } catch (error) {
      console.error("Error verificando estado de onboarding:", error);
      setOnboardingStatus(null);
      navigate('/login');
    } finally {
      setLoading(false);
      statusCheckRef.current = false;
    }
  }, [navigate, onboardingRoutes]);

  useEffect(() => {
    debug(`Ubicación actual: ${location}`);
    
    // Permitir acceso a rutas públicas sin token
    if (publicRoutes.includes(location)) {
      debug(`Ruta pública: ${location}, no es necesario redirigir`);
      return;
    }
    
    const storedToken = localStorage.getItem('authToken');
    setToken(storedToken);
    
    if (storedToken) {
      // Solo verificamos el estado si:
      // 1. Tenemos un token
      // 2. Estamos en la raíz o página de login (evitamos verificar en cada cambio de ruta)
      if (location === '/' || location === '/login') {
        checkOnboardingStatus();
      }
    } else {
      // Solo redirigir a login si no estamos ya en una ruta pública
      if (!publicRoutes.includes(location)) {
        debug(`Usuario sin token intentando acceder a ruta protegida: ${location}, redirigiendo a /login`);
        navigate('/login');
      }
    }
  }, [navigate, location, publicRoutes, checkOnboardingStatus]);

  const handleLogin = (userToken: string) => {
    localStorage.setItem('authToken', userToken);
    setToken(userToken);
    // Verificar estado después del login
    checkOnboardingStatus();
  };

  const handleOnboardingComplete = () => {
    setOnboardingStatus('complete');
    navigate('/home');
  };

  const handleOnboardingCancel = () => {
    setToken(null);
    setOnboardingStatus(null);
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const handleLogout = () => {
    setToken(null);
    setOnboardingStatus(null);
    localStorage.removeItem('authToken');
    navigate('/login');
    console.log('User logged out');
  };

  const handleStartSignup = () => {
    debug("App: Navegando a registro");
    // Primero cambiamos el estado localmente antes de navegar
    setToken(null);
    setOnboardingStatus(null);
    // Usamos un pequeño timeout para asegurar que la navegación ocurra después del cambio de estado
    setTimeout(() => {
      navigate('/register/account');
      debug("Navegación a /register/account completada");
    }, 10);
  };

  // Rutas para usuarios no autenticados
  if (!token) {
    debug("Renderizando rutas para usuarios no autenticados");
    return (
      <Router>
        <ScrollToTop />
        <Switch>
          <Route path="/login">
            {() => (
              <PageContainer>
                <ContentContainer>
                  <AuthForm 
                    onLogin={handleLogin} 
                    onStartSignup={handleStartSignup} 
                  />
                </ContentContainer>
              </PageContainer>
            )}
          </Route>
          <Route path="/register">
            {() => {
              // Redirigir a la ruta específica del primer paso
              navigate('/register/account');
              return null;
            }}
          </Route>
          <Route path="/register/:step">
            {(params) => (
              <PageContainer>
                <ContentContainer>
                  <OnboardingFlow 
                    onComplete={handleOnboardingComplete} 
                    onCancel={handleOnboardingCancel}
                    initialStep={params.step}
                  />
                </ContentContainer>
              </PageContainer>
            )}
          </Route>
          <Route>
            {() => {
              debug("Ruta no encontrada, redirigiendo a login");
              navigate('/login');
              return null;
            }}
          </Route>
        </Switch>
      </Router>
    );
  }

  const completedStatuses = [
    'complete',
    'completed',
    'PROFILE_COMPLETE_BUREAU_CONSENT_GIVEN',
    'DUMMY_BUREAU_CHECK_COMPLETED',
    'CREDIT_REPORT_AVAILABLE_DUMMY'
  ];

  // Rutas para usuarios en proceso de onboarding
  if (!completedStatuses.includes(onboardingStatus || '')) {
    return (
      <Router>
        <ScrollToTop />
        <Switch>
          <Route path="/register">
            {() => {
              // Redirigir a la ruta específica del primer paso
              navigate('/register/account');
              return null;
            }}
          </Route>
          <Route path="/register/:step">
            {(params) => (
              <PageContainer>
                <ContentContainer>
                  <OnboardingFlow 
                    onComplete={handleOnboardingComplete} 
                    onCancel={handleOnboardingCancel}
                    initialStep={params.step}
                  />
                </ContentContainer>
              </PageContainer>
            )}
          </Route>
          <Route>
            {() => {
              navigate('/register/account');
              return null;
            }}
          </Route>
        </Switch>
      </Router>
    );
  }

  // Rutas para usuarios autenticados y con onboarding completo
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 pb-16">
          <Switch>
            <Route path="/home">
              <HomeSection />
            </Route>
            <Route path="/loans">
              <LoansSection />
            </Route>
            <Route path="/loans/:loanId">
              {(params) => <LoansSection loanId={params.loanId} />}
            </Route>
            <Route path="/loans/:loanId/payments">
              {(params) => <LoansSection loanId={params.loanId} view="payments" />}
            </Route>
            <Route path="/loans/:loanId/schedule">
              {(params) => <LoansSection loanId={params.loanId} view="schedule" />}
            </Route>
            <Route path="/loans/:loanId/advance-payment">
              {(params) => <LoansSection loanId={params.loanId} view="advance-payment" />}
            </Route>
            <Route path="/profile">
              <ProfileSection />
            </Route>
            <Route path="/settings">
              <SettingsSection />
            </Route>
            <Route path="/apply">
              <CreditApplicationForm onLogout={handleLogout} />
            </Route>
            <Route path="/">
              {() => {
                navigate('/home');
                return null;
              }}
            </Route>
            <Route>
              {() => {
                navigate('/home');
                return null;
              }}
            </Route>
          </Switch>
        </main>
        {isPWA && (
          <nav className="fixed bottom-0 left-0 right-0 bg-background border-t pb-[10px]">
            <ContentContainer>
              <div className="flex justify-around py-2">
                <NavButton
                  icon={<HomeIcon className="h-5 w-5" />}
                  label="Home"
                  isActive={location.startsWith("/home")}
                  onClick={() => navigate("/home")}
                />
                <NavButton
                  icon={<DollarSignIcon className="h-5 w-5" />}
                  label="Loans"
                  isActive={location.startsWith("/loans")}
                  onClick={() => navigate("/loans")}
                />
                <NavButton
                  icon={<UserIcon className="h-5 w-5" />}
                  label="Profile"
                  isActive={location.startsWith("/profile")}
                  onClick={() => navigate("/profile")}
                />
                <NavButton
                  icon={<SettingsIcon className="h-5 w-5" />}
                  label="Settings"
                  isActive={location.startsWith("/settings")}
                  onClick={() => navigate("/settings")}
                />
              </div>
            </ContentContainer>
          </nav>
        )}
      </div>
    </Router>
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
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-16 ${
        isActive ? "text-primary" : "text-muted-foreground"
      }`}
    >
      {icon}
      <span className="mt-1 text-xs">{label}</span>
    </button>
  );
}