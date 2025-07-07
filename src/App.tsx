import { Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Feed from "./pages/Feed";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AuthModal, Navbar } from "./components";
import { useState } from "react";
import { AuthModalType } from "./types";

const AppContent: React.FC = () => {
  const [authModal, setAuthModal] = useState<AuthModalType>(null);
  const { isMissingUsername } = useAuth();
  const location = useLocation();

  const handleAuthModal = (type: "login") => {
    setAuthModal(type);
  };

  const closeAuthModal = () => {
    setAuthModal(null);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1a1a] transition-colors duration-200">
      {location.pathname !== "/" && <Navbar onAuthModal={handleAuthModal} />}
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/feed" element={<Feed />} />
          {/* <Route path="/user/:username" element={<UserProfilePage />} /> */}
          {/* <Route path="/admin" element={<AdminDashboard />} /> */}
          {/* <Route path="/auth/callback" element={<AuthCallback />} /> */}
        </Routes>
      </main>

      <AuthModal
        isOpen={authModal !== null || isMissingUsername}
        onClose={closeAuthModal}
      />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
