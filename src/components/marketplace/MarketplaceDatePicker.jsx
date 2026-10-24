export default function MarketplaceDatePicker({
  value = "",
  onChange,
  minDate,
  required = false,
}) {
  return (
    <input
      className="mk-date-input"
      type="date"
      value={
        value
      }
      min={
        minDate
      }
      onChange={(
        event
      ) =>
        onChange?.(
          event.target
            .value
        )
      }
      required={
        required
      }
    />
  );
}