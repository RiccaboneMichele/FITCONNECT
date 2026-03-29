// Register Page
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { User, Mail, Lock, UserPlus, AlertCircle } from 'lucide-react'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useI18n } from '../../i18n/I18nProvider'

export default function RegisterPage() {
  const { t } = useI18n()
  usePageTitle('Register')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { register, isLoading, error } = useAuthStore()
  const roleFromQuery = searchParams.get('role') === 'trainer' ? 'trainer' : 'client'
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: roleFromQuery
  })

  const [validationError, setValidationError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setValidationError(t('registerPasswordMismatch'))
      return
    }
    
    if (formData.password.length < 6) {
      setValidationError(t('registerPasswordMin'))
      return
    }
    
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      })
      navigate('/login')
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

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50 py-12 px-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserPlus size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('registerTitle')}</h1>
            <p className="text-gray-600">{t('registerSubtitle')}</p>
          </div>

          {/* Error Messages */}
          {(error || validationError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error || validationError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                {t('registerFullName')}
              </label>
              <div className="relative">
                <User size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input pl-10"
                              placeholder={t('authNamePlaceholder')}
                />
              </div>
            </div>

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

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                {t('registerAccountType')}
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input"
              >
                <option value="client">{t('registerClientOption')}</option>
                <option value="trainer">{t('registerTrainerOption')}</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {formData.role === 'client' 
                  ? `🏃‍♂️ ${t('registerClientHint')}`
                  : `💪 ${t('registerTrainerHint')}`
                }
              </p>
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
                  minLength={6}
                  className="input pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                {t('registerConfirmPassword')}
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="input pl-10"
                  placeholder="••••••••"
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
                  {t('registerInProgress')}
                </span>
              ) : (
                t('registerTitle')
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t('authAlreadyAccount')}{' '}
              <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">
                {t('authLoginTitle')}
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
