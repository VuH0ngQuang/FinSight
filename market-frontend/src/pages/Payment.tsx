import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import { createSubscription, getSubscriptionPlans } from '../services/api/subscriptionApi'

const TIERS = [
  {
    name: 'Free',
    description: 'Get started with basic market data',
    features: ['Real-time price feed (MQTT)', 'Basic stock scanner', 'Up to 5 favorites', 'Dashboard overview'],
    cta: 'Current Plan',
    highlight: false,
  },
  {
    name: 'Pro',
    description: 'For serious investors',
    features: ['Everything in Free', 'Full TOPSIS analysis', 'AHP criteria customization', 'Portfolio allocator', 'Year-by-year financials', 'Valuation model charts', 'Email alerts'],
    cta: 'Upgrade to Pro',
    highlight: true,
  },
  {
    name: 'Enterprise',
    description: 'For institutions and teams',
    features: ['Everything in Pro', 'Unlimited portfolios', 'API access', 'Priority support', 'Custom data feeds', 'Team management'],
    cta: 'Contact Sales',
    highlight: false,
  },
] as const

type BillingPeriod = '1M' | '1Y'
type ProPricing = { price: string; amount: number; label: '/month' | '/year'; type: BillingPeriod; savings?: string }

const FAQ = [
  { q: 'Can I cancel anytime?', a: 'Yes. You can cancel your subscription at any time from your profile settings. No cancellation fees.' },
  { q: 'Is real-time data included in the free plan?', a: 'Yes. The MQTT price feed is available on all plans including Free.' },
  { q: 'How does the portfolio allocator work?', a: 'Our AI uses TOPSIS multi-criteria decision analysis, weighted by your AHP configuration, to optimally allocate your budget across ranked stocks.' },
  { q: 'What payment methods are accepted?', a: 'We accept bank transfers via PayOS, MoMo, and major Vietnamese banking apps.' },
]

const Payment = () => {
  const navigate = useNavigate()
  const { userId } = useAuthContext()
  const [billing, setBilling] = useState<BillingPeriod>('1M')
  const [monthlyPlanId, setMonthlyPlanId] = useState<number>(2)
  const [yearlyPlanId, setYearlyPlanId] = useState<number>(3)
  const [monthlyPlanAmount, setMonthlyPlanAmount] = useState<number>(199000)
  const [yearlyPlanAmount, setYearlyPlanAmount] = useState<number>(1990000)
  const [isPricingLoaded, setIsPricingLoaded] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const loadPlans = async () => {
      try {
        const plans = await getSubscriptionPlans()
        const normalized = plans.filter((plan) => plan.planName.toLowerCase().includes('pro'))
        const source = normalized.length > 0 ? normalized : plans
        const monthly = source.find((plan) => plan.billingCycle === 'MONTHLY')
        const yearly = source.find((plan) => plan.billingCycle === 'YEARLY')

        if (!mounted) return
        if (monthly && Number.isFinite(monthly.price) && monthly.price > 0) {
          setMonthlyPlanId(monthly.planId)
          setMonthlyPlanAmount(monthly.price)
        }
        if (yearly && Number.isFinite(yearly.price) && yearly.price > 0) {
          setYearlyPlanId(yearly.planId)
          setYearlyPlanAmount(yearly.price)
        }
      } catch (error) {
        // Keep fallback amounts when API is unavailable.
        console.error('Failed to load subscription plans', error)
      } finally {
        if (mounted) setIsPricingLoaded(true)
      }
    }

    void loadPlans()
    return () => {
      mounted = false
    }
  }, [])

  const formatCurrency = (amount: number): string => new Intl.NumberFormat('vi-VN').format(amount)

  const proMonthly: ProPricing = useMemo(
    () => ({ price: formatCurrency(monthlyPlanAmount), amount: monthlyPlanAmount, label: '/month', type: '1M' }),
    [monthlyPlanAmount]
  )

  const proYearly: ProPricing = useMemo(() => {
    const savingsAmount = monthlyPlanAmount * 12 - yearlyPlanAmount
    const savings = savingsAmount > 0 ? `${Math.round(savingsAmount / monthlyPlanAmount)} months free` : undefined
    return { price: formatCurrency(yearlyPlanAmount), amount: yearlyPlanAmount, label: '/year', type: '1Y', savings }
  }, [monthlyPlanAmount, yearlyPlanAmount])

  const selectedProPricing = billing === '1Y' ? proYearly : proMonthly

  const handleCta = async (tier: typeof TIERS[number]) => {
    if (tier.name !== 'Pro') return
    if (!userId) {
      navigate('/login')
      return
    }
    setCreateError(null)
    setIsCreating(true)
    try {
      const planId = billing === '1Y' ? yearlyPlanId : monthlyPlanId
      const checkoutUrl = await createSubscription({
        userId,
        subscriptionPlanId: planId,
        type: billing,
      })
      navigate('/payment/checkout', {
        state: {
          checkoutUrl,
          plan: {
            name: tier.name,
            price: selectedProPricing.price,
            period: selectedProPricing.label,
            type: selectedProPricing.type,
            features: [...tier.features],
          },
        },
      })
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Simple, transparent pricing</h1>
        <p className="text-slate-500">Start for free. Upgrade when you're ready.</p>
      </div>

      {/* Billing toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 gap-1">
          <button
            onClick={() => setBilling('1M')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              billing === '1M'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('1Y')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors flex items-center gap-2 ${
              billing === '1Y'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Yearly
            <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${
              billing === '1Y' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
            }`}>
              2 months free
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
        {TIERS.map((tier) => {
          const pricing = tier.name === 'Pro'
            ? selectedProPricing
            : null

          return (
          <div
            key={tier.name}
            className={`rounded-2xl border p-6 flex flex-col ${
              tier.highlight
                ? 'border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-200'
                : 'border-slate-200 bg-white text-slate-900'
            }`}
          >
            <div className="mb-4">
              <h2 className={`text-lg font-bold mb-1 ${tier.highlight ? 'text-white' : 'text-slate-900'}`}>{tier.name}</h2>
              <p className={`text-sm mb-3 ${tier.highlight ? 'text-blue-100' : 'text-slate-500'}`}>{tier.description}</p>
              <div className="flex items-baseline gap-1 flex-wrap">
                {pricing ? (
                  <>
                    <span className="text-3xl font-bold text-white">₫{pricing.price}</span>
                    <span className="text-sm text-blue-200">{pricing.label}</span>
                    {'savings' in pricing && billing === '1Y' && (
                      <span className="text-xs font-semibold bg-white/20 text-white rounded-full px-2 py-0.5 ml-1">
                        {pricing.savings}
                      </span>
                    )}
                  </>
                ) : tier.name === 'Enterprise' ? (
                  <span className="text-xl font-bold text-slate-900">Contact us</span>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-slate-900">₫0</span>
                    <span className="text-sm text-slate-500">/month</span>
                  </>
                )}
              </div>
            </div>

            <ul className="flex-1 space-y-2 mb-6">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <svg className={`h-4 w-4 mt-0.5 shrink-0 ${tier.highlight ? 'text-blue-200' : 'text-emerald-500'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  <span className={tier.highlight ? 'text-blue-50' : 'text-slate-600'}>{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => void handleCta(tier)}
              disabled={tier.name === 'Free' || (tier.name === 'Pro' && (!isPricingLoaded || isCreating))}
              className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                tier.highlight
                  ? 'bg-white text-blue-600 hover:bg-blue-50'
                  : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tier.name === 'Pro' && isCreating ? 'Creating...' : tier.cta}
            </button>
          </div>
          )
        })}
      </div>

      {createError && (
        <p className="text-sm text-red-600 text-center mt-2">{createError}</p>
      )}

      {/* FAQ */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-5">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {FAQ.map(({ q, a }) => (
            <div key={q} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
              <p className="text-sm font-semibold text-slate-900 mb-1">{q}</p>
              <p className="text-sm text-slate-500">{a}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 mt-6">
        PayOS integration in progress. Contact us for early access.
      </p>
    </div>
  )
}

export default Payment
