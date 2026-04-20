import { useState } from 'react'
import { SideOption } from '../data/mockOptions'

interface Props {
  options: SideOption[]
  selected: Set<string>
  customIds: Set<string>
  onToggle: (id: string) => void
  onAdd: (opt: Omit<SideOption, 'id'>) => void
  onDelete: (id: string) => void
}

const emptyForm = { label: '', description: '' }

export default function SideOptions({ options, selected, customIds, onToggle, onAdd, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const handleSubmit = () => {
    if (!form.label.trim()) return
    onAdd({ label: form.label.trim(), description: form.description.trim() })
    setForm(emptyForm)
    setShowForm(false)
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
        אפשרויות נוספות
      </h2>

      <div className="space-y-2">
        {options.map((opt) => {
          const isChecked = selected.has(opt.id)
          const isCustom = customIds.has(opt.id)
          return (
            <div
              key={opt.id}
              className={`flex items-start gap-2 p-3 rounded-lg border transition-all ${
                isChecked ? 'border-purple-400 bg-purple-50' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <label className="flex items-start gap-3 flex-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggle(opt.id)}
                  className="mt-0.5 w-4 h-4 accent-purple-600 cursor-pointer"
                />
                <div>
                  <div className="font-medium text-gray-800 text-sm">{opt.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{opt.description}</div>
                </div>
              </label>
              {isCustom && (
                <button
                  onClick={() => onDelete(opt.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors mt-0.5 flex-shrink-0"
                  title="מחק אפשרות"
                >
                  ✕
                </button>
              )}
            </div>
          )
        })}
      </div>

      {showForm ? (
        <div className="mt-3 p-3 border border-dashed border-purple-300 rounded-lg bg-purple-50 space-y-2">
          <input
            type="text"
            placeholder="שם האפשרות *"
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-right"
          />
          <input
            type="text"
            placeholder="תיאור"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-right"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setShowForm(false); setForm(emptyForm) }}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              ביטול
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.label.trim()}
              className="px-4 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              שמור
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="mt-3 w-full py-2 text-sm text-purple-600 border border-dashed border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
        >
          + הוסף אפשרות
        </button>
      )}
    </div>
  )
}
