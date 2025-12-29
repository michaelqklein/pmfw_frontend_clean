'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 1. Create the context
const AuthContext = createContext();

// 2. Export the provider
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [stripe_customer_id, setStripeCustomerId] = useState(null);
  const router = useRouter();

  const logout = () => {
    // console.log('Logging out...');
    setCurrentUser(null);
    // Optional: clear tokens/localStorage if used
    // localStorage.removeItem('authToken');

    // Optional: dispatch logout event if other components listen for it
    const event = new CustomEvent('changeLoggedIn', { detail: false });
    document.dispatchEvent(event);

    router.push('/'); // or redirect to login or home page
  };

  useEffect(() => {
    // Optional: load user from localStorage or cookie
    const storedUser = null; // Replace with actual logic
    setCurrentUser(storedUser);
  }, []);

  return (
    <AuthContext.Provider value={{
      currentUser,
      setCurrentUser,
      stripe_customer_id,
      setStripeCustomerId,
      logout,
      // Add any other state or functions you want to expose
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Export custom hook
export const useAuth = () => useContext(AuthContext);
