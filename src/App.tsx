import React, { useState, useEffect } from 'react';
import { Building2, Lock, Mail, User, Eye, EyeOff } from 'lucide-react';
import { supabase } from './supabase';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        window.location.href = '/reset-password';
      }
      if (event === 'SIGNED_IN') {
        window.location.href = '/dashboard';
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const validatePassword = (password: string) => {
    if (password.length < 8) return 'Sua senha deve ter pelo menos 8 caracteres';
    if (!/[a-z]/.test(password)) return 'Sua senha deve ter pelo menos uma letra minuscula';
    if (!/[A-Z]/.test(password)) return 'Sua senha deve ter pelo menos uma letra maiuscula';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Sua senha deve ter pelo menos um caractere especial';
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'password') {
      setPasswordError(validatePassword(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setMessage('Intruções para reinicializar sua senha enviada para o e-mail!');
        return;
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        setMessage('Logado com sucesso!');
      } else {
        if (passwordError) {
          setMessage('Por favor corrija a senha antes de continuar');
          return;
        }

        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
            },
          },
        });
        if (error) throw error;
        setMessage('Inscrição feita com sucesso, verifique seu e-mail para confirmação.');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Aconteceu um erro');
    } finally {
      setLoading(false);
    }
  };

  const toggleForgotPassword = () => {
    setIsForgotPassword(!isForgotPassword);
    setMessage('');
    setFormData(prev => ({ ...prev, password: '' }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-semibold text-gray-900">FinanceApp</span>
          </div>
          {!isForgotPassword && (
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage('');
                setFormData({ name: '', email: '', password: '' });
              }}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {isLogin ? 'Cadastrar' : 'Acessar'}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto mt-16 px-4">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            {isForgotPassword 
              ? 'Reiniciar password'
              : isLogin 
                ? 'Acessar' 
                : 'Criar conta'}
          </h2>

          {message && (
            <div className={`mb-6 p-3 rounded ${
              message.includes('error') || message.includes('fix') 
                ? 'bg-red-100 text-red-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {!isLogin && !isForgotPassword && (
              <div className="mb-6">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 py-4"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 py-4"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {!isForgotPassword && (
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 py-4 ${
                      passwordError ? 'border-red-300' : ''
                    }`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="mt-2 text-sm text-red-600">{passwordError}</p>
                )}
              </div>
            )}

            {isLogin && !isForgotPassword && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={toggleForgotPassword}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Esqueceu sua senha?
                </button>
              </div>
            )}

            {isForgotPassword && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={toggleForgotPassword}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Voltar para o login
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                loading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {loading ? (
                <span>Processando...</span>
              ) : (
                isForgotPassword 
                  ? 'Enviar e-mail'
                  : isLogin 
                    ? 'Acessar' 
                    : 'Criar conta'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;