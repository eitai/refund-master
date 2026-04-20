import { useState } from 'react'

interface Props {
  originalAmountILS: number
  originalAmountUSD: number
  totalDeductionsILS: number
  totalDeductionsUSD: number
  dollarRate: number
  paidInILS: boolean
}

export default function SummaryPanel({ originalAmountILS, originalAmountUSD, totalDeductionsILS, totalDeductionsUSD, dollarRate, paidInILS }: Props) {
  const [displayCurrency, setDisplayCurrency] = useState<'ILS' | 'USD'>('ILS')

  const canShowUSD = dollarRate > 0

  const original   = displayCurrency === 'USD' ? originalAmountUSD  : originalAmountILS
  const deductions = displayCurrency === 'USD' ? totalDeductionsUSD : totalDeductionsILS
  const final      = original - deductions

  const symbol     = displayCurrency === 'USD' ? '$' : '₪'
  const fmt        = (n: number) => `${symbol}${Math.abs(n).toFixed(2)}`

  const isNegative = final < 0
  const hasAmount  = originalAmountILS > 0

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
          <button
            onClick={() => setDisplayCurrency('ILS')}
            className={`px-3 py-1 font-medium transition-colors ${
              displayCurrency === 'ILS' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            ₪
          </button>
          <button
            onClick={() => setDisplayCurrency('USD')}
            disabled={!canShowUSD}
            className={`px-3 py-1 font-medium transition-colors ${
              displayCurrency === 'USD' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            $
          </button>
        </div>
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
          סיכום החזר
        </h2>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-700">
          <span className="font-medium">{fmt(original)}</span>
          <span>סכום מקורי</span>
        </div>

        <div className="flex justify-between text-red-500">
          <span className="font-medium">-{fmt(deductions)}</span>
          <span>סך הניכויים</span>
        </div>

        <div className="border-t border-gray-300 my-2" />

        <div className={`flex justify-between text-base font-bold ${
          !hasAmount ? 'text-gray-400' : isNegative ? 'text-red-600' : 'text-green-600'
        }`}>
          <span>{isNegative ? '-' : ''}{fmt(final)}</span>
          <span>החזר סופי</span>
        </div>

        {displayCurrency === 'USD' && canShowUSD && hasAmount && paidInILS && (
          <p className="text-xs text-amber-600 text-left pt-1">
            לפי שער ₪{dollarRate.toFixed(2)} לדולר
          </p>
        )}

        {isNegative && hasAmount && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg p-2 mt-2">
            הניכויים עולים על הסכום המקורי. אנא בדוק את הבחירות שלך.
          </p>
        )}

        {!hasAmount && (
          <p className="text-xs text-gray-400 text-center pt-1">
            הזן סכום למעלה לחישוב ההחזר שלך.
          </p>
        )}
      </div>
    </div>
  )
}
