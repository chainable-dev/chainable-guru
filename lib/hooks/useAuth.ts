import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

interface AuthState {
  user: any | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState({ user, loading: false, error: null });
    });

    return () => unsubscribe();
  }, [auth]);

  const login = useCallback(async (email: string, password: string) => {
    setAuthState((prevState) => ({ ...prevState, loading: true }));
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setAuthState({ user: auth.currentUser, loading: false, error: null });
      router.push('/dashboard'); // Redirect to a protected route after login
    } catch (error: any) {
      setAuthState({ user: null, loading: false, error: error.message });
    }
  }, [auth, router]);

  const logout = useCallback(async () => {
    setAuthState((prevState) => ({ ...prevState, loading: true }));
    try {
      await signOut(auth);
      setAuthState({ user: null, loading: false, error: null });
      router.push('/login'); // Redirect to login page after logout
    } catch (error: any) {
      setAuthState((prevState) => ({ ...prevState, loading: false, error: error.message }));
    }
  }, [auth, router]);

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    login,
    logout,
  };
} 