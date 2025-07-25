import React from 'react';

const Login: React.FC = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:4000/auth/google';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-dark">
      <div className="bg-card-bg rounded-xl shadow-lg p-10 flex flex-col items-center w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-6">SecurePass</h1>
        <p className="text-slate-400 mb-8 text-center">Sign in to securely manage your passwords</p>
        <button
          onClick={handleLogin}
          className="bg-white text-primary-dark font-semibold px-6 py-3 rounded-lg shadow hover:bg-slate-200 transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C36.68 2.36 30.74 0 24 0 14.82 0 6.71 5.1 2.69 12.44l7.98 6.2C13.01 13.13 18.13 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.02l7.19 5.59C43.98 37.13 46.1 31.3 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.65c-1.01-2.97-1.01-6.18 0-9.15l-7.98-6.2C.7 17.1 0 20.47 0 24c0 3.53.7 6.9 1.96 10.05l8.71-5.4z"/><path fill="#EA4335" d="M24 48c6.48 0 11.92-2.15 15.89-5.85l-7.19-5.59c-2.01 1.35-4.59 2.15-8.7 2.15-5.87 0-10.99-3.63-13.33-8.85l-8.71 5.4C6.71 42.9 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
