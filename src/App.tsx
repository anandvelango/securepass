import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Search, Plus, Shield } from 'lucide-react';
import { PasswordEntry } from './models/Password';
import { PasswordCard } from './components/PasswordCard';
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
      });
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const filteredPasswords = searchPasswords(searchTerm);

  const handleAddPassword = (passwordData: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    addPassword(passwordData);
    setShowForm(false);
  };

  const handleEditPassword = (passwordData: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingPassword) return;

    updatePassword(editingPassword.id, passwordData);
    setEditingPassword(null);
    setShowForm(false);
  };

  const handleDeletePassword = (id: string) => {
    deletePassword(id);
  };

  const openEditForm = (password: PasswordEntry) => {
    setEditingPassword(password);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingPassword(null);
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={
        user ? (
          <div className="min-h-screen bg-primary-dark">
            {/* Header */}
            <header className="bg-primary-dark backdrop-blur-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                  </div>
                </div>
              </div>
            </header>
            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Search Bar */}
              <div className="mb-8">
                <div className="relative">
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
              {/* Password Grid */}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPasswords.map((password) => (
                    <PasswordCard
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
          </div>
        ) : null
      } />
    </Routes>
  );
}

export default App;