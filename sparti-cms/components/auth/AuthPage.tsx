import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import gosgLogo from "@/assets/go-sg-logo-official.png";
import { motion } from "framer-motion";

const AuthPage: React.FC = () => {
  const [email, setEmail] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, user } = useAuth();

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn(email, password);
      if (!result.success) {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background relative overflow-hidden">
      {/* Diagonal gradient accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-brandPurple/20 to-transparent blur-3xl rotate-45 -z-10"></div>
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-tl from-brandTeal/15 to-transparent blur-3xl -rotate-45 -z-10"></div>
      <div className="absolute top-1/3 left-0 w-72 h-72 bg-gradient-to-br from-coral/10 to-transparent blur-3xl rotate-12 -z-10"></div>
      
      <motion.div 
        className="max-w-md w-full space-y-8 p-8 bg-white/80 backdrop-blur-md rounded-xl shadow-xl border border-border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src={gosgLogo} 
              alt="GO SG Digital Marketing Agency" 
              className="h-16 w-auto"
            />
          </div>
          <h2 className="mt-2 text-2xl font-bold text-foreground">
            Admin Dashboard
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to access the content management system
          </p>
        </div>
        
        <div className="bg-secondary/50 backdrop-blur-sm border border-border rounded-lg p-4 mb-6">
          <p className="text-sm text-foreground">
            <strong>Demo Credentials:</strong><br />
            Username: admin<br />
            Password: admin
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Username
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-input bg-background/50 placeholder-muted-foreground text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-brandPurple focus:border-brandPurple focus:z-10 transition-all duration-200"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-input bg-background/50 placeholder-muted-foreground text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-brandPurple focus:border-brandPurple focus:z-10 transition-all duration-200"
              placeholder="Enter password"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-destructive hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-destructive disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-destructive/25 hover:shadow-xl"
            >
              <span className="relative z-10">
                {isLoading ? 'Signing in...' : 'Sign in'}
              </span>
              <span className="absolute inset-0 w-full h-full bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 blur-sm"></span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AuthPage;