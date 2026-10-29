import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getJournalTemplates,
} from "../api/journalApi";

import JournalTemplateCard
  from "../components/journal/JournalTemplateCard";

import "../styles/journal.css";


export default function JournalPage() {
  const navigate =
    useNavigate();

  const [
    templates,
    setTemplates,
  ] =
    useState([]);

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

        setError(
          ""
        );

        const data =
          await getJournalTemplates();

        if (!active) {
          return;
        }

        setTemplates(
          data?.templates ||
          data ||
          []
        );
      } catch (err) {
        if (!active) {
          return;
        }

        setError(
          err?.message ||
          "We couldn't load your journal templates."
        );
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
  }, []);


  return (
    <main className="journal-page jr-library">
      <header className="jr-library-header">
        <div>
          <h1>
            Your journal
          </h1>

          <p>
            Start with a blank page or let a template guide your thoughts.
          </p>
        </div>

        <button
          type="button"
          className="jr-primary-btn"
          onClick={() =>
            navigate(
              "/app/journal/entries"
            )
          }
        >
          My entries
        </button>
      </header>


      {error && (
        <div className="jr-error">
          {error}
        </div>
      )}


      {loading ? (
        <div className="jr-loading">
          Loading journal…
        </div>
      ) : (
        <section className="jr-template-grid">

          <button
            type="button"
            className="jr-template-card"
            onClick={() =>
              navigate(
                "/app/journal/write"
              )
            }
          >
            <div className="jr-template-image jr-write-own-image">
              <span>
                +
              </span>
            </div>

            <div className="jr-template-copy">
              <h2>
                Write your own
              </h2>

              <p>
                A space to write freely about whatever’s on your mind
              </p>
            </div>
          </button>


          {templates.map(
            (
              template
            ) => (
              <JournalTemplateCard
                key={
                  template.id
                }

                template={
                  template
                }

                onClick={() =>
                  navigate(
                    `/app/journal/template/${template.slug}`
                  )
                }
              />
            )
          )}

        </section>
      )}
    </main>
  );
}