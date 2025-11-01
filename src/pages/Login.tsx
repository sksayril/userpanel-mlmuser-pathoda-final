import React from 'react';
import { Navigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = () => {
    // Login is handled by the AuthContext
    // Navigation will be handled by the router
  };

  return <LoginForm onLogin={handleLogin} />;
};

export default Login;
