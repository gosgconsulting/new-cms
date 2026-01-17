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
  Info
} from 'lucide-react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
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
      // Pass themeSlug to signIn for backend validation
      // The backend will validate that user's tenant uses the requested theme
      const result = await signIn(
        formData.email, 
        formData.password,
        isThemeAuth ? themeSlug : undefined
      );
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Login failed' });
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage({ type: 'error', text: 'Login failed. Please try again.' });
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

  // Helper: detect database connectivity/initialization issues based on error message
  const isDatabaseIssue = (text?: string) => {
    if (!text) return false;
    return /database|db|connect|initializ|unable to connect/i.test(text);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6">
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
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600">
            {isSignUp 
              ? 'Sign up to get started' 
              : 'Sign in to access your account'
            }
          </p>
        </div>

        {/* Auth Form - Flowbite Card Style */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          {/* Message - Flowbite Alert Style */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-4 p-4 rounded-lg border ${
                  message.type === 'success' 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.type === 'success' ? (
                    <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{message.text}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* EXTRA: Database connectivity hint */}
          {message?.type === 'error' && isDatabaseIssue(message?.text) && (
            <div className="mb-4 p-4 rounded-lg border bg-amber-50 border-amber-200 text-amber-900">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 mt-0.5 flex-shrink-0 text-amber-700" />
                <div>
                  <p className="text-sm font-medium">We're having trouble connecting to the database.</p>
                  <p className="text-sm mt-1">
                    This is usually temporary. Please wait a moment and try again. You can also check the server status:
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <a
                      href="/health/detailed"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-md bg-amber-600 px-3 py-1.5 text-white text-xs hover:bg-amber-700"
                    >
                      View server status
                    </a>
                    <a
                      href="/health/database"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-md border border-amber-300 px-3 py-1.5 text-amber-900 text-xs hover:bg-amber-100"
                    >
                      Database diagnostics
                    </a>
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center justify-center rounded-md border border-amber-300 px-3 py-1.5 text-amber-900 text-xs hover:bg-amber-100"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="John"
                        required={isSignUp}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Doe"
                        required={isSignUp}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email field - Flowbite Input Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            {/* Password field - Flowbite Input Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {isSignUp && (
                <p className="text-xs text-gray-500 mt-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleInputChange}
                      className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="••••••••"
                      required={isSignUp}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button - Flowbite Button Style */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

          {/* Switch mode - Flowbite Link Style */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={switchMode}
                className="ml-1 text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

          {/* Admin note for sign up - Flowbite Alert Style */}
          {isSignUp && (
            <div className="mt-4 p-4 rounded-lg border border-blue-200 bg-blue-50">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> New accounts require admin approval before you can access the system. 
                    You will be notified once your account is approved.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;