import {
  X,
} from "lucide-react";


function ModalShell({
  title,
  children,
  onClose,
  hideClose = false,
}) {
  return (
    <div
      className="psychometric-modal-backdrop"
      role="presentation"
    >
      <div
        className="psychometric-modal"
        role="dialog"
        aria-modal="true"
      >
        <div className="psychometric-modal__header">
          <h2>
            {title}
          </h2>

          {!hideClose ? (
            <button
              type="button"
              className="psychometric-modal__close"
              onClick={
                onClose
              }
              aria-label="Close"
            >
              <X
                size={20}
                strokeWidth={1.6}
              />
            </button>
          ) : null}
        </div>

        {children}
      </div>
    </div>
  );
}


export default function PsychometricSubmitModal({
  mode,
  sectionTitle,
  unansweredCount = 0,
  timeText = "",
  nextSectionTitle = "",
  onClose,
  onReview,
  onContinue,
}) {
  if (!mode) {
    return null;
  }


  if (
    mode === "UNANSWERED"
  ) {
    return (
      <ModalShell
        title={`You have ${unansweredCount} unanswered ${
          unansweredCount === 1
            ? "question"
            : "questions"
        }`}
        onClose={
          onClose
        }
      >
        <p className="psychometric-modal__copy">
          You haven’t answered{" "}
          {unansweredCount}{" "}
          {unansweredCount === 1
            ? "question"
            : "questions"}{" "}
          in {sectionTitle}. You
          can review{" "}
          {unansweredCount === 1
            ? "it"
            : "them"}{" "}
          before submitting.
        </p>

        <div className="psychometric-modal__warning">
          Once submitted, you will
          not be able to return to{" "}
          {sectionTitle}.
        </div>

        <div className="psychometric-modal__actions">
          <button
            type="button"
            className="psychometric-button psychometric-button--outline"
            onClick={
              onReview
            }
          >
            Review Unanswered
          </button>

          <button
            type="button"
            className="psychometric-button"
            onClick={
              onContinue
            }
          >
            Continue Anyway
          </button>
        </div>
      </ModalShell>
    );
  }


  if (
    mode === "TIME_UP"
  ) {
    return (
      <ModalShell
        title="Time’s up"
        hideClose
      >
        <p className="psychometric-modal__copy">
          Your answers for this
          section have been saved
          and this section is now
          closed.
        </p>

        <div className="psychometric-modal__actions psychometric-modal__actions--single">
          <button
            type="button"
            className="psychometric-button"
            onClick={
              onContinue
            }
          >
            {nextSectionTitle
              ? `Continue to ${nextSectionTitle}`
              : "View Results"}
          </button>
        </div>
      </ModalShell>
    );
  }


  return (
    <ModalShell
      title={`Submit ${sectionTitle}?`}
      onClose={
        onClose
      }
    >
      {timeText ? (
        <div className="psychometric-modal__remaining">
          You still have{" "}
          <strong>
            {timeText}
          </strong>{" "}
          remaining.
        </div>
      ) : null}

      <p className="psychometric-modal__copy">
        Once submitted, you will
        not be able to return to{" "}
        {sectionTitle} or change
        your answers.
      </p>

      <div className="psychometric-modal__actions">
        <button
          type="button"
          className="psychometric-button psychometric-button--outline"
          onClick={
            onReview
          }
        >
          Continue Reviewing
        </button>

        <button
          type="button"
          className="psychometric-button"
          onClick={
            onContinue
          }
        >
          Submit & Continue
        </button>
      </div>
    </ModalShell>
  );
}