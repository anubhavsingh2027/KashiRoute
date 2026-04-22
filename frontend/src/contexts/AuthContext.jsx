import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getUserSession } from "../api/services";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const hasCheckedRef = useRef(false);

  // Check session on app load
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const response = await getUserSession();

        const isLoggedInResponse = response?.loggedIn === true;
        const hasUser = response?.user && Object.keys(response.user).length > 0;

        if (!mounted) return;

        if (isLoggedInResponse && hasUser) {
          setUser(response.user);
          setIsLoggedIn(true);
        } else {
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        if (!mounted) return;
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    };

    // Skip session check only when visiting root path '/'
    if (location?.pathname === "/") {
      setUser(null);
      setIsLoggedIn(false);
      setIsLoading(false);
      // Keep hasCheckedRef false so navigating away triggers a check
      hasCheckedRef.current = false;
      return () => {
        mounted = false;
      };
    }

    // Run session check once per app lifecycle (or after root skip)
    if (!hasCheckedRef.current) {
      setIsLoading(true);
      checkSession();
      hasCheckedRef.current = true;
    }

    return () => {
      mounted = false;
    };
  }, [location?.pathname]);

  const login = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
