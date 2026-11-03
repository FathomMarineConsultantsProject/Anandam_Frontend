import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
    useSearchParams,
} from "react-router-dom";

import AppLayout
    from "../components/layout/AppLayout";

import PsychometricQuestion
    from "../components/psychometrics/PsychometricQuestion";

import PsychometricTimer
    from "../components/psychometrics/PsychometricTimer";

import PsychometricSubmitModal
    from "../components/psychometrics/PsychometricSubmitModal";

import {
    completePsychometricAttempt,
    getPsychometricAttempt,
    getPsychometricSection,
    submitPsychometricSection,
    getPsychometricErrorMessage,
} from "../api/psychometricApi";

import "../styles/psychometrics.css";


function normaliseQuestion(
    item
) {
    if (!item) {
        return item;
    }


    const question =
        item?.question ||
        item;


    return {
        ...question,

        /*
          Original PsychometricQuestion ID
        */
        id:
            question?.id ||
            item?.questionId ||
            item?.id,

        questionId:
            item?.questionId ||
            question?.id ||
            null,

        /*
          PsychometricAttemptQuestion ID.
    
          This is the safest identifier
          when saving an answer.
        */
        attemptQuestionId:
            item?.attemptQuestionId ||
            (
                item?.question
                    ? item?.id
                    : null
            ),
    };
}


function buildSubmission(
    questions,
    answers
) {
    return questions
        .map((question) => {
            const answer =
                answers[
                question.id
                ];

            if (!answer) {
                return null;
            }


            // LIKERT TESTS
            if (
                question.questionType ===
                "LIKERT_5"
            ) {
                const likertValue =
                    Number(
                        answer.likertValue
                    );

                if (
                    !Number.isInteger(
                        likertValue
                    ) ||
                    likertValue < 1 ||
                    likertValue > 5
                ) {
                    return null;
                }

                return {
                    attemptQuestionId:
                        question
                            ?.attemptQuestionId ||
                        undefined,

                    questionId:
                        question
                            ?.questionId ||
                        question.id,

                    likertValue,
                };
            }


            // MULTIPLE CHOICE
            if (
                !answer.selectedOption
            ) {
                return null;
            }

            return {
                attemptQuestionId:
                    question
                        ?.attemptQuestionId ||
                    undefined,

                questionId:
                    question
                        ?.questionId ||
                    question.id,

                selectedOption:
                    answer.selectedOption,
            };
        })
        .filter(Boolean);
}


function formatRemaining(
    seconds
) {
    const safe =
        Math.max(
            0,
            seconds
        );

    const minutes =
        Math.floor(
            safe / 60
        );

    const secs =
        safe % 60;

    return `${String(
        minutes
    ).padStart(
        2,
        "0"
    )}:${String(
        secs
    ).padStart(
        2,
        "0"
    )}`;
}


function sectionDisplayTitle(
    section
) {
    if (
        section?.code ===
        "PJS"
    ) {
        return "Pre-Joining";
    }

    if (
        section?.code ===
        "PLA"
    ) {
        return "Promotion & Leadership";
    }

    if (
        section?.code ===
        "SHF"
    ) {
        return "Safety Behaviour & Human Factors";
    }

    return (
        section?.title ||
        "Assessment"
    );
}

export default function PsychometricAssessmentPage() {
    const {
        testCode,
        attemptId,
    } = useParams();

    const [
        searchParams,
        setSearchParams,
    ] = useSearchParams();

    const navigate =
        useNavigate();

    const timeoutHandledRef =
        useRef(false);


    const [
        attempt,
        setAttempt,
    ] = useState(null);

    const [
        activeSection,
        setActiveSection,
    ] = useState(null);

    const [
        questions,
        setQuestions,
    ] = useState([]);

    const [
        answers,
        setAnswers,
    ] = useState({});

    const [
        secondsRemaining,
        setSecondsRemaining,
    ] = useState(null);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        submitting,
        setSubmitting,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    const [
        modal,
        setModal,
    ] = useState(null);

    const [
        timeoutResult,
        setTimeoutResult,
    ] = useState(null);


    const selectedSectionCode =
        searchParams.get(
            "section"
        );

    const testType =
        attempt?.test?.type ||
        attempt?.testType ||
        null;


    const isMaritime =
        testType ===
        "MARITIME_HUMAN_PERFORMANCE";


    const answeredCount =
        useMemo(
            () =>
                questions.filter(
                    (question) => {
                        const answer =
                            answers[
                            question.id
                            ];

                        if (
                            question.questionType ===
                            "LIKERT_5"
                        ) {
                            return (
                                answer
                                    ?.likertValue !==
                                undefined &&
                                answer
                                    ?.likertValue !==
                                null
                            );
                        }

                        return Boolean(
                            answer
                                ?.selectedOption
                        );
                    }
                ).length,
            [
                answers,
                questions,
            ]
        );


    const unanswered =
        useMemo(
            () =>
                questions.filter(
                    (question) => {
                        const answer =
                            answers[
                            question.id
                            ];

                        if (
                            question.questionType ===
                            "LIKERT_5"
                        ) {
                            return (
                                answer
                                    ?.likertValue ===
                                undefined ||
                                answer
                                    ?.likertValue ===
                                null
                            );
                        }

                        return !answer
                            ?.selectedOption;
                    }
                ),
            [
                answers,
                questions,
            ]
        );


    function hydrateAnswers(
        items
    ) {
        const next = {};

        for (
            const item of items
        ) {
            const question =
                normaliseQuestion(
                    item
                );

            if (
                !question?.id
            ) {
                continue;
            }

            const selectedOption =
                item?.selectedOption ??
                question
                    ?.selectedOption ??
                null;

            const likertValue =
                item?.likertValue ??
                question
                    ?.likertValue ??
                null;

            if (
                selectedOption ||
                likertValue !== null
            ) {
                next[
                    question.id
                ] = {
                    questionId:
                        question.id,

                    ...(selectedOption
                        ? {
                            selectedOption,
                        }
                        : {}),

                    ...(likertValue !==
                        null
                        ? {
                            likertValue:
                                Number(
                                    likertValue
                                ),
                        }
                        : {}),
                };
            }
        }

        setAnswers(next);
    }


    const load =
        useCallback(
            async () => {
                try {
                    setLoading(true);
                    setError("");

                    const loadedAttempt =
                        await getPsychometricAttempt(
                            attemptId
                        );

                    setAttempt(
                        loadedAttempt
                    );

                    const loadedTestType =
    loadedAttempt?.test?.type ||
    loadedAttempt?.testType ||
    null;

const loadedIsMaritime =
    loadedTestType ===
    "MARITIME_HUMAN_PERFORMANCE";


/*
    =====================================================
    STANDALONE PSYCHOMETRIC TESTS

    BIG_FIVE
    PERSONALITY_16PF
    MOTIVATION_VALUES

    These DO NOT use sections.
    =====================================================
*/
if (!loadedIsMaritime) {
    setActiveSection(null);
    setSecondsRemaining(null);

    /*
      Remove any stale Maritime section parameter
      from the URL.
    */
    if (selectedSectionCode) {
        setSearchParams(
            {},
            {
                replace: true,
            }
        );
    }

    const sourceQuestions =
        loadedAttempt?.questions || [];

    setQuestions(
        sourceQuestions.map(
            normaliseQuestion
        )
    );

    hydrateAnswers(
        sourceQuestions
    );

    return;
}


                    const attemptSections =
                        Array.isArray(
                            loadedAttempt?.sections
                        )
                            ? loadedAttempt.sections
                            : [];


                    const getSectionCode = (
                        section
                    ) =>
                        section?.code ||
                        section?.section?.code ||
                        null;


                    const requestedSection =
                        attemptSections.find(
                            (section) =>
                                getSectionCode(
                                    section
                                ) ===
                                selectedSectionCode
                        );


                    const requestedSectionClosed =
                        Boolean(
                            requestedSection &&
                            (
                                requestedSection
                                    ?.submittedAt ||
                                requestedSection
                                    ?.locked
                            )
                        );


                    const nextOpenSection =
                        attemptSections.find(
                            (section) =>
                                !section?.submittedAt &&
                                !section?.locked
                        );


                    let sectionCode =
                        selectedSectionCode;


                    if (
                        !sectionCode ||
                        requestedSectionClosed
                    ) {
                        sectionCode =
                            loadedAttempt
                                ?.currentSectionCode ||
                            getSectionCode(
                                nextOpenSection
                            ) ||
                            null;
                    }


                    /*
                      Keep the URL synchronized.
                    
                      Example:
                    
                      PJS submitted
                      ?section=PJS
                    
                      automatically becomes
                    
                      ?section=PLA
                    */
                    if (
                        sectionCode &&
                        sectionCode !==
                        selectedSectionCode
                    ) {
                        setSearchParams(
                            {
                                section:
                                    sectionCode,
                            },
                            {
                                replace:
                                    true,
                            }
                        );
                    }


                    if (
                        sectionCode
                    ) {
                        const sectionData =
                            await getPsychometricSection(
                                attemptId,
                                sectionCode
                            );

                        const section =
                            sectionData
                                ?.section ||
                            sectionData;

                        setActiveSection({
                            ...section,
                            code:
                                section
                                    ?.code ||
                                sectionCode,
                        });


                        const sourceQuestions =
                            sectionData
                                ?.questions ||
                            section
                                ?.questions ||
                            [];

                        const normalized =
                            sourceQuestions.map(
                                normaliseQuestion
                            );

                        setQuestions(
                            normalized
                        );

                        hydrateAnswers(
                            sourceQuestions
                        );


                        const expiresAt =
                            sectionData
                                ?.expiresAt ||
                            section
                                ?.expiresAt ||
                            sectionData
                                ?.attemptSection
                                ?.expiresAt;


                        if (expiresAt) {
                            const remaining =
                                Math.max(
                                    0,
                                    Math.floor(
                                        (
                                            new Date(
                                                expiresAt
                                            ).getTime() -
                                            Date.now()
                                        ) / 1000
                                    )
                                );

                            setSecondsRemaining(
                                remaining
                            );
                        } else {
                            const duration =
                                Number(
                                    section
                                        ?.durationMinutes ||
                                    0
                                );

                            setSecondsRemaining(
                                duration > 0
                                    ? duration *
                                    60
                                    : null
                            );
                        }

                        timeoutHandledRef.current =
                            false;

                        return;
                    }


                    /*
                      Sectionless personality
                      assessments.
                    */

                    setActiveSection(
                        null
                    );

                    setSecondsRemaining(
                        null
                    );

                    const sourceQuestions =
                        loadedAttempt
                            ?.questions ||
                        [];

                    setQuestions(
                        sourceQuestions.map(
                            normaliseQuestion
                        )
                    );

                    hydrateAnswers(
                        sourceQuestions
                    );
                } catch (loadError) {
                    setError(
                        getPsychometricErrorMessage(
                            loadError,
                            "Unable to load this assessment."
                        )
                    );
                } finally {
                    setLoading(false);
                }
            },
            [
                attemptId,
                selectedSectionCode,
            ]
        );


    useEffect(() => {
        load();
    }, [load]);


    function updateAnswer(
        answer
    ) {
        setAnswers(
            (current) => ({
                ...current,

                [answer.questionId]:
                    answer,
            })
        );
    }


    function findNextSection(
        result
    ) {
        const nextSection =
            result?.nextSection;

        if (
            typeof nextSection ===
            "string"
        ) {
            return nextSection;
        }

        return (
            result?.nextSectionCode ||
            nextSection?.code ||
            result?.currentSectionCode ||
            result?.attempt
                ?.currentSectionCode ||
            null
        );
    }


    function isAttemptComplete(
        result
    ) {
        return Boolean(
            result?.completed ===
            true ||
            result?.status ===
            "COMPLETED" ||
            result?.attempt
                ?.status ===
            "COMPLETED"
        );
    }


    async function actuallySubmitSection({
        timedOut = false,
    } = {}) {
        if (
            submitting ||
            !activeSection?.code
        ) {
            return null;
        }

        try {
            setSubmitting(true);
            setError("");

            const result =
                await submitPsychometricSection(
                    attemptId,
                    activeSection.code,
                    {
                        answers:
                            buildSubmission(
                                questions,
                                answers
                            ),

                        timedOut,
                    }
                );

            return result;
        } catch (submitError) {
            setError(
                getPsychometricErrorMessage(
                    submitError,
                    "Unable to submit this section."
                )
            );

            return null;
        } finally {
            setSubmitting(false);
        }
    }


    async function submitSectionNormally() {
        const result =
            await actuallySubmitSection();

        if (!result) {
            return;
        }

        if (
            isAttemptComplete(
                result
            )
        ) {
            navigate(
                `/app/wellbeing/psychometrics/${encodeURIComponent(
                    testCode
                )}/results/${encodeURIComponent(
                    attemptId
                )}`,
                {
                    replace: true,
                }
            );

            return;
        }

        const next =
            findNextSection(
                result
            );

        if (next) {
            setModal(null);

            setSearchParams({
                section: next,
            });

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    }


    async function submitPersonalityAssessment() {
        if (submitting) {
            return;
        }

        if (
            unanswered.length
        ) {
            setModal(
                "UNANSWERED"
            );

            return;
        }


        const submission =
            buildSubmission(
                questions,
                answers
            );


        console.log(
            "PSYCHOMETRIC QUESTIONS:",
            questions
        );

        console.log(
            "PSYCHOMETRIC ANSWERS STATE:",
            answers
        );

        console.log(
            "PSYCHOMETRIC SUBMISSION:",
            submission
        );


        if (
            submission.length !==
            questions.length
        ) {
            console.error(
                "Submission count mismatch",
                {
                    questionCount:
                        questions.length,

                    submissionCount:
                        submission.length,

                    submission,
                }
            );

            setError(
                "Some answers could not be prepared for submission."
            );

            return;
        }


        try {
            setSubmitting(true);
            setError("");


            await completePsychometricAttempt(
                attemptId,
                {
                    answers:
                        submission,
                }
            );


            navigate(
                `/app/wellbeing/psychometrics/${encodeURIComponent(
                    testCode
                )}/results/${encodeURIComponent(
                    attemptId
                )}`,
                {
                    replace: true,
                }
            );
        } catch (submitError) {
            console.error(
                "PSYCHOMETRIC SUBMIT ERROR:",
                submitError
            );

            console.error(
                "FAILED SUBMISSION BODY:",
                submission
            );


            setError(
                getPsychometricErrorMessage(
                    submitError,
                    "Unable to submit this assessment."
                )
            );
        } finally {
            setSubmitting(false);
        }
    }


    function requestSubmit() {
        if (
            unanswered.length >
            0
        ) {
            setModal(
                "UNANSWERED"
            );

            return;
        }

        if (
            isMaritime &&
            secondsRemaining >
            0
        ) {
            setModal(
                "EARLY"
            );

            return;
        }

        if (isMaritime) {
            submitSectionNormally();

            return;
        }

        submitPersonalityAssessment();
    }


    function scrollToFirstUnanswered() {
        setModal(null);

        const first =
            unanswered[0];

        if (!first) {
            return;
        }

        document
            .getElementById(
                `psychometric-question-${first.id}`
            )
            ?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
    }


    async function continueDespiteUnanswered() {
        setModal(null);

        if (isMaritime) {
            await submitSectionNormally();
        } else {
            await submitPersonalityAssessment();
        }
    }


    /*
      =====================================================
      TIMER
      =====================================================
    */

    useEffect(() => {
        if (
            secondsRemaining ===
            null ||
            secondsRemaining <=
            0 ||
            !isMaritime
        ) {
            return undefined;
        }

        const timer =
            window.setInterval(
                () => {
                    setSecondsRemaining(
                        (current) => {
                            if (
                                current ===
                                null ||
                                current <= 1
                            ) {
                                return 0;
                            }

                            return (
                                current - 1
                            );
                        }
                    );
                },
                1000
            );

        return () =>
            window.clearInterval(
                timer
            );
    }, [
        isMaritime,
        secondsRemaining ===
        null,
    ]);


    useEffect(() => {
        if (
            !isMaritime ||
            secondsRemaining !==
            0 ||
            timeoutHandledRef.current ||
            loading
        ) {
            return;
        }

        timeoutHandledRef.current =
            true;


        async function closeTimedSection() {
            const result =
                await actuallySubmitSection({
                    timedOut: true,
                });

            if (!result) {
                return;
            }

            setTimeoutResult(
                result
            );

            setModal(
                "TIME_UP"
            );
        }


        closeTimedSection();
    }, [
        secondsRemaining,
        isMaritime,
        loading,
    ]);


    function continueAfterTimeout() {
        setModal(null);

        if (
            isAttemptComplete(
                timeoutResult
            )
        ) {
            navigate(
                `/app/wellbeing/psychometrics/${encodeURIComponent(
                    testCode
                )}/results/${encodeURIComponent(
                    attemptId
                )}`,
                {
                    replace: true,
                }
            );

            return;
        }

        const next =
            findNextSection(
                timeoutResult
            );

        if (next) {
            setSearchParams({
                section: next,
            });

            window.scrollTo({
                top: 0,
            });
        }
    }


    if (loading) {
        return (
            <AppLayout>
                <main className="psychometric-page">
                    <div className="psychometric-loading">
                        Loading assessment...
                    </div>
                </main>
            </AppLayout>
        );
    }


    const heading =
        activeSection?.title ||
        attempt?.test?.title ||
        "Assessment";


    const description =
        activeSection?.description ||
        attempt?.test
            ?.description ||
        "";


    const nextSectionTitle =
        timeoutResult
            ?.nextSection?.title ||
        timeoutResult
            ?.nextSectionTitle ||
        "";


    return (
        <AppLayout>
            <main className="psychometric-page psychometric-questionnaire-page">
                <div className="psychometric-questionnaire-card">
                    <header className="psychometric-questionnaire-header">
                        <div>
                            <h1>
                                {heading}
                            </h1>

                            {description ? (
                                <p>
                                    {
                                        description
                                    }
                                </p>
                            ) : null}
                        </div>

                        {isMaritime &&
                            secondsRemaining !==
                            null ? (
                            <PsychometricTimer
                                secondsRemaining={
                                    secondsRemaining
                                }
                            />
                        ) : null}
                    </header>


                    {error ? (
                        <div className="psychometric-inline-error">
                            {error}
                        </div>
                    ) : null}


                    <section className="psychometric-questions-container">
                        {questions.map(
                            (
                                question,
                                index
                            ) => (
                                <PsychometricQuestion
                                    key={
                                        question.id
                                    }
                                    question={
                                        question
                                    }
                                    number={
                                        index + 1
                                    }
                                    value={
                                        answers[
                                        question.id
                                        ]
                                    }
                                    onChange={
                                        updateAnswer
                                    }
                                />
                            )
                        )}
                    </section>


                    <div className="psychometric-questionnaire-footer">
                        <button
                            type="button"
                            className="psychometric-button"
                            disabled={
                                submitting
                            }
                            onClick={
                                requestSubmit
                            }
                        >
                            {submitting
                                ? "Submitting..."
                                : isMaritime
                                    ? "Submit Section"
                                    : "Submit Assessment"}
                        </button>
                    </div>
                </div>


                <PsychometricSubmitModal
                    mode={modal}
                    sectionTitle={
                        sectionDisplayTitle(
                            activeSection
                        )
                    }
                    unansweredCount={
                        unanswered.length
                    }
                    timeText={
                        secondsRemaining !==
                            null
                            ? formatRemaining(
                                secondsRemaining
                            )
                            : ""
                    }
                    nextSectionTitle={
                        nextSectionTitle
                    }
                    onClose={() =>
                        setModal(null)
                    }
                    onReview={
                        modal ===
                            "UNANSWERED"
                            ? scrollToFirstUnanswered
                            : () =>
                                setModal(
                                    null
                                )
                    }
                    onContinue={
                        modal ===
                            "UNANSWERED"
                            ? continueDespiteUnanswered
                            : modal ===
                                "TIME_UP"
                                ? continueAfterTimeout
                                : submitSectionNormally
                    }
                />
            </main>
        </AppLayout>
    );
}