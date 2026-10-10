import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import wisdomIcon from "../assets/dailywisdom/Group 2.png";
import breathingIcon from "../assets/dailywisdom/Vector (1).png";
import quoteIcon from "../assets/dailywisdom/Vector.png";
import AppLayout from "../components/layout/AppLayout";
import DAILY_WISDOM from "../data/dailyWisdom";

import "../styles/daily-wisdom.css";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

/*
  Uses the user's LOCAL calendar date.

  We convert the local year/month/day to UTC only to create
  a stable integer representing that calendar day.

  Therefore:
  - same wisdom during the entire day
  - automatically changes tomorrow
  - refreshing does not change it
*/
function getTodayNumber() {
  const now = new Date();

  return Math.floor(
    Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ) / DAY_IN_MS
  );
}

function getDailyWisdomIndex() {
  if (!DAILY_WISDOM.length) {
    return 0;
  }

  return getTodayNumber() % DAILY_WISDOM.length;
}

export default function DailyWisdomPage() {
  const navigate = useNavigate();

  /*
    This remains constant while this page instance exists.

    Reloading still calculates the exact same index because
    the calendar date hasn't changed.
  */
  const dailyIndex = useMemo(
    () => getDailyWisdomIndex(),
    []
  );

  /*
    offset = 0:
    actual Daily Wisdom

    offset > 0:
    user pressed "Next Wisdom"
  */
  const [wisdomOffset, setWisdomOffset] = useState(0);

  const wisdom = useMemo(() => {
    if (!DAILY_WISDOM.length) {
      return null;
    }

    const index =
      (dailyIndex + wisdomOffset) %
      DAILY_WISDOM.length;

    return DAILY_WISDOM[index];
  }, [dailyIndex, wisdomOffset]);

  function handleNextWisdom() {
    if (DAILY_WISDOM.length <= 1) {
      return;
    }

    setWisdomOffset((current) => {
      return (current + 1) % DAILY_WISDOM.length;
    });
  }

  function handleStartBreathing() {
    navigate("/app/breathing");
  }

  if (!wisdom) {
    return (
      <AppLayout>
        <div className="daily-wisdom-page">
          <div className="daily-wisdom-shell">
            <div className="daily-wisdom-error">
              Daily Wisdom is currently unavailable.
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="daily-wisdom-page">
        <div className="daily-wisdom-shell">

          {/* ================================
              PAGE HEADER
              ================================ */}

          <header className="daily-wisdom-header">
            <h1>Daily Wisdom</h1>

            <p>
              A little perspective for your day.
            </p>
          </header>


          {/* ================================
              WISDOM CARD
              ================================ */}

          <section
            className="daily-wisdom-card"
            aria-labelledby="daily-wisdom-quote"
          >
            <div
  className="daily-wisdom-symbol"
  aria-hidden="true"
>
  <img
    src={wisdomIcon}
    alt=""
    className="daily-wisdom-symbol__image"
  />
</div>


            <div
              key={wisdom.id}
              className="daily-wisdom-card__content"
              aria-live="polite"
            >

              {/* QUOTE */}

              <div className="daily-wisdom-quote-area">
                <img
  src={quoteIcon}
  alt=""
  className="daily-wisdom-quote-icon"
  aria-hidden="true"
/>

                <blockquote
                  id="daily-wisdom-quote"
                  className="daily-wisdom-quote"
                >
                  {wisdom.quote}
                </blockquote>

                <p className="daily-wisdom-author">
                  — {wisdom.author}
                </p>
              </div>


              {/* DIVIDER */}

              <div
                className="daily-wisdom-divider"
                aria-hidden="true"
              />


              {/* REFLECTION */}

              <div className="daily-wisdom-reflection">
                <p className="daily-wisdom-reflection__label">
                  What This Means For You
                </p>

                <p className="daily-wisdom-reflection__text">
                  {wisdom.reflection}
                </p>
              </div>


              {/* NEXT */}

              <button
                type="button"
                className="daily-wisdom-next"
                onClick={handleNextWisdom}
              >
                <span>Next Wisdom</span>

                <ArrowRight
                  size={16}
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
              </button>

            </div>
          </section>


          {/* ================================
              BREATHING CARD
              ================================ */}

          <section className="daily-wisdom-breathe-card">

            <div
  className="daily-wisdom-breathe-card__icon"
  aria-hidden="true"
>
  <img
    src={breathingIcon}
    alt=""
    className="daily-wisdom-breathe-card__icon-image"
  />
</div>


            <div className="daily-wisdom-breathe-card__content">
              <p className="daily-wisdom-breathe-card__eyebrow">
                Take A Short Breathing Break At Your Own Pace
              </p>

              <h2>
                Pause &amp; Breathe
              </h2>
            </div>


            <button
              type="button"
              className="daily-wisdom-start-button"
              onClick={handleStartBreathing}
            >
              Start session
            </button>

          </section>

        </div>
      </div>
    </AppLayout>
  );
}