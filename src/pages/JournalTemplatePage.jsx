import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  createJournalEntry,
  getJournalEntry,
  getJournalTemplate,
  updateJournalEntry,
} from "../api/journalApi";

import JournalDateTime
  from "../components/journal/JournalDateTime";

import JournalAddMenu
  from "../components/journal/JournalAddMenu";

import "../styles/journal.css";


function createInitialAnswers(
  questions = []
) {
  return Object.fromEntries(
    questions.map(
      (question) => [
        question.id,
        "",
      ]
    )
  );
}


export default function JournalTemplatePage() {
  const navigate =
    useNavigate();

  const {
    slug,
    entryId,
  } =
    useParams();

  const [
    template,
    setTemplate,
  ] =
    useState(null);

  const [
    answers,
    setAnswers,
  ] =
    useState({});

  const [
    customBlocks,
    setCustomBlocks,
  ] =
    useState([]);

  const [
    entryDate,
    setEntryDate,
  ] =
    useState(
      new Date()
        .toISOString()
    );

  const [
    currentEntryId,
    setCurrentEntryId,
  ] =
    useState(
      entryId ||
      null
    );

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");


  useEffect(() => {
    let active =
      true;

    async function load() {
      try {
        setLoading(
          true
        );

        if (entryId) {
          const data =
            await getJournalEntry(
              entryId
            );

          const entry =
            data?.entry ||
            data;

          if (!active) {
            return;
          }

          setCurrentEntryId(
            entry.id
          );

          setEntryDate(
            entry.entryDate
          );

          setTemplate(
            entry.template || {
              id:
                entry.templateId,

              slug,

              title:
                entry.templateTitleSnapshot,

              description:
                entry.templateDescriptionSnapshot,

              questions:
                entry.answers?.map(
                  (
                    answer,
                    index
                  ) => ({
                    id:
                      answer.questionId,

                    questionText:
                      answer.questionTextSnapshot,

                    sortOrder:
                      index + 1,
                  })
                ) ||
                [],
            }
          );

          setAnswers(
            Object.fromEntries(
              (
                entry.answers ||
                []
              ).map(
                (
                  answer
                ) => [
                  answer.questionId,
                  answer.answer ||
                  "",
                ]
              )
            )
          );

          setCustomBlocks(
            entry.customBlocks ||
            []
          );

          return;
        }


        const data =
          await getJournalTemplate(
            slug
          );

        const loadedTemplate =
          data?.template ||
          data;

        if (!active) {
          return;
        }

        setTemplate(
          loadedTemplate
        );

        setAnswers(
          createInitialAnswers(
            loadedTemplate.questions
          )
        );
      } catch (err) {
        if (active) {
          setError(
            err?.message ||
            "We couldn't load this journal."
          );
        }
      } finally {
        if (active) {
          setLoading(
            false
          );
        }
      }
    }

    load();

    return () => {
      active =
        false;
    };
  }, [
    slug,
    entryId,
  ]);


  const questions =
    useMemo(
      () =>
        [
          ...(
            template?.questions ||
            []
          ),
        ].sort(
          (
            a,
            b
          ) =>
            (
              a.sortOrder ||
              0
            ) -
            (
              b.sortOrder ||
              0
            )
        ),
      [
        template,
      ]
    );


  function updateAnswer(
    questionId,
    value
  ) {
    setAnswers(
      (
        previous
      ) => ({
        ...previous,

        [questionId]:
          value,
      })
    );
  }


  function addQuestion() {
    setCustomBlocks(
      (
        previous
      ) => [
        ...previous,

        {
          localId:
            crypto.randomUUID(),

          type:
            "QUESTION",

          prompt:
            "",

          content:
            "",

          sortOrder:
            previous.length +
            1,
        },
      ]
    );
  }


  function addNote() {
    setCustomBlocks(
      (
        previous
      ) => [
        ...previous,

        {
          localId:
            crypto.randomUUID(),

          type:
            "NOTE",

          prompt:
            "What's on your mind?",

          content:
            "",

          sortOrder:
            previous.length +
            1,
        },
      ]
    );
  }


  function updateCustom(
    index,
    patch
  ) {
    setCustomBlocks(
      (
        previous
      ) =>
        previous.map(
          (
            item,
            itemIndex
          ) =>
            itemIndex ===
            index
              ? {
                  ...item,
                  ...patch,
                }
              : item
        )
    );
  }


  async function save(
    status
  ) {
    if (!template) {
      return;
    }

    try {
      setSaving(
        true
      );

      setError(
        ""
      );

      const payload = {
        type:
          "TEMPLATE",

        status,

        templateId:
          template.id,

        entryDate,

        answers:
          questions.map(
            (
              question
            ) => ({
              questionId:
                question.id,

              answer:
                answers[
                  question.id
                ] ||
                "",
            })
          ),

        customBlocks:
          customBlocks.map(
            (
              block,
              index
            ) => ({
              type:
                block.type,

              prompt:
                block.prompt ||
                null,

              content:
                block.content ||
                "",

              sortOrder:
                index +
                1,
            })
          ),
      };


      const data =
        currentEntryId
          ? await updateJournalEntry(
              currentEntryId,
              payload
            )
          : await createJournalEntry(
              payload
            );


      const savedEntry =
        data?.entry ||
        data;

      if (
        savedEntry?.id
      ) {
        setCurrentEntryId(
          savedEntry.id
        );
      }


      navigate(
        "/app/journal/entries"
      );
    } catch (err) {
      setError(
        err?.message ||
        "We couldn't save this journal."
      );
    } finally {
      setSaving(
        false
      );
    }
  }


  if (loading) {
    return (
      <div className="jr-loading">
        Loading journal…
      </div>
    );
  }


  return (
    <main className="journal-page jr-editor-page">

      <div className="jr-editor-topbar">
        <button
          type="button"
          className="jr-back"
          onClick={() =>
            navigate(
              "/app/journal"
            )
          }
        >
          ← Back to journal
        </button>

        <div className="jr-save-actions">
          <button
            type="button"
            className="jr-outline-btn"
            disabled={
              saving
            }
            onClick={() =>
              save(
                "DRAFT"
              )
            }
          >
            Save Draft
          </button>

          <button
            type="button"
            className="jr-primary-btn"
            disabled={
              saving
            }
            onClick={() =>
              save(
                "SAVED"
              )
            }
          >
            {saving
              ? "Saving…"
              : "Save entry"}
          </button>
        </div>
      </div>


      <section className="jr-editor-card">

        <JournalDateTime
          value={
            entryDate
          }
          onChange={
            setEntryDate
          }
        />


        <div className="jr-editor-divider" />


        <header className="jr-template-heading">
          <h1>
            {template?.title}
          </h1>

          <p>
            {template?.description}
          </p>
        </header>


        <div className="jr-question-list">

          {questions.map(
            (
              question
            ) => (
              <div
                className="jr-question"
                key={
                  question.id
                }
              >
                <label>
                  {
                    question.questionText
                  }
                </label>

                <textarea
                  value={
                    answers[
                      question.id
                    ] ||
                    ""
                  }
                  onChange={(
                    event
                  ) =>
                    updateAnswer(
                      question.id,
                      event.target
                        .value
                    )
                  }
                  placeholder="Write here..."
                  rows={1}
                />
              </div>
            )
          )}


          {customBlocks.map(
            (
              block,
              index
            ) => (
              <div
                className="jr-question jr-custom-block"
                key={
                  block.id ||
                  block.localId ||
                  index
                }
              >
                {block.type ===
                "QUESTION" ? (
                  <input
                    className="jr-custom-question"
                    value={
                      block.prompt ||
                      ""
                    }
                    onChange={(
                      event
                    ) =>
                      updateCustom(
                        index,
                        {
                          prompt:
                            event.target
                              .value,
                        }
                      )
                    }
                    placeholder="Write your question here"
                  />
                ) : (
                  <label className="jr-note-label">
                    {block.prompt ||
                      "What's on your mind?"}
                  </label>
                )}

                <textarea
                  value={
                    block.content ||
                    ""
                  }
                  onChange={(
                    event
                  ) =>
                    updateCustom(
                      index,
                      {
                        content:
                          event.target
                            .value,
                      }
                    )
                  }
                  placeholder="Write here..."
                  rows={1}
                />
              </div>
            )
          )}

        </div>


        <JournalAddMenu
          onAddQuestion={
            addQuestion
          }
          onAddNote={
            addNote
          }
        />

      </section>


      {error && (
        <div className="jr-error">
          {error}
        </div>
      )}

    </main>
  );
}