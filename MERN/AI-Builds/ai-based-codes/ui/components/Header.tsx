import React from 'react';
import type { User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      <div/>
      <div className="flex items-center">
        <span className="text-text-light mr-4">Hi, <span className="font-semibold text-text-main">{user.name}</span></span>
        <button
          onClick={onLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
