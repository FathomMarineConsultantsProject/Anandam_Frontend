import {
  useMemo,
} from "react";

function createOptions(
  interval = 15
) {
  const values = [];

  for (
    let minuteOfDay = 0;
    minuteOfDay <
    24 * 60;
    minuteOfDay +=
    interval
  ) {
    const hour =
      Math.floor(
        minuteOfDay /
          60
      );

    const minute =
      minuteOfDay %
      60;

    const value =
      `${String(
        hour
      ).padStart(
        2,
        "0"
      )}:${String(
        minute
      ).padStart(
        2,
        "0"
      )}`;

    const hour12 =
      hour % 12 ||
      12;

    const period =
      hour < 12
        ? "AM"
        : "PM";

    const label =
      `${String(
        hour12
      ).padStart(
        2,
        "0"
      )}:${String(
        minute
      ).padStart(
        2,
        "0"
      )} ${period}`;

    values.push({
      value,
      label,
    });
  }

  return values;
}

export default function TimeDropdown({
  value = "",
  onChange,
  placeholder = "Select time",
  required = false,
  disabled = false,
  minTime = "",
}) {
  const options =
    useMemo(
      () =>
        createOptions(
          15
        ),
      []
    );

  const filtered =
    minTime
      ? options.filter(
          (
            option
          ) =>
            option.value >
            minTime
        )
      : options;

  return (
    <select
      className="mk-time-select"
      value={
        value
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
      disabled={
        disabled
      }
    >
      <option
        value=""
        disabled={
          required
        }
      >
        {placeholder}
      </option>

      {filtered.map(
        (
          option
        ) => (
          <option
            key={
              option.value
            }
            value={
              option.value
            }
          >
            {option.label}
          </option>
        )
      )}
    </select>
  );
}