function getPreview(
  entry
) {
  if (
    entry.type ===
      "CUSTOM" &&
    entry.content
  ) {
    return entry.content;
  }

  const firstAnswer =
    entry.answers?.find(
      (item) =>
        item.answer?.trim()
    );

  if (firstAnswer) {
    return firstAnswer.answer;
  }

  const custom =
    entry.customBlocks?.find(
      (item) =>
        item.content?.trim()
    );

  return (
    custom?.content ||
    "No writing added yet."
  );
}


export default function JournalEntryRow({
  entry,
  onClick,
}) {
  const date =
    new Date(
      entry.entryDate
    );

  const dateText =
    new Intl.DateTimeFormat(
      "en-GB",
      {
        day:
          "numeric",

        month:
          "long",

        year:
          "numeric",
      }
    ).format(
      date
    );

  const timeText =
    new Intl.DateTimeFormat(
      "en-GB",
      {
        hour:
          "numeric",

        minute:
          "2-digit",

        hour12:
          true,
      }
    ).format(
      date
    );

  const title =
    entry.title ||
    entry.templateTitleSnapshot ||
    entry.template?.title ||
    "Untitled journal";

  return (
    <button
      type="button"
      className="jr-entry-row"
      onClick={onClick}
    >
      <div className="jr-entry-content">
        <div className="jr-entry-meta">
          <span>
            {dateText} ·{" "}
            {timeText}
          </span>

          {entry.status ===
            "DRAFT" && (
            <span className="jr-draft-badge">
              Draft
            </span>
          )}
        </div>

        <h3>
          {title}
        </h3>

        <p>
          {getPreview(
            entry
          )}
        </p>
      </div>
    </button>
  );
}