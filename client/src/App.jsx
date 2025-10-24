
import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import API_URL from './config.js';

import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import LandingPage from './pages/LandingPage';

function App() {
  const { isLoading, error, isAuthenticated, user, getAccessTokenSilently } = useAuth0();
  useEffect(() => {
    const syncUser = async () => {
      if (isAuthenticated && user) {
        try {
          const token = await getAccessTokenSilently();
          await fetch(`${API_URL}/users/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              auth0Id: user.sub,
              email: user.email,
            }),
          });
        } catch (e) {
          console.error('Error syncing user:', e);
        }
      }
    };
    syncUser();
  }, [isAuthenticated, user, getAccessTokenSilently]);


  if (isLoading) {
    return <div className="fixed inset-0 flex items-center justify-center bg-background text-foreground"><div>Loading...</div></div>;
  }
  
  if (error) {
     return <div className="fixed inset-0 flex items-center justify-center bg-background text-destructive"><div>Oops... {error.message}</div></div>;
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route path="/" element={<ProtectedRoute component={Dashboard} />} />
          <Route path="/analytics" element={<ProtectedRoute component={Analytics} />} />
        </Routes>
      </main>
       <footer className="text-center py-6 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Cosmic Nutrition Tracker. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;