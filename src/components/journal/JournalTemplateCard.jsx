import {
  getJournalImage,
} from "./journalImages";


export default function JournalTemplateCard({
  template,
  onClick,
}) {
  const image =
    getJournalImage(
      template?.imageKey
    );


  return (
    <button
      type="button"
      className="jr-template-card"
      onClick={onClick}
    >

      <div className="jr-template-image">

        {image ? (
          <img
            src={image}
            alt={
              template?.title ||
              ""
            }
          />
        ) : (
          <div className="jr-template-image-fallback" />
        )}

      </div>


      <div className="jr-template-copy">

        <h2>
          {template?.title}
        </h2>

        <p>
          {template?.description}
        </p>

      </div>

    </button>
  );
}