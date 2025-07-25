import React, { useState, useEffect } from 'react';
import { X, Copy, RefreshCw } from 'lucide-react';
import { IPasswordGeneratorOptions } from '../models/Password';
import { SecurePasswordGenerator } from '../services/PasswordGenerator';
import { ClipboardManager } from '../utils/ClipboardManager';

interface PasswordGeneratorProps {
  onClose: () => void;
}

export const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({ onClose }) => {
  const [options, setOptions] = useState<IPasswordGeneratorOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true
  });
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copyFeedback, setCopyFeedback] = useState('');
  const passwordGenerator = SecurePasswordGenerator.getInstance();
  const clipboardManager = ClipboardManager.getInstance();

  useEffect(() => {
    generateNewPassword();
  }, [options]);

  const generateNewPassword = () => {
    const password = passwordGenerator.generatePassword(options);
    setGeneratedPassword(password);
  };

  const copyToClipboard = async () => {
    const success = await clipboardManager.copyToClipboard(generatedPassword);
    if (success) {
      setCopyFeedback('Password copied!');
    } else {
      setCopyFeedback('Failed to copy');
    }
    setTimeout(() => setCopyFeedback(''), 2000);
  };

  const updateOption = (key: keyof IPasswordGeneratorOptions, value: boolean | number) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const passwordStrength = passwordGenerator.calculateStrength(generatedPassword);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card-bg rounded-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Password Generator</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Generated Password */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Generated Password
            </label>
            <div className="relative">
              <div className="bg-slate-900 border border-slate-600 rounded-lg p-3 font-mono text-white break-all">
                {generatedPassword}
              </div>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <button
                  onClick={generateNewPassword}
                  className="text-slate-400 hover:text-blue-400 p-1 rounded-md hover:bg-slate-700 transition-colors"
                  title="Generate new password"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={copyToClipboard}
                  className="text-slate-400 hover:text-blue-400 p-1 rounded-md hover:bg-slate-700 transition-colors"
                  title="Copy password"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Password Strength */}
            <div className="mt-2">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-400">Strength</span>
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
            </div>

            {copyFeedback && (
              <div className="text-green-400 text-sm text-center mt-2 py-2 bg-green-400/10 rounded-lg">
                {copyFeedback}
              </div>
            )}
          </div>

          {/* Length Slider */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Length: {options.length}
            </label>
            <input
              type="range"
              min="8"
              max="64"
              value={options.length}
              onChange={(e) => updateOption('length', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>8</span>
              <span>64</span>
            </div>
          </div>

          {/* Character Options */}
          <div className="space-y-3">
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Include Characters
            </label>
            
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeUppercase}
                  onChange={(e) => updateOption('includeUppercase', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-3 text-white">Uppercase letters (A-Z)</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeLowercase}
                  onChange={(e) => updateOption('includeLowercase', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-3 text-white">Lowercase letters (a-z)</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeNumbers}
                  onChange={(e) => updateOption('includeNumbers', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-3 text-white">Numbers (0-9)</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeSymbols}
                  onChange={(e) => updateOption('includeSymbols', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-3 text-white">Symbols (!@#$%^&*)</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              onClick={generateNewPassword}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Generate New</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};