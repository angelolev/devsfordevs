import { Routes, Route } from "react-router-dom";
import Feed from "./pages/Feed";
import UserProfile from "./pages/UserProfile";
import PostDetail from "./pages/PostDetail";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AuthModal, Navbar } from "./components";
import { useState } from "react";
import { AuthModalType } from "./types";

const AppContent: React.FC = () => {
  const [authModal, setAuthModal] = useState<AuthModalType>(null);
  const { isMissingUsername } = useAuth();

  const handleAuthModal = (type: "login") => {
    setAuthModal(type);
  };

  const closeAuthModal = () => {
    setAuthModal(null);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] transition-colors duration-200">
      <Navbar onAuthModal={handleAuthModal} />
      <main>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/post/:postId" element={<PostDetail />} />
          <Route path="/user/:username" element={<UserProfile />} />
          <Route path="/profile/:userId" element={<UserProfile />} />
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
