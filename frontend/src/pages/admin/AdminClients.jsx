import { usePageTitle } from '../../hooks/usePageTitle'
import { useI18n } from '../../i18n/I18nProvider'

export default function AdminClients() {
  const { t } = useI18n()
  usePageTitle('Admin', 'Clients')
  return <div className="container-custom py-8"><h1>{t('adminClientsManagement')}</h1></div>
}
