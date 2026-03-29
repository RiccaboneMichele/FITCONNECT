import { usePageTitle } from '../../hooks/usePageTitle'
import { useI18n } from '../../i18n/I18nProvider'

export default function AdminUsers() {
  const { t } = useI18n()
  usePageTitle('Admin', 'Users')
  return <div className="container-custom py-8"><h1>{t('adminUsersManagement')}</h1></div>
}
