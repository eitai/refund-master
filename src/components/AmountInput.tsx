interface Props {
  value: string
  currency: 'ILS' | 'USD'
  dollarRate: string
  onValueChange: (val: string) => void
  onCurrencyChange: (c: 'ILS' | 'USD') => void
  onRateChange: (rate: string) => void
}

export default function AmountInput({ value, currency, dollarRate, onValueChange, onCurrencyChange, onRateChange }: Props) {
  const raw  = parseFloat(value) || 0
  const rate = parseFloat(dollarRate) || 0
  const ilsEquivalent = currency === 'USD' ? raw * rate : null

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
          <button
            onClick={() => onCurrencyChange('ILS')}
            className={`px-3 py-1 font-medium transition-colors ${
              currency === 'ILS' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            ₪ שקל
          </button>
          <button
            onClick={() => onCurrencyChange('USD')}
            className={`px-3 py-1 font-medium transition-colors ${
              currency === 'USD' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            $ דולר
          </button>
        </div>
        <label className="text-sm font-semibold text-gray-600">סכום ששולם במקור</label>
      </div>

      <div className="relative">
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
          {currency === 'ILS' ? '₪' : '$'}
        </span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder="0.00"
          className="w-full pr-7 pl-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold text-right"
        />
      </div>

      {currency === 'USD' && (
        <div className="mt-2 flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className="text-sm text-gray-600">שער דולר:</span>
            <div className="relative w-28">
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₪</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={dollarRate}
                onChange={(e) => onRateChange(e.target.value)}
                className="w-full pr-6 pl-2 py-1.5 text-sm border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-right bg-white"
              />
            </div>
          </div>
          {ilsEquivalent !== null && raw > 0 && rate > 0 && (
            <div className="text-sm font-semibold text-amber-700 whitespace-nowrap">
              = ₪{ilsEquivalent.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
