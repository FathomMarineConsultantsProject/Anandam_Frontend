const REMINDER_OWNER_ATTRIBUTE =
  "data-anandam-reminder-owner";

const REMINDER_CHANGE_EVENT =
  "anandam:reminder-owner-change";

export const WORK_REST_PROMPT_EVENT =
  "anandam:work-rest-reminder:prompt";

export function getReminderOwner() {
  if (typeof document === "undefined") {
    return null;
  }

  return (
    document.body.getAttribute(
      REMINDER_OWNER_ATTRIBUTE
    ) || null
  );
}

export function tryAcquireReminder(owner) {
  if (
    typeof document === "undefined" ||
    !owner
  ) {
    return false;
  }

  const currentOwner =
    getReminderOwner();

  if (
    currentOwner &&
    currentOwner !== owner
  ) {
    return false;
  }

  document.body.setAttribute(
    REMINDER_OWNER_ATTRIBUTE,
    owner
  );

  window.dispatchEvent(
    new CustomEvent(
      REMINDER_CHANGE_EVENT,
      {
        detail: {
          owner,
        },
      }
    )
  );

  return true;
}

export function releaseReminder(owner) {
  if (
    typeof document === "undefined" ||
    !owner
  ) {
    return;
  }

  if (
    getReminderOwner() !== owner
  ) {
    return;
  }

  document.body.removeAttribute(
    REMINDER_OWNER_ATTRIBUTE
  );

  window.dispatchEvent(
    new CustomEvent(
      REMINDER_CHANGE_EVENT,
      {
        detail: {
          owner: null,
        },
      }
    )
  );
}

export function subscribeReminderOwner(
  listener
) {
  if (
    typeof window === "undefined" ||
    typeof listener !== "function"
  ) {
    return () => {};
  }

  function handleChange(event) {
    listener(
      event?.detail?.owner ??
        getReminderOwner()
    );
  }

  window.addEventListener(
    REMINDER_CHANGE_EVENT,
    handleChange
  );

  return () => {
    window.removeEventListener(
      REMINDER_CHANGE_EVENT,
      handleChange
    );
  };
}
