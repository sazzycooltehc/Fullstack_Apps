
import React, { useState } from 'react';
import type { User } from '../types';
import { loginApi } from '../services/mockApi';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const user = await loginApi(username, password);
      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <header className="absolute top-0 left-0 w-full p-6 bg-white shadow-md">
            <h1 className="text-3xl font-bold text-center text-primary">Gemini Content Explorer</h1>
        </header>
        <div className="p-10 bg-white rounded-xl shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold text-center text-text-main mb-2">Welcome Back!</h2>
            <p className="text-center text-text-light mb-8">Sign in to continue</p>
            <form onSubmit={handleSubmit}>
                <div className="mb-6">
                    <label htmlFor="username" className="block text-sm font-medium text-text-light mb-2">Username</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="user"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="password" className="block text-sm font-medium text-text-light mb-2">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="password"
                        required
                    />
                </div>
                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-hover transition-colors duration-300 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                    {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
                 <p className="text-xs text-gray-400 text-center mt-4">Hint: user / password</p>
            </form>
        </div>
    </div>
  );
};

export default LoginPage;
