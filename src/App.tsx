import { useState, useEffect } from 'react'
import { refundOptions, RefundOption } from './data/mockOptions'
import AmountInput from './components/AmountInput'
import RefundOptions from './components/RefundOptions'
import SummaryPanel from './components/SummaryPanel'

const STORAGE_KEY_DEFAULTS   = 'refund_permanent_defaults'
const STORAGE_KEY_CUSTOM     = 'refund_custom_options'
const STORAGE_KEY_RATE       = 'refund_dollar_rate'
const STORAGE_KEY_OPT_CUR    = 'refund_option_currencies'
const STORAGE_KEY_OPT_RATES  = 'refund_option_rates'

function load<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback } catch { return fallback }
}

export default function App() {
  const [amountStr, setAmountStr]               = useState('')
  const [currency, setCurrency]                 = useState<'ILS' | 'USD'>('ILS')
  const [dollarRate, setDollarRate]             = useState<string>(() => localStorage.getItem(STORAGE_KEY_RATE) ?? '3.70')
  const [selected, setSelected]                 = useState<Set<string>>(new Set())
  const [permanent, setPermanent]               = useState<Record<string, number>>(() => load(STORAGE_KEY_DEFAULTS, {}))
  const [session, setSession]                   = useState<Record<string, number>>({})
  const [custom, setCustom]                     = useState<RefundOption[]>(() => load(STORAGE_KEY_CUSTOM, []))
  const [optionCurrencies, setOptionCurrencies] = useState<Record<string, 'ILS' | 'USD'>>(() => load(STORAGE_KEY_OPT_CUR, {}))
  const [optionRates, setOptionRates]           = useState<Record<string, string>>(() => load(STORAGE_KEY_OPT_RATES, {}))

  useEffect(() => { localStorage.setItem(STORAGE_KEY_DEFAULTS,  JSON.stringify(permanent))         }, [permanent])
  useEffect(() => { localStorage.setItem(STORAGE_KEY_CUSTOM,    JSON.stringify(custom))            }, [custom])
  useEffect(() => { localStorage.setItem(STORAGE_KEY_RATE,      dollarRate)                        }, [dollarRate])
  useEffect(() => { localStorage.setItem(STORAGE_KEY_OPT_CUR,   JSON.stringify(optionCurrencies))  }, [optionCurrencies])
  useEffect(() => { localStorage.setItem(STORAGE_KEY_OPT_RATES, JSON.stringify(optionRates))       }, [optionRates])

  const allOptions = [...refundOptions, ...custom]

  const getDeduction = (id: string): number => {
    if (id in session)   return session[id]
    if (id in permanent) return permanent[id]
    return allOptions.find((o) => o.id === id)?.defaultValue ?? 0
  }

  const getOptionCurrency = (id: string): 'ILS' | 'USD' => optionCurrencies[id] ?? 'ILS'

  const toggleOptionCurrency = (id: string) =>
    setOptionCurrencies((prev) => ({ ...prev, [id]: prev[id] === 'USD' ? 'ILS' : 'USD' }))

  // Returns the effective numeric rate for a specific option (own rate → global rate)
  const getOptionRate = (id: string): number => {
    const own = parseFloat(optionRates[id] ?? '')
    return own > 0 ? own : (parseFloat(dollarRate) || 0)
  }

  const setOptionRate = (id: string, val: string) =>
    setOptionRates((prev) => ({ ...prev, [id]: val }))

  const saveValue = (id: string, value: number, isForever: boolean) => {
    if (isForever) {
      setPermanent((prev) => ({ ...prev, [id]: value }))
      setSession((prev) => { const n = { ...prev }; delete n[id]; return n })
    } else {
      setSession((prev) => ({ ...prev, [id]: value }))
    }
  }

  const addCustom = (label: string, defaultValue: number) => {
    const id = `custom-${Date.now()}`
    setCustom((prev) => [...prev, { id, label, defaultValue }])
  }

  const deleteCustom = (id: string) => {
    setCustom((prev) => prev.filter((o) => o.id !== id))
    setSelected((prev)          => { const n = new Set(prev); n.delete(id); return n })
    setPermanent((prev)         => { const n = { ...prev }; delete n[id]; return n })
    setSession((prev)           => { const n = { ...prev }; delete n[id]; return n })
    setOptionCurrencies((prev)  => { const n = { ...prev }; delete n[id]; return n })
    setOptionRates((prev)       => { const n = { ...prev }; delete n[id]; return n })
  }

  const toggleSelected = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const customIds      = new Set(custom.map((o) => o.id))
  const rawAmount      = parseFloat(amountStr) || 0
  const globalRate     = parseFloat(dollarRate) || 0
  const originalAmount = currency === 'USD' ? rawAmount * globalRate : rawAmount

  // ILS totals — used for ₪ display and for internal calculations
  const totalDeductionsILS = allOptions
    .filter((o) => selected.has(o.id))
    .reduce((sum, o) => {
      const val  = getDeduction(o.id)
      const rate = getOptionRate(o.id)
      return sum + (getOptionCurrency(o.id) === 'USD' ? val * rate : val)
    }, 0)

  // USD totals — USD deductions kept as-is, ILS deductions divided by global rate
  const originalAmountUSD  = currency === 'USD' ? rawAmount : (globalRate > 0 ? originalAmount / globalRate : 0)
  const totalDeductionsUSD = allOptions
    .filter((o) => selected.has(o.id))
    .reduce((sum, o) => {
      const val = getDeduction(o.id)
      if (getOptionCurrency(o.id) === 'USD') return sum + val
      return sum + (globalRate > 0 ? val / globalRate : 0)
    }, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 flex items-start justify-center p-6 pt-12">
      <div className="w-full max-w-2xl">
        <div className="mb-6 text-right">
          <h1 className="text-2xl font-bold text-gray-800">מחשבון החזרים</h1>
          <p className="text-sm text-gray-500 mt-1">
            בחר את הסעיפים הרלוונטיים לחישוב ההחזר הסופי.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-4">
          <AmountInput
            value={amountStr}
            currency={currency}
            dollarRate={dollarRate}
            onValueChange={setAmountStr}
            onCurrencyChange={setCurrency}
            onRateChange={setDollarRate}
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-4">
          <RefundOptions
            options={allOptions}
            selected={selected}
            customIds={customIds}
            getDeduction={getDeduction}
            getOptionCurrency={getOptionCurrency}
            getOptionRate={getOptionRate}
            optionRates={optionRates}
            globalDollarRate={dollarRate}
            onToggle={toggleSelected}
            onSave={saveValue}
            onAdd={addCustom}
            onDelete={deleteCustom}
            onToggleCurrency={toggleOptionCurrency}
            onRateChange={setOptionRate}
          />
        </div>

        <SummaryPanel
          originalAmountILS={originalAmount}
          originalAmountUSD={originalAmountUSD}
          totalDeductionsILS={totalDeductionsILS}
          totalDeductionsUSD={totalDeductionsUSD}
          dollarRate={globalRate}
          paidInILS={currency === 'ILS'}
        />
      </div>
    </div>
  )
}
