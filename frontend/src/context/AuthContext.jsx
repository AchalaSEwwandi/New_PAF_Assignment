import React, { createContext, useState, useEffect } from 'react';

// Create the context
const AuthContext = createContext();

/**
 * AuthProvider component that wraps the application components
 * to provide authentication state and methods.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Read token and user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('jwt');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  /**
   * Login function to save user data and token
   * @param {Object} userData - { id, name, email, role }
   * @param {string} token - JWT token
   */
  const login = (userData, token) => {
    setUser(userData);
    setToken(token);
    localStorage.setItem('jwt', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  /**
   * Logout function to clear state and localStorage
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
  };

  // Helper boolean to check if user is admin
  const isAdmin = user?.role === 'ADMIN';

  const contextValue = {
    user,
    token,
    login,
    logout,
    isAdmin,
    loading // Useful for protected routes
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
