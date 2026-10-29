import {
  useState,
} from "react";


export default function JournalAddMenu({
  onAddQuestion,
  onAddNote,
}) {
  const [
    open,
    setOpen,
  ] =
    useState(false);

  return (
    <div className="jr-add-wrap">
      <button
        type="button"
        className="jr-add-more"
        onClick={() =>
          setOpen(
            (value) =>
              !value
          )
        }
      >
        + Add more
      </button>

      {open && (
        <div className="jr-add-menu">
          <button
            type="button"
            onClick={() => {
              setOpen(false);

              onAddQuestion();
            }}
          >
            <span>+</span>
            Add your own question
          </button>

          <button
            type="button"
            onClick={() => {
              setOpen(false);

              onAddNote();
            }}
          >
            <span>+</span>
            Add a note
          </button>
        </div>
      )}
    </div>
  );
}