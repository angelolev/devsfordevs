import React, { useState, useRef, useEffect } from "react";
import {
  Moon,
  Sun,
  Code,
  LogIn,
  User,
  LogOut,
  ChevronDown,
  ChevronUp,
  Settings,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import NotificationsDropdown from "../NotificationsDropdown";

interface NavbarProps {
  onAuthModal: (type: "login") => void;
}

const Navbar: React.FC<NavbarProps> = ({ onAuthModal }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();

  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2); // Mock count
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = user?.full_name || user?.username || user?.email;
  const isAdmin = user?.username === "admin" || user?.email?.includes("admin");

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMyProfile = () => {
    if (user) {
      navigate(`/user/${user.username}`);
      setShowUserMenu(false);
    }
  };

  const handleAdminDashboard = () => {
    navigate("/admin");
    setShowUserMenu(false);
  };

  const handleLogout = () => {
    signOut();
    setShowUserMenu(false);
    navigate("/"); // Redirect to home after logout
  };

  const handleUnreadCountChange = (count: number) => {
    setUnreadNotifications(count);
  };

  return (
    <>
      <nav
        className="sticky top-0 z-50 backdrop-blur-md border-b border-gray-800/20"
        style={{ backgroundColor: "#f0bd30" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 flex-shrink-0 hover:opacity-80 transition-opacity duration-200"
            >
              <Code className="h-6 w-6 sm:h-8 sm:w-8 text-gray-900" />
              <span className="text-lg sm:text-xl font-bold text-gray-900">
                Devs4Devs
              </span>
            </button>

            {/* Right Section */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg"
                aria-label="Toggle theme"
              >
                {theme === "light" ? (
                  <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-900" />
                ) : (
                  <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-gray-900" />
                )}
              </button>

              {user ? (
                <>
                  {/* Desktop Notifications */}
                  <div className="hidden sm:block">
                    <NotificationsDropdown
                      unreadCount={unreadNotifications}
                      onUnreadCountChange={handleUnreadCountChange}
                    />
                  </div>

                  <div className="relative" ref={menuRef}>
                    {/* User Menu Button */}
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 rounded-lg px-2 py-1"
                    >
                      {/* User Avatar */}
                      <div className="w-8 h-8 flex-shrink-0">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={displayName || ""}
                            className="w-8 h-8 rounded-full object-cover border-2 border-gray-900/20"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-xs">
                              {(displayName || "").charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Username - Hidden on mobile */}
                      <span className="hidden sm:inline text-sm font-medium text-gray-900">
                        @{user.username || user.email}
                      </span>

                      {/* Chevron Icon - Hidden on mobile */}
                      <div className="hidden sm:block">
                        {showUserMenu ? (
                          <ChevronUp className="h-4 w-4 text-gray-900 transition-transform duration-200" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-900 transition-transform duration-200" />
                        )}
                      </div>
                    </button>

                    {/* User Menu Dropdown */}
                    {showUserMenu && (
                      <>
                        {/* Mobile Menu - Full Width Below Navbar */}
                        <div className="sm:hidden fixed top-16 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600 shadow-lg animate-fade-in">
                          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="py-4">
                              {/* User Info Header */}
                              <div className="flex items-center space-x-3 pb-4 border-b border-gray-200 dark:border-gray-600">
                                {user.avatar_url ? (
                                  <img
                                    src={user.avatar_url}
                                    alt={displayName || ""}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-semibold text-lg">
                                      {(displayName || "")
                                        .charAt(0)
                                        .toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {displayName}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    @{user.username || user.email}
                                  </p>
                                </div>
                              </div>

                              {/* Menu Options */}
                              <div className="pt-4 space-y-2">
                                <button
                                  onClick={handleMyProfile}
                                  className="w-full flex items-center space-x-3 px-3 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                                >
                                  <User className="h-5 w-5" />
                                  <span className="font-medium">Mi Perfil</span>
                                </button>

                                {isAdmin && (
                                  <button
                                    onClick={handleAdminDashboard}
                                    className="w-full flex items-center space-x-3 px-3 py-3 text-left text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors duration-200"
                                  >
                                    <Settings className="h-5 w-5" />
                                    <span className="font-medium">
                                      Panel de Administrador
                                    </span>
                                  </button>
                                )}

                                <button
                                  onClick={handleLogout}
                                  className="w-full flex items-center space-x-3 px-3 py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                                >
                                  <LogOut className="h-5 w-5" />
                                  <span className="font-medium">
                                    Cerrar Sesión
                                  </span>
                                </button>
                              </div>

                              {/* Mobile Notifications */}
                              <NotificationsDropdown
                                unreadCount={unreadNotifications}
                                onUnreadCountChange={handleUnreadCountChange}
                                isMobile={true}
                                onClose={() => setShowUserMenu(false)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Desktop/Tablet Menu - Positioned below username */}
                        <div className="hidden sm:block absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 animate-fade-in">
                          {/* User Info Header */}
                          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                            <div className="flex items-center space-x-3">
                              {user.avatar_url ? (
                                <img
                                  src={user.avatar_url}
                                  alt={displayName || ""}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                  <span className="text-white font-semibold">
                                    {(displayName || "")
                                      .charAt(0)
                                      .toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-gray-800 dark:text-white">
                                  {displayName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  @{user.username || user.email}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Menu Options */}
                          <div className="py-2">
                            <button
                              onClick={handleMyProfile}
                              className="w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                            >
                              <User className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                Mi Perfil
                              </span>
                            </button>

                            {isAdmin && (
                              <button
                                onClick={handleAdminDashboard}
                                className="w-full flex items-center space-x-3 px-4 py-2 text-left text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200"
                              >
                                <Settings className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                  Panel de Administrador
                                </span>
                              </button>
                            )}

                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center space-x-3 px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                            >
                              <LogOut className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                Cerrar Sesión
                              </span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <button
                  onClick={() => onAuthModal("login")}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  <LogIn className="h-5 w-5" />
                  <span className="text-sm font-medium">Iniciar Sesión</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
