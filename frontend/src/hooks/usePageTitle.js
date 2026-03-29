import { useEffect } from 'react'
import { translations } from '../i18n/translations'

/**
 * Hook per impostare il titolo della pagina nel browser tab
 * Formato: "FitConnect - [Section] - [Page]"
 * @param {string} section - Nome della sezione (es: "Home", "Finding Trainer", "Admin")
 * @param {string} page - Nome della pagina (es: "Trainers", "Dashboard")
 */
export const usePageTitle = (section = '', page = '') => {
  useEffect(() => {
    const lang = localStorage.getItem('fitconnect-lang') || 'it'
    const dict = translations[lang] || translations.en || translations.it

    const metaMap = {
      'Home': 'metaHome',
      'Finding Trainer': 'metaFindingTrainer',
      'Trainer Detail': 'metaTrainerDetail',
      'Booking Session': 'metaBookingSession',
      'Admin': 'metaAdmin',
      'Dashboard': 'metaDashboard',
      'Login': 'metaLogin',
      'Register': 'metaRegister',
      'User Profile': 'metaUserProfile',
      'Users': 'metaUsers',
      'Clients': 'metaClients',
      'Contacts': 'metaContacts',
      'Info': 'metaInfo',
      'Sessions': 'metaSessions'
    }

    const mapLabel = (value) => {
      const key = metaMap[value]
      if (!key) return value
      return dict[key] || translations.en?.[key] || translations.it?.[key] || value
    }

    let title = 'FitConnect'
    const translatedSection = mapLabel(section)
    const translatedPage = mapLabel(page)
    
    if (translatedSection && translatedPage) {
      title = `${title} - ${translatedSection} - ${translatedPage}`
    } else if (translatedSection) {
      title = `${title} - ${translatedSection}`
    }
    
    document.title = title
    
    return () => {
      document.title = `FitConnect - ${dict.metaDefaultTagline || translations.en?.metaDefaultTagline || translations.it?.metaDefaultTagline || 'FitConnect'}`
    }
  }, [section, page])
}
