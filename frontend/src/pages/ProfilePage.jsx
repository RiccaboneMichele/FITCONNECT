import { useEffect, useState } from 'react'
import { authAPI, usersAPI, trainersAPI, clientsAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { usePageTitle } from '../hooks/usePageTitle'
import { useI18n } from '../i18n/I18nProvider'

const initialUserForm = {
  name: '',
  email: ''
}

const initialTrainerForm = {
  bio: '',
  hourly_rate: '',
  location: '',
  experience_years: '',
  certification: ''
}

const initialClientForm = {
  phone: '',
  birth_date: '',
  fitness_level: 'beginner',
  address: '',
  notes: ''
}

export default function ProfilePage() {
  const { t } = useI18n()
  usePageTitle('User Profile')
  const { user, refreshUser } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [userForm, setUserForm] = useState(initialUserForm)
  const [trainerProfile, setTrainerProfile] = useState(null)
  const [clientProfile, setClientProfile] = useState(null)
  const [trainerForm, setTrainerForm] = useState(initialTrainerForm)
  const [clientForm, setClientForm] = useState(initialClientForm)

  const isTrainer = user?.role === 'trainer'
  const isClient = user?.role === 'client'
  const isAdmin = user?.role === 'admin' || user?.is_admin

  const loadProfile = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const me = await authAPI.getCurrentUser()

      setUserForm({
        name: me.name || '',
        email: me.email || ''
      })

      if (me.role === 'trainer') {
        try {
          const trainer = await trainersAPI.getMyProfile()
          setTrainerProfile(trainer)
          setTrainerForm({
            bio: trainer.bio || '',
            hourly_rate: trainer.hourly_rate || '',
            location: trainer.location || '',
            experience_years: trainer.experience_years || 0,
            certification: trainer.certification || ''
          })
        } catch (trainerErr) {
          if (trainerErr.response?.status !== 404) throw trainerErr
        }
      }

      if (me.role === 'client') {
        try {
          const client = await clientsAPI.getMyProfile()
          setClientProfile(client)
          setClientForm({
            phone: client.phone || '',
            birth_date: client.birth_date || '',
            fitness_level: client.fitness_level || 'beginner',
            address: client.address || '',
            notes: client.notes || ''
          })
        } catch (clientErr) {
          if (clientErr.response?.status !== 404) throw clientErr
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || t('profileLoadError'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!user?.id) return

    setSaving(true)
    setError('')
    setMessage('')

    try {
      await usersAPI.update(user.id, {
        name: userForm.name,
        email: userForm.email
      })

      if (isTrainer && trainerProfile?.id) {
        await trainersAPI.update(trainerProfile.id, {
          bio: trainerForm.bio,
          hourly_rate: Number(trainerForm.hourly_rate),
          location: trainerForm.location,
          experience_years: Number(trainerForm.experience_years),
          certification: trainerForm.certification
        })
      }

      if (isClient) {
        const clientPayload = {
          user_id: user.id,
          phone: clientForm.phone || null,
          birth_date: clientForm.birth_date || null,
          fitness_level: clientForm.fitness_level || 'beginner',
          address: clientForm.address || null,
          notes: clientForm.notes || null
        }

        if (clientProfile?.id) {
          await clientsAPI.update(clientProfile.id, clientPayload)
        } else {
          const createdClient = await clientsAPI.create(clientPayload)
          setClientProfile(createdClient)
        }
      }

      await refreshUser()
      setMessage(t('profileUpdated'))
    } catch (err) {
      setError(err.response?.data?.detail || t('profileSaveError'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container-custom py-10">
        <p className="text-gray-600">{t('profileLoading')}</p>
      </div>
    )
  }

  return (
    <div className="container-custom py-10 max-w-4xl">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('profileTitle')}</h1>
      <p className="text-gray-600 mb-8">{t('profileSubtitle')}</p>

      {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{error}</div>}
      {message && <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">{message}</div>}

      <form onSubmit={handleSave} className="space-y-6">
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('profileAccountData')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">{t('profileFullName')}</label>
              <input
                className="input"
                value={userForm.name}
                onChange={(e) => setUserForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">{t('authEmail')}</label>
              <input
                type="email"
                className="input"
                value={userForm.email}
                onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">{t('profileRole')}</label>
              <input className="input bg-gray-50" value={user?.role || ''} disabled />
            </div>
          </div>
        </section>

        {isTrainer && (
          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('profileTrainer')}</h2>
            {!trainerProfile && (
              <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
                {t('profileTrainerNotFound')}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">{t('profileBio')}</label>
                <textarea
                  className="input min-h-28"
                  value={trainerForm.bio}
                  onChange={(e) => setTrainerForm((prev) => ({ ...prev, bio: e.target.value }))}
                  disabled={!trainerProfile}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">{t('profileHourlyRate')}</label>
                <input
                  type="number"
                  min="1"
                  className="input"
                  value={trainerForm.hourly_rate}
                  onChange={(e) => setTrainerForm((prev) => ({ ...prev, hourly_rate: e.target.value }))}
                  disabled={!trainerProfile}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">{t('profileLocation')}</label>
                <input
                  className="input"
                  value={trainerForm.location}
                  onChange={(e) => setTrainerForm((prev) => ({ ...prev, location: e.target.value }))}
                  disabled={!trainerProfile}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">{t('profileExperienceYears')}</label>
                <input
                  type="number"
                  min="0"
                  className="input"
                  value={trainerForm.experience_years}
                  onChange={(e) => setTrainerForm((prev) => ({ ...prev, experience_years: e.target.value }))}
                  disabled={!trainerProfile}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">{t('profileCertification')}</label>
                <input
                  className="input"
                  value={trainerForm.certification}
                  onChange={(e) => setTrainerForm((prev) => ({ ...prev, certification: e.target.value }))}
                  disabled={!trainerProfile}
                />
              </div>
            </div>
          </section>
        )}

        {isClient && (
          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('profileClient')}</h2>
            {!clientProfile && (
              <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
                {t('profileClientNotFound')}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">{t('profilePhone')}</label>
                <input
                  className="input"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">{t('profileBirthDate')}</label>
                <input
                  type="date"
                  className="input"
                  value={clientForm.birth_date || ''}
                  onChange={(e) => setClientForm((prev) => ({ ...prev, birth_date: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">{t('profileFitnessLevel')}</label>
                <select
                  className="input"
                  value={clientForm.fitness_level}
                  onChange={(e) => setClientForm((prev) => ({ ...prev, fitness_level: e.target.value }))}
                >
                  <option value="beginner">{t('profileFitnessBeginner')}</option>
                  <option value="intermediate">{t('profileFitnessIntermediate')}</option>
                  <option value="advanced">{t('profileFitnessAdvanced')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">{t('profileAddress')}</label>
                <input
                  className="input"
                  value={clientForm.address}
                  onChange={(e) => setClientForm((prev) => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">{t('profileNotes')}</label>
                <textarea
                  className="input min-h-24"
                  value={clientForm.notes}
                  onChange={(e) => setClientForm((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
          </section>
        )}

        {isAdmin && (
          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('profileAdminArea')}</h2>
            <p className="text-gray-600 text-sm">
              {t('profileAdminText')}
            </p>
          </section>
        )}

        <button
          type="submit"
          disabled={saving}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? t('profileSaving') : t('profileSave')}
        </button>
      </form>
    </div>
  )
}
