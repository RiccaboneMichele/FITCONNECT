// Footer Component
import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const { t } = useI18n()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">FC</span>
              </div>
              <span className="text-xl font-bold text-white">FitConnect</span>
            </div>
            <p className="text-sm text-gray-400">
              {t('footerBrandText')}
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footerUseful')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/trainers" className="hover:text-primary-400 transition">{t('navTrainers')}</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary-400 transition">{t('navDashboard')}</Link></li>
              <li><Link to="/profile" className="hover:text-primary-400 transition">{t('navProfile')}</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footerInfo')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/info/chi-siamo" className="hover:text-primary-400 transition">{t('footerAbout')}</Link></li>
              <li><Link to="/info/scopri-di-piu" className="hover:text-primary-400 transition">{t('footerDiscover')}</Link></li>
              <li><Link to="/info/privacy-policy" className="hover:text-primary-400 transition">{t('footerPrivacy')}</Link></li>
              <li><Link to="/info/termini-di-servizio" className="hover:text-primary-400 transition">{t('footerTerms')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footerContacts')}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Mail size={16} className="mt-1 flex-shrink-0" />
                <span>info@fitconnect.com</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone size={16} className="mt-1 flex-shrink-0" />
                <span>+39 011 1987 6543</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-1 flex-shrink-0" />
                <span>{t('footerLocation')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {currentYear} FitConnect. {t('footerRights')}</p>
        </div>
      </div>
    </footer>
  )
}
