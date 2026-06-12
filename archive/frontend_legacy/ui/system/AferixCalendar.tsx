import React, { memo, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../../utils/ui';

interface AferixCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  highlightedDates?: string[]; // ISO Strings
  className?: string;
}

/**
 * AferixCalendar: Cinematic scheduling control.
 * High-fidelity visual for workflow planning.
 */
export const AferixCalendar = memo(function AferixCalendar({ 
  selectedDate, 
  onDateSelect, 
  highlightedDates = [],
  className 
}: AferixCalendarProps) {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));

  const daysInMonth = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= lastDate; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [viewDate]);

  const monthName = viewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();

  const changeMonth = (offset: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date: Date) => {
    return date.getDate() === selectedDate.getDate() && 
           date.getMonth() === selectedDate.getMonth() && 
           date.getFullYear() === selectedDate.getFullYear();
  };

  const hasEvent = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const localIso = `${year}-${month}-${day}`;
    return highlightedDates.some(d => d.startsWith(localIso));
  };

  return (
    <div className={cn("bg-[#383F48] border border-white/[0.03] rounded-[32px] p-6 shadow-[var(--shadow-card)] backdrop-blur-md", className)}>
      <div className="flex items-center justify-between mb-6 px-2">
        <h3 className="text-[11px] font-black text-white uppercase tracking-[0.25em]">{monthName}</h3>
        <div className="flex gap-2">
          <button onClick={() => changeMonth(-1)} className="w-8 h-8 rounded-full bg-[#444D58] border border-white/5 flex items-center justify-center text-white/40 active:scale-90 transition-all">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => changeMonth(1)} className="w-8 h-8 rounded-full bg-[#444D58] border border-white/5 flex items-center justify-center text-white/40 active:scale-90 transition-all">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
          <span key={i} className="text-[10px] font-black text-white/20 text-center uppercase tracking-widest">{day}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} className="h-10" />;
          
          const selected = isSelected(date);
          const event = hasEvent(date);
          const today = isToday(date);

          const isHighlighted = selected || event;

          return (
            <button
              key={i}
              onClick={() => onDateSelect(date)}
              className={cn(
                "h-11 rounded-xl flex flex-col items-center justify-center relative transition-all active:scale-90 cursor-pointer border",
                isHighlighted ? "border-transparent" : "bg-transparent text-white/60 border-transparent hover:bg-white/5",
                today && !isHighlighted && "text-[#D4AF37] font-bold border-[#D4AF37]/20"
              )}
            >
              {/* SOLID BACKGROUND LAYER */}
              {isHighlighted && (
                <div 
                  className={cn(
                    "absolute inset-0 rounded-xl z-0",
                    selected ? "shadow-[var(--glow-gold),0_4px_12px_rgba(212,169,74,0.3)]" : ""
                  )}
                  style={{ backgroundColor: '#D4AF37', opacity: 1 }}
                />
              )}

              <span 
                className={cn("text-[13px] relative z-10 font-black")}
                style={isHighlighted ? { color: '#16181C' } : {}}
              >
                {date.getDate()}
              </span>

              {event && !selected && (
                <div 
                  className="absolute bottom-1 w-1.5 h-1.5 rounded-full z-20"
                  style={{ backgroundColor: '#16181C', opacity: 0.3 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});
