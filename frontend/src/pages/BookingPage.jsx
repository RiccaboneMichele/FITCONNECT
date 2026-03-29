import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CalendarPlus, Loader } from 'lucide-react'
import { clientsAPI, sessionsAPI, trainersAPI } from '../services/api'
import { usePageTitle } from '../hooks/usePageTitle'
import { useI18n } from '../i18n/I18nProvider'

export default function BookingPage() {
  const { t } = useI18n()
  usePageTitle('Booking Session', 'Prenotazione')

  const { trainerId } = useParams()
  const navigate = useNavigate()

  const [trainer, setTrainer] = useState(null)
  const [clientProfile, setClientProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    date: '',
    time: '',
    notes: ''
  })

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError('')

      try {
        const [trainerData, clientData] = await Promise.all([
          trainersAPI.getById(trainerId),
          clientsAPI.getMyProfile()
        ])

        setTrainer(trainerData)
        setClientProfile(clientData)
      } catch (err) {
        setError(err.response?.data?.detail || t('bookingErrorLoad'))
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [trainerId])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.date || !form.time) {
      setError(t('bookingErrorSelectDateTime'))
      return
    }

    if (!trainer?.id || !clientProfile?.id) {
      setError(t('bookingErrorInvalidProfile'))
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await sessionsAPI.create({
        trainer_id: trainer.id,
        client_id: clientProfile.id,
        date: form.date,
        time: form.time,
        status: 'scheduled',
        notes: form.notes?.trim() || null
      })

      alert(t('bookingSuccess'))
      navigate('/sessions')
    } catch (err) {
      setError(err.response?.data?.detail || t('bookingErrorSubmit'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container-custom py-8">
        <div className="min-h-64 flex items-center justify-center">
          <div className="text-center">
            <Loader size={30} className="mx-auto mb-3 animate-spin text-primary-700" />
            <p className="text-gray-600">{t('bookingLoading')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!clientProfile?.id) {
    return (
      <div className="container-custom py-8 max-w-2xl">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('bookingNeedClientProfileTitle')}</h1>
          <p className="text-yellow-800 mb-4">{t('bookingNeedClientProfileText')}</p>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition font-medium"
          >
            {t('bookingGoProfile')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-custom py-8 max-w-3xl">
      <button
        onClick={() => navigate(`/trainers/${trainer?.id || trainerId}`)}
        className="mb-6 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
      >
        ← {t('bookingBackTrainer')}
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarPlus size={24} />
            {t('bookingTitle')}
          </h1>
          <p className="opacity-90 mt-1">
            {t('bookingTrainerLabel')} <strong>{trainer?.user?.name || t('trainerFallback')}</strong> · €{trainer?.hourly_rate}{t('commonPerHour')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('bookingDate')}</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={form.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('bookingTime')}</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => handleChange('time', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('bookingNotes')}</label>
            <textarea
              rows="4"
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder={t('bookingNotesPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(`/trainers/${trainer?.id || trainerId}`)}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              {t('bookingCancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium disabled:opacity-50"
            >
              {isSubmitting ? t('bookingSubmitting') : t('bookingConfirm')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
