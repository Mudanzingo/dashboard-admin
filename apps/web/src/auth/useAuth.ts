import { useEffect, useState, useCallback } from 'react';
import { Auth } from 'aws-amplify';

interface AuthUser {
  username: string;
  attributes?: Record<string, any>;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const current = await Auth.currentAuthenticatedUser();
      setUser({ username: current.username, attributes: current.attributes });
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signIn = () => Auth.federatedSignIn(); // Hosted UI
  const signOut = async () => { await Auth.signOut(); setUser(null); };
  const getAccessToken = async () => {
    try {
      const session = await Auth.currentSession();
      return session.getAccessToken().getJwtToken();
    } catch {
      return null;
    }
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signIn,
    signOut,
    getAccessToken,
    refresh,
  };
}
