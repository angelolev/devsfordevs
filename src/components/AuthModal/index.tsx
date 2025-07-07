import React, { useRef, useState, useEffect } from "react";
import { Github } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChange?: (isOpen: boolean) => void;
}

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    signInWithGoogle,
    signInWithGitHub,
    isLoading,
    isMissingUsername,
    updateProfile,
  } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !isMissingUsername &&
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, isMissingUsername]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Sanitize input to allow only letters and numbers
    const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, "");
    setUsername(sanitizedValue);
  };

  const handleUpdateUsername = async () => {
    setError(null);
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    const letters = username.match(/[a-zA-Z]/g) || [];

    if (username.length < 3) {
      setError("Username must be at least 3 characters long.");
      return;
    }
    if (username.length > 12) {
      setError("Username cannot be more than 12 characters long.");
      return;
    }
    if (!usernameRegex.test(username)) {
      setError("Username can only contain letters and numbers.");
      return;
    }
    if (letters.length < 3) {
      setError("Username must contain at least 3 letters.");
      return;
    }

    try {
      await updateProfile(username);
      onClose(); // Close modal on success
    } catch (err) {
      const error = err as Error;
      if (
        error.message?.includes(
          "duplicate key value violates unique constraint"
        )
      ) {
        setError("This username is already taken.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  if (!isOpen && !isMissingUsername) return null;

  if (isMissingUsername) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div
          ref={modalRef}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md"
        >
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-4">
            Welcome to DevsForDevs!
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
            Choose a unique username to complete your profile.
          </p>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={handleUsernameChange}
              maxLength={12}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            {username.length >= 3 &&
              (username.match(/[a-zA-Z]/g) || []).length < 3 && (
                <p className="text-yellow-500 text-sm -mt-2">
                  Username must contain at least 3 letters.
                </p>
              )}
            {error && <p className="text-red-500 text-sm -mt-2">{error}</p>}
            <button
              onClick={handleUpdateUsername}
              disabled={
                isLoading ||
                username.length < 3 ||
                (username.match(/[a-zA-Z]/g) || []).length < 3
              }
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center cursor-pointer"
            >
              {isLoading ? "Saving..." : "Save and Continue"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-sm"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Log in to DevsForDevs
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 dark:hover:text-white cursor-pointer"
          >
            &times;
          </button>
        </div>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          Connect with developers and share your knowledge.
        </p>
        <div className="flex flex-col gap-4">
          <button
            onClick={signInWithGoogle}
            disabled={isLoading}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:bg-red-400 flex items-center justify-center cursor-pointer"
          >
            <GoogleIcon />
            Continue with Google
          </button>
          <button
            onClick={signInWithGitHub}
            disabled={isLoading}
            className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-black disabled:bg-gray-700 flex items-center justify-center cursor-pointer"
          >
            <Github className="w-5 h-5 mr-2" />
            Continue with GitHub
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
