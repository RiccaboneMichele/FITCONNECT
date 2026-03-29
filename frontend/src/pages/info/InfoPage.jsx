import { Link, useLocation } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nProvider'
import { usePageTitle } from '../../hooks/usePageTitle'

const keyByPath = {
  '/info/chi-siamo': 'About',
  '/info/scopri-di-piu': 'Discover',
  '/info/privacy-policy': 'Privacy',
  '/info/termini-di-servizio': 'Terms',
}

export default function InfoPage() {
  const { pathname } = useLocation()
  const { t } = useI18n()
  const section = keyByPath[pathname] || 'Discover'
  const pageTitle = t(`info${section}Title`)
  usePageTitle('Info', pageTitle)

  return (
    <div className="container-custom py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-sm p-8 md:p-10 animate-fade-in">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t(`info${section}Title`)}</h1>
        <p className="text-lg text-gray-700 leading-relaxed mb-8">{t(`info${section}Text`)}</p>
        <Link
          to="/"
          className="inline-flex items-center px-5 py-3 rounded-xl bg-gray-900 text-white hover:bg-black transition"
        >
          {t('infoBackHome')}
        </Link>
      </div>
    </div>
  )
}
