import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    fetch('http://localhost:4000/auth/user', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.id) {
          // User is already authenticated, redirect to main page
          navigate('/');
        }
        setIsChecking(false);
      })
      .catch(() => {
        setIsChecking(false);
      });
  }, [navigate]);

  const handleLogin = () => {
    window.location.href = 'http://localhost:4000/auth/google';
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-dark">
        <div className="text-white text-lg">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-700">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">SecurePass</h1>
          <p className="text-slate-300 text-lg">Your Personal Password Manager</p>
        </div>

        {/* Welcome Message */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-white mb-3">Welcome Back!</h2>
          <p className="text-slate-400 leading-relaxed">
            Sign in to securely access and manage all your passwords in one place. 
            Your data is protected with industry-standard encryption.
          </p>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="w-full bg-white hover:bg-slate-100 text-slate-900 font-semibold px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-3 text-lg"
        >
          <svg className="w-6 h-6" viewBox="0 0 48 48">
            <g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C36.68 2.36 30.74 0 24 0 14.82 0 6.71 5.1 2.69 12.44l7.98 6.2C13.01 13.13 18.13 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.02l7.19 5.59C43.98 37.13 46.1 31.3 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.65c-1.01-2.97-1.01-6.18 0-9.15l-7.98-6.2C.7 17.1 0 20.47 0 24c0 3.53.7 6.9 1.96 10.05l8.71-5.4z"/><path fill="#EA4335" d="M24 48c6.48 0 11.92-2.15 15.89-5.85l-7.19-5.59c-2.01 1.35-4.59 2.15-8.7 2.15-5.87 0-10.99-3.63-13.33-8.85l-8.71 5.4C6.71 42.9 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g>
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Features */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center space-x-3 text-slate-300">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm">End-to-end encryption</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-300">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm">Secure cloud sync</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-300">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm">Cross-platform access</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-slate-700">
          <p className="text-slate-500 text-sm">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
