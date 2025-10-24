import React from 'react';
import { withAuthenticationRequired } from '@auth0/auth0-react';

const ProtectedRoute = ({ component, ...args }) => {
  const Component = withAuthenticationRequired(component, {
    onRedirecting: () => <div className="min-h-screen flex items-center justify-center"><div>Loading...</div></div>,
  });
  return <Component {...args} />;
};

export default ProtectedRoute;
