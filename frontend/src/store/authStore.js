// Auth Store - Zustand state management per autenticazione
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'
import { languages, translations } from '../i18n/translations'

const normalizeLanguageCode = (rawCode) => {
  const code = String(rawCode || '').trim()
  const supportedCodes = languages.map((item) => item.code)

  if (supportedCodes.includes(code)) return code

  const lowerCode = code.toLowerCase()
  const mapped = supportedCodes.find((supported) => supported.toLowerCase() === lowerCode)
  if (mapped) return mapped

  if (lowerCode.startsWith('es')) return 'es-MX'
  if (lowerCode.startsWith('fr')) return 'fr'
  if (lowerCode.startsWith('ko')) return 'ko'
  if (lowerCode.startsWith('ja')) return 'ja'
  if (lowerCode.startsWith('zh')) return 'zh'
  if (lowerCode.startsWith('en')) return 'en'
  if (lowerCode.startsWith('it')) return 'it'

  return 'it'
}

const getI18nText = (key) => {
  const lang = normalizeLanguageCode(localStorage.getItem('fitconnect-lang') || 'it')
  const dict = translations[lang] || translations.en || translations.it
  return dict?.[key] || translations.en?.[key] || translations.it?.[key] || key
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email, password) => {
        set({ isLoading: true, error: null })
        
        try {
          const data = await authAPI.login(email, password)
          
          // Salva token e user
          localStorage.setItem('access_token', data.access_token)
          
          set({
            user: data.user,
            token: data.access_token,
            isAuthenticated: true,
            isLoading: false,
          })
          
          toast.success(`${getI18nText('authWelcome')}, ${data.user.name}!`)
          return data
        } catch (error) {
          const errorMessage = error.response?.data?.detail || getI18nText('authLoginError')
          set({ error: errorMessage, isLoading: false })
          toast.error(errorMessage)
          throw error
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null })
        
        try {
          const data = await authAPI.register(userData)
          
          toast.success(getI18nText('authRegisterSuccess'))
          set({ isLoading: false })
          return data
        } catch (error) {
          const errorMessage = error.response?.data?.detail || getI18nText('authRegisterError')
          set({ error: errorMessage, isLoading: false })
          toast.error(errorMessage)
          throw error
        }
      },

      logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
        
        toast.success(getI18nText('authLogoutSuccess'))
      },

      refreshUser: async () => {
        try {
          const userData = await authAPI.getCurrentUser()
          set({ user: userData })
        } catch (error) {
          console.error('Failed to refresh user:', error)
          get().logout()
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'fitconnect-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
