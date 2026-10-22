import { useEffect, useMemo, useRef, useState } from "react";
import dateRangeIcon from "../../assets/marketplace/date_range.svg";

function pad(value) {
  return String(value).padStart(2, "0");
}

function toValue(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function fromValue(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function displayValue(value, placeholder) {
  const date = fromValue(value);
  if (!date) return placeholder;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(date);
}

export default function MarketplaceDatePicker({ value, onChange, placeholder = "Select date", minDate, ariaLabel = "Choose date" }) {
  const selected = useMemo(() => fromValue(value), [value]);
  const initial = selected || new Date();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [draft, setDraft] = useState(selected);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [open]);

  useEffect(() => {
    if (selected) {
      setDraft(selected);
      setViewYear(selected.getFullYear());
      setViewMonth(selected.getMonth());
    }
  }, [value]);

  const monthLabel = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(new Date(viewYear, viewMonth, 1));
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const mondayOffset = (firstDay + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
  const min = minDate ? fromValue(minDate) : null;

  const cells = Array.from({ length: 42 }, (_, index) => {
    const raw = index - mondayOffset + 1;
    let year = viewYear;
    let month = viewMonth;
    let day = raw;
    let outside = false;
    if (raw < 1) {
      outside = true;
      month -= 1;
      if (month < 0) { month = 11; year -= 1; }
      day = prevMonthDays + raw;
    } else if (raw > daysInMonth) {
      outside = true;
      month += 1;
      if (month > 11) { month = 0; year += 1; }
      day = raw - daysInMonth;
    }
    const date = new Date(year, month, day);
    const disabled = min ? date < new Date(min.getFullYear(), min.getMonth(), min.getDate()) : false;
    return { date, day, outside, disabled };
  });

  function changeMonth(delta) {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  function chooseDate() {
    if (draft) onChange?.(toValue(draft));
    setOpen(false);
  }

  return (
    <div className="mk-date-picker" ref={rootRef}>
      <button
        type="button"
        className={`mk-date-trigger ${value ? "has-value" : ""}`}
        onClick={() => {
          setDraft(selected || new Date());
          setOpen((current) => !current);
        }}
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        <span>{displayValue(value, placeholder)}</span>
        <img src={dateRangeIcon} alt="" aria-hidden="true" />
      </button>

      {open && (
        <div className="mk-calendar-popover" role="dialog" aria-label="Date picker">
          <div className="mk-calendar-header">
            <button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month">‹</button>
            <strong>{monthLabel}</strong>
            <button type="button" onClick={() => changeMonth(1)} aria-label="Next month">›</button>
          </div>

          <div className="mk-calendar-weekdays">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => <span key={day}>{day}</span>)}
          </div>

          <div className="mk-calendar-grid">
            {cells.map(({ date, day, outside, disabled }, index) => {
              const chosen = draft && toValue(date) === toValue(draft);
              return (
                <button
                  type="button"
                  key={`${toValue(date)}-${index}`}
                  className={`${outside ? "outside" : ""} ${chosen ? "selected" : ""}`}
                  disabled={disabled}
                  onClick={() => setDraft(date)}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mk-calendar-actions">
            <button type="button" className="mk-calendar-cancel" onClick={() => setOpen(false)}>Cancel</button>
            <button type="button" className="mk-calendar-choose" onClick={chooseDate} disabled={!draft}>Choose Date</button>
          </div>
        </div>
      )}
    </div>
  );
}
