import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Feed from "./pages/Feed";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { Navbar } from "./components";
import { useState } from "react";
import { AuthModalType } from "./types";

const AppContent: React.FC = () => {
  const [authModal, setAuthModal] = useState<AuthModalType>(null);
  // const { user, needsUsername, setUserUsername } = useAuth();
  // const [searchParams] = useSearchParams();

  // // Check for auth errors from OAuth callback
  // useEffect(() => {
  //   const authError = searchParams.get("auth_error");
  //   if (authError) {
  //     console.error("Auth error from callback:", authError);
  //     // You could show a toast notification here
  //   }
  // }, [searchParams]);

  const handleAuthModal = (type: "login") => {
    setAuthModal(type);
  };

  // const closeAuthModal = () => {
  //   setAuthModal(null);
  // };

  // const handleUsernameComplete = (username: string) => {
  //   setUserUsername(username);
  //   // Redirect to user's profile page after username setup
  //   window.location.href = `/user/${username}`;
  // };

  return (
    <div
      className="min-h-screen transition-colors duration-200"
      style={{ backgroundColor: "#1a1a1a" }}
    >
      <Navbar onAuthModal={handleAuthModal} />
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/feed" element={<Feed />} />
          {/* <Route path="/user/:username" element={<UserProfilePage />} /> */}
          {/* <Route path="/admin" element={<AdminDashboard />} /> */}
          {/* <Route path="/auth/callback" element={<AuthCallback />} /> */}
        </Routes>
      </main>

      {/* Auth Modal */}
      {/* {authModal && <AuthModal type={authModal} onClose={closeAuthModal} />} */}

      {/* Username Selection Modal */}
      {/* {user && needsUsername && (
        <UsernameSelectionModal
          onComplete={handleUsernameComplete}
          userEmail={user.email}
          userName={user.name}
        />
      )} */}
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
