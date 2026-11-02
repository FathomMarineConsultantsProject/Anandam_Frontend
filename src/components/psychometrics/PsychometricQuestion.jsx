const LIKERT_OPTIONS = [
  {
    value: 1,
    label: "Strongly Disagree",
  },
  {
    value: 2,
    label: "Disagree",
  },
  {
    value: 3,
    label: "Neutral",
  },
  {
    value: 4,
    label: "Agree",
  },
  {
    value: 5,
    label: "Strongly Agree",
  },
];


function getMultipleChoiceOptions(
  question
) {
  return [
    {
      value: "A",
      label:
        question?.optionA,
    },

    {
      value: "B",
      label:
        question?.optionB,
    },

    {
      value: "C",
      label:
        question?.optionC,
    },

    {
      value: "D",
      label:
        question?.optionD,
    },
  ].filter(
    (item) =>
      item.label !== null &&
      item.label !== undefined &&
      item.label !== ""
  );
}


export default function PsychometricQuestion({
  question,
  number,
  value,
  onChange,
}) {
  const isLikert =
    question?.questionType ===
    "LIKERT_5";

  const options =
    isLikert
      ? LIKERT_OPTIONS
      : getMultipleChoiceOptions(
          question
        );

  const selectedValue =
    isLikert
      ? value?.likertValue
      : value?.selectedOption;


  return (
    <section
      className="psychometric-question"
      id={`psychometric-question-${question.id}`}
    >
      <div className="psychometric-question__number">
        Question {number}
      </div>

      <h2 className="psychometric-question__prompt">
        {question.questionText}
      </h2>

      <div className="psychometric-question__options">
        {options.map(
          (option) => {
            const checked =
              selectedValue ===
              option.value;

            return (
              <label
                key={
                  option.value
                }
                className={`psychometric-answer-option${
                  checked
                    ? " is-selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name={`psychometric-${question.id}`}
                  checked={
                    checked
                  }
                  onChange={() => {
                    if (
                      isLikert
                    ) {
                      onChange({
                        questionId:
                          question.id,

                        likertValue:
                          option.value,
                      });

                      return;
                    }

                    onChange({
                      questionId:
                        question.id,

                      selectedOption:
                        option.value,
                    });
                  }}
                />

                <span
                  className="psychometric-answer-option__radio"
                  aria-hidden="true"
                >
                  <span />
                </span>

                <span className="psychometric-answer-option__text">
                  {!isLikert ? (
                    <strong>
                      {
                        option.value
                      }.
                    </strong>
                  ) : null}

                  {
                    option.label
                  }
                </span>
              </label>
            );
          }
        )}
      </div>
    </section>
  );
}