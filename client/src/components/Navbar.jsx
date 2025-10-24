
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import cosmicLogo from '../assets/cosmic_logo.png';

const Navbar = () => {
  const { loginWithRedirect, logout, user, isAuthenticated } = useAuth0();

  const activeLinkClass = "bg-primary/10 text-primary dark:bg-accent";
  const inactiveLinkClass = "text-muted-foreground hover:text-primary";
  const linkBaseClass = "px-3 py-2 rounded-md text-sm font-medium transition-colors";

  return (
    <header className="bg-card/80 border-b border-border backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <img src={cosmicLogo} alt="Cosmic Nutrition" className="h-8 w-8 rounded-full object-cover ring-2 ring-offset-2 ring-offset-background ring-ring" />
              <h1 className="text-xl px-3 font-bold text-foreground tracking-tight">Cosmic Nutrition</h1>
            </div>
             {isAuthenticated && (
              <nav className="hidden md:flex items-center space-x-2">
                <NavLink to="/" className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
                  Dashboard
                </NavLink>
                <NavLink to="/analytics" className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
                  Analytics
                </NavLink>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            {!isAuthenticated && (
              <button
                onClick={() => loginWithRedirect()}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Log In
              </button>
            )}
            {isAuthenticated && (
              <>
                 <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground hidden sm:inline">{user.name}</span>
                    <img src={user.picture} alt={user.name} className="h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-background ring-ring" />
                 </div>
                <button
                  onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                  Log Out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;