import React, { useState, useRef, useEffect } from 'react';
import { Globe, Menu, UserCircle, LogOut, Plus, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMessages } from '../hooks/useMessages';
import SearchBar from './SearchBar';
import AuthModal from './AuthModal';

export default function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { conversations, loading } = useMessages(user?.id);

  const unreadCount = conversations.filter(conv => 
    conv.lastMessage && !conv.lastMessage.read && conv.lastMessage.receiverId === user?.id
  ).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 w-full bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Globe className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">LocalXplore</span>
          </Link>

          <SearchBar />

          <nav className="flex items-center space-x-4">
            {user && (
              <>
                <button
                  onClick={() => navigate('/create-experience')}
                  className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create Experience</span>
                </button>
                <button
                  onClick={() => navigate('/messages')}
                  className="relative p-2 hover:bg-gray-100 rounded-full text-gray-600 hover:text-gray-900"
                >
                  <MessageSquare className="h-5 w-5" />
                  {!loading && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </>
            )}
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Globe className="h-5 w-5" />
            </button>
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 border rounded-full p-2 hover:shadow-md cursor-pointer"
                >
                  <Menu className="h-5 w-5" />
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-6 w-6 rounded-full"
                    />
                  ) : (
                    <UserCircle className="h-6 w-6" />
                  )}
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      {user.name}
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate('/messages');
                      }}
                      className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <span>Messages</span>
                      {!loading && unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center space-x-2 border rounded-full p-2 hover:shadow-md"
              >
                <Menu className="h-5 w-5" />
                <UserCircle className="h-6 w-6" />
              </button>
            )}
          </nav>
        </div>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
}