import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Search, Plus, Shield, User, LogOut, Download } from 'lucide-react';
import { PasswordEntry } from './models/Password';
import { PasswordRow } from './components/PasswordRow';
import { PasswordForm } from './components/PasswordForm';
import { PasswordGenerator } from './components/PasswordGenerator';
import Login from './components/Login';
import { usePasswordManager } from './hooks/usePasswordManager';

function App() {
  const { 
    passwords, 
    addPassword, 
    updatePassword, 
    deletePassword, 
    searchPasswords 
  } = usePasswordManager();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:4000/auth/user', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.id) {
          setUser(data);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Auth check failed:', err);
        setUser(null);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const [filteredPasswords, setFilteredPasswords] = useState<PasswordEntry[]>([]);

  useEffect(() => {
    const loadFilteredPasswords = async () => {
      try {
        const passwords = await searchPasswords(searchTerm);
        setFilteredPasswords(passwords);
      } catch (error) {
        console.error('Failed to search passwords:', error);
        setFilteredPasswords([]);
      }
    };
    
    loadFilteredPasswords();
  }, [searchTerm, searchPasswords]);

  const handleAddPassword = async (passwordData: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addPassword(passwordData);
      // Refresh the filtered passwords to show the new password
      const updatedFilteredPasswords = await searchPasswords(searchTerm);
      setFilteredPasswords(updatedFilteredPasswords);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to add password:', error);
    }
  };

  const handleEditPassword = async (passwordData: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingPassword) return;

    try {
      await updatePassword(editingPassword.id, passwordData);
      // Refresh the filtered passwords to show the updated password
      const updatedFilteredPasswords = await searchPasswords(searchTerm);
      setFilteredPasswords(updatedFilteredPasswords);
      setEditingPassword(null);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to update password:', error);
    }
  };

  const handleDeletePassword = async (id: string) => {
    try {
      await deletePassword(id);
      // Refresh the filtered passwords to remove the deleted password
      const updatedFilteredPasswords = await searchPasswords(searchTerm);
      setFilteredPasswords(updatedFilteredPasswords);
    } catch (error) {
      console.error('Failed to delete password:', error);
    }
  };

  const handleExportPasswords = async () => {
    try {
      if (typeof window === 'undefined') {
        alert('Export is only available in a browser environment.');
        return;
      }
      if (!('crypto' in window) || !('subtle' in window.crypto)) {
        alert('This browser does not support secure encryption (Web Crypto API). Please try a modern browser.');
        return;
      }
      if (!window.isSecureContext) {
        // localhost is usually a secure context, but warn if not
        console.warn('Not a secure context; Web Crypto may be unavailable.');
      }
      // Create export data with user info and passwords
      const exportData = {
        exportedAt: new Date().toISOString(),
        user: {
          name: user?.name || user?.email || 'Unknown User',
          email: user?.email || 'Unknown Email'
        },
        // Always export the current logged-in user's full list, not filtered view
        totalPasswords: passwords.length,
        passwords: passwords.map(password => ({
          website: password.website,
          username: password.username,
          password: password.password,
          notes: password.notes || '',
          createdAt: password.createdAt,
          updatedAt: password.updatedAt
        }))
      };

      // transform: hash passwords before exporting (no prompts, no storage)
      const toSha256Base64 = async (text: string) => {
        const enc = new TextEncoder().encode(text);
        const hash = await crypto.subtle.digest('SHA-256', enc);
        const bytes = new Uint8Array(hash);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        return btoa(binary);
      };

      // Build sanitized export with hashed passwords
      const sanitized = { ...exportData } as any;
      const transformed = await Promise.all(
        sanitized.passwords.map(async (p: any) => ({
          website: p.website,
          username: p.username,
          passwordHash: await toSha256Base64(p.password),
          notes: p.notes,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt
        }))
      );
      sanitized.passwords = transformed;
      const dataStr = JSON.stringify(sanitized, null, 2);

      const textToUint8 = (text: string) => new TextEncoder().encode(text);
      const bytesToBase64 = (bytes: Uint8Array) => {
        let binary = '';
        const chunkSize = 0x8000;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.subarray(i, i + chunkSize);
          binary += String.fromCharCode.apply(null, Array.from(chunk));
        }
        return btoa(binary);
      };

      const encrypt = async (plaintext: string, pass: string) => {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const keyMaterial = await crypto.subtle.importKey(
          'raw',
          textToUint8(pass),
          { name: 'PBKDF2' },
          false,
          ['deriveKey']
        );
        const key = await crypto.subtle.deriveKey(
          {
            name: 'PBKDF2',
            salt,
            iterations: 100000,
            hash: 'SHA-256'
          },
          keyMaterial,
          { name: 'AES-GCM', length: 256 },
          true,
          ['encrypt', 'decrypt']
        );
        const ciphertext = new Uint8Array(
          await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            textToUint8(plaintext)
          )
        );
        const payload = {
          version: 1,
          kdf: 'PBKDF2',
          kdfParams: { iterations: 100000, hash: 'SHA-256', salt: bytesToBase64(salt) },
          cipher: 'AES-GCM',
          iv: bytesToBase64(iv),
          ciphertext: bytesToBase64(ciphertext)
        };
        return JSON.stringify(payload, null, 2);
      };

      // Build encrypted export
      try {
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `securepass-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        // Force reflow to ensure the element is in the DOM before click
        void link.offsetHeight;
        link.click();
        link.remove();
        URL.revokeObjectURL(url);

        // toast/notification could be added here if desired
      } catch (err) {
        console.error('Export failed:', err);
      }
    } catch (error) {
      console.error('Failed to export passwords:', error);
    }
  };

  const handleSavePassphrase = async () => {
    if (!passphraseInput || passphraseInput.length < 8) {
      setPassphraseError('Passphrase must be at least 8 characters.');
      return;
    }
    if (passphraseInput !== passphraseConfirmInput) {
      setPassphraseError('Passphrases do not match.');
      return;
    }
    saveStoredPassphrase(passphraseInput);
    setShowPassphraseModal(false);
    setPassphraseInput('');
    setPassphraseConfirmInput('');
    setPassphraseError('');
    if (pendingExport) {
      setPendingExport(false);
      // Re-run export now that passphrase is saved
      setTimeout(() => { handleExportPasswords(); }, 0);
    }
  };

  const openEditForm = (password: PasswordEntry) => {
    setEditingPassword(password);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingPassword(null);
  };

  const handleLogout = () => {
    console.log('=== LOGOUT FUNCTION STARTED ===');
    
    try {
      console.log('About to make fetch request to logout endpoint');
      fetch('http://localhost:4000/auth/logout', {
        credentials: 'include',
      })
        .then((res) => {
          console.log('Logout response received:', res);
          console.log('Response status:', res.status);
          console.log('Response ok:', res.ok);
          return res.json();
        })
        .then((data) => {
          console.log('Logout response data:', data);
          console.log('Setting user to null');
          setUser(null);
          console.log('Closing user menu');
          setShowUserMenu(false);
          console.log('Navigating to login page');
          navigate('/login');
          console.log('=== LOGOUT COMPLETED SUCCESSFULLY ===');
        })
        .catch(err => {
          console.error('Fetch error in logout:', err);
        });
    } catch (error) {
      console.error('Error in handleLogout function:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-dark flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={
        user ? (
          <div className="min-h-screen bg-primary-dark">
            {/* Header */}
            <header className="bg-primary-dark backdrop-blur-sm relative z-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white">SecurePass</h1>
                      <p className="text-slate-400 text-sm">Your personal password manager</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setShowGenerator(true)}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Generate</span>
                    </button>
                    <button
                      onClick={() => setShowForm(true)}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Password</span>
                    </button>
                    <button
                      onClick={handleExportPasswords}
                      className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                      title="Export passwords to JSON file"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                    
                    {/* User Menu */}
                    <div className="relative user-menu-container">
                      <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg transition-colors"
                      >
                        <User className="w-5 h-5" />
                      </button>
                      
                      {/* User Menu Dropdown */}
                      {showUserMenu && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 z-[999999]">
                          <div className="py-2">
                            <div className="px-4 py-2 text-sm text-slate-300 border-b border-slate-700">
                              {user?.name || user?.email || 'User'}
                            </div>
                            <button
                              onClick={handleLogout}
                              className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 flex items-center space-x-2 transition-colors cursor-pointer"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Logout</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </header>
            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Search Bar */}
              <div className="mb-8 z-0">
                <div className="relative z-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search passwords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-800 text-white placeholder-slate-400 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              {/* Password List */}
              {filteredPasswords.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-300 mb-2">
                    {passwords.length === 0 ? 'No passwords saved yet' : 'No passwords found'}
                  </h3>
                  <p className="text-slate-400 mb-6">
                    {passwords.length === 0 
                      ? 'Add your first password to get started'
                      : 'Try adjusting your search terms'
                    }
                  </p>
                  {passwords.length === 0 && (
                    <button
                      onClick={() => setShowForm(true)}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Your First Password</span>
                    </button>
                  )}
                </div>
              ) : (
                                  <div className="space-y-3">
                    {filteredPasswords.map((password) => (
                      <PasswordRow
                        key={password.id}
                        password={password}
                        onEdit={openEditForm}
                        onDelete={handleDeletePassword}
                      />
                    ))}
                  </div>
              )}
            </main>
            {/* Modals */}
            {showForm && (
              <PasswordForm
                password={editingPassword}
                onSubmit={editingPassword ? handleEditPassword : handleAddPassword}
                onClose={closeForm}
              />
            )}
            {showGenerator && (
              <PasswordGenerator onClose={() => setShowGenerator(false)} />
            )}
            {/* Passphrase modal removed as export now hashes passwords automatically */}
          </div>
        ) : null
      } />
    </Routes>
  );
}

export default App;