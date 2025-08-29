import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Shuffle } from 'lucide-react';
import { PasswordEntry, IPasswordEntry } from '../models/Password';
import { SecurePasswordGenerator } from '../services/PasswordGenerator';

interface PasswordFormProps {
  password?: PasswordEntry | null;
  onSubmit: (passwordData: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

export const PasswordForm: React.FC<PasswordFormProps> = ({ password, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    website: '',
    username: '',
    password: '',
    notes: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const passwordGenerator = SecurePasswordGenerator.getInstance();

  useEffect(() => {
    if (password) {
      setFormData({
        website: password.website,
        username: password.username,
        password: password.password,
        notes: password.notes || ''
      });
    }
  }, [password]);

  useEffect(() => {
    setPasswordStrength(passwordGenerator.calculateStrength(formData.password));
  }, [formData.password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.website || !formData.username || !formData.password) return;
    
    // Check password strength before allowing submission
    const strength = passwordGenerator.calculateStrength(formData.password);
    if (strength < 30) {
      alert('Password is too weak! Please choose a stronger password with at least 8 characters including uppercase, lowercase, numbers, and symbols.');
      return;
    }
    
    const passwordEntry = new PasswordEntry(
      formData.website,
      formData.username,
      formData.password,
      formData.notes
    );
    onSubmit(passwordEntry);
  };

  const generatePassword = () => {
    const newPassword = passwordGenerator.generatePassword({
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true
    });
    setFormData(prev => ({ ...prev, password: newPassword }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card-bg rounded-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">
            {password ? 'Edit Password' : 'Add New Password'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Website */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Website/Service *
            </label>
            <input
              type="text"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Gmail, Facebook, GitHub"
              required
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Username/Email *
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your.email@example.com"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg px-3 py-2 pr-20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                placeholder="Enter password"
                required
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <button
                  type="button"
                  onClick={generatePassword}
                  className="text-slate-400 hover:text-blue-400 p-1 rounded-md hover:bg-slate-700 transition-colors"
                  title="Generate password"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-blue-400 p-1 rounded-md hover:bg-slate-700 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            {/* Password Strength */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-400">Password Strength</span>
                  <span className={`font-medium ${
                    passwordStrength < 30 ? 'text-red-400' :
                    passwordStrength < 60 ? 'text-yellow-400' :
                    passwordStrength < 80 ? 'text-blue-400' : 'text-green-400'
                  }`}>
                    {passwordGenerator.getStrengthLevel(passwordStrength)}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${passwordGenerator.getStrengthColor(passwordStrength)}`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
                {passwordStrength < 30 && (
                  <p className="text-red-400 text-xs mt-1">
                    ⚠️ Password is too weak. Use at least 8 characters with uppercase, lowercase, numbers, and symbols.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Any additional notes..."
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={passwordStrength < 30}
              className={`px-6 py-2 rounded-lg transition-colors ${
                passwordStrength < 30 
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {password ? 'Update' : 'Add'} Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};