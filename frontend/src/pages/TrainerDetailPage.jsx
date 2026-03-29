import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapPin, Star, MessageCircle, CalendarPlus, Globe, Video, Users, Loader, Send, Flag, CreditCard, RotateCcw, X } from 'lucide-react'
import { trainersAPI, clientsAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { usePageTitle } from '../hooks/usePageTitle'
import { useI18n } from '../i18n/I18nProvider'

export default function TrainerDetailPage() {
  const { t } = useI18n()
  usePageTitle('Finding Trainer', 'Trainer Detail')
  
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  
  const [trainer, setTrainer] = useState(null)
  const [clientProfile, setClientProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Chat états
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatText, setChatText] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)

  // Payment states
  const [showPayment, setShowPayment] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(trainer?.hourly_rate || '')
  const [paymentDescription, setPaymentDescription] = useState(t('trainerDetailPaymentDefaultDescription'))

  // Report states
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDetails, setReportDetails] = useState('')

  const isRoleClient = user?.role === 'client'
  const isRoleTrainer = user?.role === 'trainer'
  const isRoleAdmin = user?.role === 'admin' || user?.is_admin

  useEffect(() => {
    const loadTrainer = async () => {
      setIsLoading(true)
      setError('')
      try {
        const data = await trainersAPI.getById(id)
        setTrainer(data)
        setPaymentAmount(data.hourly_rate)
      } catch (err) {
        setError(err.response?.data?.detail || t('trainerDetailLoadError'))
      } finally {
        setIsLoading(false)
      }
    }

    loadTrainer()
  }, [id])

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

  const handleOpenChat = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setShowChat(true)
    setError('')
    
    setIsChatLoading(true)
    try {
      const messages = await trainersAPI.getChatMessages(trainer.id)
      setChatMessages(messages)
    } catch (err) {
      setError(err.response?.data?.detail || t('trainerDetailChatLoadError'))
    } finally {
      setIsChatLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!chatText.trim()) return

    try {
      const sentMessage = await trainersAPI.sendChatMessage(trainer.id, { 
        message: chatText.trim() 
      })
      setChatMessages((prev) => [...prev, sentMessage])
      setChatText('')
    } catch (err) {
      setError(err.response?.data?.detail || t('trainerDetailChatSendError'))
    }
  }

  const handlePayment = async () => {
    if (!paymentAmount || paymentAmount <= 0) {
      alert(t('trainerDetailPaymentInvalidAmount'))
      return
    }
    alert(`💳 ${t('trainerDetailPaymentConfirmed')} €${paymentAmount} ${t('trainerDetailPaymentTo')} ${trainer.user?.name}.\n\n${t('trainerDetailPaymentMockText')}`)
    setShowPayment(false)
    setPaymentAmount(trainer.hourly_rate)
    setPaymentDescription(t('trainerDetailPaymentDefaultDescription'))
  }

  const handleRefund = async () => {
    const refundAmount = prompt(`${t('trainerDetailRefundPrompt')} (Max €${trainer.hourly_rate})`)
    if (!refundAmount) return
    
    const amount = parseFloat(refundAmount)
    if (isNaN(amount) || amount <= 0 || amount > trainer.hourly_rate) {
      alert(t('trainerDetailPaymentInvalidAmount'))
      return
    }
    
    alert(`💰 ${t('trainerDetailRefundRequested')} €${amount} ${t('trainerDetailPaymentTo')} ${trainer.user?.name}.\n\n${t('trainerDetailRefundMockText')}`)
  }

  const handleSubmitReport = async () => {
    if (!reportReason || !reportDetails.trim()) {
      alert(t('trainerDetailReportFillAll'))
      return
    }

    try {
      alert(`📢 ${t('trainerDetailReportSent')}\n\n${t('trainerDetailReportReason')}: ${reportReason}\n${t('trainerDetailReportDetails')}: ${reportDetails}\n\n${t('trainerDetailReportReviewText')}`)
      setShowReport(false)
      setReportReason('')
      setReportDetails('')
    } catch (err) {
      alert(t('trainerDetailReportSendError'))
    }
  }

  if (isLoading) {
    return (
      <div className="container-custom py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader size={32} className="mx-auto mb-4 animate-spin text-primary-700" />
            <p className="text-gray-600">{t('trainerDetailLoading')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !showChat) {
    return (
      <div className="container-custom py-8">
        <button 
          onClick={() => navigate('/trainers')}
          className="mb-4 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          ← {t('trainerDetailBack')}
        </button>
        <div className="p-6 rounded-lg bg-red-50 border border-red-200">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  if (!trainer) {
    return (
      <div className="container-custom py-8">
        <button 
          onClick={() => navigate('/trainers')}
          className="mb-4 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          ← {t('trainerDetailBack')}
        </button>
        <div className="text-center p-8">
          <p className="text-gray-600">{t('trainerDetailNotFound')}</p>
        </div>
      </div>
    )
  }

  const languages = trainer.languages?.split(',').map(l => l.trim()).filter(l => l) || []
  const sessionTypes = trainer.session_types?.split(',').map(s => s.trim()).filter(s => s) || []
  const lessonTypes = trainer.lesson_types?.split(',').map(l => l.trim()).filter(l => l) || []

  const sessionTypeLabels = {
    'online': t('trainerDetailOnlineSession'),
    'in_person': t('trainerDetailInPersonSession'),
    'in-person': t('trainerDetailInPersonSession')
  }

  return (
    <div className="container-custom py-8">
      <button 
        onClick={() => navigate('/trainers')}
        className="mb-6 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
      >
        ← {t('trainerDetailBack')}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <h1 className="text-4xl font-bold text-gray-900">{trainer.user?.name || t('trainerFallback')}</h1>
            
            <div className="flex flex-wrap gap-6 text-gray-600 mt-4">
              <span className="flex items-center gap-2">
                <MapPin size={18} className="text-primary-600" />
                <strong>{trainer.location}</strong>
              </span>
              <span className="flex items-center gap-2">
                <Star size={18} className="text-yellow-500" />
                <strong>{Number(trainer.rating || 0).toFixed(1)}</strong> · {trainer.total_sessions || 0} {t('trainerDetailSessions')}
              </span>
              <span className="flex items-center gap-2">
                <strong>{trainer.experience_years} {t('trainerDetailYears')}</strong> {t('trainerDetailExperience')}
              </span>
            </div>

            {trainer.is_verified && (
              <div className="mt-4 inline-block px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full border border-green-200">
                ✓ {t('trainerDetailVerified')}
              </div>
            )}

            <p className="text-2xl font-bold text-primary-700 mt-6">€{trainer.hourly_rate} <span className="text-sm text-gray-500">{t('trainersPerHour')}</span></p>
          </div>

          {/* Bio */}
          {trainer.bio && (
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('trainerDetailWhoIs')} {trainer.user?.name}</h2>
              <p className="text-gray-700 leading-relaxed">{trainer.bio}</p>
            </div>
          )}

          {/* Dettagli Professionali */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">{t('trainerDetailProfessionalDetails')}</h2>

            {/* Specializzazioni */}
            {trainer.specializations?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users size={20} className="text-primary-600" />
                  {t('trainersSpecialization')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trainer.specializations.map((spec) => (
                    <span key={spec.id} className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium">
                      {spec.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Lingue */}
            {languages.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Globe size={20} className="text-primary-600" />
                  {t('trainerDetailLanguages')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang, idx) => (
                    <span key={idx} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tipo Sessioni */}
            {sessionTypes.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Video size={20} className="text-primary-600" />
                  {t('trainerDetailLessonMode')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {sessionTypes.map((type, idx) => (
                    <span key={idx} className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                      {sessionTypeLabels[type] || type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tipo Lezioni */}
            {lessonTypes.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users size={20} className="text-primary-600" />
                  {t('trainerDetailLessonTypes')}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {lessonTypes.map((lesson, idx) => (
                    <span key={idx} className="px-3 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium text-center">
                      {lesson}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certificazione */}
            {trainer.certification && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('trainerDetailCertifications')}</h3>
                <p className="text-gray-700">{trainer.certification}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Actions */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm sticky top-24 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700">
              <p className="text-white text-sm opacity-90">{t('trainerDetailPrice')}: <strong>€{trainer.hourly_rate}/{t('trainerDetailHourShort')}</strong></p>
            </div>

            <div className="p-6 space-y-4">
              {isRoleClient && (
                <>
                  {clientProfile?.id ? (
                    <Link
                      to={`/booking/${trainer.id}`}
                      className="w-full btn-primary flex items-center justify-center gap-2 text-white font-medium"
                    >
                      <CalendarPlus size={18} />
                      {t('trainerDetailBookLesson')}
                    </Link>
                  ) : (
                    <Link
                      to="/profile"
                      className="w-full px-4 py-3 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition font-medium flex items-center justify-center gap-2"
                    >
                      <CalendarPlus size={18} />
                      {t('trainerDetailCompleteProfileToBook')}
                    </Link>
                  )}
                  {!clientProfile?.id && (
                    <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2">
                      {t('trainerDetailNeedClientProfile')}
                    </p>
                  )}
                </>
              )}

              {/* Messaging Section */}
              <div className="space-y-2 sm:space-y-0 sm:flex sm:flex-col sm:gap-2">
                <button
                  onClick={handleOpenChat}
                  className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  {t('trainerDetailSendMessage')}
                </button>

                <button
                  onClick={() => setShowReport(true)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <Flag size={18} />
                  {t('trainerDetailReport')}
                </button>
              </div>

              {isRoleClient && (
                <>
                  <button
                    onClick={() => setShowPayment(true)}
                    className="w-full px-4 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
                  >
                    <CreditCard size={18} />
                    {t('trainerDetailPayment')}
                  </button>

                  <button
                    onClick={handleRefund}
                    className="w-full px-4 py-3 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition font-medium flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={18} />
                    {t('trainerDetailRefund')}
                  </button>
                </>
              )}

              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="w-full px-4 py-3 rounded-lg border border-primary-300 text-primary-700 font-medium text-center hover:bg-primary-50 transition"
                >
                  {t('trainerDetailLoginToContact')}
                </Link>
              )}
            </div>

            {/* Info Card */}
            <div className="p-6 bg-blue-50 border-t border-blue-200">
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-blue-600 font-medium">📋 {t('trainerDetailReplyTime')}</p>
                  <p className="font-semibold text-gray-900">{t('trainerDetailWithin24h')}</p>
                </div>
                {trainer.total_sessions > 0 && (
                  <div className="pt-2 border-t border-blue-200">
                    <p className="text-gray-500">{t('trainerDetailCompletedSessions')}</p>
                    <p className="font-semibold text-gray-900">{trainer.total_sessions}</p>
                  </div>
                )}
              </div>
            </div>

            {showChat && (
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{t('trainerDetailChatWith')} {trainer.user?.name}</h3>
                  <button onClick={() => setShowChat(false)} className="text-gray-500 hover:text-gray-700 transition">
                    <X size={18} />
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg border border-gray-200 h-64 overflow-y-auto p-3 space-y-2">
                  {isChatLoading ? (
                    <div className="text-center py-6">
                      <Loader size={22} className="mx-auto animate-spin text-primary-700" />
                    </div>
                  ) : chatMessages.length === 0 ? (
                    <p className="text-center text-gray-500 py-6 text-sm">{t('trainerDetailStartConversation')}</p>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.sender_user_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                          msg.sender_user_id === user?.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}>
                          {msg.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={chatText}
                    onChange={(e) => setChatText(e.target.value)}
                    placeholder={t('trainersWriteMessage')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="submit"
                    disabled={!chatText.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <CreditCard size={28} className="text-green-600" />
                {t('trainerDetailPayment')}
              </h3>
              <button onClick={() => setShowPayment(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('trainerFallback')}
                </label>
                <p className="text-lg font-semibold text-gray-900">{trainer.user?.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('trainerDetailDescription')}
                </label>
                <input
                  type="text"
                  value={paymentDescription}
                  onChange={(e) => setPaymentDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('trainerDetailAmount')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <strong>{t('trainerDetailTotal')}:</strong> €{Number(paymentAmount).toFixed(2)}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowPayment(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  {t('adminCancel')}
                </button>
                <button
                  onClick={handlePayment}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  {t('trainerDetailPayNow')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Flag size={28} className="text-red-600" />
                {t('trainerDetailReport')}
              </h3>
              <button onClick={() => setShowReport(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('trainerDetailReportAgainst')}
                </label>
                <p className="text-lg font-semibold text-gray-900">{trainer.user?.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('trainerDetailReportReason')}
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="">{t('trainerDetailChooseReason')}</option>
                  <option value="inappropriate">{t('trainerDetailReasonInappropriate')}</option>
                  <option value="scam">{t('trainerDetailReasonScam')}</option>
                  <option value="offensive">{t('trainerDetailReasonOffensive')}</option>
                  <option value="spam">{t('trainerDetailReasonSpam')}</option>
                  <option value="other">{t('trainerDetailReasonOther')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('trainerDetailReportDetails')}
                </label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder={t('trainerDetailDescribeIssue')}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowReport(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  {t('adminCancel')}
                </button>
                <button
                  onClick={handleSubmitReport}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  {t('trainerDetailReport')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
