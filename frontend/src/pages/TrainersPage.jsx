import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MessageCircle, Search, MapPin, Star, Send, CalendarPlus } from 'lucide-react'
import { trainersAPI, specializationsAPI, clientsAPI, sessionsAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { usePageTitle } from '../hooks/usePageTitle'
import { useI18n } from '../i18n/I18nProvider'

export default function TrainersPage() {
  const { t } = useI18n()
  usePageTitle('Finding Trainer', 'Trainers')
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, isAuthenticated } = useAuthStore()

  const [trainers, setTrainers] = useState([])
  const [specializations, setSpecializations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [error, setError] = useState('')

  const [filters, setFilters] = useState(() => ({
    location: searchParams.get('location') || '',
    specialization: searchParams.get('specialization') || '',
    max_price: searchParams.get('max_price') || ''
  }))

  const [activeTrainer, setActiveTrainer] = useState(null)
  const [bookingTrainer, setBookingTrainer] = useState(null)
  const [clientProfile, setClientProfile] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [chatText, setChatText] = useState('')
  const [chatClientId, setChatClientId] = useState('')
  const [bookingForm, setBookingForm] = useState({
    date: '',
    time: '',
    notes: ''
  })
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingMessage, setBookingMessage] = useState('')

  const isRoleClient = user?.role === 'client'
  const isRoleTrainer = user?.role === 'trainer'
  const isRoleAdmin = user?.role === 'admin' || user?.is_admin
  const canUseChat = isAuthenticated && (isRoleClient || isRoleTrainer || isRoleAdmin)

  const loadData = async (searchFilters = filters) => {
    setIsLoading(true)
    setError('')
    try {
      const params = {}
      if (searchFilters.location) params.location = searchFilters.location
      if (searchFilters.specialization) params.specialization = searchFilters.specialization
      if (searchFilters.max_price) params.max_price = Number(searchFilters.max_price)

      const [trainersData, specsData] = await Promise.all([
        trainersAPI.search(params),
        specializationsAPI.getAll()
      ])

      setTrainers(trainersData)
      setSpecializations(specsData)
    } catch (err) {
      setError(err.response?.data?.detail || t('trainersLoadError'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const urlFilters = {
      location: searchParams.get('location') || '',
      specialization: searchParams.get('specialization') || '',
      max_price: searchParams.get('max_price') || ''
    }

    setFilters(urlFilters)
    loadData(urlFilters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    const loadClientProfile = async () => {
      if (!isRoleClient || !isAuthenticated) return
      try {
        const profile = await clientsAPI.getMyProfile()
        setClientProfile(profile)
      } catch (err) {
        setClientProfile(null)
      }
    }

    loadClientProfile()
  }, [isAuthenticated, isRoleClient])

  const openChat = async (trainer) => {
    if (!canUseChat) return

    setActiveTrainer(trainer)
    setChatMessages([])
    setChatText('')
    setError('')

    setIsChatLoading(true)
    try {
      const params = {}
      if ((isRoleTrainer || isRoleAdmin) && chatClientId) {
        params.client_id = Number(chatClientId)
      }

      const messages = await trainersAPI.getChatMessages(trainer.id, params)
      setChatMessages(messages)
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(detail || t('trainersChatOpenError'))
    } finally {
      setIsChatLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!activeTrainer || !chatText.trim()) return

    try {
      const payload = { message: chatText.trim() }
      if ((isRoleTrainer || isRoleAdmin) && chatClientId) {
        payload.client_id = Number(chatClientId)
      }

      const sentMessage = await trainersAPI.sendChatMessage(activeTrainer.id, payload)
      setChatMessages((prev) => [...prev, sentMessage])
      setChatText('')
    } catch (err) {
      setError(err.response?.data?.detail || t('trainersChatSendError'))
    }
  }

  const selectBookingTrainer = (trainer) => {
    setBookingTrainer(trainer)
    setBookingMessage('')
    setError('')
    setBookingForm({
      date: '',
      time: '',
      notes: ''
    })
  }

  const handleBookSession = async (e) => {
    e.preventDefault()
    if (!bookingTrainer || !clientProfile?.id) {
      setError(t('trainersBookingProfileError'))
      return
    }

    if (!bookingForm.date || !bookingForm.time) {
      setError(t('trainersBookingDateTimeError'))
      return
    }

    setBookingLoading(true)
    setError('')
    setBookingMessage('')

    try {
      await sessionsAPI.create({
        client_id: clientProfile.id,
        trainer_id: bookingTrainer.id,
        date: bookingForm.date,
        time: bookingForm.time,
        notes: bookingForm.notes || null
      })

      setBookingMessage(t('trainersBookingSuccess'))
      setBookingForm({ date: '', time: '', notes: '' })
    } catch (err) {
      setError(err.response?.data?.detail || t('trainersBookingError'))
    } finally {
      setBookingLoading(false)
    }
  }

  const trainerCountText = useMemo(() => {
    if (isLoading) return t('trainersLoading')
    if (trainers.length === 0) return t('trainersNoResults')
    return `${trainers.length} ${t('trainersAvailableSuffix')}`
  }, [isLoading, trainers.length, t])

  return (
    <div className="container-custom py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">{t('trainersTitle')}</h1>
        <p className="text-gray-600 mt-2">{t('trainersSubtitle')}</p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600 mb-1 block">{t('trainersCity')}</label>
            <input
              type="text"
              value={filters.location}
              onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
              placeholder={t('trainersCityPlaceholder')}
              className="input"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">{t('trainersSpecialization')}</label>
            <select
              value={filters.specialization}
              onChange={(e) => setFilters((prev) => ({ ...prev, specialization: e.target.value }))}
              className="input"
            >
              <option value="">{t('trainersAll')}</option>
              {specializations.map((spec) => (
                <option key={spec.id} value={spec.name}>{spec.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">{t('trainersMaxPrice')}</label>
            <input
              type="number"
              min="1"
              value={filters.max_price}
              onChange={(e) => setFilters((prev) => ({ ...prev, max_price: e.target.value }))}
              placeholder={t('trainersPricePlaceholder')}
              className="input"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 items-center">
          <button
            onClick={() => {
              const params = {}
              if (filters.location) params.location = filters.location
              if (filters.specialization) params.specialization = filters.specialization
              if (filters.max_price) params.max_price = filters.max_price
              setSearchParams(params)
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Search size={18} />
            {t('homeSearch')}
          </button>
          <button
            onClick={() => {
              const reset = { location: '', specialization: '', max_price: '' }
              setFilters(reset)
              setSearchParams({})
            }}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
          >
            {t('trainersReset')}
          </button>
          <span className="text-sm text-gray-500">{trainerCountText}</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {trainers.map((trainer) => (
            <article key={trainer.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">{trainer.user?.name || t('trainerFallback')}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1"><MapPin size={15} /> {trainer.location}</span>
                    <span className="flex items-center gap-1"><Star size={15} /> {Number(trainer.rating || 0).toFixed(1)}</span>
                    <span>{trainer.experience_years} {t('trainersYearsExperience')}</span>
                  </div>
                  <p className="text-gray-700 mt-3">{trainer.bio || t('trainersBioFallback')}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {trainer.specializations?.length ? trainer.specializations.map((spec) => (
                      <span key={spec.id} className="px-3 py-1 text-xs bg-primary-50 text-primary-700 rounded-full">
                        {spec.name}
                      </span>
                    )) : (
                      <span className="text-sm text-gray-500">{t('trainersNoSpecializations')}</span>
                    )}
                  </div>
                </div>

                <div className="md:text-right">
                  <p className="text-2xl font-bold text-primary-700">€{trainer.hourly_rate}</p>
                  <p className="text-xs text-gray-500">{t('trainersPerHour')}</p>

                  <div className="mt-4 space-y-2 md:min-w-44">
                    <Link
                      to={`/trainers/${trainer.id}`}
                      className="block text-center px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                    >
                      {t('trainersDetails')}
                    </Link>
                    {isRoleClient && (
                      <button
                        onClick={() => selectBookingTrainer(trainer)}
                        className="w-full text-center btn-primary flex items-center justify-center gap-2"
                      >
                        <CalendarPlus size={16} /> {t('trainersBookHere')}
                      </button>
                    )}
                    <button
                      onClick={() => openChat(trainer)}
                      disabled={!canUseChat}
                      className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={16} /> {t('trainersChat')}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="bg-white rounded-2xl border border-gray-200 shadow-sm h-fit sticky top-24">
          {isRoleClient && (
            <>
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">{t('trainersQuickBooking')}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {bookingTrainer ? `${t('trainersBookingWith')} ${bookingTrainer.user?.name}` : t('trainersSelectTrainerToBook')}
                </p>
              </div>

              <form onSubmit={handleBookSession} className="p-4 border-b border-gray-200 space-y-3">
                {!clientProfile && (
                  <div className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg p-2 space-y-2">
                    <p>{t('trainersMissingClientProfile')}</p>
                    <Link
                      to="/profile"
                      className="inline-flex items-center text-primary-700 hover:text-primary-800 font-medium"
                    >
                      {t('bookingGoProfile')}
                    </Link>
                  </div>
                )}

                {bookingMessage && (
                  <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg p-2">
                    {bookingMessage}
                  </p>
                )}

                <div>
                  <label className="text-xs text-gray-600 block mb-1">{t('bookingDate')}</label>
                  <input
                    type="date"
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, date: e.target.value }))}
                    className="input"
                    disabled={!bookingTrainer || !clientProfile}
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600 block mb-1">{t('bookingTime')}</label>
                  <input
                    type="time"
                    value={bookingForm.time}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, time: e.target.value }))}
                    className="input"
                    disabled={!bookingTrainer || !clientProfile}
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600 block mb-1">{t('bookingNotes')}</label>
                  <textarea
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, notes: e.target.value }))}
                    className="input min-h-20"
                    placeholder={t('trainersNotesPlaceholder')}
                    disabled={!bookingTrainer || !clientProfile}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!bookingTrainer || !clientProfile || bookingLoading}
                >
                  {bookingLoading ? t('bookingSubmitting') : t('bookingConfirm')}
                </button>
              </form>
            </>
          )}

          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">{t('trainersChatTitle')}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {activeTrainer ? `${t('trainersChatOpenWith')} ${activeTrainer.user?.name}` : t('trainersSelectTrainerForChat')}
            </p>
          </div>

          {(isRoleTrainer || isRoleAdmin) && (
            <div className="p-4 border-b border-gray-200">
              <label className="text-xs text-gray-600 block mb-1">{t('trainersClientIdLabel')}</label>
              <input
                value={chatClientId}
                onChange={(e) => setChatClientId(e.target.value)}
                type="number"
                min="1"
                className="input"
                placeholder={t('trainersClientIdPlaceholder')}
              />
            </div>
          )}

          <div className="p-4 h-72 overflow-y-auto space-y-3 bg-gray-50">
            {!isAuthenticated && (
              <p className="text-sm text-gray-600">
                {t('trainersLoginForChat')}
              </p>
            )}

            {isChatLoading && <p className="text-sm text-gray-600">{t('trainersLoadingMessages')}</p>}

            {isAuthenticated && !isChatLoading && chatMessages.length === 0 && (
              <p className="text-sm text-gray-600">{t('trainersNoMessages')}</p>
            )}

            {chatMessages.map((msg) => {
              const mine = msg.sender_user_id === user?.id
              return (
                <div
                  key={msg.id}
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${mine ? 'ml-auto bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}
                >
                  <p>{msg.message}</p>
                </div>
              )
            })}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder={activeTrainer ? t('trainersWriteMessage') : t('trainersOpenChatFirst')}
                disabled={!activeTrainer || !canUseChat}
                className="input"
              />
              <button
                type="submit"
                disabled={!activeTrainer || !chatText.trim() || !canUseChat}
                className="px-3 rounded-lg bg-primary-600 text-white disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  )
}
