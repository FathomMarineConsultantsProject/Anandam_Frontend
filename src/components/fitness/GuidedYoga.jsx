import { ArrowLeft } from "lucide-react";

import {
  GUIDED_YOGA_POSES,
} from "../../data/guidedYogaData";

function GuidedYogaImage({
  src,
  alt,
  className = "",
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      draggable="false"
    />
  );
}

export function GuidedYogaTab({ onOpen }) {
  return (
    <div className="fitness-tab-panel fitness-yoga-tab-panel">
      <div className="fitness-yoga-grid">
        {GUIDED_YOGA_POSES.map((pose) => (
          <article
            className="fitness-yoga-card"
            key={pose.id}
          >
            <div className="fitness-yoga-card__media">
              <GuidedYogaImage
                src={pose.gif}
                alt={`${pose.title} demonstration`}
                className="fitness-yoga-card__gif"
              />
            </div>

            <div className="fitness-yoga-card__body">
              <div>
                <h2>{pose.title}</h2>
                <p>{pose.description}</p>
              </div>

              <button
                type="button"
                className="fitness-yoga-start-button"
                onClick={() => onOpen(pose)}
              >
                Start
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function GuidedYogaDetail({ pose, onBack }) {
  if (!pose) {
    return null;
  }

  const sequence = pose.layout === "sequence";

  return (
    <div className="fitness-yoga-detail-shell">
      <section className="fitness-yoga-detail-card">
        <button
          type="button"
          className="fitness-yoga-back"
          onClick={onBack}
        >
          <ArrowLeft size={17} strokeWidth={1.7} />
          <span>Back</span>
        </button>

        <h1 className="fitness-yoga-detail-title">
          {pose.title} ({pose.sanskritName})
        </h1>

        <div className="fitness-yoga-detail-hero">
          <GuidedYogaImage
            src={pose.gif}
            alt={`${pose.title} animated demonstration`}
            className="fitness-yoga-detail-gif"
          />
        </div>

        <section className="fitness-yoga-instructions">
          <h2>How to do it</h2>

          <div
            className={`fitness-yoga-steps${
              sequence ? " fitness-yoga-steps--sequence" : ""
            }`}
          >
            {pose.steps.map((step) => (
              <article
                className="fitness-yoga-step-card"
                key={`${pose.id}-${step.id}`}
              >
                <div className="fitness-yoga-step-heading">
                  <span className="fitness-yoga-step-number">
                    {step.id}
                  </span>
                  <span>{step.title}</span>
                </div>

                <div className="fitness-yoga-step-media">
                  <GuidedYogaImage
                    src={step.image}
                    alt={`${pose.title} step ${step.id}: ${step.title}`}
                    className="fitness-yoga-step-image"
                  />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="fitness-yoga-benefits">
          <h2>Benefits of {pose.title}</h2>

          <ul>
            {pose.benefits.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>
        </section>
      </section>
    </div>
  );
}
