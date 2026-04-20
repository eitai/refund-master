export interface RefundOption {
  id: string
  label: string
  defaultValue: number
}

export const refundOptions: RefundOption[] = [
  { id: 'credit',     label: 'עלות ערך / זיכוי שקיבלנו', defaultValue: 0   },
  { id: 'handling',   label: 'דמי טיפול',                 defaultValue: 75  },
  { id: 'clearing',   label: 'עמלות סליקה',               defaultValue: 35  },
  { id: 'penalties',  label: 'קנסות',                     defaultValue: 100 },
  { id: 'insurance',  label: 'ביטוח ביטול טיסה',          defaultValue: 180 },
]
