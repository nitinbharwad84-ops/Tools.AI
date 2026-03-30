import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import App from './App.tsx';
import { AuthPage } from './pages/AuthPage.tsx';
import './index.css';
import { HistoryProvider } from './context/HistoryContext';
import { useAuthStore } from './stores/authStore';
import { supabase } from './services/supabaseClient';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuthStore();
  if (!session) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { setSession, setUser, setProfile } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data }) => setProfile(data));
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data }) => setProfile(data));
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, setUser, setProfile]);

  if (loading) return null;

  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/auth",
    element: <AuthPage />,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HistoryProvider>
        <AuthWrapper>
          <RouterProvider router={router} />
        </AuthWrapper>
      </HistoryProvider>
    </QueryClientProvider>
  </StrictMode>,
);
