// Admin Dashboard - Complete with stats, users management, contacts
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminAPI, usersAPI, clientsAPI } from '../../services/api'
import { 
  Users, UserCheck, Calendar, DollarSign, 
  Mail, TrendingUp, Activity, Shield,
  Search, Filter, Eye, Trash2, UserPlus
} from 'lucide-react'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useI18n } from '../../i18n/I18nProvider'

export default function AdminDashboard() {
  const { t } = useI18n()
  usePageTitle('Admin', 'Dashboard')
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [userFormError, setUserFormError] = useState('')
  const [usersActionError, setUsersActionError] = useState('')
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client'
  })
  const { user: currentUser } = useAuthStore()
  const queryClient = useQueryClient()

  // Fetch dashboard stats
  const { data: dashboardData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminAPI.getDashboard,
  })

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersAPI.getAll(),
  })

  // Fetch clients
  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsAPI.getAll(),
  })

  // Fetch contacts
  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['admin-contacts'],
    queryFn: () => adminAPI.getContacts({ is_read: false }),
  })

  const stats = dashboardData?.statistics || {}

  const createUserMutation = useMutation({
    mutationFn: usersAPI.create,
    onSuccess: () => {
      setShowCreateUser(false)
      setUserFormError('')
      setUserForm({ name: '', email: '', password: '', role: 'client' })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
    },
    onError: (error) => {
      setUserFormError(error.response?.data?.detail || t('adminCreateError'))
    }
  })

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, isActive }) => usersAPI.updateStatus(userId, isActive),
    onSuccess: (_, variables) => {
      setUsersActionError('')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success(variables?.isActive ? t('adminUserActivated') : t('adminUserDeactivated'))
    },
    onError: (error) => {
      setUsersActionError(error.response?.data?.detail || t('adminUpdateError'))
      toast.error(error.response?.data?.detail || t('adminUpdateError'))
    }
  })

  const deleteUserMutation = useMutation({
    mutationFn: usersAPI.delete,
    onSuccess: () => {
      setUsersActionError('')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
      toast.success(t('adminUserDeleted'))
    },
    onError: (error) => {
      setUsersActionError(error.response?.data?.detail || t('adminDeleteError'))
      toast.error(error.response?.data?.detail || t('adminDeleteError'))
    }
  })

  const handleCreateUser = (e) => {
    e.preventDefault()
    setUserFormError('')

    if (!userForm.name.trim() || !userForm.email.trim() || !userForm.password.trim()) {
      setUserFormError(t('adminFillRequired'))
      return
    }

    createUserMutation.mutate({
      name: userForm.name.trim(),
      email: userForm.email.trim(),
      password: userForm.password,
      role: userForm.role
    })
  }

  const handleToggleUserStatus = (targetUser) => {
    if (!targetUser || targetUser.id === currentUser?.id) return
    setUsersActionError('')
    updateUserMutation.mutate({
      userId: targetUser.id,
      isActive: !targetUser.is_active
    })
  }

  const handleDeleteUser = (targetUser) => {
    if (!targetUser || targetUser.id === currentUser?.id) return
    const confirmed = window.confirm(`${t('adminConfirmDeleteUser')} ${targetUser.name}?`)
    if (!confirmed) return
    setUsersActionError('')
    deleteUserMutation.mutate(targetUser.id)
  }

  const handleQuickCreateUser = () => {
    setActiveTab('users')
    setShowCreateUser(true)
  }

  const handleQuickEmail = () => {
    setActiveTab('contacts')
  }

  const handleQuickSessions = () => {
    navigate('/sessions')
  }

  const handleQuickPermissions = () => {
    setActiveTab('users')
  }

  const statCards = [
    {
      title: t('adminUsersTotal'),
      value: stats.total_users || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: t('adminClientsActive'),
      value: stats.total_clients || 0,
      icon: UserCheck,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: t('adminSessionsTotal'),
      value: stats.total_sessions || 0,
      icon: Calendar,
      color: 'bg-purple-500',
      change: '+23%'
    },
    {
      title: t('adminRevenueTotal'),
      value: `€${stats.total_revenue || 0}`,
      icon: DollarSign,
      color: 'bg-orange-500',
      change: '+15%'
    },
  ]

  const additionalStats = [
    { label: t('adminScheduled'), value: stats.scheduled_sessions || 0 },
    { label: t('adminCompleted'), value: stats.completed_sessions || 0 },
    { label: t('adminCancelled'), value: stats.cancelled_sessions || 0 },
    { label: t('adminUnreadContacts'), value: contacts.length || 0 },
  ]

  if (statsLoading) {
    return (
      <div className="container-custom py-8">
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Shield className="text-primary-600" size={32} />
            {t('adminDashTitle')}
          </h1>
          <p className="page-subtitle">
            {t('adminDashSubtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Activity size={18} />
          <span>
            {t('adminAdminLabel')} <strong>{dashboardData?.admin?.name}</strong>
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp size={14} className="text-green-600" />
                  <span className="text-xs text-green-600 font-medium">{stat.change}</span>
                  <span className="text-xs text-gray-500">{t('adminVsLastMonth')}</span>
                </div>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {additionalStats.map((stat, index) => (
          <div key={index} className="card text-center">
            <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex gap-8">
            {['overview', 'users', 'clients', 'contacts'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                  activeTab === tab
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'overview' ? t('adminOverview') : tab === 'users' ? t('adminUsersTab') : tab === 'clients' ? t('adminClientsTab') : t('adminContactsTab')}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">{t('adminRecentActivity')}</h3>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <Users size={16} className="text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{t('adminNewRegisteredUser')}</p>
                      <p className="text-xs text-gray-500">{i} {t('adminHoursAgo')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">{t('adminQuickActions')}</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleQuickCreateUser}
                  className="btn-secondary py-3 flex items-center justify-center gap-2"
                >
                  <Users size={18} />
                  {t('adminNewUser')}
                </button>
                <button
                  onClick={handleQuickEmail}
                  className="btn-secondary py-3 flex items-center justify-center gap-2"
                >
                  <Mail size={18} />
                  {t('adminSendEmail')}
                </button>
                <button
                  onClick={handleQuickSessions}
                  className="btn-secondary py-3 flex items-center justify-center gap-2"
                >
                  <Calendar size={18} />
                  {t('adminManageSessions')}
                </button>
                <button
                  onClick={handleQuickPermissions}
                  className="btn-secondary py-3 flex items-center justify-center gap-2"
                >
                  <Shield size={18} />
                  {t('adminPermissions')}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">{t('adminUsersManagement')} ({users.length})</h3>
              <button onClick={() => setShowCreateUser(true)} className="btn-primary flex items-center gap-2">
                <UserPlus size={16} />
                {t('adminNewUser')}
              </button>
            </div>

            {usersActionError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {usersActionError}
              </div>
            )}

            {usersLoading ? (
              <div className="text-center py-8">
                <div className="spinner mx-auto"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">{t('adminNameCol')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">{t('adminEmailCol')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">{t('adminRoleCol')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">{t('adminStatusCol')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">{t('adminActionsCol')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-primary-600 font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium text-gray-900">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`badge ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'trainer' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge ${
                            user.is_active ? 'badge-success' : 'badge-danger'
                          }`}>
                            {user.is_active ? t('adminActive') : t('adminInactive')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleUserStatus(user)}
                              disabled={user.id === currentUser?.id || updateUserMutation.isPending}
                              className="px-3 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                            >
                              {updateUserMutation.isPending ? t('adminUpdating') : (user.is_active ? t('adminDisable') : t('adminEnable'))}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              disabled={user.id === currentUser?.id || deleteUserMutation.isPending}
                              className="px-3 py-1 text-xs rounded border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 flex items-center gap-1"
                            >
                              <Trash2 size={12} />
                              {t('adminDelete')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">{t('adminClientsManagement')} ({clients.length})</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('adminSearchClient')}
                    className="input pl-10 py-2"
                  />
                </div>
                <button className="btn-secondary">
                  <Filter size={18} />
                </button>
              </div>
            </div>

            {clientsLoading ? (
              <div className="text-center py-8">
                <div className="spinner mx-auto"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.map((client) => (
                  <div key={client.id} className="card-hover">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <UserCheck size={20} className="text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{client.user?.name || 'N/A'}</h4>
                          <p className="text-xs text-gray-500">{client.user?.email || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('adminLevel')}</span>
                        <span className={`badge ${
                          client.fitness_level === 'advanced' ? 'badge-success' :
                          client.fitness_level === 'intermediate' ? 'badge-warning' :
                          'badge-info'
                        }`}>
                          {client.fitness_level}
                        </span>
                      </div>
                      {client.phone && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('adminPhone')}</span>
                          <span className="font-medium">{client.phone}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedClient(client)}
                      className="mt-4 w-full btn-secondary py-2 flex items-center justify-center gap-2"
                    >
                      <Eye size={16} />
                      {t('adminDetails')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">{t('adminContactsTitle')} ({contacts.length} {t('adminUnreadSuffix')})</h3>
            </div>

            {contactsLoading ? (
              <div className="text-center py-8">
                <div className="spinner mx-auto"></div>
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Mail size={48} className="mx-auto mb-4 text-gray-300" />
                <p>{t('adminNoUnreadContacts')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div key={contact.id} className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                        <p className="text-sm text-gray-600">{contact.email}</p>
                      </div>
                      <span className="badge badge-info">{t('adminNew')}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-2">{contact.subject}</p>
                    <p className="text-sm text-gray-600">{contact.message}</p>
                    <div className="mt-3 flex gap-2">
                      <button className="btn-primary py-1 px-3 text-sm">{t('adminReply')}</button>
                      <button className="btn-secondary py-1 px-3 text-sm">{t('adminMarkRead')}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showCreateUser && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-gray-200 w-full max-w-md p-6">
            <h3 className="text-xl font-semibold mb-4">{t('adminCreateUserTitle')}</h3>

            {userFormError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {userFormError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminNameCol')}</label>
                <input
                  value={userForm.name}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="input"
                  placeholder={t('authNamePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminEmailCol')}</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="input"
                  placeholder={t('adminEmailPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('authPassword')}</label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="input"
                  placeholder={t('adminPasswordPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('profileRole')}</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, role: e.target.value }))}
                  className="input"
                >
                  <option value="client">{t('adminRoleClient')}</option>
                  <option value="trainer">{t('adminRoleTrainer')}</option>
                  <option value="admin">{t('adminRoleAdmin')}</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateUser(false)}
                  className="flex-1 btn-secondary"
                >
                  {t('adminCancel')}
                </button>
                <button
                  type="submit"
                  disabled={createUserMutation.isPending}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {createUserMutation.isPending ? t('adminCreating') : t('adminCreateUser')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedClient && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-gray-200 w-full max-w-lg p-6">
            <h3 className="text-xl font-semibold mb-4">{t('adminClientDetailsTitle')}</h3>
            <div className="space-y-2 text-sm">
              <p><strong>{t('adminNameCol')}:</strong> {selectedClient.user?.name || t('commonNA')}</p>
              <p><strong>{t('adminEmailCol')}:</strong> {selectedClient.user?.email || t('commonNA')}</p>
              <p><strong>{t('adminPhone')}:</strong> {selectedClient.phone || t('commonNA')}</p>
              <p><strong>{t('profileFitnessLevel')}:</strong> {selectedClient.fitness_level || t('commonNA')}</p>
              <p><strong>{t('profileBirthDate')}:</strong> {selectedClient.birth_date || t('commonNA')}</p>
              <p><strong>{t('profileAddress')}:</strong> {selectedClient.address || t('commonNA')}</p>
              <p><strong>{t('profileNotes')}:</strong> {selectedClient.notes || t('adminNoNotes')}</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setSelectedClient(null)} className="btn-secondary">
                {t('adminClose')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
