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
import { Router, Route, Switch, useLocation, useRoute, Redirect } from "wouter";
import LoanPaymentSchedule from "./components/LoanPaymentSchedule";
import AdvancePaymentForm from "./components/AdvancePaymentForm";
import ScrollToTop from "./components/ScrollToTop";

// Para depuración
const debug = (message: string) => {
  console.log(`DEBUG: ${message}`);
};

const ONBOARDING_STATUS_LOCALSTORAGE_KEY = 'onboardingUserComplete';

// Componentes de redirección
const RedirectToHome = () => {
  debug("Redireccionando a /home");
  return <Redirect to="/home" />;
};

const RedirectToLogin = () => {
  debug("Redireccionando a /login");
  return <Redirect to="/login" />;
};

const RedirectToRegisterAccount = () => {
  debug("Redireccionando a /register/account");
  return <Redirect to="/register/account" />;
};

// Spinner Component
const Spinner = () => (
  <svg 
    className="animate-spin -ml-1 mr-3 h-10 w-10 text-primary" 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24"
  >
    <circle 
      className="opacity-25" 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="4"
    ></circle>
    <path 
      className="opacity-75" 
      fill="currentColor" 
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

export default function App() {
  // Safely use the isPWA hook
  // const isPWA = typeof window !== 'undefined' ? useIsPWA() : false; // Comentado temporalmente
  const [isPWA, setIsPWA] = useState(false); // Inicialización directa con useState

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Lógica de useIsPWA movida aquí temporalmente
      const checkPWA = () => {
        const standalone = 
          window.matchMedia('(display-mode: standalone)').matches ||
          (window.navigator as any).standalone === true;
        setIsPWA(standalone);
        debug(`[PWA Check] Standalone: ${standalone}`)
      };
      
      checkPWA();
      // Considerar si el listener de resize es realmente necesario o si causa re-renders excesivos.
      // Por ahora lo mantenemos para replicar el hook original.
      window.addEventListener('resize', checkPWA);
      return () => window.removeEventListener('resize', checkPWA);
    }
  }, []); // Ejecutar solo una vez al montar

  // Initialize token from localStorage immediately on component mount
  const [token, setToken] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  });

  // Leer el estado optimista de localStorage para onboarding
  const optimisticOnboardingComplete = typeof window !== 'undefined' ?
                                      localStorage.getItem(ONBOARDING_STATUS_LOCALSTORAGE_KEY) === 'true' : false;

  const [onboardingStatus, setOnboardingStatus] = useState<string | null>(() => {
    // Si es optimista, asumimos 'complete', sino, null hasta que se verifique
    return optimisticOnboardingComplete ? 'complete' : null;
  });
  const [loading, setLoading] = useState(false);
  const [location, navigate] = useLocation();
  const statusCheckRef = useRef<boolean>(false);
  // Track if initial status check has been performed
  const initialCheckDoneRef = useRef<boolean>(false);
  // No mostrar loader si ya tenemos un estado optimista de onboarding completo
  const [initialLoadingOnboarding, setInitialLoadingOnboarding] = useState<boolean>(!optimisticOnboardingComplete);

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
  const checkOnboardingStatus = useCallback(async (options = { preventRedirects: false }) => {
    if (statusCheckRef.current) {
      debug("[ONBOARDING] Evitando verificación de status duplicada");
      return null;
    }

    statusCheckRef.current = true;
    // Solo mostrar loading general si no estamos en carga inicial optimista
    if (!optimisticOnboardingComplete || !initialLoadingOnboarding) {
        setLoading(true);
    }
    
    let statusToReturn = null; // Para guardar el status antes del finally

    try {
      const { fetchOnboardingStatus } = await import('./lib/api/onboardingService');
      const res = await fetchOnboardingStatus();
      statusToReturn = res.status; // Guardamos el status
      
      debug(`[ONBOARDING] Estado recibido del servidor: ${res.status}`);
      setOnboardingStatus(res.status); // Actualizar estado de React
      
      const completedStatuses = [
        'complete',
        'completed',
        'PROFILE_COMPLETE_BUREAU_CONSENT_GIVEN',
        'DUMMY_BUREAU_CHECK_COMPLETED',
        'CREDIT_REPORT_AVAILABLE_DUMMY'
      ];
      const isActuallyCompleted = completedStatuses.includes(res.status);

      if (isActuallyCompleted) {
        localStorage.setItem(ONBOARDING_STATUS_LOCALSTORAGE_KEY, 'true');
        debug("[ONBOARDING] Estado completo confirmado, guardado en localStorage.");
      } else {
        localStorage.removeItem(ONBOARDING_STATUS_LOCALSTORAGE_KEY);
        debug("[ONBOARDING] Estado no completo confirmado, removido de localStorage.");
      }
      
      // Si estamos previniendo redirecciones, solo actualizar el estado y retornar
      if (options.preventRedirects) {
        debug("[ONBOARDING] No se realizan redirecciones (preventRedirects=true)");
        return res.status; // Retornar el status real obtenido
      }
      
      // Get current location instead of using it from dependency
      const currentLocation = window.location.pathname;
      debug(`[ONBOARDING] Ubicación actual para redirección: ${currentLocation}`);
      
      // Definir rutas protegidas válidas
      const validSecuredPaths = ['/home', '/loans', '/profile', '/settings', '/apply'];
      const isProtectedRoute = validSecuredPaths.some(path => currentLocation.startsWith(path));
      // Usar isActuallyCompleted para la lógica de redirección
      const isOnboardingRoute = onboardingRoutes.some(route => currentLocation.startsWith(route));
      
      debug(`[ONBOARDING] Redirección: Es ruta protegida: ${isProtectedRoute}, Status completo real: ${isActuallyCompleted}, Es ruta onboarding: ${isOnboardingRoute}`);
      
      // Si el usuario tiene onboarding completo
      if (isActuallyCompleted) {
        // Solo redireccionar si estamos en:
        // 1. La ruta raíz (/)
        // 2. Una ruta de login
        // 3. Una ruta de onboarding
        if (currentLocation === '/' || currentLocation === '/login' || isOnboardingRoute) {
          debug("[ONBOARDING] Onboarding completo (real), redirigiendo a home");
          navigate('/home');
        } else {
          debug("[ONBOARDING] Onboarding completo (real), manteniendo en la ruta actual");
        }
      } 
      // Si el usuario tiene onboarding incompleto
      else {
        localStorage.removeItem(ONBOARDING_STATUS_LOCALSTORAGE_KEY); // Asegurar que se quite si no está completo
        // Solo redireccionar a onboarding si:
        // 1. No estamos ya en una ruta de onboarding
        // 2. No estamos en login (que tiene su propia lógica)
        if (!isOnboardingRoute && currentLocation !== '/login') {
          debug("[ONBOARDING] Onboarding incompleto (real), redirigiendo a register/account");
          navigate('/register/account');
        } else {
          debug("[ONBOARDING] Onboarding incompleto (real), manteniendo en la ruta actual de onboarding");
        }
      }
      
      return res.status; // Retornar el status real obtenido
    } catch (error) {
      console.error("[ONBOARDING] Error verificando estado de onboarding:", error);
      setOnboardingStatus(null); // Estado de React a null
      localStorage.removeItem(ONBOARDING_STATUS_LOCALSTORAGE_KEY); // Remover de localStorage en error
      debug("[ONBOARDING] Error, removido de localStorage.");
      statusToReturn = null; // Status a retornar es null
      
      // Solo redirigir a login si no estamos previniendo redirecciones
      if (!options.preventRedirects) {
        debug("[ONBOARDING] Error en verificación de onboarding, redirigiendo a login");
        navigate('/login');
      }
      
      return null; // Retornar null en caso de error
    } finally {
      setLoading(false);
      statusCheckRef.current = false;
      // Si el estado optimista era completo, pero el real no lo es (o hubo error),
      // y estábamos evitando el loader inicial, ahora debemos permitir que la lógica de renderizado
      // basada en el estado real (posiblemente nulo o incompleto) funcione.
      if (optimisticOnboardingComplete && (!statusToReturn || !completedStatuses.includes(statusToReturn))) {
        // Esto podría causar un re-render que active la lógica de onboarding incompleto si es necesario
        debug("[ONBOARDING] Discrepancia optimista/real o error, asegurando re-evaluación de carga/rutas.");
        setInitialLoadingOnboarding(true); // Temporalmente para forzar re-evaluación de bloques de render.
        // Pequeño timeout para luego volver a quitar el loading si la app no navega/cambia fundamentalmente
        setTimeout(() => setInitialLoadingOnboarding(false), 0);
      }
    }
  }, [navigate, onboardingRoutes, optimisticOnboardingComplete, initialLoadingOnboarding]);

  // Initialize auth state and verify token only once on component mount
  useEffect(() => {
    const initializeAuthState = async () => {
      if (initialCheckDoneRef.current) {
        setInitialLoadingOnboarding(false);
        return;
      }
      
      // Si no es optimista, activamos la carga inicial visualmente.
      // Si es optimista, initialLoadingOnboarding ya es false.
      if (!optimisticOnboardingComplete) {
        setInitialLoadingOnboarding(true);
      }
      
      if (token) {
        debug(`[INIT] Token encontrado en localStorage. Optimista completo: ${optimisticOnboardingComplete}`);
        try {
          const { isTokenExpired, refreshAccessToken } = await import('./lib/api/authService');
          if (isTokenExpired(token)) {
            debug("[INIT] Token está por expirar, intentando refrescar");
            const newToken = await refreshAccessToken();
            
            if (newToken) {
              debug("[INIT] Token refrescado exitosamente");
              setToken(newToken);
            } else {
              // Token couldn't be refreshed, clear it
              debug("[INIT] No se pudo refrescar el token, limpiando estado");
              localStorage.removeItem('authToken');
              localStorage.removeItem('refreshToken');
              setToken(null);
              
              // Only redirect if we're not already on a public route
              if (!publicRoutes.includes(location)) {
                debug("[INIT] Redirigiendo a login después de fallo en refresh");
                navigate('/login');
                return;
              }
            }
          }
          
          debug("[INIT] Verificando estado de onboarding real (sin redirecciones)");
          statusCheckRef.current = false; 
          const serverStatus = await checkOnboardingStatus({ preventRedirects: true });
          debug(`[INIT] Estado de onboarding real obtenido del servidor: ${serverStatus}`);

          // Si hubo una suposición optimista y el estado real es diferente (o nulo),
          // la lógica de redirección aquí debe basarse en el serverStatus.
          // Si serverStatus es null (error) o no es completo, y estábamos en una ruta protegida
          // debido a la suposición optimista, podríamos necesitar redirigir.
          
          const currentLocation = window.location.pathname;
          const validSecuredPaths = ['/home', '/loans', '/profile', '/settings', '/apply'];
          const isProtectedRoute = validSecuredPaths.some(path => currentLocation.startsWith(path));
          const completedStatuses = [
            'complete', 'completed', 'PROFILE_COMPLETE_BUREAU_CONSENT_GIVEN',
            'DUMMY_BUREAU_CHECK_COMPLETED', 'CREDIT_REPORT_AVAILABLE_DUMMY'
          ];
          const isServerStatusComplete = serverStatus && completedStatuses.includes(serverStatus);

          if (optimisticOnboardingComplete && !isServerStatusComplete && isProtectedRoute) {
            // Estábamos optimistamente en una ruta protegida, pero el servidor dice que ya no.
            // Redirigir a onboarding o login según el serverStatus.
            debug(`[INIT] Discrepancia optimista! Optimista: completo, Real: ${serverStatus}. Redirigiendo.`);
            if (serverStatus) { // Si hay un estado (incompleto)
              navigate('/register/account');
            } else { // Si serverStatus es null (error en fetch)
              navigate('/login');
            }
          } else if (isProtectedRoute) {
            // Si no hubo discrepancia crítica o no estábamos en modo optimista,
            // y estamos en ruta protegida, mantener al usuario.
            debug(`[INIT] Manteniendo al usuario en la ruta protegida (real): ${currentLocation}`);
          } else if (currentLocation === '/' || !publicRoutes.includes(currentLocation)) {
            // Rutas no protegidas (raíz o desconocidas), redirigir según estado REAL.
            if (isServerStatusComplete) {
              debug("[INIT] Onboarding completo (real), redirigiendo a home");
              navigate('/home');
            } else {
              debug(`[INIT] Onboarding incompleto (real: ${serverStatus}), redirigiendo a register/account`);
              navigate('/register/account');
            }
          }
        } catch (error) {
          console.error("[INIT] Error during initialization:", error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem(ONBOARDING_STATUS_LOCALSTORAGE_KEY);
          setToken(null);
          setOnboardingStatus(null);
        } finally {
          // Solo ponemos loading a false si no partimos de un estado optimista ya "cargado"
          if (!optimisticOnboardingComplete) {
            setInitialLoadingOnboarding(false);
          }
          initialCheckDoneRef.current = true; 
        }
      } else {
        debug(`[INIT] No hay token en localStorage. Limpiando estado optimista.`);
        localStorage.removeItem(ONBOARDING_STATUS_LOCALSTORAGE_KEY);
        setOnboardingStatus(null); // Asegurar que el estado de React esté limpio
        setInitialLoadingOnboarding(false);
        initialCheckDoneRef.current = true; 
        if (!publicRoutes.includes(location) && location !== '/') {
          debug(`[INIT] Redireccionando a login desde ruta protegida: ${location}`);
          navigate('/login');
        }
      }
    };
    initializeAuthState();
  }, [/* Run only once on mount, optimisticOnboardingComplete ya está fuera y es constante para este efecto */]);
  
  // Handle location changes for auth-protected routes
  useEffect(() => {
    // Skip the location change handling during initial mount
    if (!initialCheckDoneRef.current) return;
    
    debug(`[NAV] Cambio de ubicación: ${location}`);
    
    // Allow access to public routes without a token
    if (publicRoutes.includes(location)) {
      debug(`[NAV] Ruta pública: ${location}`);
      return;
    }
    
    // Check if we have a token for protected routes
    if (!token) {
      debug(`[NAV] Sin token en ruta protegida: ${location}`);
      navigate('/login');
    }
  }, [location, navigate, publicRoutes, token]);
  
  // Efecto para verificar estado de onboarding cuando sea necesario para rutas específicas
  useEffect(() => {
    // Skip during initial mount - we already do this in initialization
    if (!initialCheckDoneRef.current) return;
    
    // Solo verificar onboarding si tenemos token
    if (!token) return;
    
    // Verificar estado de onboarding en casos específicos:
    // 1. Cuando estamos en la raíz
    // 2. Cuando llegamos al login con un token (redirección automática)
    // 3. Solo para rutas no protegidas (para evitar redirecciones en rutas protegidas)
    const validSecuredPaths = ['/home', '/loans', '/profile', '/settings', '/apply'];
    const isProtectedRoute = validSecuredPaths.some(path => location.startsWith(path));
    
    if ((location === '/' || location === '/login') && !isProtectedRoute) {
      debug(`[ONBOARDING] Verificando estado de onboarding para ruta: ${location}`);
      checkOnboardingStatus();
    }
  }, [location, token, checkOnboardingStatus]);

  const handleLogin = async (userToken: string) => {
    debug("Login exitoso, guardando token");
    localStorage.setItem('authToken', userToken);
    setToken(userToken);
    
    // No hay estado optimista aquí, se va a verificar.
    setInitialLoadingOnboarding(true); // Mostrar carga mientras se verifica post-login.
    localStorage.removeItem(ONBOARDING_STATUS_LOCALSTORAGE_KEY); // Limpiar cualquier estado optimista previo.

    try {
      debug("Verificando estado de onboarding después del login");
      // La llamada a checkOnboardingStatus aquí ya actualiza localStorage y el estado de React.
      // Y también maneja la redirección.
      await checkOnboardingStatus(); 
      // No es necesario hacer más aquí, checkOnboardingStatus se encarga.
    } catch (error) { // El catch de checkOnboardingStatus ya maneja esto
      console.error("Error verificando estado de onboarding post-login:", error);
      // Por si acaso, una redirección de fallback si checkOnboardingStatus falla catastróficamente antes de su propio catch.
      // aunque checkOnboardingStatus debería manejar su propio error y redirección a login.
      // localStorage.removeItem(ONBOARDING_STATUS_LOCALSTORAGE_KEY);
      // setOnboardingStatus(null);
      // navigate('/login'); 
    } finally {
        setInitialLoadingOnboarding(false); // Quitar carga post-login.
    }
  };

  const handleOnboardingComplete = () => {
    setOnboardingStatus('complete');
    localStorage.setItem(ONBOARDING_STATUS_LOCALSTORAGE_KEY, 'true');
    debug("Onboarding completado manualmente, guardado en localStorage.");
    setTimeout(() => {
      navigate('/home');
    }, 0);
  };

  const handleOnboardingCancel = () => {
    setToken(null);
    setOnboardingStatus(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem(ONBOARDING_STATUS_LOCALSTORAGE_KEY);
    debug("Onboarding cancelado, limpiado localStorage.");
    setTimeout(() => {
      navigate('/login');
    }, 0);
  };

  const handleLogout = () => {
    setToken(null);
    setOnboardingStatus(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken'); // Asegurarse de limpiar también el refresh token
    localStorage.removeItem(ONBOARDING_STATUS_LOCALSTORAGE_KEY);
    debug("Logout, limpiado localStorage.");
    // Forzar que initialLoadingOnboarding se ponga a true para que el loader aparezca si se vuelve a login.
    // O mejor, dejar que la lógica de no-token maneje el renderizado directamente.
    // setInitialLoadingOnboarding(true); // Ya no es necesario si usamos la bandera optimista
    initialCheckDoneRef.current = false; // Permitir que la inicialización se ejecute de nuevo si hay re-login.
    setTimeout(() => {
      navigate('/login');
    }, 0);
    console.log('User logged out');
  };

  const handleStartSignup = () => {
    debug("App: Navegando a registro");
    setToken(null);
    setOnboardingStatus(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem(ONBOARDING_STATUS_LOCALSTORAGE_KEY);
    debug("Iniciando signup, limpiado localStorage.");
    initialCheckDoneRef.current = false; // Permitir que la inicialización se ejecute de nuevo.
    setTimeout(() => {
      navigate('/register/account');
      debug("Navegación a /register/account completada");
    }, 10);
  };

  // Mostrar carga (Spinner) solo si NO hay un estado optimista de onboarding completo
  // Y realmente estamos en la fase de carga inicial.
  if (token && initialLoadingOnboarding) { // initialLoadingOnboarding es false si optimisticOnboardingComplete es true
    debug("[RENDER] Mostrando Spinner (carga inicial no-optimista o post-login)");
    return (
      <PageContainer>
        <ContentContainer className="flex justify-center items-center h-screen">
          <Spinner />
        </ContentContainer>
      </PageContainer>
    );
  }

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
            {() => <RedirectToRegisterAccount />}
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
            {() => <RedirectToLogin />}
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
            {() => <RedirectToRegisterAccount />}
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
            {() => <RedirectToRegisterAccount />}
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
                // Esta lógica se ejecuta si se llega a "/" DESPUÉS de las redirecciones iniciales.
                // initializeAuthState ya debería haber redirigido a /home, /login, o /register/account.
                // Esto actúa como un fallback por si acaso se aterriza en "/" directamente.
                debug("[ROUTE /] Evaluando fallback de redirección desde raíz.");
                if (token && completedStatuses.includes(onboardingStatus || '')) {
                  return <RedirectToHome />;
                } else if (token) { // Token pero onboardingStatus no es completo
                  return <RedirectToRegisterAccount />;
                } else { // No hay token
                  return <RedirectToLogin />;
                }
              }}
            </Route>
            <Route>
              {() => <RedirectToHome />}
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