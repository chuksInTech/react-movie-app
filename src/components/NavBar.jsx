import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogIn } from 'lucide-react';
import { useAuth } from './AuthContext';
import Search from './search.jsx';


const Navbar = ({searchTerm, setSearchTerm}) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  return (
    <nav className="bg-gray-900 py-2 px-6 shadow-md">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center w-full">
        <div className="flex items-center">
          <Link to="/" className="text-lg sm:text-xl md:text-2xl font-bold text-purple-500">MovieFinder</Link>
        </div>
        
        <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md px-4 flex-1 flex-nowrap">
          <div className="relative">
            <Search 
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            className="absolute left-3 top-2.5 text-gray-400" />
            <h1 className="text-white">{searchTerm}</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {currentUser ? (
            <div className="flex items-center space-x-4">
              <Link to="/user-profile" className="flex items-center text-gray-300 hover:text-white">
                <User size={18} className="mr-1" />
                <span className="hidden sm:inline">Profile</span>
              </Link>
              <button 
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="text-gray-300 hover:text-white"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="flex items-center text-gray-300 hover:text-white">
              <LogIn size={18} className="mr-1" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
