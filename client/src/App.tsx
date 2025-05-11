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
import { Router, Route, useLocation, Link } from "wouter";

export default function App() {
  const isPWA = useIsPWA();
  const [location, setLocation] = useLocation();
  const [token, setToken] = React.useState<string | null>(null);
  const [onboardingStatus, setOnboardingStatus] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    setToken(storedToken);
    if (storedToken) {
      setLoading(true);
      import('./lib/api/onboardingService').then(({ fetchOnboardingStatus }) => {
        fetchOnboardingStatus()
          .then((res) => {
            setOnboardingStatus(res.status);
            if (res.status === 'complete' || res.status === 'completed') {
              setLocation('/home');
            } else {
              setLocation('/register');
            }
          })
          .catch(() => {
            setOnboardingStatus(null);
            setLocation('/login');
          })
          .finally(() => setLoading(false));
      });
    } else {
      setLocation('/login');
    }
  }, []);

  const handleLogin = (userToken: string) => {
    localStorage.setItem('authToken', userToken);
    setToken(userToken);
    setLoading(true);
    import('./lib/api/onboardingService').then(({ fetchOnboardingStatus }) => {
      fetchOnboardingStatus()
        .then((res) => {
          setOnboardingStatus(res.status);
          if (res.status === 'complete' || res.status === 'completed') {
            setLocation('/home');
          } else {
            setLocation('/register');
          }
        })
        .catch(() => {
          setOnboardingStatus(null);
          setLocation('/login');
        })
        .finally(() => setLoading(false));
    });
  };

  const handleOnboardingComplete = () => {
    setOnboardingStatus('complete');
    setLocation('/home');
  };

  const handleOnboardingCancel = () => {
    setToken(null);
    setOnboardingStatus(null);
    localStorage.removeItem('authToken');
    setLocation('/login');
  };

  const handleLogout = () => {
    setToken(null);
    setOnboardingStatus(null);
    localStorage.removeItem('authToken');
    setLocation('/login');
    console.log('User logged out');
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  if (!token) {
    return (
      <Router>
        <Route path="/login"><PageContainer><ContentContainer><AuthForm onLogin={handleLogin} onStartSignup={() => setLocation('/register')} /></ContentContainer></PageContainer></Route>
        <Route path="/register"><PageContainer><ContentContainer><OnboardingFlow onComplete={handleOnboardingComplete} onCancel={handleOnboardingCancel} /></ContentContainer></PageContainer></Route>
        <Route path="/">{() => { setLocation('/login'); return null; }}</Route>
      </Router>
    );
  }

  if (onboardingStatus !== 'complete' && onboardingStatus !== 'completed') {
    return (
      <Router>
        <Route path="/register"><PageContainer><ContentContainer><OnboardingFlow onComplete={handleOnboardingComplete} onCancel={handleOnboardingCancel} /></ContentContainer></PageContainer></Route>
        <Route path="/">{() => { setLocation('/register'); return null; }}</Route>
      </Router>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 pb-16">
          <Route path="/home"><HomeSection /></Route>
          <Route path="/loans"><LoansSection /></Route>
          <Route path="/profile"><ProfileSection /></Route>
          <Route path="/settings"><SettingsSection /></Route>
          <Route path="/apply"><CreditApplicationForm onLogout={handleLogout} /></Route>
          <Route path="/">{() => { setLocation('/home'); return null; }}</Route>
        </main>
        {isPWA && (
          <nav className="fixed bottom-0 left-0 right-0 bg-background border-t pb-[10px]">
            <ContentContainer>
              <div className="flex justify-around py-2">
                <NavButton icon={<HomeIcon className="h-5 w-5" />} label="Home" isActive={location === "/home"} onClick={() => setLocation("/home")} />
                <NavButton icon={<DollarSignIcon className="h-5 w-5" />} label="Loans" isActive={location === "/loans"} onClick={() => setLocation("/loans")} />
                <NavButton icon={<UserIcon className="h-5 w-5" />} label="Profile" isActive={location === "/profile"} onClick={() => setLocation("/profile")} />
                <NavButton icon={<SettingsIcon className="h-5 w-5" />} label="Settings" isActive={location === "/settings"} onClick={() => setLocation("/settings")} />
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
      className={`flex flex-col items-center justify-center px-4 py-1 rounded-md transition-colors ${
        isActive ? 'text-primary' : 'text-muted-foreground'
      }`}
      onClick={onClick}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
}
