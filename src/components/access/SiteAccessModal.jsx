import {
  X,
} from "lucide-react";

import {
  useSiteAccess,
} from "../../context/SiteAccessContext";

import {
  getStoredAuthUser,
} from "../../api/authApi";

import tokenCoin
  from "../../assets/token coin.png";

import "../../styles/site-access.css";


const CONTACT_EMAIL =
  "contact@fathommarineconsultants.com";


function SiteAccessModal() {
  const {
    access,
    modalOpen,
    activating,
    error,
    closeAccessModal,
    activateAccess,
  } = useSiteAccess();


  if (!modalOpen) {
    return null;
  }


  const tokenCost =
    Number(
      access?.tokenCost ??
      30
    );


  const durationDays =
    Number(
      access?.durationDays ??
      30
    );


  const tokenBalance =
    Number(
      access?.tokenBalance ??
      access?.balance ??
      0
    );


  const missingTokens =
    Math.max(
      tokenCost -
        tokenBalance,
      0
    );


  const canActivate =
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
      `Requested Anandam access: ${durationDays} days`,
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


  async function handleActivate() {
    try {
      await activateAccess();
    } catch {
      // Context already displays the error.
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
        aria-labelledby="site-access-title"
      >
        <button
          type="button"
          className="site-access-modal__close"
          onClick={
            closeAccessModal
          }
          disabled={
            activating
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
          id="site-access-title"
        >
          Unlock Anandam
        </h2>


        <p className="site-access-modal__description">
          Use{" "}
          <strong>
            {tokenCost} tokens
          </strong>{" "}
          to unlock Anandam features
          for{" "}
          <strong>
            {durationDays} days
          </strong>.
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
              Access cost
            </span>

            <strong>
              {tokenCost} Tokens
            </strong>
          </div>


          {canActivate && (
            <div>
              <span>
                Balance after unlock
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


        {!canActivate && (
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
            to unlock Anandam.
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
              closeAccessModal
            }
            disabled={
              activating
            }
          >
            Not now
          </button>


          {canActivate ? (
            <button
              type="button"
              className="site-access-button site-access-button--primary"
              onClick={
                handleActivate
              }
              disabled={
                activating
              }
            >
              {activating
                ? "Unlocking..."
                : `Unlock for ${tokenCost} Tokens`}
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


export default SiteAccessModal;
