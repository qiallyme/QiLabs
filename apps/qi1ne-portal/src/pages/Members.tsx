import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { apiClient } from '../lib/api/client'
import type { TenantMember, Role } from '../lib/api/types'
import { Users, UserPlus, Shield, Trash2, Mail, User } from 'lucide-react'

export default function Members() {
  const { activeTenant, user } = useAuth()
  const [members, setMembers] = useState<TenantMember[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<Role>('member')
  const [inviting, setInviting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (activeTenant) {
      fetchMembers(activeTenant.id)
    }
  }, [activeTenant])

  const fetchMembers = async (tenantId: string) => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const { data, error } = await apiClient.listTenantMembers(tenantId)

      if (error) {
        setErrorMsg(error.message || 'Failed to fetch members')
        setMembers([])
      } else if (data?.items) {
        setMembers(data.items)
      } else if (Array.isArray(data)) {
        // Fallback for if gateway returns array instead of wrapper obj
        setMembers(data as any)
      } else {
        setMembers([])
      }
    } catch (e: any) {
      console.error('Members fetch failed:', e)
      setErrorMsg(e.message || 'Network error fetching members')
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail || !activeTenant) return
    setInviting(true)
    setErrorMsg(null)

    try {
      const { data, error } = await apiClient.inviteTenantMember(activeTenant.id, {
        email: inviteEmail,
        role: inviteRole
      })

      if (error) {
        throw new Error(error.message || 'Invitation failed')
      }

      alert(`Invitation sent to ${inviteEmail}`)
      setInviteEmail('')
      // Refresh list to show invited user if possible
      fetchMembers(activeTenant.id)
    } catch (e: any) {
      console.error('Invite failed:', e)
      setErrorMsg(e.message || 'Failed to send invite via Gateway')
    } finally {
      setInviting(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return
    
    // Deletion is not in the first 6 safe routes, so we block it locally
    alert('Member deletion is not yet supported in the Gateway.')
  }

  if (!activeTenant) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-200">
        <Users className="w-12 h-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">No Active Tenant</h2>
        <p className="text-gray-500 text-center max-w-md mt-2">
          You need an active household or organization to manage members.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Member Management</h1>
          <p className="text-gray-500 mt-1">
            Managing members for <span className="font-semibold text-gray-900">{activeTenant.name}</span>
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-500" />
                Active Members
              </h2>
            </div>
            {loading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {members.map(member => (
                  <div key={member.memberId || member.email} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {(member.displayName || member.email || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          {member.displayName || member.email}
                          {member.userId === user?.id && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">You</span>
                          )}
                          {member.status === 'invited' && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Pending Invite</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-1.5 text-sm">
                        {member.role === 'admin' ? (
                          <Shield className="w-4 h-4 text-purple-500" />
                        ) : (
                          <User className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="capitalize text-gray-700">{member.role}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveMember(member.memberId)}
                        disabled={member.userId === user?.id}
                        className="text-gray-400 hover:text-red-600 disabled:opacity-30 transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
                {members.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No members found in this tenant.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-24">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-gray-500" />
                Invite New Member
              </h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="colleague@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value as Role)}
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none bg-white"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={inviting || !inviteEmail}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {inviting ? 'Sending...' : 'Send Invitation'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
