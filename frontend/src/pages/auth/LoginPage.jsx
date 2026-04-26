// Login Page
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useI18n } from '../../i18n/I18nProvider'

export default function LoginPage() {
  const { t } = useI18n()
  usePageTitle('Login')
  const navigate = useNavigate()
  const { login, isLoading, error } = useAuthStore()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      await login(formData.email, formData.password)
      navigate('/dashboard')
    } catch (error) {
      // Error handled by store
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const fillDemoCredentials = (role) => {
    const credentials = {
      admin: { email: 'admin@fitconnect.com', password: 'admin123' },
      trainer: { email: 'marco.trainer@fitconnect.com', password: 'trainer123' },
      client: { email: 'luca.client@fitconnect.com', password: 'client123' }
    }
    setFormData(credentials[role])
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50 py-12 px-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogIn size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('authLoginTitle')}</h1>
            <p className="text-gray-600">{t('authLoginSubtitle')}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('authEmail')}
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input pl-10"
                  placeholder={t('authEmailPlaceholder')}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('authPassword')}
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input pl-10"
                  placeholder={t('authPasswordPlaceholder')}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="spinner w-5 h-5 border-2"></div>
                  {t('authLoggingIn')}
                </span>
              ) : (
                t('authLoginTitle')
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-700 mb-2">🎯 {t('authDemoCredentials')}</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => fillDemoCredentials('admin')}
                className="text-xs btn-secondary py-1.5"
              >
                {t('authDemoAdmin')}
              </button>
              <button
                onClick={() => fillDemoCredentials('trainer')}
                className="text-xs btn-secondary py-1.5"
              >
                {t('authDemoTrainer')}
              </button>
              <button
                onClick={() => fillDemoCredentials('client')}
                className="text-xs btn-secondary py-1.5"
              >
                {t('authDemoClient')}
              </button>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t('authNoAccount')}{' '}
              <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700">
                {t('authRegisterNow')}
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {t('authTermsPrefix')}{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700">{t('authTermsLabel')}</a>
            {' '}{t('authAnd')}{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700">{t('authPrivacyLabel')}</a>
          </p>
        </div>
      </div>
    </div>
  )
}
