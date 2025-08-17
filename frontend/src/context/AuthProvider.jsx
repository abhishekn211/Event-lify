// src/context/AuthProvider.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { verifyUserAPI } from "../../helpers/apiCommunicators";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true

  // This effect runs ONLY on initial app load to verify the session
  useEffect(() => {
    const verifyUser = async () => {
      const result = await verifyUserAPI();
      if (result.user) {
        setAuthUser(result.user);
      } else {
        // If verification fails, ensure user is null and local storage is clear
        setAuthUser(null);
        localStorage.removeItem("authUser");
      }
      setIsLoading(false);
    };
    verifyUser();
  }, []);

  // This effect is the SINGLE SOURCE OF TRUTH for syncing state to localStorage.
  // It runs whenever authUser changes (login, logout, etc.)
  useEffect(() => {
    if (authUser) {
      localStorage.setItem('authUser', JSON.stringify(authUser));
    } else {
      localStorage.removeItem('authUser');
    }
  }, [authUser]);

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}