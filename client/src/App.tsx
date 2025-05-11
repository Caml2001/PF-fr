import React, { useState, useEffect } from "react";
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
import { Router, Route, Switch, useLocation } from "wouter";
import LoanPaymentSchedule from "./components/LoanPaymentSchedule";
import AdvancePaymentForm from "./components/AdvancePaymentForm";
import ScrollToTop from "./components/ScrollToTop";

export default function App() {
  const isPWA = useIsPWA();
  const [token, setToken] = useState<string | null>(null);
  const [onboardingStatus, setOnboardingStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [location, navigate] = useLocation();

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    setToken(storedToken);
    if (storedToken) {
      setLoading(true);
      import('./lib/api/onboardingService').then(({ fetchOnboardingStatus }) => {
        fetchOnboardingStatus()
          .then((res) => {
            setOnboardingStatus(res.status);
            if (
              res.status === 'complete' ||
              res.status === 'completed' ||
              res.status === 'PROFILE_COMPLETE_BUREAU_CONSENT_GIVEN' ||
              res.status === 'DUMMY_BUREAU_CHECK_COMPLETED' ||
              res.status === 'CREDIT_REPORT_AVAILABLE_DUMMY'
            ) {
              // Solo navegamos a home si estamos en la ruta raíz (/) 
              // o en una ruta no segura
              const validSecuredPaths = ['/home', '/loans', '/profile', '/settings', '/apply'];
              if (location === '/' || !validSecuredPaths.some(path => location.startsWith(path))) {
                navigate('/home');
              }
            } else {
              navigate('/register');
            }
          })
          .catch(() => {
            setOnboardingStatus(null);
            navigate('/login');
          })
          .finally(() => setLoading(false));
      });
    } else {
      navigate('/login');
    }
  }, [navigate, location]);

  const handleLogin = (userToken: string) => {
    localStorage.setItem('authToken', userToken);
    setToken(userToken);
    setLoading(true);
    import('./lib/api/onboardingService').then(({ fetchOnboardingStatus }) => {
      fetchOnboardingStatus()
        .then((res) => {
          setOnboardingStatus(res.status);
          if (
            res.status === 'complete' ||
            res.status === 'completed' ||
            res.status === 'PROFILE_COMPLETE_BUREAU_CONSENT_GIVEN' ||
            res.status === 'DUMMY_BUREAU_CHECK_COMPLETED' ||
            res.status === 'CREDIT_REPORT_AVAILABLE_DUMMY'
          ) {
            navigate('/home');
          } else {
            navigate('/register');
          }
        })
        .catch(() => {
          setOnboardingStatus(null);
          navigate('/login');
        })
        .finally(() => setLoading(false));
    });
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

  // Rutas para usuarios no autenticados
  if (!token) {
    return (
      <Router>
        <ScrollToTop />
        <Switch>
          <Route path="/login">
            <PageContainer>
              <ContentContainer>
                <AuthForm 
                  onLogin={handleLogin} 
                  onStartSignup={() => navigate('/register')} 
                />
              </ContentContainer>
            </PageContainer>
          </Route>
          <Route path="/register">
            <PageContainer>
              <ContentContainer>
                <OnboardingFlow 
                  onComplete={handleOnboardingComplete} 
                  onCancel={handleOnboardingCancel} 
                />
              </ContentContainer>
            </PageContainer>
          </Route>
          <Route>
            {() => {
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
            <PageContainer>
              <ContentContainer>
                <OnboardingFlow 
                  onComplete={handleOnboardingComplete} 
                  onCancel={handleOnboardingCancel} 
                />
              </ContentContainer>
            </PageContainer>
          </Route>
          <Route>
            {() => {
              navigate('/register');
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