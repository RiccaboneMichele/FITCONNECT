import { createContext, useContext, useMemo, useState } from 'react'
import { languages, translations } from './translations'

const I18nContext = createContext(null)

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

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(() => normalizeLanguageCode(localStorage.getItem('fitconnect-lang') || 'it'))

  const changeLanguage = (nextLanguage) => {
    const normalized = normalizeLanguageCode(nextLanguage)
    setLanguage(normalized)
    localStorage.setItem('fitconnect-lang', normalized)
  }

  const value = useMemo(() => {
    const dict = translations[language] || translations.it
    const t = (key) => dict[key] || translations.en[key] || translations.it[key] || key
    return { language, setLanguage: changeLanguage, t }
  }, [language])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return ctx
}
