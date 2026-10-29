function toDateValue(
  iso
) {
  if (!iso) {
    return "";
  }

  const date =
    new Date(iso);

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}


function toTimeValue(
  iso
) {
  if (!iso) {
    return "";
  }

  const date =
    new Date(iso);

  return [
    String(
      date.getHours()
    ).padStart(
      2,
      "0"
    ),

    String(
      date.getMinutes()
    ).padStart(
      2,
      "0"
    ),
  ].join(":");
}


function mergeDateTime(
  dateValue,
  timeValue
) {
  if (
    !dateValue ||
    !timeValue
  ) {
    return null;
  }

  const date =
    new Date(
      `${dateValue}T${timeValue}:00`
    );

  return date.toISOString();
}


export default function JournalDateTime({
  value,
  onChange,
}) {
  const current =
    value ||
    new Date().toISOString();

  const date =
    toDateValue(
      current
    );

  const time =
    toTimeValue(
      current
    );

  return (
    <div className="jr-date-time">
      <label>
        <span className="jr-date-icon">
          ▣
        </span>

        <input
          type="date"
          value={date}
          onChange={(event) =>
            onChange(
              mergeDateTime(
                event.target
                  .value,
                time
              )
            )
          }
        />
      </label>

      <label>
        <span className="jr-time-icon">
          ◷
        </span>

        <input
          type="time"
          value={time}
          onChange={(event) =>
            onChange(
              mergeDateTime(
                date,
                event.target
                  .value
              )
            )
          }
        />
      </label>
    </div>
  );
}