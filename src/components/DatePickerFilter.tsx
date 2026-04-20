'use client'

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useLanguage } from '@/contexts/LanguageContext'
import { CalendarIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fr, de } from 'date-fns/locale'

interface DatePickerFilterProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
}

const DatePickerFilter = ({ value, onChange, placeholder }: DatePickerFilterProps) => {
  const [open, setOpen] = useState(false)
  const { locale } = useLanguage()
  const dateFnsLocale = locale === 'de' ? de : fr

  const selected = value ? new Date(value + 'T00:00:00') : undefined

  const formatted = selected
    ? selected.toLocaleDateString(`${locale}-CH`, { day: '2-digit', month: 'long', year: 'numeric' })
    : null

  const handleSelect = (date: Date | undefined) => {
    if (!date) return
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    onChange(`${yyyy}-${mm}-${dd}`)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'w-full flex items-center justify-between gap-2 h-9 px-3 rounded-md border text-base transition-colors',
            'bg-sidebar-accent border-sidebar-border text-sidebar-foreground',
            'hover:border-primary/50 focus:outline-none focus:border-primary',
            !formatted && 'text-sidebar-foreground/40'
          )}
        >
          <span className="truncate">{formatted ?? placeholder}</span>
          {value ? (
            <X
              className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/40 hover:text-sidebar-foreground"
              onClick={(e) => { e.stopPropagation(); onChange('') }}
            />
          ) : (
            <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/40" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" side="right">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          defaultMonth={selected}
          captionLayout="dropdown"
          locale={dateFnsLocale}
          weekStartsOn={1}
        />
      </PopoverContent>
    </Popover>
  )
}

export default DatePickerFilter
