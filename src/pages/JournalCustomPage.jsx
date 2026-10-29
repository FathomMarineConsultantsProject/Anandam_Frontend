import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  createJournalEntry,
  getJournalEntry,
  updateJournalEntry,
} from "../api/journalApi";

import JournalDateTime
  from "../components/journal/JournalDateTime";

import "../styles/journal.css";


export default function JournalCustomPage() {
  const navigate =
    useNavigate();

  const {
    entryId,
  } =
    useParams();

  const editorRef =
    useRef(null);

  const [
    title,
    setTitle,
  ] =
    useState("");

  const [
    content,
    setContent,
  ] =
    useState("");

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
    error,
    setError,
  ] =
    useState("");


  useEffect(() => {
    if (!entryId) {
      return;
    }

    let active =
      true;

    async function load() {
      try {
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

        setTitle(
          entry.title ||
          ""
        );

        setContent(
          entry.content ||
          ""
        );

        setEntryDate(
          entry.entryDate
        );

        setCurrentEntryId(
          entry.id
        );
      } catch (err) {
        if (active) {
          setError(
            err?.message ||
            "We couldn't load this journal."
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
    entryId,
  ]);


  function execute(
    command,
    value = null
  ) {
    editorRef.current
      ?.focus();

    document.execCommand(
      command,
      false,
      value
    );

    setContent(
      editorRef.current
        ?.innerHTML ||
        ""
    );
  }


  async function save(
    status
  ) {
    try {
      setSaving(
        true
      );

      const body =
        editorRef.current
          ?.innerHTML ??
        content;

      const payload = {
        type:
          "CUSTOM",

        status,

        title:
          title.trim() ||
          null,

        content:
          body,

        entryDate,

        answers:
          [],

        customBlocks:
          [],
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


      const entry =
        data?.entry ||
        data;

      if (entry?.id) {
        setCurrentEntryId(
          entry.id
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


  return (
    <main className="journal-page jr-custom-page">

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
          ← Back
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
            Save entry
          </button>
        </div>
      </div>


      <section className="jr-custom-editor">

        <div className="jr-toolbar">

          <button
            type="button"
            onClick={() =>
              execute(
                "bold"
              )
            }
          >
            <b>B</b>
          </button>

          <button
            type="button"
            onClick={() =>
              execute(
                "italic"
              )
            }
          >
            <i>I</i>
          </button>

          <button
            type="button"
            onClick={() =>
              execute(
                "underline"
              )
            }
          >
            <u>U</u>
          </button>

          <span className="jr-toolbar-divider" />

          <button
            type="button"
            onClick={() =>
              execute(
                "insertUnorderedList"
              )
            }
          >
            ☷
          </button>

          <button
            type="button"
            onClick={() =>
              execute(
                "insertOrderedList"
              )
            }
          >
            ☰
          </button>

          <span className="jr-toolbar-divider" />

          <button
            type="button"
            onClick={() =>
              execute(
                "formatBlock",
                "h2"
              )
            }
          >
            T
          </button>

          <button
            type="button"
            onClick={() =>
              execute(
                "formatBlock",
                "p"
              )
            }
          >
            T
          </button>

        </div>


        <div className="jr-custom-date-row">
          <JournalDateTime
            value={
              entryDate
            }
            onChange={
              setEntryDate
            }
          />
        </div>


        <input
          className="jr-custom-title"
          value={title}
          onChange={(
            event
          ) =>
            setTitle(
              event.target
                .value
            )
          }
          placeholder="Add a title (optional)"
        />


        <div
          ref={editorRef}
          className="jr-rich-editor"
          contentEditable
          suppressContentEditableWarning
          data-placeholder="Write here..."
          dangerouslySetInnerHTML={{
            __html:
              content,
          }}
          onInput={(
            event
          ) =>
            setContent(
              event.currentTarget
                .innerHTML
            )
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