import {
  X,
} from "lucide-react";

import tokenCoin
  from "../../assets/token coin.png";


export default function PsychometricTokenModal({
  open,
  loading = false,

  title =
    "Token Required",

  description =
    "Tokens are required to start this assessment.",

  tokenCost = 1,

  walletBalance = 0,

  hasEnoughTokens = false,

  error = "",

  onClose,

  onConfirm,
}) {
  if (!open) {
    return null;
  }


  const safeTokenCost =
    Math.max(
      0,
      Number(
        tokenCost || 0
      )
    );


  const safeWalletBalance =
    Math.max(
      0,
      Number(
        walletBalance || 0
      )
    );


  const enoughTokens =
    Boolean(
      hasEnoughTokens
    ) ||
    safeWalletBalance >=
      safeTokenCost;


  const remainingBalance =
    enoughTokens
      ? Math.max(
          0,
          safeWalletBalance -
            safeTokenCost
        )
      : safeWalletBalance;


  return (
    <div
      className="psychometric-token-backdrop"
      role="presentation"
    >
      <div
        className="psychometric-token-modal psychometric-repeat-token-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="psychometric-token-title"
      >
        <button
          type="button"
          className="psychometric-token-modal__close"
          onClick={
            onClose
          }
          disabled={
            loading
          }
          aria-label="Close"
        >
          <X
            size={20}
            strokeWidth={1.6}
          />
        </button>


        <div className="psychometric-token-image-wrap">
          <img
            src={
              tokenCoin
            }
            alt="Anandam token"
            className="psychometric-token-image"
          />
        </div>


        <h2
          id="psychometric-token-title"
        >
          {title}
        </h2>


        <p className="psychometric-token-modal__description">
          {description}
        </p>


        <div className="psychometric-token-balance-card">
          <div className="psychometric-token-balance-row">
            <span>
              Current balance
            </span>

            <strong>
              {
                safeWalletBalance
              }{" "}
              Token
              {safeWalletBalance ===
              1
                ? ""
                : "s"}
            </strong>
          </div>


          <div className="psychometric-token-balance-row">
            <span>
              Required
            </span>

            <strong>
              {
                safeTokenCost
              }{" "}
              Token
              {safeTokenCost ===
              1
                ? ""
                : "s"}
            </strong>
          </div>


          {enoughTokens ? (
            <div className="psychometric-token-balance-row psychometric-token-balance-row--remaining">
              <span>
                Balance after use
              </span>

              <strong>
                {
                  remainingBalance
                }{" "}
                Token
                {remainingBalance ===
                1
                  ? ""
                  : "s"}
              </strong>
            </div>
          ) : null}
        </div>


        {!enoughTokens ? (
          <div className="psychometric-token-insufficient">
            <strong>
              Insufficient token
              balance
            </strong>

            <span>
              You need{" "}
              {safeTokenCost}{" "}
              token
              {safeTokenCost ===
              1
                ? ""
                : "s"}{" "}
              to start this
              assessment attempt,
              but your current
              balance is{" "}
              {
                safeWalletBalance
              }.
            </span>
          </div>
        ) : null}


        {error ? (
          <div className="psychometric-token-modal__error">
            {error}
          </div>
        ) : null}


        <div className="psychometric-token-modal__actions">
          <button
            type="button"
            className="psychometric-button psychometric-button--outline"
            onClick={
              onClose
            }
            disabled={
              loading
            }
          >
            Cancel
          </button>


          <button
            type="button"
            className="psychometric-button"
            onClick={
              onConfirm
            }
            disabled={
              loading ||
              !enoughTokens
            }
          >
            {loading
              ? "Starting..."
              : `Use ${safeTokenCost} Token${
                  safeTokenCost ===
                  1
                    ? ""
                    : "s"
                } & Continue`}
          </button>
        </div>
      </div>
    </div>
  );
}
