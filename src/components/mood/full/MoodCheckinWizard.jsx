import { X } from "lucide-react";

import helpIcon from "../../../assets/mood/help.png";
import {
    useMemo,
    useState,
} from "react";

import {
    ENERGY_OPTIONS,
    FEELING_OPTIONS,
    MOOD_OPTIONS,
    STRESS_OPTIONS,
    WORKLOAD_OPTIONS,
    getEnergyLabel,
    getMoodLabel,
    getSleepLabel,
    getStressLabel,
    getWorkloadLabel,
} from "../../../data/fullMoodData";

import {
    submitMoodCheckin,
} from "../../../api/moodCheckinApi";

const MAX_FEELINGS = 5;
const MAX_TEXT_LENGTH = 350;

const INITIAL_FORM = {
    mood: null,
    energy: null,
    stress: null,

    sleepHours: 8,
    workload: null,

    additionalThoughts: "",
    feelings: [],
    journalEntry: "",
};

/* =====================================================
   STEPPER
   ===================================================== */

function CheckinStepper({
    step,
}) {
    const items = [
        {
            number: 1,
            label: "Wellbeing",
        },
        {
            number: 2,
            label: "Sleep & Workload",
        },
        {
            number: 3,
            label: "Emotions & Notes",
        },
    ];

    return (
        <div className="full-mood-stepper">
            {items.map(
                (item, index) => {
                    const active =
                        step === item.number;

                    const completed =
                        step > item.number;

                    return (
                        <div
                            className="full-mood-stepper__group"
                            key={item.number}
                        >
                            <div
                                className={`full-mood-stepper__item ${active
                                    ? "is-active"
                                    : ""
                                    } ${completed
                                        ? "is-complete"
                                        : ""
                                    }`}
                            >
                                <span className="full-mood-stepper__circle">
                                    {item.number}
                                </span>

                                <span className="full-mood-stepper__label">
                                    {item.label}
                                </span>
                            </div>

                            {index <
                                items.length - 1 && (
                                    <span className="full-mood-stepper__line" />
                                )}
                        </div>
                    );
                }
            )}
        </div>
    );
}

/* =====================================================
   STANDARD SELECT CARD
   ===================================================== */

function VisualChoice({
    option,
    selected,
    onClick,
    className = "",
    children,
}) {
    return (
        <button
            type="button"
            className={`full-mood-choice ${selected
                ? "is-selected"
                : ""
                } ${className}`}
            onClick={onClick}
        >
            {children || (
                <>
                    <img
                        src={option.image}
                        alt=""
                        className="full-mood-choice__image"
                    />

                    <span>
                        {option.label}
                    </span>
                </>
            )}
        </button>
    );
}

/* =====================================================
   STRESS VISUAL

   Figma uses progressively untangling line artwork.
   ===================================================== */


/* =====================================================
   STEP 1
   ===================================================== */

function StepOne({
    form,
    update,
    onContinue,
}) {
    const valid =
        form.mood !== null &&
        form.energy !== null &&
        form.stress !== null;

    return (
        <div className="full-mood-step-body">
            <section className="full-mood-form-card">
                <h2>
                    How Are You Feeling Today?
                </h2>

                <div className="full-mood-five-grid">
                    {MOOD_OPTIONS.map(
                        (option) => (
                            <VisualChoice
                                key={option.value}
                                option={option}
                                selected={
                                    form.mood ===
                                    option.value
                                }
                                onClick={() =>
                                    update(
                                        "mood",
                                        option.value
                                    )
                                }
                            />
                        )
                    )}
                </div>
            </section>

            <section className="full-mood-form-card">
                <h2>
                    How Is Your Energy Level?
                </h2>

                <div className="full-mood-five-grid">
                    {ENERGY_OPTIONS.map(
                        (option) => (
                            <VisualChoice
                                key={option.value}
                                option={option}
                                selected={
                                    form.energy ===
                                    option.value
                                }
                                onClick={() =>
                                    update(
                                        "energy",
                                        option.value
                                    )
                                }
                                className="energy-choice"
                            />
                        )
                    )}
                </div>
            </section>

            <section className="full-mood-form-card">
                <h2>
                    How Stressed Do You Feel?
                </h2>

                <div className="full-mood-five-grid">
                    {STRESS_OPTIONS.map((option) => (
                        <VisualChoice
                            key={option.value}
                            option={option}
                            selected={
                                form.stress === option.value
                            }
                            onClick={() =>
                                update(
                                    "stress",
                                    option.value
                                )
                            }
                            className="stress-choice"
                        />
                    ))}
                </div>
            </section>

            <div className="full-mood-step-actions">
                <button
                    type="button"
                    className="full-mood-primary-button"
                    onClick={onContinue}
                    disabled={!valid}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}

/* =====================================================
   STEP 2
   ===================================================== */

function StepTwo({
    form,
    update,
    onBack,
    onContinue,
}) {
    return (
        <div className="full-mood-step-body">
            <section className="full-mood-form-card full-mood-sleep-card">
                <h2>
                    How many hours did you sleep last night
                </h2>

                <div className="full-mood-sleep-number">
                    <strong>
                        {form.sleepHours}
                    </strong>

                    <span>
                        Hours
                    </span>
                </div>

                <input
                    type="range"
                    min="0"
                    max="12"
                    step="1"
                    value={
                        form.sleepHours
                    }
                    onChange={(event) =>
                        update(
                            "sleepHours",
                            Number(
                                event.target.value
                            )
                        )
                    }
                    className="full-mood-sleep-range"
                    style={{
                        "--sleep-progress": `${(form.sleepHours /
                            12) *
                            100
                            }%`,
                    }}
                />

                <div className="full-mood-sleep-ticks">
                    {Array.from(
                        {
                            length: 13,
                        },
                        (_, index) => (
                            <span key={index}>
                                {index}
                            </span>
                        )
                    )}
                </div>
            </section>

            <section className="full-mood-form-card full-mood-workload-card">
                <h2>
                    How would you describe your current workload?
                </h2>

                <div className="full-mood-workload-grid">
                    {WORKLOAD_OPTIONS.map(
                        (option) => (
                            <button
                                type="button"
                                key={option.id}
                                className={`full-mood-workload-option ${form.workload ===
                                    option.id
                                    ? "is-selected"
                                    : ""
                                    }`}
                                onClick={() =>
                                    update(
                                        "workload",
                                        option.id
                                    )
                                }
                            >
                                <strong>
                                    {option.label}
                                </strong>

                                <span>
                                    {
                                        option.description
                                    }
                                </span>
                            </button>
                        )
                    )}
                </div>

                <div className="full-mood-textarea-section">
                    <label>
                        Anything else you would like to share?
                    </label>

                    <textarea
                        value={
                            form.additionalThoughts
                        }
                        maxLength={
                            MAX_TEXT_LENGTH
                        }
                        onChange={(event) =>
                            update(
                                "additionalThoughts",
                                event.target.value
                            )
                        }
                        placeholder="Share anything that may be affecting your sleep or your workload..."
                    />

                    <div className="full-mood-character-count">
                        {
                            form
                                .additionalThoughts
                                .length
                        }{" "}
                        / {MAX_TEXT_LENGTH}{" "}
                        characters
                    </div>
                </div>
            </section>

            <div className="full-mood-step-actions">
                <button
                    type="button"
                    className="full-mood-secondary-button"
                    onClick={onBack}
                >
                    Back
                </button>

                <button
                    type="button"
                    className="full-mood-primary-button"
                    onClick={onContinue}
                    disabled={
                        !form.workload
                    }
                >
                    Continue
                </button>
            </div>
        </div>
    );
}

/* =====================================================
   STEP 3
   ===================================================== */

function StepThree({
    form,
    update,
    toggleFeeling,
    onBack,
    onReview,
}) {
    return (
        <div className="full-mood-step-body">
            <section className="full-mood-form-card full-mood-feelings-card">
                <div className="full-mood-feelings-heading">
                    <div>
                        <h2>
                            How are you feeling?
                        </h2>

                        <p>
                            Choose all that apply.
                            You can select more than
                            one
                        </p>
                    </div>

                    <span>
                        {form.feelings.length}{" "}
                        selected
                    </span>
                </div>

                <div className="full-mood-feelings-grid">
                    {FEELING_OPTIONS.map(
                        (feeling) => {
                            const selected =
                                form.feelings.includes(
                                    feeling.id
                                );

                            const disabled =
                                !selected &&
                                form.feelings.length >=
                                MAX_FEELINGS;

                            return (
                                <button
                                    key={
                                        feeling.id
                                    }
                                    type="button"
                                    className={`full-mood-feeling-option ${selected
                                        ? "is-selected"
                                        : ""
                                        }`}
                                    onClick={() =>
                                        toggleFeeling(
                                            feeling.id
                                        )
                                    }
                                    disabled={
                                        disabled
                                    }
                                >
                                    <span className="full-mood-feeling-option__content">
                                        <span
                                            className="full-mood-feeling-option__icon"
                                            style={{
                                                "--feeling-bg": feeling.bg,
                                            }}
                                        >
                                            <img
                                                src={feeling.icon}
                                                alt=""
                                                aria-hidden="true"
                                                draggable="false"
                                            />
                                        </span>

                                        <strong>
                                            {
                                                feeling.label
                                            }
                                        </strong>
                                    </span>

                                    <span
                                        className={`full-mood-checkbox ${selected
                                            ? "is-checked"
                                            : ""
                                            }`}
                                    >
                                        {selected
                                            ? "✓"
                                            : ""}
                                    </span>
                                </button>
                            );
                        }
                    )}
                </div>

                <div className="full-mood-textarea-section full-mood-journal-section">
                    <label>
                        Journal Entry
                    </label>

                    <textarea
                        value={
                            form.journalEntry
                        }
                        maxLength={
                            MAX_TEXT_LENGTH
                        }
                        onChange={(event) =>
                            update(
                                "journalEntry",
                                event.target.value
                            )
                        }
                        placeholder="Dear Journal,"
                    />

                    <div className="full-mood-character-count">
                        {
                            form
                                .journalEntry
                                .length
                        }{" "}
                        / {MAX_TEXT_LENGTH}{" "}
                        characters
                    </div>
                </div>
            </section>

            <div className="full-mood-step-actions">
                <button
                    type="button"
                    className="full-mood-secondary-button"
                    onClick={onBack}
                >
                    Back
                </button>

                <button
                    type="button"
                    className="full-mood-primary-button"
                    onClick={onReview}
                >
                    Complete checkin
                </button>
            </div>
        </div>
    );
}

/* =====================================================
   REVIEW MODAL
   ===================================================== */

function ReviewModal({
    form,
    saving,
    error,
    onClose,
    onSubmit,
}) {
    const feelingText =
        form.feelings.length
            ? form.feelings
                .map((id) => {
                    const option =
                        FEELING_OPTIONS.find(
                            (item) =>
                                item.id === id
                        );

                    return (
                        option?.label || id
                    );
                })
                .join(", ")
            : "None selected";

    const rows = [
        [
            "Mood",
            getMoodLabel(
                form.mood
            ),
        ],
        [
            "Energy",
            getEnergyLabel(
                form.energy
            ),
        ],
        [
            "Stress",
            getStressLabel(
                form.stress
            ),
        ],
        [
            "Sleep",
            getSleepLabel(
                form.sleepHours
            ),
        ],
        [
            "Workload",
            getWorkloadLabel(
                form.workload
            ),
        ],
        [
            "Feelings",
            feelingText,
        ],
    ];

    return (
        <div
            className="full-mood-modal-backdrop"
            role="presentation"
        >
            <div
                className="full-mood-review-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="full-mood-review-title"
            >
                <button
                    type="button"
                    className="full-mood-modal-close"
                    onClick={onClose}
                    aria-label="Close"
                    disabled={saving}
                >
                    <X size={22} />
                </button>

                <div className="full-mood-review-icon">
  <img
    src={helpIcon}
    alt=""
    aria-hidden="true"
  />
</div>

                <h2 id="full-mood-review-title">
                    Complete your check-in?
                </h2>

                <div className="full-mood-review-divider" />

                <p className="full-mood-review-description">
                    Please confirm that
                    you're ready to submit
                    your responses. Once
                    saved, they cannot be
                    edited.
                </p>

                <div className="full-mood-review-list">
                    {rows.map(
                        ([label, value]) => (
                            <div
                                className="full-mood-review-row"
                                key={label}
                            >
                                <span>
                                    {label}
                                </span>

                                <strong>
                                    {value}
                                </strong>
                            </div>
                        )
                    )}
                </div>

                {error && (
                    <p className="full-mood-review-error">
                        {error}
                    </p>
                )}

                <div className="full-mood-review-actions">
                    <button
                        type="button"
                        className="full-mood-secondary-button"
                        onClick={onClose}
                        disabled={saving}
                    >
                        Go Back
                    </button>

                    <button
                        type="button"
                        className="full-mood-primary-button"
                        onClick={onSubmit}
                        disabled={saving}
                    >
                        {saving
                            ? "Saving..."
                            : "Complete Check-in"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* =====================================================
   MAIN WIZARD
   ===================================================== */

function MoodCheckinWizard({
    onComplete,
}) {
    const [step, setStep] =
        useState(1);

    const [form, setForm] =
        useState(INITIAL_FORM);

    const [
        reviewOpen,
        setReviewOpen,
    ] = useState(false);

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        submitError,
        setSubmitError,
    ] = useState("");

    function update(
        field,
        value
    ) {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    }

    function toggleFeeling(id) {
        setForm((previous) => {
            const selected =
                previous.feelings.includes(
                    id
                );

            if (selected) {
                return {
                    ...previous,
                    feelings:
                        previous.feelings.filter(
                            (item) =>
                                item !== id
                        ),
                };
            }

            if (
                previous.feelings.length >=
                MAX_FEELINGS
            ) {
                return previous;
            }

            return {
                ...previous,
                feelings: [
                    ...previous.feelings,
                    id,
                ],
            };
        });
    }

    async function submit() {
        try {
            setSaving(true);
            setSubmitError("");

            const response =
                await submitMoodCheckin(
                    {
                        mood: form.mood,
                        energy: form.energy,
                        stress: form.stress,

                        sleepHours:
                            form.sleepHours,

                        workload:
                            form.workload,

                        additionalThoughts:
                            form.additionalThoughts,

                        feelings:
                            form.feelings,

                        journalEntry:
                            form.journalEntry,
                    }
                );

            setReviewOpen(false);

            onComplete?.(
                response?.entry
            );
        } catch (error) {
            console.error(
                "Full mood check-in failed:",
                error
            );

            setSubmitError(
                error?.message ||
                "We couldn't save your check-in. Please try again."
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <div className="full-mood-wizard-heading">
                <h1>
                    Wellbeing Check-in
                </h1>

                <p>
                    Take a moment for
                    yourself today
                </p>
            </div>

            <CheckinStepper
                step={step}
            />

            {step === 1 && (
                <StepOne
                    form={form}
                    update={update}
                    onContinue={() =>
                        setStep(2)
                    }
                />
            )}

            {step === 2 && (
                <StepTwo
                    form={form}
                    update={update}
                    onBack={() =>
                        setStep(1)
                    }
                    onContinue={() =>
                        setStep(3)
                    }
                />
            )}

            {step === 3 && (
                <StepThree
                    form={form}
                    update={update}
                    toggleFeeling={
                        toggleFeeling
                    }
                    onBack={() =>
                        setStep(2)
                    }
                    onReview={() => {
                        setSubmitError("");
                        setReviewOpen(true);
                    }}
                />
            )}

            {reviewOpen && (
                <ReviewModal
                    form={form}
                    saving={saving}
                    error={submitError}
                    onClose={() =>
                        !saving &&
                        setReviewOpen(false)
                    }
                    onSubmit={submit}
                />
            )}
        </>
    );
}

export default MoodCheckinWizard;