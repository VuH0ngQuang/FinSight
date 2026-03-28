const TIERS = [
  {
    name: 'Free',
    price: '0',
    description: 'Get started with basic market data',
    features: ['Real-time price feed (MQTT)', 'Basic stock scanner', 'Up to 5 favorites', 'Dashboard overview'],
    cta: 'Current Plan',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '199,000',
    period: '/month',
    description: 'For serious investors',
    features: ['Everything in Free', 'Full TOPSIS analysis', 'AHP criteria customization', 'Portfolio allocator', 'Year-by-year financials', 'Valuation model charts', 'Email alerts'],
    cta: 'Upgrade to Pro',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Contact us',
    description: 'For institutions and teams',
    features: ['Everything in Pro', 'Unlimited portfolios', 'API access', 'Priority support', 'Custom data feeds', 'Team management'],
    cta: 'Contact Sales',
    highlight: false,
  },
]

const FAQ = [
  { q: 'Can I cancel anytime?', a: 'Yes. You can cancel your subscription at any time from your profile settings. No cancellation fees.' },
  { q: 'Is real-time data included in the free plan?', a: 'Yes. The MQTT price feed is available on all plans including Free.' },
  { q: 'How does the portfolio allocator work?', a: 'Our AI uses TOPSIS multi-criteria decision analysis, weighted by your AHP configuration, to optimally allocate your budget across ranked stocks.' },
  { q: 'What payment methods are accepted?', a: 'We accept bank transfers via PayOS, MoMo, and major Vietnamese banking apps.' },
]

const Payment = () => (
  <div className="max-w-4xl mx-auto">
    <div className="text-center mb-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Simple, transparent pricing</h1>
      <p className="text-slate-500">Start for free. Upgrade when you're ready.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
      {TIERS.map((tier) => (
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
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-bold ${tier.highlight ? 'text-white' : 'text-slate-900'}`}>
                {tier.price === 'Contact us' ? '' : '₫'}{tier.price}
              </span>
              {tier.period && <span className={`text-sm ${tier.highlight ? 'text-blue-200' : 'text-slate-500'}`}>{tier.period}</span>}
              {tier.price === 'Contact us' && <span className={`text-xl font-bold ${tier.highlight ? 'text-white' : 'text-slate-900'}`}>Contact us</span>}
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
            className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              tier.highlight
                ? 'bg-white text-blue-600 hover:bg-blue-50'
                : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tier.cta}
          </button>
        </div>
      ))}
    </div>

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

export default Payment
