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

  // Check session on app load and route changes
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
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Skip session check only when visiting root path '/'
    if (location?.pathname === "/") {
      setUser(null);
      setIsLoggedIn(false);
      setIsLoading(false);
      hasCheckedRef.current = false;
      return () => {
        mounted = false;
      };
    }

    // Always check session on first load and when pathname changes (except root)
    // Reset flag when leaving root so re-checks happen on route changes
    setIsLoading(true);
    checkSession();

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
