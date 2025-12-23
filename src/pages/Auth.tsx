import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  UserPlus,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Shield
} from 'lucide-react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import gosgLogo from "@/assets/go-sg-logo-official.png";
import { useAuth } from '../../sparti-cms/components/auth/AuthProvider';

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

interface LocationState {
  from?: {
    pathname?: string;
  };
}

const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { createAdminUser, signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ themeSlug?: string }>();
  
  // Check if we're in a theme context
  const themeSlug = params.themeSlug;
  const isThemeAuth = !!themeSlug;
  
  // Get the intended destination from location state or default
  const locationState = location.state as LocationState;
  let from = locationState?.from?.pathname || "/admin";
  
  // If in theme context, redirect to theme admin after login
  if (isThemeAuth && from === "/admin") {
    from = `/theme/${themeSlug}/admin`;
  }
  
  // Initial form data
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  
  // Handle redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const result = await signIn(formData.email, formData.password);
      
      if (result.success) {
        // If in theme context, verify user's tenant uses this theme
        if (isThemeAuth && themeSlug) {
          try {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4173';
            const response = await fetch(`${API_BASE_URL}/api/tenants/by-theme/${themeSlug}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('sparti-user-session') ? JSON.parse(localStorage.getItem('sparti-user-session') || '{}').token : ''}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (response.ok) {
              const data = await response.json();
              // Check if user's tenant is in the list (or if user is super admin)
              const userSession = localStorage.getItem('sparti-user-session');
              if (userSession) {
                const sessionData = JSON.parse(userSession);
                const userTenantId = sessionData.tenant_id;
                const isSuperAdmin = sessionData.is_super_admin;
                
                // Super admins can access any theme
                if (isSuperAdmin || !userTenantId || data.tenants?.some((t: any) => t.id === userTenantId)) {
                  setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
                  setTimeout(() => {
                    navigate(from, { replace: true });
                  }, 1000);
                } else {
                  setMessage({ 
                    type: 'error', 
                    text: 'Access denied. Your tenant does not use this theme.' 
                  });
                  setLoading(false);
                  return;
                }
              } else {
                // No session data, proceed normally
                setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
                setTimeout(() => {
                  navigate(from, { replace: true });
                }, 1000);
              }
            } else {
              // If API fails, allow access for now (graceful degradation)
              setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
              setTimeout(() => {
                navigate(from, { replace: true });
              }, 1000);
            }
          } catch (error) {
            console.error('Theme validation error:', error);
            // On error, allow access (graceful degradation)
            setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
            setTimeout(() => {
              navigate(from, { replace: true });
            }, 1000);
          }
        } else {
          // Not in theme context, proceed normally
          setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
          setTimeout(() => {
            navigate(from, { replace: true });
          }, 1000);
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Login failed' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage({ type: 'error', text: 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validate passwords match
    if (formData.password !== formData.confirm_password) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: 'Registration successful! Your account is pending approval. You will be notified once approved.' 
        });
        // Reset form
        setFormData({
          first_name: '',
          last_name: '',
          email: 'admin',
          password: 'admin',
          confirm_password: ''
        });
        // Switch to sign in after successful registration
        setTimeout(() => {
          setIsSignUp(false);
        }, 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Registration failed' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage({ type: 'error', text: 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Function to create admin user
  const handleCreateAdmin = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const result = await createAdminUser('admin', 'admin');
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: 'Admin user created successfully! Redirecting to dashboard...' 
        });
        
        setTimeout(() => {
          navigate('/admin', { replace: true });
        }, 1500);
      } else {
        setMessage({ 
          type: 'error', 
          text: result.error || 'Failed to create admin user' 
        });
      }
    } catch (error) {
      console.error('Create admin error:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to create admin user. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: 'admin',
      password: 'admin',
      confirm_password: ''
    });
    setMessage(null);
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-brandPurple/5 to-transparent blur-3xl rotate-45 -z-10"></div>
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-tl from-brandTeal/5 to-transparent blur-3xl -rotate-45 -z-10"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          
          <div className="flex justify-center mb-6">
            <img 
              src={gosgLogo} 
              alt="GO SG Digital Marketing Agency" 
              className="h-12 w-auto"
            />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-muted-foreground">
            {isSignUp 
              ? 'Sign up to get started with GO SG' 
              : 'Sign in to access your account'
            }
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-lg border border-border shadow-lg p-6">
          {/* Message */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-4 p-3 rounded-lg border ${
                  message.type === 'success' 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {message.type === 'success' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">{message.text}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            {/* Name fields for sign up */}
            <AnimatePresence>
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brandPurple focus:border-transparent"
                        placeholder="John"
                        required={isSignUp}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brandPurple focus:border-transparent"
                        placeholder="Doe"
                        required={isSignUp}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brandPurple focus:border-transparent"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-10 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brandPurple focus:border-transparent"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {isSignUp && (
                <p className="text-xs text-muted-foreground mt-1">
                  Must be at least 8 characters long
                </p>
              )}
            </div>

            {/* Confirm password field for sign up */}
            <AnimatePresence>
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-10 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brandPurple focus:border-transparent"
                      placeholder="••••••••"
                      required={isSignUp}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-brandPurple text-white rounded-lg hover:bg-brandPurple/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  {isSignUp ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Admin Access Button */}
          {/* <div className="mt-6 border-t pt-6">
            <button
              onClick={handleCreateAdmin}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  <span>Create Admin Access</span>
                </>
              )}
            </button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Creates a demo admin user with credentials: admin/admin
            </p>
          </div> */}

          {/* Switch mode */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={switchMode}
                className="ml-1 text-brandPurple hover:text-brandPurple/80 font-medium transition-colors"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

          {/* Admin note for sign up */}
          {isSignUp && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> New accounts require admin approval before you can access the system. 
                You will be notified once your account is approved.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
