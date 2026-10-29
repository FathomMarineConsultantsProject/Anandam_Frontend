import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getJournalEntries,
} from "../api/journalApi";

import JournalEntryRow from
  "../components/journal/JournalEntryRow";

import "../styles/journal.css";
import {
  firstPageImage,
} from "../components/journal/journalImages";


function normaliseEntries(
  response
) {
  if (
    Array.isArray(
      response
    )
  ) {
    return response;
  }

  if (
    Array.isArray(
      response?.entries
    )
  ) {
    return response.entries;
  }

  if (
    Array.isArray(
      response?.data
    )
  ) {
    return response.data;
  }

  if (
    Array.isArray(
      response?.data?.entries
    )
  ) {
    return response.data.entries;
  }

  return [];
}


function getSearchText(
  entry
) {
  const answers =
    Array.isArray(
      entry?.answers
    )
      ? entry.answers
      : [];

  const customBlocks =
    Array.isArray(
      entry?.customBlocks
    )
      ? entry.customBlocks
      : [];

  return [
    entry?.title,
    entry?.templateTitleSnapshot,
    entry?.template?.title,
    entry?.content,

    ...answers.map(
      (answer) =>
        answer?.answer
    ),

    ...customBlocks.flatMap(
      (block) => [
        block?.prompt,
        block?.content,
      ]
    ),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}


export default function JournalEntriesPage() {
  const navigate =
    useNavigate();

  const [
    entries,
    setEntries,
  ] =
    useState([]);

  const [
    tab,
    setTab,
  ] =
    useState("ALL");

  const [
    search,
    setSearch,
  ] =
    useState("");

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
    let cancelled =
      false;

    async function loadEntries() {
      try {
        setLoading(true);
        setError("");

        const response =
          await getJournalEntries();

        if (cancelled) {
          return;
        }

        console.log(
          "Journal entries response:",
          response
        );

        setEntries(
          normaliseEntries(
            response
          )
        );
      } catch (err) {
        console.error(
          "Journal entries load failed:",
          err
        );

        if (
          !cancelled
        ) {
          setEntries([]);

          setError(
            err?.message ||
              "We couldn't load your journal entries."
          );
        }
      } finally {
        if (
          !cancelled
        ) {
          setLoading(false);
        }
      }
    }

    loadEntries();

    return () => {
      cancelled =
        true;
    };
  }, []);


  const visibleEntries =
    useMemo(() => {
      const safeEntries =
        Array.isArray(
          entries
        )
          ? entries
          : [];

      const term =
        search
          .trim()
          .toLowerCase();

      return safeEntries.filter(
        (entry) => {
          if (
            tab ===
              "DRAFT" &&
            entry?.status !==
              "DRAFT"
          ) {
            return false;
          }

          if (!term) {
            return true;
          }

          return getSearchText(
            entry
          ).includes(
            term
          );
        }
      );
    }, [
      entries,
      tab,
      search,
    ]);


  function openEntry(
    entry
  ) {
    if (!entry?.id) {
      return;
    }

    if (
      entry.type ===
        "CUSTOM" ||
      !entry.templateId
    ) {
      navigate(
        `/app/journal/write/${entry.id}`
      );

      return;
    }

    const slug =
      entry?.template?.slug;

    if (!slug) {
      console.warn(
        "Template entry has no template slug:",
        entry
      );

      return;
    }

    navigate(
      `/app/journal/template/${slug}/${entry.id}`
    );
  }


  return (
    <main className="journal-page jr-entries-page">

      <button
        type="button"
        className="jr-back"
        onClick={() =>
          navigate(
            "/app/journal"
          )
        }
      >
        <span>
          ←
        </span>

        Back to journal
      </button>


      <header className="jr-entries-heading">
        <h1>
          My Entries
        </h1>

        <p>
          Your thoughts, reflections, and drafts, all in one place.
        </p>
      </header>


      <div className="jr-entry-search">
        <span
          className="jr-search-icon"
          aria-hidden="true"
        >
          ⌕
        </span>

        <input
          type="search"
          value={search}
          placeholder="Search your entries"
          onChange={(
            event
          ) =>
            setSearch(
              event.target.value
            )
          }
        />
      </div>


      <div className="jr-entry-tabs">
        <button
          type="button"
          className={
            tab === "ALL"
              ? "active"
              : ""
          }
          onClick={() =>
            setTab("ALL")
          }
        >
          All entries
        </button>

        <button
          type="button"
          className={
            tab === "DRAFT"
              ? "active"
              : ""
          }
          onClick={() =>
            setTab(
              "DRAFT"
            )
          }
        >
          Drafts
        </button>
      </div>


      {error && (
        <div className="jr-error">
          {error}
        </div>
      )}


      {loading ? (
        <section className="jr-entries-loading">
          <div className="jr-loading-spinner" />

          <p>
            Loading your entries...
          </p>
        </section>
      ) : visibleEntries.length >
        0 ? (
        <section className="jr-entry-list">
          {visibleEntries.map(
            (entry) => (
              <JournalEntryRow
                key={
                  entry.id
                }
                entry={
                  entry
                }
                onClick={() =>
                  openEntry(
                    entry
                  )
                }
              />
            )
          )}
        </section>
      ) : (
        <section className="jr-empty-entries">

          <div className="jr-empty-illustration">
  <img
    src={firstPageImage}
    alt=""
  />
</div>

          <h2>
            {tab ===
            "DRAFT"
              ? "No drafts yet."
              : "Your first page is waiting."}
          </h2>

          <p>
            {tab ===
            "DRAFT"
              ? "Entries you save as drafts will appear here."
              : "You haven’t written any entries yet. Begin with a thought, a moment or whatever is on your mind today."}
          </p>

          {tab !==
            "DRAFT" && (
            <button
              type="button"
              className="jr-primary-btn"
              onClick={() =>
                navigate(
                  "/app/journal"
                )
              }
            >
              Start writing
            </button>
          )}

        </section>
      )}

    </main>
  );
}