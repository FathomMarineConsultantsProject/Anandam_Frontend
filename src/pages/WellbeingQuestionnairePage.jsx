import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Check,
  RefreshCw,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";

import {
  getWellbeingQuestionnaireBySlug,
  submitWellbeingQuestionnaire,
  getWellbeingQuestionnaireErrorMessage,
} from "../api/wellbeingQuestionnaireApi";

import {
  getQuestionnaireIllustration,
} from "../utils/questionnaireAssets";

import "../styles/wellbeing-questionnaires.css";


function createEmptyAnswer(
  question
) {
  return {
    selectedOptionIds: [],
    numericValue: "",
    textValue: "",

    /*
      Only used visually by
      DURATION_MINUTES.
    */
    hours: "",
    minutes: "",
  };
}


function isQuestionAnswered(
  question,
  answer
) {
  if (!question || !answer) {
    return false;
  }

  switch (
    question.questionType
  ) {
    case "SINGLE_CHOICE":
    case "BOOLEAN":
    case "MULTI_CHOICE":
      return (
        Array.isArray(
          answer.selectedOptionIds
        ) &&
        answer.selectedOptionIds
          .length > 0
      );


    case "DURATION_MINUTES":
      return (
        answer.hours !== "" ||
        answer.minutes !== ""
      );


    case "SCALE":
      return (
        answer.numericValue !== "" &&
        answer.numericValue !== null &&
        answer.numericValue !==
          undefined
      );


    case "TEXT":
      return Boolean(
        String(
          answer.textValue || ""
        ).trim()
      );


    default:
      return false;
  }
}


function getDurationTotalMinutes(
  answer
) {
  const hours =
    answer?.hours === ""
      ? 0
      : Number(answer.hours);

  const minutes =
    answer?.minutes === ""
      ? 0
      : Number(answer.minutes);

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes)
  ) {
    return null;
  }

  if (
    hours < 0 ||
    hours > 24 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  const total =
    Math.floor(hours) * 60 +
    Math.floor(minutes);

  if (total > 1440) {
    return null;
  }

  return total;
}


function QuestionOptions({
  question,
  answer,
  onChange,
}) {
  const multiple =
    question.questionType ===
    "MULTI_CHOICE";

  const selected =
    answer?.selectedOptionIds ||
    [];


  return (
    <div className="wellbeing-options">

      {(question.options || []).map(
        (option) => {
          const checked =
            selected.includes(
              option.id
            );

          return (
            <label
              key={option.id}
              className={`wellbeing-option${
                checked
                  ? " is-selected"
                  : ""
              }`}
            >

              <input
                type={
                  multiple
                    ? "checkbox"
                    : "radio"
                }
                name={
                  multiple
                    ? undefined
                    : `question-${question.id}`
                }
                checked={checked}
                onChange={() => {
                  if (multiple) {
                    const next =
                      checked
                        ? selected.filter(
                            (id) =>
                              id !==
                              option.id
                          )
                        : [
                            ...selected,
                            option.id,
                          ];

                    onChange({
                      ...answer,
                      selectedOptionIds:
                        next,
                    });

                    return;
                  }

                  onChange({
                    ...answer,
                    selectedOptionIds: [
                      option.id,
                    ],
                  });
                }}
              />


              <span
                className={
                  multiple
                    ? "wellbeing-option__checkbox"
                    : "wellbeing-option__radio"
                }
                aria-hidden="true"
              >
                {multiple &&
                checked ? (
                  <Check
                    size={13}
                    strokeWidth={2}
                  />
                ) : null}
              </span>


              <span className="wellbeing-option__label">
                {option.label}
              </span>

            </label>
          );
        }
      )}

    </div>
  );
}


function DurationInput({
  answer,
  onChange,
}) {
  return (
    <div className="wellbeing-duration">

      <label>
        <span>Hours</span>

        <input
          type="number"
          min="0"
          max="24"
          step="1"
          inputMode="numeric"
          value={
            answer?.hours ?? ""
          }
          placeholder="0"
          onChange={(event) =>
            onChange({
              ...answer,
              hours:
                event.target.value,
            })
          }
        />
      </label>


      <label>
        <span>Minutes</span>

        <input
          type="number"
          min="0"
          max="59"
          step="1"
          inputMode="numeric"
          value={
            answer?.minutes ?? ""
          }
          placeholder="0"
          onChange={(event) =>
            onChange({
              ...answer,
              minutes:
                event.target.value,
            })
          }
        />
      </label>

    </div>
  );
}


function ScaleInput({
  question,
  answer,
  onChange,
}) {
  /*
    If the backend supplies options for
    the scale, use them.

    Otherwise show a numeric field.
  */

  if (
    Array.isArray(question.options) &&
    question.options.length > 0
  ) {
    return (
      <QuestionOptions
        question={{
          ...question,
          questionType:
            "SINGLE_CHOICE",
        }}
        answer={answer}
        onChange={onChange}
      />
    );
  }


  return (
    <input
      className="wellbeing-number-input"
      type="number"
      step="1"
      value={
        answer?.numericValue ?? ""
      }
      onChange={(event) =>
        onChange({
          ...answer,
          numericValue:
            event.target.value,
        })
      }
    />
  );
}


function QuestionField({
  question,
  answer,
  error,
  onChange,
}) {
  switch (
    question.questionType
  ) {
    case "SINGLE_CHOICE":
    case "BOOLEAN":
    case "MULTI_CHOICE":
      return (
        <QuestionOptions
          question={question}
          answer={answer}
          onChange={onChange}
        />
      );


    case "DURATION_MINUTES":
      return (
        <DurationInput
          answer={answer}
          onChange={onChange}
        />
      );


    case "SCALE":
      return (
        <ScaleInput
          question={question}
          answer={answer}
          onChange={onChange}
        />
      );


    case "TEXT":
      return (
        <textarea
          className="wellbeing-textarea"
          rows="4"
          value={
            answer?.textValue || ""
          }
          placeholder="Type your answer"
          onChange={(event) =>
            onChange({
              ...answer,
              textValue:
                event.target.value,
            })
          }
        />
      );


    default:
      return (
        <div className="wellbeing-question-unsupported">
          This question type is not
          currently supported.
        </div>
      );
  }
}


export default function WellbeingQuestionnairePage() {
  const navigate =
    useNavigate();

  const { slug } =
    useParams();


  const [
    questionnaire,
    setQuestionnaire,
  ] = useState(null);

  const [
    answers,
    setAnswers,
  ] = useState({});

  const [
    errors,
    setErrors,
  ] = useState({});

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    pageError,
    setPageError,
  ] = useState("");

  const [
    completed,
    setCompleted,
  ] = useState(false);

  const [
    supportRecommended,
    setSupportRecommended,
  ] = useState(false);


  async function loadQuestionnaire() {
    setLoading(true);
    setPageError("");

    try {
      const data =
        await getWellbeingQuestionnaireBySlug(
          slug
        );

      setQuestionnaire(data);

      const initialAnswers = {};

      for (
        const question of
        data?.questions || []
      ) {
        initialAnswers[
          question.id
        ] =
          createEmptyAnswer(
            question
          );
      }

      setAnswers(
        initialAnswers
      );
    } catch (loadError) {
      setPageError(
        getWellbeingQuestionnaireErrorMessage(
          loadError,
          "We couldn't open this wellbeing check-in."
        )
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadQuestionnaire();
  }, [slug]);


  const questions =
    questionnaire?.questions || [];


  const answeredCount =
    useMemo(() => {
      return questions.reduce(
        (total, question) => {
          const answer =
            answers[
              question.id
            ];

          return (
            total +
            (isQuestionAnswered(
              question,
              answer
            )
              ? 1
              : 0)
          );
        },
        0
      );
    }, [
      questions,
      answers,
    ]);


  const progress =
    questions.length > 0
      ? Math.round(
          (answeredCount /
            questions.length) *
            100
        )
      : 0;


  const illustration =
    useMemo(
      () =>
        getQuestionnaireIllustration(
          questionnaire
        ),
      [questionnaire]
    );


  function updateAnswer(
    questionId,
    nextAnswer
  ) {
    setAnswers(
      (current) => ({
        ...current,
        [questionId]:
          nextAnswer,
      })
    );

    setErrors(
      (current) => {
        if (
          !current[
            questionId
          ]
        ) {
          return current;
        }

        const next = {
          ...current,
        };

        delete next[
          questionId
        ];

        return next;
      }
    );
  }


  function validateForm() {
    const nextErrors = {};

    for (
      const question of questions
    ) {
      const answer =
        answers[
          question.id
        ];

      const hasAnswer =
        isQuestionAnswered(
          question,
          answer
        );


      if (
        question.isRequired &&
        !hasAnswer
      ) {
        nextErrors[
          question.id
        ] =
          "Please answer this question.";

        continue;
      }


      if (
        question.questionType ===
          "DURATION_MINUTES" &&
        hasAnswer
      ) {
        const total =
          getDurationTotalMinutes(
            answer
          );

        if (total === null) {
          nextErrors[
            question.id
          ] =
            "Enter a valid duration. Minutes must be between 0 and 59.";
        }
      }
    }


    setErrors(
      nextErrors
    );


    const firstErrorId =
      Object.keys(
        nextErrors
      )[0];

    if (firstErrorId) {
      window.setTimeout(
        () => {
          document
            .getElementById(
              `question-${firstErrorId}`
            )
            ?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
        },
        50
      );

      return false;
    }


    return true;
  }


  function buildSubmissionAnswers() {
    const payload = [];


    for (
      const question of questions
    ) {
      const answer =
        answers[
          question.id
        ];

      if (
        !isQuestionAnswered(
          question,
          answer
        )
      ) {
        continue;
      }


      const base = {
        questionId:
          question.id,
      };


      switch (
        question.questionType
      ) {
        case "SINGLE_CHOICE":
        case "BOOLEAN":
        case "MULTI_CHOICE":
          payload.push({
            ...base,

            selectedOptionIds:
              answer.selectedOptionIds,
          });

          break;


        case "DURATION_MINUTES":
          payload.push({
            ...base,

            numericValue:
              getDurationTotalMinutes(
                answer
              ),
          });

          break;


        case "SCALE":
          if (
            Array.isArray(
              question.options
            ) &&
            question.options.length >
              0
          ) {
            payload.push({
              ...base,

              selectedOptionIds:
                answer.selectedOptionIds,
            });
          } else {
            payload.push({
              ...base,

              numericValue:
                Number(
                  answer.numericValue
                ),
            });
          }

          break;


        case "TEXT":
          payload.push({
            ...base,

            textValue:
              String(
                answer.textValue ||
                  ""
              ).trim(),
          });

          break;


        default:
          break;
      }
    }


    return payload;
  }


  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }


    if (!validateForm()) {
      return;
    }


    setSubmitting(true);
    setPageError("");


    try {
      const result =
        await submitWellbeingQuestionnaire(
          slug,
          buildSubmissionAnswers()
        );


      setSupportRecommended(
        Boolean(
          result
            ?.supportPromptRecommended
        )
      );

      setCompleted(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (submitError) {
      setPageError(
        getWellbeingQuestionnaireErrorMessage(
          submitError,
          "We couldn't save your check-in. Please try again."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }


  if (loading) {
    return (
      <AppLayout>
        <main className="wellbeing-page">
          <div className="wellbeing-form-shell">
            <div className="wellbeing-form-loading">
              Loading your check-in...
            </div>
          </div>
        </main>
      </AppLayout>
    );
  }


  if (
    pageError &&
    !questionnaire
  ) {
    return (
      <AppLayout>
        <main className="wellbeing-page">
          <div className="wellbeing-form-shell">
            <div className="wellbeing-load-error">
              <h1>
                Unable to open check-in
              </h1>

              <p>
                {pageError}
              </p>

              <button
                type="button"
                className="wellbeing-primary-button"
                onClick={
                  loadQuestionnaire
                }
              >
                <RefreshCw
                  size={16}
                />

                Try again
              </button>
            </div>
          </div>
        </main>
      </AppLayout>
    );
  }


  if (completed) {
    return (
      <AppLayout>
        <main className="wellbeing-page">
          <div className="wellbeing-form-shell">

            <section className="wellbeing-complete-card">

              {illustration ? (
                <img
                  src={
                    illustration
                  }
                  alt=""
                  className="wellbeing-complete-card__image"
                />
              ) : null}


              <div className="wellbeing-complete-card__check">
                <Check
                  size={28}
                  strokeWidth={2}
                />
              </div>


              <h1>
                Check-in completed
              </h1>

              <p>
                Thank you for taking
                a moment to check in
                with yourself.
              </p>


              {supportRecommended ? (
                <div
                  className="wellbeing-support-note"
                  role="alert"
                >
                  If you're feeling
                  unsafe or worried
                  you may hurt
                  yourself, please use
                  the Emergency
                  section in Anandam
                  or contact local
                  emergency support.
                </div>
              ) : null}


              <button
                type="button"
                className="wellbeing-primary-button"
                onClick={() =>
                  navigate(
                    "/app/wellbeing",
                    {
                      replace: true,

                      state: {
                        questionnaireToast:
                          "Your wellbeing check-in has been saved.",
                      },
                    }
                  )
                }
              >
                Back to wellbeing
              </button>

            </section>

          </div>
        </main>
      </AppLayout>
    );
  }


  const version =
    questionnaire?.version || {};


  return (
    <AppLayout>
      <main className="wellbeing-page">

        <div className="wellbeing-form-shell">

          <section className="wellbeing-form-card">

            {/* =====================================
                HEADER
                ===================================== */}

            <header className="wellbeing-form-header">

              <h1>
                {version.title ||
                  "Wellbeing Check-in"}
              </h1>

              <p>
                {version.subtitle ||
                  version.description ||
                  "Take a moment to reflect on how you're feeling."}
              </p>

            </header>


            {/* =====================================
                PROGRESS
                ===================================== */}

            <div className="wellbeing-progress">

              <div className="wellbeing-progress__labels">

                <span>
                  Questions{" "}
                  {answeredCount} of{" "}
                  {questions.length}
                </span>

                <span>
                  {progress}% complete
                </span>

              </div>


              <div
                className="wellbeing-progress__track"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={
                  progress
                }
              >
                <span
                  style={{
                    width:
                      `${progress}%`,
                  }}
                />
              </div>

            </div>


            {/* =====================================
                FORM
                ===================================== */}

            <form
              className="wellbeing-question-form"
              onSubmit={
                handleSubmit
              }
              noValidate
            >

              {questions.map(
                (
                  question,
                  index
                ) => {

                  const answer =
                    answers[
                      question.id
                    ] ||
                    createEmptyAnswer(
                      question
                    );

                  return (
                    <section
                      id={`question-${question.id}`}
                      key={
                        question.id
                      }
                      className={`wellbeing-question${
                        errors[
                          question.id
                        ]
                          ? " has-error"
                          : ""
                      }`}
                    >

                      <div className="wellbeing-question__number">
                        Question{" "}
                        {index + 1}
                      </div>


                      {illustration ? (
                        <img
                          src={
                            illustration
                          }
                          alt=""
                          aria-hidden="true"
                          className="wellbeing-question__illustration"
                        />
                      ) : null}


                      <div className="wellbeing-question__heading">

                        <h2>
                          {
                            question.questionText
                          }
                        </h2>


                        {question.helperText ? (
                          <p>
                            {
                              question.helperText
                            }
                          </p>
                        ) : null}


                        {!question.isRequired ? (
                          <span className="wellbeing-question__optional">
                            Optional
                          </span>
                        ) : null}

                      </div>


                      <QuestionField
                        question={
                          question
                        }
                        answer={
                          answer
                        }
                        error={
                          errors[
                            question.id
                          ]
                        }
                        onChange={(
                          nextAnswer
                        ) =>
                          updateAnswer(
                            question.id,
                            nextAnswer
                          )
                        }
                      />


                      {errors[
                        question.id
                      ] ? (
                        <p
                          className="wellbeing-question__error"
                          role="alert"
                        >
                          {
                            errors[
                              question.id
                            ]
                          }
                        </p>
                      ) : null}

                    </section>
                  );
                }
              )}


              {pageError ? (
                <div
                  className="wellbeing-submit-error"
                  role="alert"
                >
                  {pageError}
                </div>
              ) : null}


              <div className="wellbeing-form-actions">

                <button
                  type="button"
                  className="wellbeing-secondary-button"
                  onClick={() =>
                    navigate(
                      "/app/wellbeing"
                    )
                  }
                  disabled={
                    submitting
                  }
                >
                  Back
                </button>


                <button
                  type="submit"
                  className="wellbeing-primary-button wellbeing-complete-button"
                  disabled={
                    submitting
                  }
                >
                  {submitting
                    ? "Saving..."
                    : "Complete Check-in"}
                </button>

              </div>

            </form>

          </section>

        </div>

      </main>
    </AppLayout>
  );
}