import { useState } from 'react'
import { useStockList } from '../hooks/useStockList'
import { createStock, updateStock, deleteStock, updateIndustryRatios, type CreateStockRequest, type UpdateIndustryRatiosRequest } from '../services/api/stockApi'
import { uploadStockYearDataExcel } from '../services/api/stockYearDataApi'
import { getUserDetail, updateUser, adminResetPassword, deleteUser, type UserDetailDto } from '../services/api/userApi'
import { formatPrice, formatDate } from '../utils/formatters'
import TabGroup from '../components/ui/TabGroup'
import Modal from '../components/ui/Modal'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorBanner from '../components/ui/ErrorBanner'
import Badge from '../components/ui/Badge'

const TABS = [
  { id: 'stocks', label: 'Stocks' },
  { id: 'yeardata', label: 'Year Data' },
  { id: 'users', label: 'Users' },
]

const inputCls = 'block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

const defaultStockForm = (): CreateStockRequest => ({
  stockId: '', stockName: '', sector: '',
  peRatio: 0, pbRatio: 0, pcfRatio: 0, psRatio: 0,
  industryPeRatio: 0, industryPbRatio: 0, industryPcfRatio: 0, industryPsRatio: 0,
})

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('stocks')
  const { symbols, details, isLoading } = useStockList()

  // Stock CRUD state
  const [stockForm, setStockForm] = useState<CreateStockRequest>(defaultStockForm())
  const [editingStock, setEditingStock] = useState<string | null>(null)
  const [stockModalOpen, setStockModalOpen] = useState(false)
  const [deleteStockTarget, setDeleteStockTarget] = useState<string | null>(null)
  const [industryModalStock, setIndustryModalStock] = useState<string | null>(null)
  const [industryForm, setIndustryForm] = useState<UpdateIndustryRatiosRequest>({ stockId: '', industryPeRatio: 0, industryPbRatio: 0, industryPcfRatio: 0, industryPsRatio: 0 })
  const [stockMsg, setStockMsg] = useState<string | null>(null)
  const [stockErr, setStockErr] = useState<string | null>(null)

  // User management state
  const [userSearchId, setUserSearchId] = useState('')
  const [userSearchLoading, setUserSearchLoading] = useState(false)
  const [userSearchErr, setUserSearchErr] = useState<string | null>(null)
  const [loadedUser, setLoadedUser] = useState<UserDetailDto | null>(null)
  const [userMsg, setUserMsg] = useState<string | null>(null)

  // Edit user modal
  const [editUserOpen, setEditUserOpen] = useState(false)
  const [editUserForm, setEditUserForm] = useState({ username: '', email: '', phoneNumber: '' })
  const [editUserLoading, setEditUserLoading] = useState(false)
  const [editUserErr, setEditUserErr] = useState<string | null>(null)

  // Reset password modal
  const [resetPwOpen, setResetPwOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetPwLoading, setResetPwLoading] = useState(false)
  const [resetPwErr, setResetPwErr] = useState<string | null>(null)

  // Delete user modal
  const [deleteUserOpen, setDeleteUserOpen] = useState(false)
  const [deleteUserLoading, setDeleteUserLoading] = useState(false)

  // Year data state
  const [ydFile, setYdFile] = useState<File | null>(null)
  const [ydUploading, setYdUploading] = useState(false)
  const [ydErr, setYdErr] = useState<string | null>(null)
  const [ydMsg, setYdMsg] = useState<string | null>(null)

  const handleStockSubmit = async () => {
    setStockMsg(null); setStockErr(null)
    try {
      if (editingStock) await updateStock(stockForm)
      else await createStock(stockForm)
      setStockModalOpen(false)
      setEditingStock(null)
      setStockForm(defaultStockForm())
      setStockMsg(editingStock ? 'Stock updated' : 'Stock created')
    } catch (err) {
      setStockErr(err instanceof Error ? err.message : 'Operation failed')
    }
  }

  const handleDeleteStock = async (stockId: string) => {
    try {
      await deleteStock(stockId)
      setDeleteStockTarget(null)
      setStockMsg('Stock deleted')
    } catch (err) {
      setStockErr(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const handleUpdateIndustry = async () => {
    try {
      await updateIndustryRatios(industryForm)
      setIndustryModalStock(null)
      setStockMsg('Industry ratios updated')
    } catch (err) {
      setStockErr(err instanceof Error ? err.message : 'Update failed')
    }
  }

  // --- User handlers ---
  const handleUserSearch = async () => {
    if (!userSearchId.trim()) return
    setUserSearchLoading(true)
    setUserSearchErr(null)
    setLoadedUser(null)
    setUserMsg(null)
    try {
      const user = await getUserDetail(userSearchId.trim())
      setLoadedUser(user)
    } catch (err) {
      setUserSearchErr(err instanceof Error ? err.message : 'User not found')
    } finally {
      setUserSearchLoading(false)
    }
  }

  const openEditUser = () => {
    if (!loadedUser) return
    setEditUserForm({
      username: loadedUser.username ?? '',
      email: loadedUser.email ?? '',
      phoneNumber: loadedUser.phoneNumber ?? '',
    })
    setEditUserErr(null)
    setEditUserOpen(true)
  }

  const handleEditUserSave = async () => {
    if (!loadedUser) return
    setEditUserLoading(true)
    setEditUserErr(null)
    try {
      await updateUser({ userId: loadedUser.userId, ...editUserForm })
      const refreshed = await getUserDetail(loadedUser.userId)
      setLoadedUser(refreshed)
      setEditUserOpen(false)
      setUserMsg('User updated successfully')
    } catch (err) {
      setEditUserErr(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setEditUserLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!loadedUser) return
    if (newPassword !== confirmPassword) {
      setResetPwErr('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setResetPwErr('Password must be at least 6 characters')
      return
    }
    setResetPwLoading(true)
    setResetPwErr(null)
    try {
      await adminResetPassword({ userId: loadedUser.userId, password: newPassword })
      setResetPwOpen(false)
      setNewPassword('')
      setConfirmPassword('')
      setUserMsg('Password reset successfully')
    } catch (err) {
      setResetPwErr(err instanceof Error ? err.message : 'Reset failed')
    } finally {
      setResetPwLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!loadedUser) return
    setDeleteUserLoading(true)
    try {
      await deleteUser(loadedUser.userId)
      setDeleteUserOpen(false)
      setLoadedUser(null)
      setUserSearchId('')
      setUserMsg('User deleted successfully')
    } catch (err) {
      setUserSearchErr(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeleteUserLoading(false)
    }
  }

  const handleYdUpload = async () => {
    if (!ydFile) return
    setYdMsg(null); setYdErr(null)
    setYdUploading(true)
    try {
      const message = await uploadStockYearDataExcel(ydFile)
      setYdMsg(message)
      setYdFile(null)
    } catch (err) {
      setYdErr(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setYdUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-sm text-slate-500">Manage stocks and financial data</p>
        </div>
        <Badge variant="violet">Admin</Badge>
      </div>

      <TabGroup tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {(stockMsg || userMsg) && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 text-sm">
          {stockMsg || userMsg}
        </div>
      )}
      {stockErr && <ErrorBanner message={stockErr} onDismiss={() => setStockErr(null)} />}

      {activeTab === 'stocks' && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <button
              onClick={() => { setEditingStock(null); setStockForm(defaultStockForm()); setStockModalOpen(true) }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              + Add Stock
            </button>
          </div>

          {isLoading ? <LoadingSpinner /> : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {['ID', 'Name', 'Sector', 'P/E', 'P/B', 'P/CF', 'P/S', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {symbols?.map((sym) => {
                    const d = details[sym]
                    return (
                      <tr key={sym} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-slate-900">{sym}</td>
                        <td className="px-4 py-3 text-slate-700 max-w-32 truncate">{d?.stockName ?? '—'}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{d?.sector ?? '—'}</td>
                        <td className="px-4 py-3 font-mono text-xs">{d ? formatPrice(d.peRatio) : '—'}</td>
                        <td className="px-4 py-3 font-mono text-xs">{d ? formatPrice(d.pbRatio) : '—'}</td>
                        <td className="px-4 py-3 font-mono text-xs">{d ? formatPrice(d.pcfRatio) : '—'}</td>
                        <td className="px-4 py-3 font-mono text-xs">{d ? formatPrice(d.psRatio) : '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingStock(sym)
                                setStockForm({ stockId: sym, stockName: d?.stockName ?? '', sector: d?.sector ?? '', peRatio: d?.peRatio, pbRatio: d?.pbRatio, pcfRatio: d?.pcfRatio, psRatio: d?.psRatio, industryPeRatio: d?.industryPeRatio, industryPbRatio: d?.industryPbRatio, industryPcfRatio: d?.industryPcfRatio, industryPsRatio: d?.industryPsRatio })
                                setStockModalOpen(true)
                              }}
                              className="text-xs text-blue-600 hover:underline"
                            >Edit</button>
                            <button
                              onClick={() => {
                                setIndustryModalStock(sym)
                                setIndustryForm({ stockId: sym, industryPeRatio: d?.industryPeRatio ?? 0, industryPbRatio: d?.industryPbRatio ?? 0, industryPcfRatio: d?.industryPcfRatio ?? 0, industryPsRatio: d?.industryPsRatio ?? 0 })
                              }}
                              className="text-xs text-amber-600 hover:underline"
                            >Industry</button>
                            <button onClick={() => setDeleteStockTarget(sym)} className="text-xs text-red-600 hover:underline">Delete</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'yeardata' && (
        <div className="flex flex-col gap-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Upload Year Data via Excel</h3>
            <p className="text-sm text-slate-600 mb-4">
              Manual input is disabled. Upload an Excel file and it will be processed by the market-ingestion service.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setYdFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
              />
              <button
                onClick={() => void handleYdUpload()}
                disabled={ydUploading || !ydFile}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {ydUploading ? 'Uploading…' : 'Upload Excel'}
              </button>
            </div>
            {ydFile && <p className="mt-2 text-xs text-slate-500">Selected file: {ydFile.name}</p>}
          </div>

          {ydErr && <ErrorBanner message={ydErr} onDismiss={() => setYdErr(null)} />}
          {ydMsg && <div className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 text-sm">{ydMsg}</div>}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="flex flex-col gap-5">
          {/* Lookup */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Look up user by ID</h3>
            <p className="text-xs text-slate-500 mb-3">Enter a userId to load their profile, then edit, reset password, or delete.</p>
            <div className="flex gap-3">
              <input
                type="text"
                value={userSearchId}
                onChange={(e) => setUserSearchId(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') void handleUserSearch() }}
                className={inputCls}
                placeholder="User ID…"
              />
              <button
                onClick={() => void handleUserSearch()}
                disabled={userSearchLoading || !userSearchId.trim()}
                className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {userSearchLoading ? '…' : 'Load'}
              </button>
            </div>
            {userSearchErr && <p className="mt-2 text-sm text-red-600">{userSearchErr}</p>}
          </div>

          {/* Loaded user card */}
          {loadedUser && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-sm">
                    {(loadedUser.username ?? loadedUser.email ?? '?').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{loadedUser.username}</p>
                    <p className="text-sm text-slate-500">{loadedUser.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {loadedUser.isAdmin && <Badge variant="violet">Admin</Badge>}
                  {loadedUser.subscriptions?.map((s) => (
                    <Badge key={s.subscriptionId ?? s.subscriptionPlan?.planName} variant="blue">
                      {s.subscriptionPlan?.planName ?? s.status ?? 'Subscription'}
                    </Badge>
                  ))}
                  {!loadedUser.subscriptions?.length && <Badge variant="slate">Free</Badge>}
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-5">
                <div>
                  <dt className="text-xs text-slate-400">User ID</dt>
                  <dd className="font-mono text-xs text-slate-700">{loadedUser.userId}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Phone</dt>
                  <dd className="text-slate-700">{loadedUser.phoneNumber || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Joined</dt>
                  <dd className="text-slate-700">{formatDate(loadedUser.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">AHP Config</dt>
                  <dd className="text-slate-700">{loadedUser.ahpConfig ? `ID ${loadedUser.ahpConfig.ahpConfigId}` : 'None'}</dd>
                </div>
              </dl>

              <div className="flex gap-3 border-t border-slate-100 pt-4">
                <button
                  onClick={openEditUser}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => { setResetPwErr(null); setNewPassword(''); setConfirmPassword(''); setResetPwOpen(true) }}
                  className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
                >
                  Reset Password
                </button>
                <button
                  onClick={() => setDeleteUserOpen(true)}
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
                >
                  Delete User
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stock edit/create modal */}
      <Modal open={stockModalOpen} onClose={() => setStockModalOpen(false)} title={editingStock ? 'Edit Stock' : 'Add Stock'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Stock ID</label><input type="text" value={stockForm.stockId} onChange={(e) => setStockForm((p) => ({ ...p, stockId: e.target.value.toUpperCase() }))} className={inputCls} disabled={!!editingStock} /></div>
          <div><label className={labelCls}>Stock Name</label><input type="text" value={stockForm.stockName ?? ''} onChange={(e) => setStockForm((p) => ({ ...p, stockName: e.target.value }))} className={inputCls} /></div>
          <div><label className={labelCls}>Sector</label><input type="text" value={stockForm.sector ?? ''} onChange={(e) => setStockForm((p) => ({ ...p, sector: e.target.value }))} className={inputCls} /></div>
          {(['peRatio', 'pbRatio', 'pcfRatio', 'psRatio'] as const).map((k) => (
            <div key={k}><label className={labelCls}>{k}</label><input type="number" step="any" value={stockForm[k] ?? ''} onChange={(e) => setStockForm((p) => ({ ...p, [k]: Number(e.target.value) }))} className={inputCls} /></div>
          ))}
        </div>
        <div className="mt-4 flex gap-3 justify-end">
          <button onClick={() => setStockModalOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
          <button onClick={() => void handleStockSubmit()} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Save</button>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteStockTarget} onClose={() => setDeleteStockTarget(null)} title="Delete Stock">
        <p className="text-sm text-slate-600 mb-5">Delete <strong>{deleteStockTarget}</strong>? This cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteStockTarget(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
          <button onClick={() => void handleDeleteStock(deleteStockTarget!)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Delete</button>
        </div>
      </Modal>

      {/* Industry ratios modal */}
      <Modal open={!!industryModalStock} onClose={() => setIndustryModalStock(null)} title={`Industry Ratios — ${industryModalStock}`}>
        <div className="grid grid-cols-2 gap-4">
          {(['industryPeRatio', 'industryPbRatio', 'industryPcfRatio', 'industryPsRatio'] as const).map((k) => (
            <div key={k}><label className={labelCls}>{k}</label><input type="number" step="any" value={industryForm[k] ?? ''} onChange={(e) => setIndustryForm((p) => ({ ...p, [k]: Number(e.target.value) }))} className={inputCls} /></div>
          ))}
        </div>
        <div className="mt-4 flex gap-3 justify-end">
          <button onClick={() => setIndustryModalStock(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
          <button onClick={() => void handleUpdateIndustry()} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Update</button>
        </div>
      </Modal>

      {/* Edit user modal */}
      <Modal open={editUserOpen} onClose={() => setEditUserOpen(false)} title={`Edit User — ${loadedUser?.userId}`}>
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>Username</label>
            <input type="text" value={editUserForm.username} onChange={(e) => setEditUserForm((p) => ({ ...p, username: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" value={editUserForm.email} onChange={(e) => setEditUserForm((p) => ({ ...p, email: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input type="tel" value={editUserForm.phoneNumber} onChange={(e) => setEditUserForm((p) => ({ ...p, phoneNumber: e.target.value }))} className={inputCls} placeholder="+84 xxx xxx xxxx" />
          </div>
          {editUserErr && <p className="text-sm text-red-600">{editUserErr}</p>}
        </div>
        <div className="mt-5 flex gap-3 justify-end">
          <button onClick={() => setEditUserOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
          <button
            onClick={() => void handleEditUserSave()}
            disabled={editUserLoading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {editUserLoading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </Modal>

      {/* Reset password modal */}
      <Modal open={resetPwOpen} onClose={() => setResetPwOpen(false)} title={`Reset Password — ${loadedUser?.username ?? loadedUser?.userId}`}>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-500">Set a new password for this user. They will use it on next login.</p>
          <div>
            <label className={labelCls}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputCls}
              placeholder="Min. 6 characters"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className={labelCls}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputCls}
              placeholder="Repeat password"
              autoComplete="new-password"
            />
          </div>
          {resetPwErr && <p className="text-sm text-red-600">{resetPwErr}</p>}
        </div>
        <div className="mt-5 flex gap-3 justify-end">
          <button onClick={() => setResetPwOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
          <button
            onClick={() => void handleResetPassword()}
            disabled={resetPwLoading || !newPassword}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
          >
            {resetPwLoading ? 'Resetting…' : 'Reset Password'}
          </button>
        </div>
      </Modal>

      {/* Delete user confirm modal */}
      <Modal open={deleteUserOpen} onClose={() => setDeleteUserOpen(false)} title="Delete User">
        <p className="text-sm text-slate-600 mb-2">
          Permanently delete <strong>{loadedUser?.username ?? loadedUser?.email}</strong>?
        </p>
        <p className="text-sm text-slate-500 mb-5">This will remove all their data, favorites, and configuration. This cannot be undone.</p>
        {deleteUserLoading && <LoadingSpinner size="sm" />}
        {!deleteUserLoading && (
          <div className="flex gap-3 justify-end">
            <button onClick={() => setDeleteUserOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
            <button onClick={() => void handleDeleteUser()} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Delete User</button>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminPanel
