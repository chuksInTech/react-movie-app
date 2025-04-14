import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogIn } from 'lucide-react';
import { useAuth } from './AuthContext';
import Search from './Search.jsx';


const Navbar = ({searchTerm, setSearchTerm}) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  return (
    <nav className="bg-gray-900 py-2 px-6 shadow-md">
  <div className="max-w-screen-xl mx-auto w-full">
    
    {/* Top Row: Logo + Buttons */}
    <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-2 sm:gap-0">
      <div className="flex justify-between items-center w-full sm:w-auto">
        <Link to="/" className="text-lg sm:text-xl md:text-2xl font-bold text-purple-500">MovieFinder</Link>

        {/* Mobile login/logout button stack */}
        <div className="sm:hidden flex items-center gap-2">
          {currentUser ? (
            <>
              <Link to="/user-profile" className="text-gray-300 hover:text-white">
              <User size={16} mr-2/>
              </Link>
              <button onClick={() => { logout(); navigate('/'); }} className="text-gray-300 hover:text-white">Logout</button>
            </>
          ) : (
            <Link to="/login" className="flex items-center text-gray-200 hover:text-white">
            <LogIn size={16} className='mr-1'/>
            <span>Login</span>
            </Link>
          )}
        </div>
      </div>

      {/* Desktop login/logout */}
      <div className="hidden sm:flex items-center space-x-4">
        {currentUser ? (
          <>
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
          </>
        ) : (
          <Link to="/login" className="flex items-center text-gray-300 hover:text-white">
            <LogIn size={18} className="mr-1" />
            <span>Login</span>
          </Link>
        )}
      </div>
    </div>

    {/* Full-width search bar under nav on mobile */}
    <div className="w-full mt-2 sm:mt-0 sm:max-w-md mx-auto px-2">
      <div className="relative">
        <Search 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          className="w-full pl-10 pr-3 py-2 rounded-md text-sm sm:text-base"
        />
      </div>
    </div>

  </div>
</nav>

  );
};

export default Navbar;
