import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { usePayOS } from '@payos/payos-checkout'
import Badge from '../components/ui/Badge'

interface PlanInfo {
  name: string
  price: string
  period?: string
  type?: '1M' | '1Y'
  features: string[]
}

const DEFAULT_PLAN: PlanInfo = {
  name: 'Pro',
  price: '199,000',
  period: '/month',
  features: [
    'Full TOPSIS analysis',
    'AHP criteria customization',
    'Portfolio allocator',
    'Year-by-year financials',
    'Valuation model charts',
    'Email alerts',
  ],
}
interface CheckoutLocationState {
  checkoutUrl?: string
  plan?: PlanInfo
}

const PaymentPanel = ({ checkoutUrl, onSuccess }: { checkoutUrl: string; onSuccess: () => void }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { open, exit } = usePayOS({
    RETURN_URL: `${window.location.origin}/payment/checkout`,
    ELEMENT_ID: 'payos-embedded-container',
    CHECKOUT_URL: checkoutUrl,
    embedded: true,
    onSuccess: () => {
      setIsOpen(false)
      onSuccess()
    },
    onCancel: () => {
      setIsOpen(false)
    },
    onExit: () => {
      setIsOpen(false)
    },
  })

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      open()
      setIsOpen(true)
    })
    return () => {
      cancelAnimationFrame(frame)
      try { exit() } catch { /* ignore cleanup race */ }
    }
  }, [open, exit])

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Complete Payment</h2>
      <div
        id="payos-embedded-container"
        className="relative h-[460px] w-full rounded-xl border border-slate-100 overflow-hidden [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:block [&_iframe]:h-full [&_iframe]:w-full"
      />

      {!isOpen && (
        <p className="text-sm text-slate-400 text-center mt-4">
          Initializing payment...
        </p>
      )}

      {isOpen && (
        <p className="text-xs text-slate-400 text-center mt-4">
          After paying, the page will update automatically.
        </p>
      )}
    </div>
  )
}

// ─── Order summary panel ──────────────────────────────────────────────────────

const OrderSummaryPanel = ({ plan, onBack }: { plan: PlanInfo; onBack: () => void }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
    <h2 className="text-lg font-bold text-slate-900 mb-5">Order Summary</h2>

    <div className="flex items-center gap-2 mb-4">
      <Badge variant="blue">Pro Plan</Badge>
      {plan.period && (
        <span className="text-xs text-slate-500">billed monthly</span>
      )}
    </div>

    <ul className="space-y-2 mb-6">
      {plan.features.map((f) => (
        <li key={f} className="flex items-start gap-2 text-sm">
          <svg className="h-4 w-4 mt-0.5 shrink-0 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
          </svg>
          <span className="text-slate-600">{f}</span>
        </li>
      ))}
    </ul>

    <div className="border-t border-slate-200 pt-4 space-y-2 mb-6">
      <div className="flex justify-between text-sm">
        <span className="text-slate-500">Subtotal</span>
        <span className="text-slate-900 font-medium">₫{plan.price}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-slate-500">VAT (0%)</span>
        <span className="text-slate-900 font-medium">₫0</span>
      </div>
      <div className="flex justify-between text-base font-bold pt-1 border-t border-slate-100">
        <span className="text-slate-900">Total</span>
        <span className="text-blue-600">₫{plan.price}{plan.period}</span>
      </div>
    </div>

    <button
      onClick={onBack}
      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
    >
      ← Back to Plans
    </button>

    <p className="text-xs text-slate-400 text-center mt-4">
      Secured by PayOS · SSL encrypted
    </p>
  </div>
)

// ─── Success overlay ──────────────────────────────────────────────────────────

const SuccessOverlay = ({ onContinue }: { onContinue: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
    <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-xl text-center max-w-sm mx-4">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
        <svg className="h-8 w-8 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Payment received!</h2>
      <p className="text-sm text-slate-500 mb-6">
        Your Pro plan is being activated. This usually takes under a minute.
      </p>
      <button
        onClick={onContinue}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
      >
        Go to Dashboard
      </button>
    </div>
  </div>
)

// ─── Page ─────────────────────────────────────────────────────────────────────

const Checkout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { checkoutUrl, plan } = (location.state ?? {}) as CheckoutLocationState
  const normalizedPlan: PlanInfo = plan ?? DEFAULT_PLAN
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    if (!checkoutUrl) {
      navigate('/payment', { replace: true })
    }
  }, [checkoutUrl, navigate])

  return (
    <div className="max-w-5xl mx-auto">
      {confirmed && <SuccessOverlay onContinue={() => navigate('/')} />}

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Complete your purchase</h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete your PayOS payment below to activate your plan.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Left: payment (2/3) */}
        <div className="lg:col-span-2">
          {checkoutUrl ? (
            <PaymentPanel checkoutUrl={checkoutUrl} onSuccess={() => setConfirmed(true)} />
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-slate-500">
              Redirecting...
            </div>
          )}
        </div>

        {/* Right: order summary (1/3) */}
        <div className="lg:col-span-1">
          <OrderSummaryPanel plan={normalizedPlan} onBack={() => navigate('/payment')} />
        </div>
      </div>
    </div>
  )
}

export default Checkout
