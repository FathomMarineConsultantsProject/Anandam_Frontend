import { useMemo } from "react";

function buildTimeOptions(stepMinutes = 15) {
  const values = [];

  for (
    let minutes = 0;
    minutes < 24 * 60;
    minutes += stepMinutes
  ) {
    const hour =
      Math.floor(minutes / 60);

    const minute =
      minutes % 60;

    const value =
      `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

    const displayHour =
      hour % 12 || 12;

    const period =
      hour < 12
        ? "AM"
        : "PM";

    const label =
      `${String(displayHour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;

    values.push({
      value,
      label,
    });
  }

  return values;
}

export default function TimeDropdown({
  value,
  onChange,
  placeholder = "Select time",
  required = false,
  disabled = false,
  minTime = "",
}) {
  const options =
    useMemo(
      () => buildTimeOptions(15),
      []
    );

  const visibleOptions =
    minTime
      ? options.filter(
          (option) =>
            option.value > minTime
        )
      : options;

  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      required={required}
      disabled={disabled}
    >
      <option value="">
        {placeholder}
      </option>

      {visibleOptions.map(
        (option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        )
      )}
    </select>
  );
}