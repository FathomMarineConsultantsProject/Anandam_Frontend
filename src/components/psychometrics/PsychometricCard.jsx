import {
  ClipboardList,
  Gift,
} from "lucide-react";

import {
  getPsychometricIllustration,
} from "../../utils/psychometricAssets";


export default function PsychometricCard({
  test,
  featured = false,
  onOpen,
}) {
  const illustration =
    getPsychometricIllustration(
      test
    );

  const attemptCount =
    Number(
      test?.attemptCount ??
      test?.eligibility
        ?.attemptCount ??
      0
    );

  const firstAttemptUsed =
    Boolean(
      test?.eligibility
        ?.firstAttemptUsed ??
      test?.firstAttemptUsed ??
      attemptCount > 0
    );

  const questionCount =
    Number(
      test?.questionCount ??
      test?.questionsPerAttempt ??
      20
    );

  const repeatCost =
    Number(
      test?.repeatTokenCost ??
      test?.eligibility
        ?.repeatTokenCost ??
      1
    );


  if (featured) {
    const duration =
      Number(
        test?.durationMinutes ??
        test?.sections?.reduce(
          (
            total,
            section
          ) =>
            total +
            Number(
              section?.durationMinutes ||
                0
            ),
          0
        ) ??
        80
      );

    const sectionCount =
      Number(
        test?.sectionCount ??
        test?.sections?.length ??
        3
      );


    return (
      <article className="pad-featured-card">

        <div className="pad-featured-card__top">

          <div>
            {illustration ? (
              <img
                src={illustration}
                alt=""
                aria-hidden="true"
                className="pad-featured-card__image"
              />
            ) : null}


            <h2>
              {test?.title ||
                "Maritime Human Performance Analysis"}
            </h2>


            <p>
              {test?.description ||
                "Explore your reasoning, leadership, and safety judgement across three timed sections."}
            </p>
          </div>


          <div
            className={`pad-attempt-badge ${
              firstAttemptUsed
                ? "is-used"
                : ""
            }`}
          >
            <Gift
              size={15}
              strokeWidth={1.5}
            />

            {firstAttemptUsed
              ? "First attempt used"
              : "First attempt is free"}
          </div>

        </div>


        <div className="pad-featured-card__bottom">

          <div className="pad-meta">

            <span>
              <ClipboardList
                size={17}
                strokeWidth={1.4}
              />

              {questionCount} Questions
            </span>


            <span>
              ◷ {duration} Minutes
            </span>


            <span>
              ☷ {sectionCount} Sections
            </span>

          </div>


          {firstAttemptUsed ? (
            <span className="pad-token-required">
              {repeatCost}{" "}
              {repeatCost === 1
                ? "Token"
                : "Tokens"}{" "}
              required
            </span>
          ) : null}


          <button
            type="button"
            className="psychometric-button pad-get-started"
            onClick={() =>
              onOpen?.(test)
            }
          >
            Get started
          </button>

        </div>

      </article>
    );
  }


  return (
    <article className="pad-assessment-card">

      <div className="pad-assessment-card__top">

        {illustration ? (
          <img
            src={illustration}
            alt=""
            aria-hidden="true"
            className="pad-assessment-card__image"
          />
        ) : null}


        <div
          className={`pad-attempt-badge ${
            firstAttemptUsed
              ? "is-used"
              : ""
          }`}
        >
          <Gift
            size={14}
            strokeWidth={1.5}
          />

          {firstAttemptUsed
            ? "First attempt used"
            : "First attempt is free"}
        </div>

      </div>


      <h2>
        {test?.title ||
          "Assessment"}
      </h2>


      <p>
        {test?.description ||
          ""}
      </p>


      <div className="pad-assessment-card__footer">

        <span>
          <ClipboardList
            size={17}
            strokeWidth={1.4}
          />

          {questionCount} questions
        </span>


        <button
          type="button"
          className="psychometric-button"
          onClick={() =>
            onOpen?.(test)
          }
        >
          Get started
        </button>

      </div>

    </article>
  );
}