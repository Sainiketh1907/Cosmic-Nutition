import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import cosmicBackground from '../assets/cosmic_background.mp4';
import cosmicLogo from '../assets/cosmic_logo.png';

const LandingPage = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="relative overflow-hidden min-h-screen bg-background text-foreground flex flex-col">
      {/* Background video - decorative */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src={cosmicBackground}
        poster={cosmicLogo}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />

      {/* Overlay to improve text contrast */}
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />

      <div className="relative z-10 flex-grow flex items-center justify-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-neutral-200 to-slate-500">
            Welcome to Cosmic Nutrition
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Unlock the secrets of your diet. Effortlessly track your meals, analyze your nutrition, and achieve your health goals with the power of AI.
          </p>
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => loginWithRedirect()}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-base font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 py-3"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      <footer className="relative z-10 text-center py-6 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Cosmic Nutrition Tracker. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
