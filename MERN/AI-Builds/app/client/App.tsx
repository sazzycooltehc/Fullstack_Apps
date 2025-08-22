import React, { useState } from 'react';
import Header from './components/Header';
import MainContent from './components/MainContent';
import Login from './components/Login';

interface User {
  username: string;
  name: string;
}

interface AuthData {
    token: string;
    user: User;
}

function App() {
  const [authData, setAuthData] = useState<AuthData | null>(null);

  const handleLoginSuccess = (data: AuthData) => {
    setAuthData(data);
  };
  
  const handleLogout = () => {
    setAuthData(null);
  };

  if (!authData) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-900 text-white">
      <Header user={authData.user} onLogout={handleLogout} />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <MainContent user={authData.user} />
      </main>
      <footer className="text-center p-4 text-gray-500 border-t border-gray-800">
        <p>&copy; {new Date().getFullYear()} Client-Server App. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
