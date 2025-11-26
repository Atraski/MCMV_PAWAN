import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import ProfileDropdown from './ProfileDropdown';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleProfileClick = () => {
    if (isAuthenticated) {
      setIsProfileDropdownOpen(!isProfileDropdownOpen);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="relative w-full">
      {/* Mobile View - Top Dark Gray Bar */}
      <div className="md:hidden bg-gray-800 px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="text-lg font-bold">
            <span className="text-gray-300">MyCity</span>
            <span className="text-[#FFD700]">MyVoice</span>
          </span>
        </Link>

          {/* Right Side - Profile Button and Hamburger */}
          <div className="flex items-center gap-3">
            {/* Profile Button - Orange Square */}
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={handleProfileClick}
                  className="bg-[#FFA500] hover:bg-[#FF8C00] w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
                >
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name || 'User'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
                </button>
                
                {/* Profile Dropdown for Mobile */}
                <ProfileDropdown
                  isOpen={isProfileDropdownOpen}
                  onClose={() => setIsProfileDropdownOpen(false)}
                  user={user}
                />
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-[#FFA500] hover:bg-[#FF8C00] w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>
            )}

          {/* Hamburger Menu */}
          <button
            onClick={toggleMobileMenu}
            className="text-white hover:text-[#FFD700] transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Yellow Navigation Sidebar */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gradient-to-r from-[#FFD700] via-[#FFE44D] to-[#FFF8DC] px-4 py-6 shadow-lg">
          <div className="flex flex-col space-y-4">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-900 hover:text-[#B8860B] font-medium text-base transition-colors"
            >
              Home
            </Link>
            <Link
              to="/meet-the-team"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-900 hover:text-[#B8860B] font-medium text-base transition-colors"
            >
              Meet the Team
            </Link>
            <Link
              to="/brand-collaboration"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-900 hover:text-[#B8860B] font-medium text-base transition-colors"
            >
              Brand Collaboration
            </Link>
            <Link
              to="/events"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-900 hover:text-[#B8860B] font-medium text-base transition-colors"
            >
              Upcoming Events
            </Link>
            <Link
              to="/events/past"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-900 hover:text-[#B8860B] font-medium text-base transition-colors"
            >
              Past Events
            </Link>
            <Link
              to="/news"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-900 hover:text-[#B8860B] font-medium text-base transition-colors"
            >
              News
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-900 hover:text-[#B8860B] font-medium text-base transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-900 hover:text-red-600 font-medium text-base transition-colors text-left"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Desktop View - Main Navbar */}
      <div className="hidden md:block bg-gradient-to-r from-[#FFD700] via-[#FFE44D] to-[#FFF8DC]">
        <div className="w-full">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Left Side */}
            <div className="flex-shrink-0 flex items-center pl-4 lg:pl-6">
              <Link to="/" className="flex items-center">
                <span className="text-xl sm:text-2xl font-bold whitespace-nowrap">
                  <span className="text-gray-900">MyCity</span>
                  <span className="text-[#B8860B]">MyVoice</span>
                </span>
              </Link>
            </div>

            {/* Navigation Links - Center */}
            <div className="flex-1 flex items-center justify-center px-2 sm:px-4">
              <div className="flex items-center space-x-4 sm:space-x-6 lg:space-x-8">
                <Link
                  to="/"
                  className="text-gray-900 hover:text-[#B8860B] font-medium text-xs sm:text-sm transition-colors duration-200 whitespace-nowrap"
                >
                  Home
                </Link>
                <Link
                  to="/meet-the-team"
                  className="text-gray-900 hover:text-[#B8860B] font-medium text-xs sm:text-sm transition-colors duration-200 whitespace-nowrap"
                >
                  Meet the Team
                </Link>
                <Link
                  to="/brand-collaboration"
                  className="text-gray-900 hover:text-[#B8860B] font-medium text-xs sm:text-sm transition-colors duration-200 whitespace-nowrap"
                >
                  Brand Collaboration
                </Link>
                <Link
                  to="/events"
                  className="text-gray-900 hover:text-[#B8860B] font-medium text-xs sm:text-sm transition-colors duration-200 whitespace-nowrap"
                >
                  Upcoming Events
                </Link>
                <Link
                  to="/events/past"
                  className="text-gray-900 hover:text-[#B8860B] font-medium text-xs sm:text-sm transition-colors duration-200 whitespace-nowrap"
                >
                  Past Events
                </Link>
                <Link
                  to="/news"
                  className="text-gray-900 hover:text-[#B8860B] font-medium text-xs sm:text-sm transition-colors duration-200 whitespace-nowrap"
                >
                  News
                </Link>
              </div>
            </div>

            {/* User Button - Right Side */}
            <div className="flex-shrink-0 flex items-center gap-2 pr-4 lg:pr-6">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={handleProfileClick}
                    className="bg-[#FFA500] hover:bg-[#FF8C00] w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm"
                  >
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name || 'User'}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold text-sm">
                        {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </button>
                  
                  {/* Profile Dropdown */}
                  <ProfileDropdown
                    isOpen={isProfileDropdownOpen}
                    onClose={() => setIsProfileDropdownOpen(false)}
                    user={user}
                  />
                </div>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-[#FFA500] hover:bg-[#FF8C00] text-gray-900 font-medium px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm whitespace-nowrap"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </nav>
  );
};

export default Navbar;

