import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut,
  Sparkles,
  Crown,
  Shield
} from 'lucide-react';

export function ModernNavbar() {
  const [location, setLocation] = useLocation();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'Features', path: '/features' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'About', path: '/about' }
  ];

  const userMenuVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-1.5 sm:space-x-2 cursor-pointer"
            onClick={() => setLocation('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <motion.div
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-brand rounded-lg sm:rounded-xl p-1.5 sm:p-2"
                animate={{ 
                  boxShadow: [
                    '0 0 0 0 rgba(31, 184, 217, 0.4)',
                    '0 0 0 10px rgba(31, 184, 217, 0)',
                    '0 0 0 0 rgba(31, 184, 217, 0)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </motion.div>
            </div>
            <div className="hidden xs:block">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-brand bg-clip-text text-transparent">
                Hire Mzansi
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">South Africa's #1 CV Platform</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <motion.button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`text-sm font-medium transition-colors relative ${
                  location === item.path
                    ? 'text-brand-blue'
                    : scrolled 
                      ? 'text-gray-700 hover:text-brand-blue' 
                      : 'text-gray-800 hover:text-brand-blue'
                }`}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                {item.label}
                {location === item.path && (
                  <motion.div
                    className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-brand"
                    layoutId="activeTab"
                    initial={false}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
            {user ? (
              <div className="relative">
                <motion.button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center">
                    {user.isAdmin ? (
                      <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <User className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                  </div>
                  <span className="hidden md:block text-xs sm:text-sm font-medium max-w-24 lg:max-w-none truncate">
                    {user.name || user.email}
                  </span>
                  {user.isAdmin && (
                    <Badge variant="secondary" className="hidden lg:flex bg-yellow-400 text-yellow-900 text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </motion.button>

                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      variants={userMenuVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2"
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.name || user.email}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setLocation('/dashboard');
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Dashboard
                      </button>

                      {user.isAdmin && (
                        <button
                          onClick={() => {
                            setLocation('/admin/dashboard');
                            setIsMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Admin Dashboard
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setLocation('/settings');
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </button>

                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={() => {
                            signOut();
                            setIsMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => setLocation('/signin')}
                  className="text-xs sm:text-sm font-medium px-2 sm:px-4 py-1.5 sm:py-2"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => setLocation('/signup')}
                  className="btn-brand text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2"
                >
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Get Started</span>
                  <span className="xs:hidden">Start</span>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute top-16 left-0 right-0 bg-white shadow-lg border-t border-gray-200">
            <div className="p-4">
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      setLocation(item.path);
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left py-2 px-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              {user ? (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                  {user.isAdmin && (
                    <button
                      onClick={() => {
                        setLocation('/admin/dashboard');
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded flex items-center"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Dashboard
                    </button>
                  )}
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                  <Button
                    onClick={() => {
                      setLocation('/signin');
                      setIsMenuOpen(false);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => {
                      setLocation('/signup');
                      setIsMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.nav>
  );
}