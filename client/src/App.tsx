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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isPWA = useIsPWA();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Check if there's a logged-in user in localStorage
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Función para manejar el login (ahora llamada por AuthForm DESPUÉS de una API exitosa)
  const handleLogin = (username: string) => {
    console.log("Login successful for:", username); // Username might not be needed here anymore
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    // Redirect after state is set, ensuring UI updates smoothly
    // Using setLocation might be smoother than window.location.replace if no full reload is desired
    setLocation("/home"); 
    // window.location.replace("/home"); // Keep if full reload is intended
  };

  // Función para manejar la finalización del onboarding (después de signup API exitoso)
  const handleOnboardingComplete = (/* Optional: userData from OnboardingFlow if needed */) => {
    console.log("Onboarding/Signup successful, logging user in.");
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    setLocation("/home"); // Navigate to home after successful signup/login
  };

  // Función para manejar la cancelación del onboarding
  const handleOnboardingCancel = () => {
  };

  // Función para manejar el logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    setLocation("/login");
    console.log("User logged out");
  };

  // Routing for login/register/onboarding
  if (!isAuthenticated) {
    return (
      <Router>
        <Route path="/login"><PageContainer><ContentContainer><AuthForm onLogin={handleLogin} onStartSignup={() => setLocation('/register')} /></ContentContainer></PageContainer></Route>
        <Route path="/register"><PageContainer><ContentContainer><OnboardingFlow onComplete={handleOnboardingComplete} onCancel={handleOnboardingCancel} /></ContentContainer></PageContainer></Route>
        {/* Default: redirect to login */}
        <Route path="/">{() => { 
          // Check auth state again in case it changed while navigating
          if (!isAuthenticated) {
             setLocation("/login");
          } else {
            setLocation("/home"); // Should not happen if !isAuthenticated, but safer
          }
          return null; 
        }}</Route>
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
          {/* Example: you can add more routes for loan details, payments, etc. */}
          {/* Redirect root to /home */}
          <Route path="/">{() => { 
            // Redirect authenticated users from root to /home
            setLocation("/home"); 
            return null; 
          }}</Route>
        </main>
        {/* Bottom nav only in PWA */}
        {isPWA && (
          <nav className="fixed bottom-0 left-0 right-0 bg-background border-t pb-[10px]">
            <ContentContainer>
              <div className="flex justify-around py-2">
                <NavButton
                  icon={<HomeIcon className="h-5 w-5" />}
                  label="Home"
                  isActive={location === "/home"}
                  onClick={() => setLocation("/home")}
                />
                <NavButton
                  icon={<DollarSignIcon className="h-5 w-5" />}
                  label="Loans"
                  isActive={location === "/loans"}
                  onClick={() => setLocation("/loans")}
                />
                <NavButton
                  icon={<UserIcon className="h-5 w-5" />}
                  label="Profile"
                  isActive={location === "/profile"}
                  onClick={() => setLocation("/profile")}
                />
                <NavButton
                  icon={<SettingsIcon className="h-5 w-5" />}
                  label="Settings"
                  isActive={location === "/settings"}
                  onClick={() => setLocation("/settings")}
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
