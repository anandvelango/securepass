import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Edit, Trash2, Globe, User, Calendar } from 'lucide-react';
import { PasswordEntry } from '../models/Password';
import { ClipboardManager } from '../utils/ClipboardManager';

// Utility function to format dates safely
const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    return 'Unknown date';
  }
};

interface PasswordRowProps {
  password: PasswordEntry;
  onEdit: (password: PasswordEntry) => void;
  onDelete: (id: string) => void;
}

export const PasswordRow: React.FC<PasswordRowProps> = ({ password, onEdit, onDelete }) => {
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
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors">
      {/* Main Row Content */}
      <div className="flex items-center justify-between">
        {/* Left Side - Website, Username, Password */}
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            {/* Website Icon */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
            </div>
            
            {/* Website, Username, Password Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium truncate">{password.website}</h3>
              <div className="flex items-center space-x-4 mt-1">
                {/* Username Section */}
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300 text-sm">{password.username}</span>
                  <button
                    onClick={() => copyToClipboard(password.username, 'Username')}
                    className="text-slate-400 hover:text-blue-400 p-1 rounded-md hover:bg-slate-700 transition-colors"
                    title="Copy username"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                
                {/* Password Section */}
                <div className="flex items-center space-x-2">
                  <span className="text-slate-300 text-sm">Password:</span>
                  <div className="bg-slate-900 rounded px-2 py-1 font-mono text-sm">
                    <span className="text-white">
                      {showPassword ? password.password : '•'.repeat(password.password.length)}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-blue-400 p-1 rounded-md hover:bg-slate-700 transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(password.password, 'Password')}
                    className="text-slate-400 hover:text-blue-400 p-1 rounded-md hover:bg-slate-700 transition-colors"
                    title="Copy password"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              {/* Notes */}
              {password.notes && (
                <p className="text-slate-400 text-sm mt-1 truncate">{password.notes}</p>
              )}
              
              {/* Dates */}
              <div className="flex items-center space-x-4 mt-1 text-slate-500 text-xs">
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>Added {formatDate(password.createdAt)}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>Updated {formatDate(password.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Action Buttons */}
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => onEdit(password)}
            className="text-slate-400 hover:text-blue-400 p-2 rounded-md hover:bg-slate-700 transition-colors"
            title="Edit password"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(password.id)}
            className="text-slate-400 hover:text-red-400 p-2 rounded-md hover:bg-slate-700 transition-colors"
            title="Delete password"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Copy Feedback */}
      {copyFeedback && (
        <div className="text-green-400 text-sm text-center py-2 bg-green-400/10 rounded-lg mt-3">
          {copyFeedback}
        </div>
      )}
    </div>
  );
};
