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

  const hasLoadedEditor =
    useRef(false);

  const [
    title,
    setTitle,
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
      entryId || null
    );

  const [
    initialContent,
    setInitialContent,
  ] =
    useState("");

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    loading,
    setLoading,
  ] =
    useState(
      Boolean(entryId)
    );

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    textColor,
    setTextColor,
  ] =
    useState("#181F2A");

  const [
    highlightColor,
    setHighlightColor,
  ] =
    useState("#FFF1A8");


  // =====================================================
  // LOAD EXISTING JOURNAL
  // =====================================================

  useEffect(() => {
    if (!entryId) {
      setLoading(false);
      return;
    }

    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getJournalEntry(
            entryId
          );

        const entry =
          data?.entry || data;

        if (!active) {
          return;
        }

        setTitle(
          entry?.title || ""
        );

        setEntryDate(
          entry?.entryDate ||
          new Date()
            .toISOString()
        );

        setCurrentEntryId(
          entry?.id || entryId
        );

        setInitialContent(
          entry?.content || ""
        );

        hasLoadedEditor.current =
          false;
      } catch (err) {
        if (active) {
          setError(
            err?.message ||
            "We couldn't load this journal."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [
    entryId,
  ]);


  // =====================================================
  // SET INITIAL HTML ONLY ONCE
  // IMPORTANT: DO NOT SET HTML ON EVERY KEYSTROKE
  // =====================================================

  useEffect(() => {
    if (
      loading ||
      !editorRef.current ||
      hasLoadedEditor.current
    ) {
      return;
    }

    editorRef.current.innerHTML =
      initialContent || "";

    hasLoadedEditor.current =
      true;
  }, [
    loading,
    initialContent,
  ]);


  // =====================================================
  // EDITOR COMMAND
  // =====================================================

  function execute(
    command,
    value = null
  ) {
    editorRef.current?.focus();

    document.execCommand(
      command,
      false,
      value
    );
  }


  function formatBlock(
    tag
  ) {
    execute(
      "formatBlock",
      tag
    );
  }


  function addLink() {
    const url =
      window.prompt(
        "Enter link URL"
      );

    if (!url) {
      return;
    }

    execute(
      "createLink",
      url
    );
  }


  function applyTextColor(
    color
  ) {
    setTextColor(color);

    execute(
      "foreColor",
      color
    );
  }


  function applyHighlight(
    color
  ) {
    setHighlightColor(
      color
    );

    execute(
      "hiliteColor",
      color
    );
  }


  // =====================================================
  // SAVE
  // =====================================================

  async function save(
    status
  ) {
    try {
      setSaving(true);
      setError("");

      const content =
        editorRef.current
          ?.innerHTML
          ?.trim() || "";

      const payload = {
        type: "CUSTOM",

        status,

        title:
          title.trim() ||
          null,

        content,

        entryDate,

        answers: [],

        customBlocks: [],
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
        data?.entry || data;

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
      setSaving(false);
    }
  }


  if (loading) {
    return (
      <main className="journal-page jr-custom-page">
        <div className="jr-loading">
          Loading journal…
        </div>
      </main>
    );
  }


  return (
    <main className="journal-page jr-custom-page">

      {/* ==================================================
          PAGE TOP BAR
      ================================================== */}

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
            disabled={saving}
            onClick={() =>
              save("DRAFT")
            }
          >
            Save Draft
          </button>


          <button
            type="button"
            className="jr-primary-btn"
            disabled={saving}
            onClick={() =>
              save("SAVED")
            }
          >
            {saving
              ? "Saving…"
              : "Save entry"}
          </button>

        </div>

      </div>


      {/* ==================================================
          EDITOR
      ================================================== */}

      <section className="jr-custom-editor">

        {/* ===============================================
            RICH TEXT TOOLBAR
        =============================================== */}

        <div className="jr-toolbar">

          {/* TEXT STYLE */}

          <select
            className="jr-toolbar-select jr-style-select"
            defaultValue="p"
            onChange={(event) =>
              formatBlock(
                event.target.value
              )
            }
            aria-label="Text style"
          >
            <option value="p">
              Normal text
            </option>

            <option value="h1">
              Heading 1
            </option>

            <option value="h2">
              Heading 2
            </option>

            <option value="h3">
              Heading 3
            </option>
          </select>


          {/* FONT */}

          <select
            className="jr-toolbar-select jr-font-select"
            defaultValue="Roboto"
            onChange={(event) =>
              execute(
                "fontName",
                event.target.value
              )
            }
            aria-label="Font"
          >
            <option value="Roboto">
              Roboto
            </option>

            <option value="Arial">
              Arial
            </option>

            <option value="Georgia">
              Georgia
            </option>

            <option value="Times New Roman">
              Times New Roman
            </option>
          </select>


          {/* FONT SIZE */}

          <select
            className="jr-toolbar-select jr-size-select"
            defaultValue="3"
            onChange={(event) =>
              execute(
                "fontSize",
                event.target.value
              )
            }
            aria-label="Font size"
          >
            <option value="2">
              12
            </option>

            <option value="3">
              14
            </option>

            <option value="4">
              16
            </option>

            <option value="5">
              18
            </option>

            <option value="6">
              24
            </option>
          </select>


          <span className="jr-toolbar-divider" />


          {/* UNDO */}

          <button
            type="button"
            className="jr-toolbar-button"
            onMouseDown={(event) =>
              event.preventDefault()
            }
            onClick={() =>
              execute("undo")
            }
            title="Undo"
          >
            ↶
          </button>


          {/* REDO */}

          <button
            type="button"
            className="jr-toolbar-button"
            onMouseDown={(event) =>
              event.preventDefault()
            }
            onClick={() =>
              execute("redo")
            }
            title="Redo"
          >
            ↷
          </button>


          <span className="jr-toolbar-divider" />


          <button
            type="button"
            className="jr-toolbar-button"
            onMouseDown={(event) =>
              event.preventDefault()
            }
            onClick={() =>
              execute("bold")
            }
            title="Bold"
          >
            <strong>B</strong>
          </button>


          <button
            type="button"
            className="jr-toolbar-button"
            onMouseDown={(event) =>
              event.preventDefault()
            }
            onClick={() =>
              execute("italic")
            }
            title="Italic"
          >
            <em>I</em>
          </button>


          <button
            type="button"
            className="jr-toolbar-button"
            onMouseDown={(event) =>
              event.preventDefault()
            }
            onClick={() =>
              execute(
                "underline"
              )
            }
            title="Underline"
          >
            <u>U</u>
          </button>


          <button
            type="button"
            className="jr-toolbar-button"
            onMouseDown={(event) =>
              event.preventDefault()
            }
            onClick={() =>
              execute(
                "strikeThrough"
              )
            }
            title="Strikethrough"
          >
            <s>S</s>
          </button>


          <span className="jr-toolbar-divider" />


          {/* TEXT COLOR */}

          <label
            className="jr-color-tool"
            title="Text color"
          >
            <span
              className="jr-color-letter"
              style={{
                borderBottomColor:
                  textColor,
              }}
            >
              A
            </span>

            <input
              type="color"
              value={textColor}
              onChange={(event) =>
                applyTextColor(
                  event.target.value
                )
              }
            />
          </label>


          {/* HIGHLIGHT */}

          <label
            className="jr-color-tool"
            title="Highlight"
          >
            <span
              className="jr-highlight-letter"
              style={{
                backgroundColor:
                  highlightColor,
              }}
            >
              A
            </span>

            <input
              type="color"
              value={
                highlightColor
              }
              onChange={(event) =>
                applyHighlight(
                  event.target.value
                )
              }
            />
          </label>


          <span className="jr-toolbar-divider" />


          {/* ALIGN LEFT */}

          <button
            type="button"
            className="jr-toolbar-button jr-align-icon"
            onMouseDown={(event) =>
              event.preventDefault()
            }
            onClick={() =>
              execute(
                "justifyLeft"
              )
            }
            title="Align left"
          >
            ≡
          </button>


          {/* ALIGN CENTER */}

          <button
            type="button"
            className="jr-toolbar-button jr-align-icon"
            onMouseDown={(event) =>
              event.preventDefault()
            }
            onClick={() =>
              execute(
                "justifyCenter"
              )
            }
            title="Align center"
          >
            ≡
          </button>


          {/* ALIGN RIGHT */}

          <button
            type="button"
            className="jr-toolbar-button jr-align-right-icon"
            onMouseDown={(event) =>
              event.preventDefault()
            }
            onClick={() =>
              execute(
                "justifyRight"
              )
            }
            title="Align right"
          >
            ≡
          </button>


          {/* JUSTIFY */}

          <button
            type="button"
            className="jr-toolbar-button"
            onMouseDown={(event) =>
              event.preventDefault()
            }
            onClick={() =>
              execute(
                "justifyFull"
              )
            }
            title="Justify"
          >
            ☰
          </button>


          <span className="jr-toolbar-divider" />


          {/* BULLET LIST */}

          <button
            type="button"
            className="jr-toolbar-button"
            onMouseDown={(event) =>
              event.preventDefault()
            }
            onClick={() =>
              execute(
                "insertUnorderedList"
              )
            }
            title="Bullet list"
          >
            ☷
          </button>


          {/* NUMBERED LIST */}

          <button
            type="button"
            className="jr-toolbar-button"
            onMouseDown={(event) =>
              event.preventDefault()
            }
            onClick={() =>
              execute(
                "insertOrderedList"
              )
            }
            title="Numbered list"
          >
            1≡
          </button>


          {/* LINK */}

          <button
            type="button"
            className="jr-toolbar-button"
            onMouseDown={(event) =>
              event.preventDefault()
            }
            onClick={
              addLink
            }
            title="Add link"
          >
            🔗
          </button>


          {/* CLEAR */}

          <button
            type="button"
            className="jr-toolbar-button"
            onMouseDown={(event) =>
              event.preventDefault()
            }
            onClick={() =>
              execute(
                "removeFormat"
              )
            }
            title="Clear formatting"
          >
            ◇
          </button>

        </div>


        {/* ===============================================
            DATE / TIME
        =============================================== */}

        <div className="jr-custom-date-row">

          <JournalDateTime
            value={entryDate}
            onChange={
              setEntryDate
            }
          />

        </div>


        {/* ===============================================
            TITLE
        =============================================== */}

        <input
          className="jr-custom-title"
          value={title}
          onChange={(event) =>
            setTitle(
              event.target.value
            )
          }
          placeholder="Add a title (optional)"
        />


        {/* ===============================================
            WRITING AREA
        =============================================== */}

        <div
          ref={editorRef}
          className="jr-rich-editor"
          contentEditable
          suppressContentEditableWarning
          data-placeholder="Write here..."
          spellCheck="true"
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