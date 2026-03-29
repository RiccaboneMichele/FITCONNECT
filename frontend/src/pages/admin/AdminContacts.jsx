import { usePageTitle } from '../../hooks/usePageTitle'
import { useI18n } from '../../i18n/I18nProvider'

export default function AdminContacts() {
  const { t } = useI18n()
  usePageTitle('Admin', 'Contacts')
  return <div className="container-custom py-8"><h1>{t('adminContactsTitle')}</h1></div>
}
