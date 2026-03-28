import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { updateUser, updatePassword, deleteUser } from '../services/api/userApi'
import { getAhpConfig, updateAhpConfig } from '../services/api/ahpConfigApi'
import { computeWeightsFromMatrix, buildDefaultMatrix, syncMatrix, CRITERIA_LABELS } from '../utils/ahp'
import { formatDate } from '../utils/formatters'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import AhpWeightsBarChart from '../components/charts/AhpWeightsBarChart'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const AHP_VALUES = [1/9, 1/7, 1/5, 1/3, 1, 3, 5, 7, 9]

const ProfileSettings = () => {
  const { userId, userDetail, logout, refreshUserDetail } = useAuth()
  const navigate = useNavigate()

  // Profile form
  const [username, setUsername] = useState(userDetail?.username ?? '')
  const [email, setEmail] = useState(userDetail?.email ?? '')
  const [phone, setPhone] = useState(userDetail?.phoneNumber ?? '')
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  // Password form
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [pwLoading, setPwLoading] = useState(false)

  // AHP
  const [matrix, setMatrix] = useState<number[][]>(buildDefaultMatrix())
  const [ahpExists, setAhpExists] = useState(false)
  const [ahpLoading, setAhpLoading] = useState(true)
  const [ahpMsg, setAhpMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [ahpSaving, setAhpSaving] = useState(false)
  const [ahpConfigId, setAhpConfigId] = useState<string>('0')

  // Danger zone
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    if (userDetail) {
      setUsername(userDetail.username ?? '')
      setEmail(userDetail.email ?? '')
      setPhone(userDetail.phoneNumber ?? '')
    }
  }, [userDetail])

  // Prefer AHP config id coming from user detail (login payload).
  useEffect(() => {
    const id = userDetail?.ahpConfig?.ahpConfigId
    if (id && id !== '0') {
      setAhpConfigId(id)
      setAhpExists(true)
    }
  }, [userDetail?.ahpConfig?.ahpConfigId])

  useEffect(() => {
    if (!userId) return
    getAhpConfig(userId)
      .then((cfg) => {
        if (cfg) {
          setAhpExists(true)
          setAhpConfigId(cfg.ahpConfigId ?? '0')
          if (cfg.pairwiseMatrixJson) {
            try {
              const parsed = JSON.parse(cfg.pairwiseMatrixJson) as unknown
              if (Array.isArray(parsed) && parsed.every((row) => Array.isArray(row))) {
                setMatrix(parsed as number[][])
              }
            } catch {
              // ignore parse errors
            }
          }
        } else {
          setAhpExists(false)
          setAhpConfigId('0')
          setMatrix(buildDefaultMatrix())
        }
      })
      .catch(() => { /* no config yet */ })
      .finally(() => setAhpLoading(false))
  }, [userId])

  const weights = computeWeightsFromMatrix(matrix)

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    setProfileLoading(true)
    setProfileMsg(null)
    try {
      await updateUser({ userId, username, email, phoneNumber: phone || undefined })
      await refreshUserDetail()
      setProfileMsg({ type: 'success', text: 'Profile updated successfully' })
    } catch (err) {
      setProfileMsg({ type: 'error', text: err instanceof Error ? err.message : 'Update failed' })
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    if (newPw !== confirmPw) {
      setPwMsg({ type: 'error', text: 'New passwords do not match' })
      return
    }
    setPwLoading(true)
    setPwMsg(null)
    try {
      await updatePassword({ userId, currentPassword: currentPw, newPassword: newPw })
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
      setPwMsg({ type: 'success', text: 'Password updated' })
    } catch (err) {
      setPwMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update password' })
    } finally {
      setPwLoading(false)
    }
  }

  const handleAhpSave = async () => {
    if (!userId) return
    const synced = syncMatrix(matrix)
    const w = computeWeightsFromMatrix(synced)
    setAhpSaving(true)
    setAhpMsg(null)
    try {
      const resolvedAhpId = userDetail?.ahpConfig?.ahpConfigId || ahpConfigId

      if (!resolvedAhpId || resolvedAhpId === '0') {
        throw new Error('Missing AHP config id. Please re-login to sync user details (AHP config) before updating.')
      }

      const req = {
        ahpConfigId: resolvedAhpId,
        userId,
        criteriaJson: JSON.stringify(CRITERIA_LABELS),
        pairwiseMatrixJson: JSON.stringify(synced),
        weightsJson: JSON.stringify(w),
      }

      await updateAhpConfig(req)
      setAhpExists(true)
      setAhpMsg({ type: 'success', text: 'AHP configuration saved' })
    } catch (err) {
      setAhpMsg({ type: 'error', text: err instanceof Error ? err.message : 'Save failed' })
    } finally {
      setAhpSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!userId) return
    setDeleteLoading(true)
    try {
      await deleteUser(userId)
      logout()
      navigate('/login')
    } catch { /* ignore */ } finally {
      setDeleteLoading(false)
    }
  }

  const updateCell = (i: number, j: number, value: number) => {
    setMatrix((prev) => {
      const m = prev.map((row) => [...row])
      m[i][j] = value
      m[j][i] = value > 0 ? 1 / value : 1
      return m
    })
  }

  const inputCls = 'block w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100'
  const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5'
  const sectionCls = 'rounded-xl border border-slate-200 bg-white p-6 shadow-sm'

  const initials = userDetail?.username?.slice(0, 2).toUpperCase() ?? userDetail?.email?.slice(0, 2).toUpperCase() ?? '?'

  return (
    <div className="flex gap-6">
      {/* Left — Identity card */}
      <div className="w-64 shrink-0">
        <div className={`${sectionCls} flex flex-col items-center text-center`}>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white mb-3">
            {initials}
          </div>
          <p className="font-semibold text-slate-900">{userDetail?.username}</p>
          <p className="text-sm text-slate-500 mb-3">{userDetail?.email}</p>
          <div className="flex flex-wrap gap-1 justify-center">
            {userDetail?.subscriptions?.map((s) => (
              <Badge key={s.subscriptionId ?? s.subscriptionPlan?.planName ?? 'subscription'} variant="blue">
                {s.subscriptionPlan?.planName ?? s.status ?? 'Subscription'}
              </Badge>
            ))}
            {!userDetail?.subscriptions?.length && <Badge variant="slate">Free</Badge>}
            {userDetail?.isAdmin && <Badge variant="violet">Admin</Badge>}
          </div>
          <div className="mt-4 text-xs text-slate-400">
            Joined {formatDate(userDetail?.createdAt)}
          </div>
          <div className="mt-1 text-xs text-slate-300">ID: {userId}</div>
        </div>
      </div>

      {/* Right — Forms */}
      <div className="flex-1 flex flex-col gap-5">
        {/* Edit profile */}
        <div className={sectionCls}>
          <h2 className="text-base font-semibold text-slate-900 mb-4">Edit Profile</h2>
          <form onSubmit={(e) => void handleProfileSave(e)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelCls}>Username</label><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Phone</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="+84 xxx xxx xxxx" /></div>
            </div>
            {profileMsg && (
              <p className={`text-sm ${profileMsg.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>{profileMsg.text}</p>
            )}
            <button type="submit" disabled={profileLoading} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {profileLoading ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className={sectionCls}>
          <h2 className="text-base font-semibold text-slate-900 mb-4">Change Password</h2>
          <form onSubmit={(e) => void handlePasswordSave(e)} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div><label className={labelCls}>Current Password</label><input type="password" required value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>New Password</label><input type="password" required value={newPw} onChange={(e) => setNewPw(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Confirm New</label><input type="password" required value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className={inputCls} /></div>
            </div>
            {pwMsg && <p className={`text-sm ${pwMsg.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>{pwMsg.text}</p>}
            <button type="submit" disabled={pwLoading} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {pwLoading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* AHP Configuration */}
        <div className={sectionCls}>
          <h2 className="text-base font-semibold text-slate-900 mb-1">AHP Criteria Configuration</h2>
          <p className="text-xs text-slate-500 mb-4">Set pairwise importance of valuation criteria. Values &gt; 1 favor the row criterion.</p>
          {ahpLoading ? <LoadingSpinner size="sm" /> : (
            <>
              <div className="overflow-x-auto mb-4">
                <table className="text-xs border-collapse">
                  <thead>
                    <tr>
                      <th className="w-12" />
                      {CRITERIA_LABELS.map((l) => <th key={l} className="px-2 py-1 text-slate-500 font-medium">{l}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {matrix.map((row, i) => (
                      <tr key={i}>
                        <td className="pr-2 py-1 text-slate-600 font-medium">{CRITERIA_LABELS[i]}</td>
                        {row.map((val, j) => (
                          <td key={j} className="px-1 py-1">
                            {i === j ? (
                              <div className="w-14 text-center bg-slate-100 rounded px-2 py-1 font-mono text-slate-500">1</div>
                            ) : j > i ? (
                              <select
                                value={val}
                                onChange={(e) => updateCell(i, j, Number(e.target.value))}
                                className="w-14 rounded border border-slate-200 bg-white px-1 py-1 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
                              >
                                {AHP_VALUES.map((v) => (
                                  <option key={v} value={v}>{v < 1 ? `1/${Math.round(1/v)}` : v}</option>
                                ))}
                              </select>
                            ) : (
                              <div className="w-14 text-center px-2 py-1 font-mono text-slate-400 text-xs">
                                {val < 1 ? `1/${Math.round(1/val)}` : val.toFixed(0)}
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mb-4">
                <p className="text-xs font-medium text-slate-600 mb-2">Computed Weights</p>
                <AhpWeightsBarChart weights={weights} />
              </div>

              {ahpMsg && <p className={`text-sm mb-3 ${ahpMsg.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>{ahpMsg.text}</p>}
              <button onClick={() => void handleAhpSave()} disabled={ahpSaving} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                {ahpSaving ? 'Saving…' : ahpExists ? 'Update Config' : 'Save Config'}
              </button>
            </>
          )}
        </div>

        {/* Danger zone */}
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-base font-semibold text-red-700 mb-1">Danger Zone</h2>
          <p className="text-sm text-red-600 mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
          <button onClick={() => setDeleteModalOpen(true)} className="rounded-lg border border-red-300 bg-white px-5 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors">
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete confirm modal */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Account">
        <p className="text-sm text-slate-600 mb-5">Are you sure you want to delete your account? This is permanent and cannot be undone.</p>
        {deleteLoading && <LoadingSpinner size="sm" />}
        {!deleteLoading && (
          <div className="flex gap-3 justify-end">
            <button onClick={() => setDeleteModalOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
            <button onClick={() => void handleDelete()} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Delete Account</button>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ProfileSettings
