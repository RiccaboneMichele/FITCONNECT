// Navbar Component
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { User, LogOut, Settings, LayoutDashboard, Users, Calendar, Menu, X, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { languages } from '../../i18n/translations'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const { language, setLanguage, t } = useI18n()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const unreadMessages = 0 // TODO: Caricare dal backend

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'badge bg-purple-100 text-purple-800',
      trainer: 'badge bg-blue-100 text-blue-800',
      client: 'badge bg-green-100 text-green-800'
    }
    return badges[role] || 'badge'
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">FC</span>
            </div>
            <span className="text-xl font-bold text-gray-900">FitConnect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/trainers" className="text-gray-700 hover:text-primary-600 font-medium transition">
              {t('navTrainers')}
            </Link>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-2 py-1 bg-white"
              aria-label={t('language')}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 font-medium transition flex items-center gap-2">
                  <LayoutDashboard size={18} />
                  {t('navDashboard')}
                </Link>
                
                {user?.role === 'client' && (
                  <Link to="/sessions" className="text-gray-700 hover:text-primary-600 font-medium transition flex items-center gap-2">
                    <Calendar size={18} />
                    {t('navSessions')}
                  </Link>
                )}
                
                {(user?.is_admin || user?.role === 'admin') && (
                  <Link to="/admin" className="text-gray-700 hover:text-primary-600 font-medium transition flex items-center gap-2">
                    <Users size={18} />
                    {t('navAdmin')}
                  </Link>
                )}

                {/* Trainer Messages Notifications */}
                {user?.role === 'trainer' && (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="relative text-gray-700 hover:text-primary-600 font-medium transition flex items-center gap-2"
                    title={t('navMessages')}
                  >
                    <MessageCircle size={18} />
                    {unreadMessages > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
                        {unreadMessages > 99 ? '99+' : unreadMessages}
                      </span>
                    )}
                  </button>
                )}
                
                {/* User Dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <User size={18} className="text-primary-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium">{user?.name}</div>
                      <div className={getRoleBadge(user?.role) + " text-xs"}>
                        {user?.role}
                      </div>
                    </div>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                    >
                      <Settings size={16} />
                      {t('navProfile')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut size={16} />
                      {t('navLogout')}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium transition">
                  {t('navLogin')}
                </Link>
                <Link to="/register" className="btn-primary">
                  {t('navRegister')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('language')}</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-2 py-2 bg-white"
                  aria-label={t('language')}
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>{lang.label}</option>
                  ))}
                </select>
              </div>

              <Link
                to="/trainers"
                className="text-gray-700 hover:text-primary-600 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('navTrainers')}
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-primary-600 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('navDashboard')}
                  </Link>
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-primary-600 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('navProfile')}
                  </Link>
                  {(user?.is_admin || user?.role === 'admin') && (
                    <Link
                      to="/admin"
                      className="text-gray-700 hover:text-primary-600 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('navAdminPanel')}
                    </Link>
                  )}
                  {user?.role === 'trainer' && (
                    <Link
                      to="/dashboard"
                      className="text-gray-700 hover:text-primary-600 font-medium flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <MessageCircle size={18} />
                      {t('navMessages')}
                      {unreadMessages > 0 && (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-full">
                          {unreadMessages > 99 ? '99+' : unreadMessages}
                        </span>
                      )}
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="text-left text-red-600 font-medium"
                  >
                    {t('navLogout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-primary-600 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('navLogin')}
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary inline-block text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('navRegister')}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
