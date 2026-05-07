import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import type { SubscriptionDto } from '../services/api/userApi'
import StatCard from '../components/ui/StatCard'
import Badge, { type BadgeVariant } from '../components/ui/Badge'
import { formatDate } from '../utils/formatters'

type StatusVariant = Exclude<BadgeVariant, 'violet'>

type StatusMeta = {
  variant: StatusVariant
  dotClass: string
}

const STATUS_META: Record<string, StatusMeta> = {
  ACTIVE: { variant: 'emerald', dotClass: 'bg-emerald-500' },
  EXPIRED: { variant: 'slate', dotClass: 'bg-slate-400' },
  CANCELED: { variant: 'red', dotClass: 'bg-red-500' },
  UNPAID: { variant: 'amber', dotClass: 'bg-amber-500' },
  ERROR: { variant: 'red', dotClass: 'bg-red-500' },
}

const formatCurrency = (value: number | undefined): string => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
  return `₫${new Intl.NumberFormat('vi-VN').format(value)}`
}

const formatBillingCycle = (value: string | undefined): string => {
  if (!value) return '—'
  if (value === 'MONTHLY') return 'Monthly'
  if (value === 'YEARLY') return 'Yearly'
  return value
}

const getTimestamp = (value: string | undefined): number => {
  if (!value) return 0
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? timestamp : 0
}

const getStatusMeta = (status: string | undefined): StatusMeta => STATUS_META[status ?? ''] ?? { variant: 'slate', dotClass: 'bg-slate-400' }

const SubscriptionHistory = () => {
  const { userDetail } = useAuthContext()
  const navigate = useNavigate()

  const subscriptions = useMemo(
    () =>
      [...(userDetail?.subscriptions ?? [])].sort(
        (a, b) => getTimestamp(b.startDate) - getTimestamp(a.startDate)
      ),
    [userDetail?.subscriptions]
  )

  const activeSubscription = useMemo(
    () => subscriptions.find((sub) => sub.status === 'ACTIVE'),
    [subscriptions]
  )

  const latestSubscription = subscriptions[0]
  const planLabel = activeSubscription?.subscriptionPlan?.planName ?? latestSubscription?.subscriptionPlan?.planName ?? 'Free'
  const statusLabel = activeSubscription?.status ?? latestSubscription?.status ?? 'NO SUBSCRIPTION'
  const renewalLabel = activeSubscription?.endDate
    ? `Renews ${formatDate(activeSubscription.endDate)}`
    : latestSubscription?.endDate
      ? `Expired ${formatDate(latestSubscription.endDate)}`
      : '—'

  const statusMeta = getStatusMeta(statusLabel)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Subscription History</h1>
        <p className="mt-1 text-sm text-slate-500">Review your current and past subscription plans.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Current Plan"
          value={planLabel}
          accent="blue"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          }
        />
        <StatCard
          label="Status"
          value={
            <Badge variant={statusMeta.variant}>
              <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${statusMeta.dotClass}`} />
              {statusLabel}
            </Badge>
          }
          accent={statusMeta.variant}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          }
        />
        <StatCard
          label={activeSubscription ? 'Renewal' : 'Expired'}
          value={renewalLabel}
          accent={activeSubscription ? 'emerald' : 'slate'}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
        />
      </div>

      <div className="mt-2">
        {subscriptions.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">No subscriptions yet</h2>
          <p className="mt-2 text-sm text-slate-500">Upgrade to Pro to unlock advanced analytics and portfolio tools.</p>
          <button
            type="button"
            onClick={() => navigate('/payment')}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Upgrade to Pro
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Billing</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Start</th>
                  <th className="px-4 py-3">End</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {subscriptions.map((subscription: SubscriptionDto) => {
                  const meta = getStatusMeta(subscription.status)
                  return (
                    <tr key={subscription.subscriptionId ?? `${subscription.startDate ?? ''}-${subscription.endDate ?? ''}-${subscription.status ?? ''}`}>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {subscription.subscriptionPlan?.planName ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {formatBillingCycle(subscription.subscriptionPlan?.billingCycle)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {formatCurrency(subscription.subscriptionPlan?.price)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{formatDate(subscription.startDate)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{formatDate(subscription.endDate)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={meta.variant}>
                          <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
                          {subscription.status ?? 'UNKNOWN'}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

export default SubscriptionHistory
