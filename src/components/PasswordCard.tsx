import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Edit, Trash2, Globe, User, Calendar } from 'lucide-react';
import { PasswordEntry } from '../models/Password';
import { ClipboardManager } from '../utils/ClipboardManager';

interface PasswordCardProps {
  password: PasswordEntry;
  onEdit: (password: PasswordEntry) => void;
  onDelete: (id: string) => void;
}

export const PasswordCard: React.FC<PasswordCardProps> = ({ password, onEdit, onDelete }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState('');
  const clipboardManager = ClipboardManager.getInstance();

  const copyToClipboard = async (text: string, type: string) => {
    const success = await clipboardManager.copyToClipboard(text);
    if (success) {
      setCopyFeedback(`${type} copied!`);
    } else {
      setCopyFeedback('Failed to copy');
    }
    setTimeout(() => setCopyFeedback(''), 2000);
  };

  return (
    <div className="bg-card-bg rounded-xl p-6 transition-all duration-200 hover:transform hover:scale-[1.02]">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600/20 p-2 rounded-lg">
            <Globe className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg truncate">{password.website}</h3>
            <p className="text-slate-400 text-sm">Added {password.getFormattedDate('createdAt')}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(password)}
            className="text-slate-400 hover:text-blue-400 p-1 rounded-md hover:bg-slate-700 transition-colors"
            title="Edit password"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(password.id)}
            className="text-slate-400 hover:text-red-400 p-1 rounded-md hover:bg-slate-700 transition-colors"
            title="Delete password"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Username */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300 text-sm">Username</span>
          </div>
          <button
            onClick={() => copyToClipboard(password.username, 'Username')}
            className="text-slate-400 hover:text-blue-400 p-1 rounded-md hover:bg-slate-700 transition-colors"
            title="Copy username"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <p className="text-white mt-1 break-all">{password.username}</p>
      </div>

      {/* Password */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <span className="text-slate-300 text-sm">Password</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-blue-400 p-1 rounded-md hover:bg-slate-700 transition-colors"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={() => copyToClipboard(password.password, 'Password')}
              className="text-slate-400 hover:text-blue-400 p-1 rounded-md hover:bg-slate-700 transition-colors"
              title="Copy password"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="bg-slate-900 rounded-lg p-3 mt-1 font-mono">
          <span className="text-white">
            {showPassword ? password.password : '•'.repeat(password.password.length)}
          </span>
        </div>
      </div>

      {/* Notes */}
      {password.notes && (
        <div className="mb-4">
          <span className="text-slate-300 text-sm">Notes</span>
          <p className="text-slate-400 text-sm mt-1">{password.notes}</p>
        </div>
      )}

      {/* Copy Feedback */}
      {copyFeedback && (
        <div className="text-green-400 text-sm text-center py-2 bg-green-400/10 rounded-lg">
          {copyFeedback}
        </div>
      )}

      {/* Last Updated */}
      <div className="flex items-center text-slate-500 text-xs pt-4 border-t border-primary">
        <Calendar className="w-3 h-3 mr-1" />
        <span>Updated {password.getFormattedDate('updatedAt')}</span>
      </div>
    </div>
  );
};