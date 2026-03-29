// Client Dashboard
import { useQuery } from '@tanstack/react-query'
import { sessionsAPI } from '../../services/api'
import { Calendar, TrendingUp, Clock, User } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'

const formatSessionTime = (value) => {
  if (!value) return ''
  return typeof value === 'string' ? value.slice(0, 5) : String(value)
}

export default function ClientDashboard() {
  const { t, language } = useI18n()
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['my-sessions'],
    queryFn: () => sessionsAPI.getAll(),
  })

  const upcomingSessions = sessions.filter(s => s.status === 'scheduled')
  const completedSessions = sessions.filter(s => s.status === 'completed')

  return (
    <div className="container-custom py-8">
      <div className="page-header">
        <h1 className="page-title">{t('clientDashTitle')}</h1>
        <p className="page-subtitle">{t('clientDashSubtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">{t('clientDashScheduled')}</p>
              <p className="text-3xl font-bold text-primary-600">{upcomingSessions.length}</p>
            </div>
            <Calendar size={32} className="text-primary-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">{t('clientDashCompleted')}</p>
              <p className="text-3xl font-bold text-green-600">{completedSessions.length}</p>
            </div>
            <TrendingUp size={32} className="text-green-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">{t('clientDashHours')}</p>
              <p className="text-3xl font-bold text-purple-600">{completedSessions.length * 1}</p>
            </div>
            <Clock size={32} className="text-purple-600" />
          </div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">{t('clientDashNextSessions')}</h2>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="spinner mx-auto"></div>
          </div>
        ) : upcomingSessions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
            <p>{t('clientDashNoSessions')}</p>
            <a href="/trainers" className="btn-primary mt-4 inline-block">
              {t('clientDashBookSession')}
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <User size={24} className="text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{session.trainer?.user?.name || t('trainerFallback')}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(session.date).toLocaleDateString(language)} {t('commonAt')} {formatSessionTime(session.time)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="badge badge-info mb-2">{t('clientDashScheduledBadge')}</span>
                    <p className="text-sm text-gray-600">{session.duration_minutes || 60} {t('clientDashMinutes')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
