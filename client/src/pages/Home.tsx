import { useState } from "react";
import LoginForm from "@/components/LoginForm";
import CreditApplicationForm from "@/components/CreditApplicationForm";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [contactInfo, setContactInfo] = useState("");

  const handleLogin = (contact: string) => {
    setContactInfo(contact);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Header />
        
        <main>
          {!isLoggedIn ? (
            <LoginForm onLogin={handleLogin} />
          ) : (
            <CreditApplicationForm onLogout={handleLogout} />
          )}
        </main>
        
        <Footer />
      </div>
    </div>
  );
}
