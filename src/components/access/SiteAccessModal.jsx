import {
  useEffect,
  useMemo,
  useState,
} from "react";

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


/* =====================================================
   ACCESS PRESETS

   1 token = 24 hours
   ===================================================== */

const ACCESS_OPTIONS = [
  {
    id: "2-hours",
    label: "2 hours",
    tokens: 0.083333,
  },
  {
    id: "6-hours",
    label: "6 hours",
    tokens: 0.25,
  },
  {
    id: "12-hours",
    label: "12 hours",
    tokens: 0.5,
  },
  {
    id: "1-day",
    label: "1 day",
    tokens: 1,
  },
  {
    id: "2-days",
    label: "2 days",
    tokens: 2,
  },
  {
    id: "7-days",
    label: "7 days",
    tokens: 7,
  },
  {
    id: "15-days",
    label: "15 days",
    tokens: 15,
  },
  {
    id: "30-days",
    label: "30 days",
    tokens: 30,
  },
];


/* =====================================================
   HELPERS
   ===================================================== */

function roundTokens(
  value
) {
  return Number(
    Number(value || 0)
      .toFixed(6)
  );
}


function formatTokenAmount(
  value
) {
  const amount =
    roundTokens(value);


  return amount.toLocaleString(
    undefined,
    {
      maximumFractionDigits: 6,
    }
  );
}


function formatDurationFromTokens(
  tokenAmount
) {
  const totalHours =
    Number(tokenAmount || 0) *
    24;


  if (
    !Number.isFinite(totalHours) ||
    totalHours <= 0
  ) {
    return "0 hours";
  }


  const wholeDays =
    Math.floor(
      totalHours / 24
    );


  const remainingHoursFloat =
    totalHours -
    wholeDays * 24;


  const wholeHours =
    Math.floor(
      remainingHoursFloat
    );


  const minutes =
    Math.round(
      (
        remainingHoursFloat -
        wholeHours
      ) * 60
    );


  const parts = [];


  if (wholeDays > 0) {
    parts.push(
      `${wholeDays} ${
        wholeDays === 1
          ? "day"
          : "days"
      }`
    );
  }


  if (wholeHours > 0) {
    parts.push(
      `${wholeHours} ${
        wholeHours === 1
          ? "hour"
          : "hours"
      }`
    );
  }


  if (
    minutes > 0 &&
    wholeDays === 0
  ) {
    parts.push(
      `${minutes} ${
        minutes === 1
          ? "minute"
          : "minutes"
      }`
    );
  }


  return (
    parts.join(" ") ||
    "Less than 1 minute"
  );
}


/*
  If the user has fewer than 30 tokens,
  automatically select the largest preset
  they can currently afford.

  Examples:

  balance 30 -> 30 days
  balance 15 -> 15 days
  balance 2  -> 2 days
  balance .5 -> 12 hours
*/

function findBestPreset(
  tokenBalance
) {
  const affordable =
    ACCESS_OPTIONS
      .filter(
        (option) =>
          option.tokens <=
          tokenBalance
      )
      .sort(
        (a, b) =>
          b.tokens -
          a.tokens
      );


  if (
    tokenBalance >= 30
  ) {
    return "30-days";
  }


  return (
    affordable[0]?.id ||
    "30-days"
  );
}


/* =====================================================
   MODAL
   ===================================================== */

function SiteAccessModal() {
  const {
    access,
    modalOpen,
    activating,
    error,
    closeAccessModal,
    activateAccess,
  } =
    useSiteAccess();


  const tokenBalance =
    Number(
      access?.tokenBalance ??
      access?.balance ??
      0
    );


  const [
    selectedId,
    setSelectedId,
  ] = useState(
    "30-days"
  );


  const [
    customValue,
    setCustomValue,
  ] = useState("");


  const [
    customUnit,
    setCustomUnit,
  ] = useState(
    "hours"
  );


  /* ===================================================
     RESET SELECTION WHEN MODAL OPENS
     =================================================== */

  useEffect(() => {
    if (!modalOpen) {
      return;
    }


    setSelectedId(
      findBestPreset(
        tokenBalance
      )
    );


    setCustomValue(
      ""
    );


    setCustomUnit(
      "hours"
    );

  }, [
    modalOpen,
    tokenBalance,
  ]);


  /* ===================================================
     SELECTED PRESET
     =================================================== */

  const selectedPreset =
    ACCESS_OPTIONS.find(
      (option) =>
        option.id ===
        selectedId
    ) ||
    null;


  /* ===================================================
     CUSTOM DURATION -> TOKEN CALCULATION

     Hours:
       hours / 24

     Days:
       days = tokens
     =================================================== */

  const customTokenAmount =
    useMemo(
      () => {
        const value =
          Number(
            customValue
          );


        if (
          !Number.isFinite(
            value
          ) ||
          value <= 0
        ) {
          return 0;
        }


        const tokens =
          customUnit ===
          "days"
            ? value
            : value / 24;


        return roundTokens(
          tokens
        );
      },
      [
        customUnit,
        customValue,
      ]
    );


  /* ===================================================
     FINAL TOKEN AMOUNT
     =================================================== */

  const selectedTokens =
    selectedId ===
    "custom"
      ? customTokenAmount
      : Number(
          selectedPreset
            ?.tokens ||
          0
        );


  const selectedDuration =
    formatDurationFromTokens(
      selectedTokens
    );


  /*
    Maximum purchase from this popup:
    30 tokens / 30 days.

    Existing access can still be extended
    again later.
  */

  const validSelection =
    selectedTokens > 0 &&
    selectedTokens <= 30;


  const missingTokens =
    roundTokens(
      Math.max(
        selectedTokens -
        tokenBalance,
        0
      )
    );


  const canActivate =
    validSelection &&
    tokenBalance >=
      selectedTokens;


  if (!modalOpen) {
    return null;
  }


  /* ===================================================
     CONTACT ANANDAM
     =================================================== */

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
        : selectedTokens ||
          1;


    const subject =
      `Anandam Token Request - ${username}`;


    const body = [
      "Hello Fathom Marine Consultants,",
      "",
      "I would like to request Anandam tokens.",
      "",
      `User: ${username}`,
      `Requested tokens: ${formatTokenAmount(
        requestedTokens
      )}`,
      `Requested Anandam access: ${selectedDuration}`,
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


  /* ===================================================
     ACTIVATE
     =================================================== */

  async function handleActivate() {
    if (
      !canActivate
    ) {
      return;
    }


    try {
      await activateAccess(
        selectedTokens
      );
    } catch {
      /*
        Error is already handled
        by SiteAccessContext.
      */
    }
  }


  /* ===================================================
     UI
     =================================================== */

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
        {/* CLOSE */}

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


        {/* TOKEN ICON */}

        <div className="site-access-modal__coin">
          <img
            src={tokenCoin}
            alt=""
            aria-hidden="true"
          />
        </div>


        {/* TITLE */}

        <h2
          id="site-access-title"
        >
          Choose Anandam Access
        </h2>


        <p className="site-access-modal__description">
          Choose how long you want
          access. Your token cost is
          calculated using{" "}
          <strong>
            1 token = 24 hours
          </strong>.
        </p>


        {/* =============================================
            PRESET OPTIONS
            ============================================= */}

        <div
  className="site-access-duration-grid"
>
          {ACCESS_OPTIONS.map(
            (option) => {
              const selected =
                selectedId ===
                option.id;


              return (
                <button
                  key={
                    option.id
                  }
                  type="button"
                  className="site-access-button site-access-button--secondary"
                  onClick={() =>
                    setSelectedId(
                      option.id
                    )
                  }
                  disabled={
                    activating
                  }
                  style={{
                    minHeight:
                      "58px",

                    border:
                      selected
                        ? "1px solid #712E1E"
                        : undefined,

                    background:
                      selected
                        ? "#FFF4EF"
                        : undefined,
                  }}
                >
                  <span
                    style={{
                      display:
                        "block",

                      fontWeight:
                        700,
                    }}
                  >
                    {option.label}
                  </span>


                  <small
                    style={{
                      display:
                        "block",

                      marginTop:
                        "3px",
                    }}
                  >
                    {formatTokenAmount(
                      option.tokens
                    )}{" "}
                    {option.tokens ===
                    1
                      ? "token"
                      : "tokens"}
                  </small>
                </button>
              );
            }
          )}
        </div>


        {/* =============================================
            CUSTOM DURATION BUTTON
            ============================================= */}

        <button
          type="button"
          className="site-access-button site-access-button--secondary"
          onClick={() =>
            setSelectedId(
              "custom"
            )
          }
          disabled={
            activating
          }
          style={{
            width:
              "100%",

            marginBottom:
              "10px",

            border:
              selectedId ===
              "custom"
                ? "1px solid #712E1E"
                : undefined,

            background:
              selectedId ===
              "custom"
                ? "#FFF4EF"
                : undefined,
          }}
        >
          Custom duration
        </button>


        {/* =============================================
            CUSTOM HOURS / DAYS
            ============================================= */}

        {selectedId ===
          "custom" && (
         <div className="site-access-custom-duration">
            <input
              type="number"
              min="0.01"
              max={
                customUnit ===
                "days"
                  ? "30"
                  : "720"
              }
              step="0.25"
              value={
                customValue
              }
              onChange={(
                event
              ) =>
                setCustomValue(
                  event
                    .target
                    .value
                )
              }
              placeholder="e.g. 3"
              style={{
                minWidth:
                  0,

                padding:
                  "11px 12px",

                borderRadius:
                  "8px",

                border:
                  "1px solid #D9D9D9",

                font:
                  "inherit",
              }}
            />


            <select
              value={
                customUnit
              }
              onChange={(
                event
              ) =>
                setCustomUnit(
                  event
                    .target
                    .value
                )
              }
              style={{
                padding:
                  "11px 10px",

                borderRadius:
                  "8px",

                border:
                  "1px solid #D9D9D9",

                font:
                  "inherit",

                background:
                  "white",
              }}
            >
              <option value="hours">
                Hours
              </option>

              <option value="days">
                Days
              </option>
            </select>
          </div>
        )}


        {/* CUSTOM COST PREVIEW */}

        {selectedId ===
          "custom" &&
          customTokenAmount >
            0 && (
          <p
            style={{
              margin:
                "-4px 0 14px",

              fontSize:
                "13px",

              opacity:
                0.8,
            }}
          >
            This duration costs{" "}
            <strong>
              {formatTokenAmount(
                customTokenAmount
              )}{" "}
              tokens
            </strong>.
          </p>
        )}


        {/* =============================================
            SUMMARY
            ============================================= */}

        <div className="site-access-modal__summary">
          <div>
            <span>
              Your balance
            </span>

            <strong>
              {formatTokenAmount(
                tokenBalance
              )}{" "}
              Tokens
            </strong>
          </div>


          <div>
            <span>
              Selected access
            </span>

            <strong>
              {
                selectedDuration
              }
            </strong>
          </div>


          <div>
            <span>
              Access cost
            </span>

            <strong>
              {formatTokenAmount(
                selectedTokens
              )}{" "}
              Tokens
            </strong>
          </div>


          {canActivate && (
            <div>
              <span>
                Balance after unlock
              </span>

              <strong>
                {formatTokenAmount(
                  tokenBalance -
                    selectedTokens
                )}{" "}
                Tokens
              </strong>
            </div>
          )}
        </div>


        {/* =============================================
            INVALID DURATION
            ============================================= */}

        {selectedTokens >
          30 && (
          <div className="site-access-modal__warning">
            Please choose a
            maximum of 30 days
            per activation.
          </div>
        )}


        {/* =============================================
            INSUFFICIENT BALANCE
            ============================================= */}

        {validSelection &&
          !canActivate && (
          <div className="site-access-modal__warning">
            You need{" "}
            <strong>
              {formatTokenAmount(
                missingTokens
              )}
            </strong>{" "}
            more{" "}
            {missingTokens ===
            1
              ? "token"
              : "tokens"}{" "}
            for this access
            period.
          </div>
        )}


        {/* BACKEND ERROR */}

        {error && (
          <div
            className="site-access-modal__error"
            role="alert"
          >
            {error}
          </div>
        )}


        {/* =============================================
            ACTIONS
            ============================================= */}

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
                : `Use ${formatTokenAmount(
                    selectedTokens
                  )} Tokens`}
            </button>
          ) : (
            <button
              type="button"
              className="site-access-button site-access-button--primary"
              onClick={
                contactAnandam
              }
              disabled={
                !validSelection
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