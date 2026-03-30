import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import App from './App.tsx';
import { AuthPage } from './pages/AuthPage.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { ToolPage } from './pages/ToolPage.tsx';
import { HistoryPage } from './pages/HistoryPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
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
    element: <AuthWrapper><LandingPage /></AuthWrapper>,
  },
  {
    element: <AuthWrapper><App /></AuthWrapper>,
    children: [
      {
        path: "dashboard",
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
      },
      {
        path: "tools/:toolId",
        element: <ProtectedRoute><ToolPage /></ProtectedRoute>,
      },
      {
        path: "history",
        element: <ProtectedRoute><HistoryPage /></ProtectedRoute>,
      },
      {
        path: "profile",
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute>,
      },
    ],
  },
  {
    path: "/auth",
    element: <AuthWrapper><AuthPage /></AuthWrapper>,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <HistoryProvider>
          <AuthWrapper>
            <RouterProvider router={router} />
          </AuthWrapper>
        </HistoryProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
);
