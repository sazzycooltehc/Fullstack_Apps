
import React, { useState } from 'react';
import type { User } from './types';
import LoginPage from './components/LoginPage';
import MainPage from './components/MainPage';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  }

  return (
    <div className="min-h-screen">
      {!user ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <MainPage user={user} onLogout={handleLogout}/>
      )}
    </div>
  );
};

export default App;
