import { usePageTitle } from '../hooks/usePageTitle'
import { useI18n } from '../i18n/I18nProvider'

export default function SessionsPage() {
  const { t } = useI18n()
  usePageTitle('Sessions')
  return <div className="container-custom py-8"><h1>{t('sessionsTitle')}</h1></div>
}
