import React from 'react';

interface User {
  username: string;
  name: string;
}

interface HeaderProps {
  user: User;
  onLogout: () => void;
}


const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-700">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zM21 12H3" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-2.828 0-5.38-1.5-7.071-3.75M12 3c2.828 0 5.38 1.5 7.071 3.75" />
          </svg>
          <h1 className="text-2xl font-bold text-white tracking-tight">Client-Server App</h1>
        </div>
        <nav className="flex items-center space-x-4">
          <span className="text-gray-300">Welcome, <span className="font-bold text-white">{user.name}</span>!</span>
          <button 
            onClick={onLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition-colors"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
