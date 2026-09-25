import { useEffect, useMemo, useState } from "react";

import {
  ArrowUpRight,
  Brain,
  HardHat,
  Mail,
  MessageCircle,
  Phone,
  PhoneCall,
  Plus,
  Siren,
  X,
} from "lucide-react";

import AppLayout from "../components/layout/AppLayout";

import "../styles/global.css";
import "../styles/emergency.css";

/* =========================================================
   FATHOM CONTACT
   ========================================================= */

const FATHOM_PHONE_DISPLAY = "+91 84529 65467";
const FATHOM_PHONE_LINK = "tel:+918452965467";

const SUPPORT_EMAIL =
  "contact@fathommarineconsultants.com";

/* =========================================================
   EMERGENCY SUPPORT
   ========================================================= */

const SUPPORT_ITEMS = [
  {
    id: "medical",
    title: "Medical emergency",
    number: "112",
    meta: "National Emergency Number",
    phoneLink: "tel:112",
    tone: "medical",
    Icon: Plus,
  },

  {
    id: "mental-health",
    title: "Mental health support",
    number: "+91 9999 666 555",
    meta: "Vandrevala Foundation · 24/7",
    phoneLink: "tel:+919999666555",
    tone: "mental",
    Icon: Brain,
  },

  {
    id: "maritime",
    title: "Maritime safety",
    number: "9004048406",
    meta: "DG Shipping India · 24/7",
    phoneLink: "tel:9004048406",
    tone: "maritime",
    Icon: HardHat,
  },

  {
    id: "crisis",
    title: "Crisis helpline",
    number: "+91 86575 49760",
    meta: "Safety & port crisis support",
    phoneLink: "tel:+918657549760",
    tone: "crisis",
    Icon: Siren,
  },
];

/* =========================================================
   EMAIL
   ========================================================= */

const EMAIL_SUBJECT =
  "Anandam Emergency Support Request";

const EMAIL_BODY = `Hello Fathom Marine Consultants,

I need emergency support through Anandam. Please contact me as soon as possible.

Name:
Vessel / Location:
Nature of emergency:

Thank you.`;

const EMAIL_LINK =
  `mailto:${SUPPORT_EMAIL}` +
  `?subject=${encodeURIComponent(EMAIL_SUBJECT)}` +
  `&body=${encodeURIComponent(EMAIL_BODY)}`;

/* =========================================================
   WHATSAPP
   ========================================================= */

const WHATSAPP_MESSAGE =
  "Hello Fathom Marine Consultants, I need emergency support through Anandam. Please contact me as soon as possible.";

const WHATSAPP_LINK =
  `https://wa.me/918452965467` +
  `?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

/* =========================================================
   EMERGENCY ASSETS

   Searches everything inside:
   src/assets/emergency/
   ========================================================= */

const emergencyAssets = import.meta.glob(
  "../assets/emergency/*.{png,jpg,jpeg,webp,svg,gif}",
  {
    eager: true,
    import: "default",
  }
);

function findEmergencyAsset(keywords = []) {
  const entries =
    Object.entries(emergencyAssets);

  for (const keyword of keywords) {
    const match = entries.find(
      ([path]) =>
        path
          .toLowerCase()
          .includes(
            keyword.toLowerCase()
          )
    );

    if (match) {
      return match[1];
    }
  }

  return "";
}

/*
  Used only for AI asset.

  This allows the long AI image filename from Figma/export
  to still be detected even if it isn't literally called "chatbot".
*/

function findAiAsset() {
  const preferred =
    findEmergencyAsset([
      "chatbot",
      "chat-bot",
      "ai-bot",
      "assistant",
      "premium",
      "seamless",
      "globe",
      "calm",
      "chat",
    ]);

  if (preferred) {
    return preferred;
  }

  const entries =
    Object.entries(emergencyAssets);

  const excluded = [
    "whatsapp",
    "botim",
    "bottim",
    "email",
    "mail",
  ];

  const match =
    entries.find(([path]) => {
      const lower =
        path.toLowerCase();

      return !excluded.some(
        (word) =>
          lower.includes(word)
      );
    });

  return match?.[1] || "";
}

/* =========================================================
   EMERGENCY SUPPORT CARD
   ========================================================= */

function EmergencySupportCard({
  title,
  number,
  meta,
  phoneLink,
  tone,
  Icon,
}) {
  return (
    <a
      className="emergency-support-item"
      href={phoneLink}
      aria-label={`Call ${title} at ${number}`}
    >
      <span
        className={`emergency-support-item__icon emergency-support-item__icon--${tone}`}
        aria-hidden="true"
      >
        <Icon
          size={18}
          strokeWidth={1.9}
        />
      </span>

      <span className="emergency-support-item__copy">
        <strong className="emergency-support-item__title">
          {title}
        </strong>

        <span className="emergency-support-item__details">
          <span className="emergency-support-item__number">
            {number}
          </span>

          <span
            className="emergency-support-item__separator"
            aria-hidden="true"
          >
            ·
          </span>

          <span className="emergency-support-item__meta">
            {meta}
          </span>
        </span>
      </span>

      <Phone
        className="emergency-support-item__call"
        size={17}
        strokeWidth={1.7}
        aria-hidden="true"
      />
    </a>
  );
}

/* =========================================================
   CONTACT ICON
   ========================================================= */

function ContactIcon({
  type,
  logoSrc,
  unread = false,
}) {
  return (
    <span
      className={`emergency-contact-icon emergency-contact-icon--${type}`}
      aria-hidden="true"
    >
      {logoSrc ? (
        <img
          src={logoSrc}
          alt=""
          draggable="false"
          className="emergency-contact-icon__asset"
        />
      ) : type === "whatsapp" ? (
        <MessageCircle
          size={22}
          strokeWidth={2}
        />
      ) : type === "email" ? (
        <Mail
          size={17}
          strokeWidth={1.9}
        />
      ) : (
        <span className="emergency-botim-fallback">
          b
        </span>
      )}

      {unread ? (
        <span className="emergency-contact-icon__badge" />
      ) : null}
    </span>
  );
}

/* =========================================================
   STAY IN TOUCH CARD
   ========================================================= */

function ContactCard({
  type,
  label,
  href,
  logoSrc,
  unreadText,
  onClick,
  isButton = false,
}) {
  const content = (
    <>
      <ContactIcon
        type={type}
        logoSrc={logoSrc}
        unread={Boolean(unreadText)}
      />

      <span className="emergency-contact-card__body">
        <span className="emergency-contact-card__label">
          {label}
        </span>

        {unreadText ? (
          <span className="emergency-contact-card__unread">
            {unreadText}
          </span>
        ) : null}
      </span>

      <span
        className="emergency-contact-card__arrow"
        aria-hidden="true"
      >
        <ArrowUpRight
          size={17}
          strokeWidth={1.7}
        />
      </span>
    </>
  );

  if (isButton) {
    return (
      <button
        type="button"
        className="emergency-contact-card"
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <a
      className="emergency-contact-card"
      href={href}
      target={
        type === "whatsapp"
          ? "_blank"
          : undefined
      }
      rel={
        type === "whatsapp"
          ? "noreferrer"
          : undefined
      }
    >
      {content}
    </a>
  );
}

/* =========================================================
   NOTICE
   ========================================================= */

function EmergencyNotice({
  notice,
  onClose,
}) {
  if (!notice) {
    return null;
  }

  return (
    <div
      className="emergency-notice"
      role="status"
      aria-live="polite"
    >
      <div className="emergency-notice__copy">
        <strong>
          {notice.title}
        </strong>

        <span>
          {notice.message}
        </span>
      </div>

      <button
        type="button"
        className="emergency-notice__close"
        onClick={onClose}
        aria-label="Close message"
      >
        <X size={16} />
      </button>
    </div>
  );
}

/* =========================================================
   PAGE
   ========================================================= */

function EmergencyPage() {
  const whatsappLogo =
    useMemo(
      () =>
        findEmergencyAsset([
          "whatsapp",
          "whats-app",
          "whats_app",
        ]),
      []
    );

  const botimLogo =
    useMemo(
      () =>
        findEmergencyAsset([
          "botim",
          "bottim",
        ]),
      []
    );

  const aiChatImage =
    useMemo(
      () => findAiAsset(),
      []
    );

  const [
    notice,
    setNotice,
  ] = useState(null);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timer =
      window.setTimeout(
        () => {
          setNotice(null);
        },
        5000
      );

    return () =>
      window.clearTimeout(
        timer
      );
  }, [notice]);

  function showAiComingSoon() {
    setNotice({
      title:
        "AI support is coming shortly",
      message:
        "The Anandam AI support assistant will be available here soon. For immediate help, please use the emergency numbers, WhatsApp, or email.",
    });
  }

  function showBotimComingSoon() {
    setNotice({
      title:
        "BOTIM integration is coming shortly",
      message:
        "For now, you can contact the emergency team through phone, WhatsApp, or email.",
    });
  }

  return (
    <AppLayout>
      <div className="emergency-page">

        {/* =================================================
            HEADING
            ================================================= */}

        <header className="emergency-page__heading">
          <h1>
            Emergency Response Hub
          </h1>

          <p>
            Comprehensive crisis management
            and emergency communication system
          </p>
        </header>

        {/* =================================================
            IMMEDIATE DANGER
            ================================================= */}

        <section className="emergency-danger-card">
          <div className="emergency-danger-card__copy">
            <h2>
              Immediate Danger?
            </h2>

            <p>
              For serious illness or injury,
              a safety incident, or a situation
              where someone may harm themselves.
            </p>
          </div>

          <a
            className="emergency-primary-action"
            href={FATHOM_PHONE_LINK}
            aria-label={`Call Fathom emergency team at ${FATHOM_PHONE_DISPLAY}`}
          >
            <PhoneCall
              className="emergency-primary-action__icon"
              size={16}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <span>
              Contact Emergency Team
            </span>
          </a>
        </section>

        {/* =================================================
            EMERGENCY SUPPORT
            ================================================= */}

        <section className="emergency-support-section">
          <h2 className="emergency-section-title">
            Emergency support
          </h2>

          <div className="emergency-support-grid">
            {SUPPORT_ITEMS.map(
              (item) => (
                <EmergencySupportCard
                  key={item.id}
                  {...item}
                />
              )
            )}
          </div>
        </section>

        {/* =================================================
            STAY IN TOUCH
            ================================================= */}

        <section className="emergency-contact-section">
          <h2>
            Stay In Touch
          </h2>

          <div className="emergency-contact-grid">

            {/* WhatsApp */}

            <ContactCard
              type="whatsapp"
              label="WhatsApp"
              unreadText="(3 unread)"
              href={WHATSAPP_LINK}
              logoSrc={whatsappLogo}
            />

            {/* Email */}

            <ContactCard
              type="email"
              label="Email"
              unreadText="(3 unread)"
              href={EMAIL_LINK}
            />

            {/* BOTIM */}

            <ContactCard
              type="botim"
              label="Botim"
              logoSrc={botimLogo}
              isButton
              onClick={
                showBotimComingSoon
              }
            />

          </div>
        </section>

        {/* =================================================
            AI CHAT
            ================================================= */}

        <button
          type="button"
          className="emergency-ai-button"
          onClick={showAiComingSoon}
          aria-label="Open Anandam AI support"
          title="AI Support"
        >
          {aiChatImage ? (
            <img
              src={aiChatImage}
              alt=""
              draggable="false"
              aria-hidden="true"
              className="emergency-ai-button__image"
            />
          ) : (
            <span className="emergency-ai-button__fallback">
              <MessageCircle
                size={31}
                strokeWidth={1.5}
              />
            </span>
          )}
        </button>

        {/* =================================================
            NOTICE
            ================================================= */}

        <EmergencyNotice
          notice={notice}
          onClose={() =>
            setNotice(null)
          }
        />

      </div>
    </AppLayout>
  );
}

export default EmergencyPage;