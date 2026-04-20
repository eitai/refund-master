import { useState } from 'react'
import { RefundOption } from '../data/mockOptions'

interface Props {
  options: RefundOption[]
  selected: Set<string>
  customIds: Set<string>
  getDeduction: (id: string) => number
  getOptionCurrency: (id: string) => 'ILS' | 'USD'
  getOptionRate: (id: string) => number
  optionRates: Record<string, string>
  globalDollarRate: string
  onToggle: (id: string) => void
  onSave: (id: string, value: number, isForever: boolean) => void
  onAdd: (label: string, defaultValue: number) => void
  onDelete: (id: string) => void
  onToggleCurrency: (id: string) => void
  onRateChange: (id: string, val: string) => void
}

interface RowState {
  editing: boolean
  inputVal: string
  confirming: boolean
}

const emptyForm = { label: '', value: '' }

export default function RefundOptions({
  options, selected, customIds, getDeduction, getOptionCurrency, getOptionRate,
  optionRates, globalDollarRate,
  onToggle, onSave, onAdd, onDelete, onToggleCurrency, onRateChange,
}: Props) {
  const [rowStates, setRowStates] = useState<Record<string, RowState>>({})
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState(emptyForm)

  const getRow = (id: string): RowState =>
    rowStates[id] ?? { editing: false, inputVal: '', confirming: false }

  const patchRow = (id: string, patch: Partial<RowState>) =>
    setRowStates((prev) => ({ ...prev, [id]: { ...getRow(id), ...patch } }))

  const startEdit = (id: string) =>
    patchRow(id, { editing: true, inputVal: String(getDeduction(id)), confirming: false })

  const cancelEdit = (id: string) =>
    patchRow(id, { editing: false, confirming: false, inputVal: '' })

  const submitEdit = (id: string) => {
    const val = parseFloat(getRow(id).inputVal)
    if (isNaN(val) || val < 0) return
    if (val === getDeduction(id)) { cancelEdit(id); return }
    patchRow(id, { confirming: true })
  }

  const confirmSave = (id: string, isForever: boolean) => {
    const val = parseFloat(getRow(id).inputVal)
    onSave(id, val, isForever)
    patchRow(id, { editing: false, confirming: false, inputVal: '' })
  }

  const handleAdd = () => {
    if (!form.label.trim()) return
    onAdd(form.label.trim(), parseFloat(form.value) || 0)
    setForm(emptyForm)
    setShowForm(false)
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
        סעיפי ניכוי
      </h2>

      <div className="space-y-2">
        {options.map((opt) => {
          const isChecked  = selected.has(opt.id)
          const isCustom   = customIds.has(opt.id)
          const row        = getRow(opt.id)
          const val        = getDeduction(opt.id)
          const cur        = getOptionCurrency(opt.id)
          const isUSD      = cur === 'USD'
          const symbol     = isUSD ? '$' : '₪'
          const rate       = getOptionRate(opt.id)
          const ilsVal     = isUSD && rate > 0 ? val * rate : null
          // own rate string (empty = using global)
          const ownRate    = optionRates[opt.id] ?? ''

          return (
            <div
              key={opt.id}
              onClick={() => !row.editing && onToggle(opt.id)}
              className={`rounded-lg border transition-all cursor-pointer select-none ${
                isChecked
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {/* Main row */}
              <div className="flex items-center gap-2 p-3">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggle(opt.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 accent-blue-600 cursor-pointer flex-shrink-0"
                />

                <span className="flex-1 font-medium text-gray-800 text-sm">{opt.label}</span>

                {/* Currency toggle */}
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleCurrency(opt.id) }}
                  className={`text-xs px-2 py-0.5 rounded-full border font-medium transition-colors flex-shrink-0 ${
                    isUSD
                      ? 'bg-amber-100 border-amber-300 text-amber-700 hover:bg-amber-200'
                      : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isUSD ? '$' : '₪'}
                </button>

                {/* Value / edit */}
                {row.editing ? (
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <span className="text-gray-400 text-sm">{symbol}</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.inputVal}
                      onChange={(e) => patchRow(opt.id, { inputVal: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter')  submitEdit(opt.id)
                        if (e.key === 'Escape') cancelEdit(opt.id)
                      }}
                      autoFocus
                      className="w-24 px-2 py-1 text-sm border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-right"
                    />
                    <button onClick={() => submitEdit(opt.id)} className="text-blue-600 hover:text-blue-800 text-sm font-bold px-1">✓</button>
                    <button onClick={() => cancelEdit(opt.id)} className="text-gray-400 hover:text-gray-600 text-sm px-1">✕</button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); startEdit(opt.id) }}
                    className="flex items-center gap-1 text-sm font-semibold text-red-500 hover:text-red-700 group transition-colors flex-shrink-0"
                  >
                    <span>-{symbol}{val.toFixed(2)}</span>
                    {ilsVal !== null && (
                      <span className="text-xs text-gray-400 font-normal">(₪{ilsVal.toFixed(0)})</span>
                    )}
                    <span className="text-gray-300 group-hover:text-gray-400 text-xs">✏️</span>
                  </button>
                )}

                {isCustom && !row.editing && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(opt.id) }}
                    className="text-gray-300 hover:text-red-400 transition-colors text-sm flex-shrink-0"
                    title="מחק סעיף"
                  >
                    🗑
                  </button>
                )}
              </div>

              {/* Per-row dollar rate — shown only when USD */}
              {isUSD && (
                <div
                  className="flex items-center justify-end gap-2 px-3 pb-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-xs text-gray-500">שער דולר לשורה זו:</span>
                  <div className="relative w-28">
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₪</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={ownRate}
                      onChange={(e) => onRateChange(opt.id, e.target.value)}
                      placeholder={globalDollarRate}
                      className="w-full pr-6 pl-2 py-1 text-xs border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white text-right"
                    />
                  </div>
                  {!ownRate && (
                    <span className="text-xs text-gray-400 italic">ברירת מחדל גלובלי</span>
                  )}
                </div>
              )}

              {/* Save confirmation */}
              {row.confirming && (
                <div className="px-3 pb-3 flex items-center gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                  <span className="text-xs text-gray-500 mr-auto">שמור את הערך החדש:</span>
                  <button
                    onClick={() => confirmSave(opt.id, false)}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    לסשן הנוכחי
                  </button>
                  <button
                    onClick={() => confirmSave(opt.id, true)}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    לצמיתות
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showForm ? (
        <div className="mt-3 p-3 border border-dashed border-blue-300 rounded-lg bg-blue-50 space-y-2">
          <input
            type="text"
            placeholder="שם הסעיף *"
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setShowForm(false); setForm(emptyForm) } }}
            autoFocus
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-right"
          />
          <div className="relative">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₪</span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="ערך ברירת מחדל"
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
              className="w-full pr-7 pl-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-right"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setShowForm(false); setForm(emptyForm) }}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              ביטול
            </button>
            <button
              onClick={handleAdd}
              disabled={!form.label.trim()}
              className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              הוסף
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="mt-3 w-full py-2 text-sm text-blue-600 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
        >
          + הוסף סעיף
        </button>
      )}
    </div>
  )
}
