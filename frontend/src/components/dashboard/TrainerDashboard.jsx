// Trainer Dashboard
import { useQuery } from '@tanstack/react-query'
import { sessionsAPI } from '../../services/api'
import { Calendar, DollarSign, Users, Clock } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { trainersAPI } from '../../services/api'
import { useI18n } from '../../i18n/I18nProvider'

const formatSessionTime = (value) => {
  if (!value) return ''
  return typeof value === 'string' ? value.slice(0, 5) : String(value)
}

export default function TrainerDashboard() {
  const { t, language } = useI18n()
  const [conversations, setConversations] = useState([])
  const [selectedClientId, setSelectedClientId] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [chatText, setChatText] = useState('')
  const [chatError, setChatError] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['trainer-sessions'],
    queryFn: () => sessionsAPI.getAll(),
  })

  const upcomingSessions = sessions.filter(s => s.status === 'scheduled')
  const completedSessions = sessions.filter(s => s.status === 'completed')
  const totalRevenue = completedSessions.reduce((sum, s) => sum + (s.price || 0), 0)

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.client_id === selectedClientId) || null,
    [conversations, selectedClientId]
  )

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data = await trainersAPI.getMyChatConversations({ limit: 100 })
        setConversations(data)
        if (!selectedClientId && data.length > 0) {
          setSelectedClientId(data[0].client_id)
        }
      } catch (err) {
        setChatError(err.response?.data?.detail || t('trainerDashLoadChatsError'))
      }
    }

    loadConversations()
  }, [selectedClientId])

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedClientId) {
        setChatMessages([])
        return
      }

      setIsChatLoading(true)
      setChatError('')
      try {
        const messages = await trainersAPI.getMyChatMessages(selectedClientId, { limit: 200 })
        setChatMessages(messages)
      } catch (err) {
        setChatError(err.response?.data?.detail || t('trainerDashLoadMessagesError'))
      } finally {
        setIsChatLoading(false)
      }
    }

    loadMessages()
  }, [selectedClientId])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!selectedClientId || !chatText.trim() || isSending) return

    setIsSending(true)
    setChatError('')
    try {
      const message = await trainersAPI.sendMyChatMessage(selectedClientId, {
        message: chatText.trim()
      })
      setChatMessages((prev) => [...prev, message])
      setConversations((prev) => prev.map((c) =>
        c.client_id === selectedClientId
          ? { ...c, last_message: message.message, last_message_at: message.created_at, total_messages: (c.total_messages || 0) + 1 }
          : c
      ))
      setChatText('')
    } catch (err) {
      setChatError(err.response?.data?.detail || t('trainerDashSendError'))
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="container-custom py-8">
      <div className="page-header">
        <h1 className="page-title">{t('trainerDashTitle')}</h1>
        <p className="page-subtitle">{t('trainerDashSubtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">{t('trainerDashScheduled')}</p>
              <p className="text-3xl font-bold text-primary-600">{upcomingSessions.length}</p>
            </div>
            <Calendar size={32} className="text-primary-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">{t('trainerDashCompleted')}</p>
              <p className="text-3xl font-bold text-green-600">{completedSessions.length}</p>
            </div>
            <Users size={32} className="text-green-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">{t('trainerDashRevenue')}</p>
              <p className="text-3xl font-bold text-orange-600">€{totalRevenue.toFixed(0)}</p>
            </div>
            <DollarSign size={32} className="text-orange-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">{t('trainerDashHours')}</p>
              <p className="text-3xl font-bold text-purple-600">{completedSessions.length}</p>
            </div>
            <Clock size={32} className="text-purple-600" />
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">{t('trainerDashNextSessions')}</h2>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="spinner mx-auto"></div>
          </div>
        ) : upcomingSessions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
            <p>{t('trainerDashNoSessions')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {session.client?.user?.name || t('trainerDashClientFallback')}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(session.date).toLocaleDateString(language)} {t('commonAt')} {formatSessionTime(session.time)}
                    </p>
                    {session.notes && (
                      <p className="text-sm text-gray-500 mt-1">{t('trainerDashNotes')} {session.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="badge badge-success mb-2">€{session.price || '0'}</span>
                    <p className="text-sm text-gray-600">{session.duration_minutes || 60} {t('trainerDashMin')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card mt-8">
        <h2 className="text-xl font-bold mb-4">{t('trainerDashPrivateChats')}</h2>

        {chatError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {chatError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 border border-gray-200 rounded-lg p-3 max-h-96 overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="text-sm text-gray-500">{t('trainerDashNoPrivateChats')}</p>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.client_id}
                    onClick={() => setSelectedClientId(conv.client_id)}
                    className={`w-full text-left p-3 rounded-lg border transition ${selectedClientId === conv.client_id ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}
                  >
                    <p className="font-semibold text-gray-900">{conv.client_name}</p>
                    <p className="text-xs text-gray-600 truncate mt-1">{conv.last_message}</p>
                    <p className="text-xs text-gray-400 mt-1">{t('trainerDashMessagesCount')} {conv.total_messages}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 border border-gray-200 rounded-lg p-3">
            {!selectedConversation ? (
              <div className="h-80 flex items-center justify-center text-gray-500">
                {t('trainerDashSelectConversation')}
              </div>
            ) : (
              <>
                <div className="pb-3 mb-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">{t('trainerDashChatWith')} {selectedConversation.client_name}</h3>
                </div>

                <div className="h-64 overflow-y-auto space-y-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
                  {isChatLoading ? (
                    <p className="text-sm text-gray-500">{t('trainerDashLoadingMessages')}</p>
                  ) : chatMessages.length === 0 ? (
                    <p className="text-sm text-gray-500">{t('trainerDashNoMessages')}</p>
                  ) : (
                    chatMessages.map((msg) => (
                      <div key={msg.id} className="p-2 rounded bg-white border border-gray-200 text-sm">
                        {msg.message}
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={chatText}
                    onChange={(e) => setChatText(e.target.value)}
                    placeholder={t('trainerDashReplyPlaceholder')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                  <button
                    type="submit"
                    disabled={!chatText.trim() || isSending}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                  >
                    {isSending ? t('trainerDashSending') : t('trainerDashSend')}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
