import {
  X,
} from "lucide-react";

import {
  useWellbeingAccess,
} from "../../context/WellbeingAccessContext";

import {
  getStoredAuthUser,
} from "../../api/authApi";

import tokenCoin
  from "../../assets/token coin.png";

import "../../styles/site-access.css";


const CONTACT_EMAIL =
  "contact@fathommarineconsultants.com";


function WellbeingAccessModal() {
  const {
    modalOpen,
    unlocking,
    error,
    tokenCost,
    tokenBalance,
    closeWellbeingModal,
    unlockCurrentWellbeingEntry,
  } = useWellbeingAccess();


  if (!modalOpen) {
    return null;
  }


  const missingTokens =
    Math.max(
      tokenCost -
        tokenBalance,
      0
    );


  const canUnlock =
    tokenBalance >=
    tokenCost;


  function contactAnandam() {
    const user =
      getStoredAuthUser() ||
      {};

    const username =
      user.fullName ||
      user.name ||
      user.username ||
      user.email ||
      "Anandam user";

    const requestedTokens =
      missingTokens > 0
        ? missingTokens
        : tokenCost;

    const subject =
      `Anandam Token Request - ${username}`;

    const body = [
      "Hello Fathom Marine Consultants,",
      "",
      "I would like to request Anandam tokens.",
      "",
      `User: ${username}`,
      `Requested tokens: ${requestedTokens}`,
      "Purpose: Wellbeing access",
      "",
      "Please assist me with adding the required tokens to my account.",
      "",
      "Thank you.",
    ].join("\n");

    window.location.href =
      `mailto:${CONTACT_EMAIL}` +
      `?subject=${encodeURIComponent(
        subject
      )}` +
      `&body=${encodeURIComponent(
        body
      )}`;
  }


  async function handleUnlock() {
    try {
      await unlockCurrentWellbeingEntry();
    } catch {
      // Context already displays the backend error.
    }
  }


  return (
    <div
      className="site-access-overlay"
      role="presentation"
    >
      <section
        className="site-access-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wellbeing-access-title"
      >
        <button
          type="button"
          className="site-access-modal__close"
          onClick={
            closeWellbeingModal
          }
          disabled={
            unlocking
          }
          aria-label="Close"
        >
          <X size={18} />
        </button>


        <div className="site-access-modal__coin">
          <img
            src={tokenCoin}
            alt=""
            aria-hidden="true"
          />
        </div>


        <h2
          id="wellbeing-access-title"
        >
          Access Wellbeing
        </h2>


        <p className="site-access-modal__description">
          Use{" "}
          <strong>
            1 token
          </strong>{" "}
          to enter the Wellbeing section.
          Your access stays active while
          you remain in Wellbeing.
        </p>


        <p className="site-access-modal__description">
          Wellbeing is included automatically
          when you have active Anandam access.
        </p>


        <div className="site-access-modal__summary">
          <div>
            <span>
              Your balance
            </span>

            <strong>
              {tokenBalance} Tokens
            </strong>
          </div>


          <div>
            <span>
              Wellbeing access
            </span>

            <strong>
              1 Token
            </strong>
          </div>


          {canUnlock && (
            <div>
              <span>
                Balance after access
              </span>

              <strong>
                {Number(
                  (
                    tokenBalance -
                    tokenCost
                  ).toFixed(6)
                )}{" "}
                Tokens
              </strong>
            </div>
          )}
        </div>


        {!canUnlock && (
          <div className="site-access-modal__warning">
            You need{" "}
            <strong>
              {Number(
                missingTokens.toFixed(6)
              )}
            </strong>{" "}
            more{" "}
            {missingTokens === 1
              ? "token"
              : "tokens"}{" "}
            to access Wellbeing.
          </div>
        )}


        {error && (
          <div
            className="site-access-modal__error"
            role="alert"
          >
            {error}
          </div>
        )}


        <div className="site-access-modal__actions">
          <button
            type="button"
            className="site-access-button site-access-button--secondary"
            onClick={
              closeWellbeingModal
            }
            disabled={
              unlocking
            }
          >
            Not now
          </button>


          {canUnlock ? (
            <button
              type="button"
              className="site-access-button site-access-button--primary"
              onClick={
                handleUnlock
              }
              disabled={
                unlocking
              }
            >
              {unlocking
                ? "Opening..."
                : "Access for 1 Token"}
            </button>
          ) : (
            <button
              type="button"
              className="site-access-button site-access-button--primary"
              onClick={
                contactAnandam
              }
            >
              Contact Anandam
            </button>
          )}
        </div>
      </section>
    </div>
  );
}


export default WellbeingAccessModal;
