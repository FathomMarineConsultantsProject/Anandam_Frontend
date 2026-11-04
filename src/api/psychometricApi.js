import {
  apiRequest,
  getUserFriendlyError,
} from "./client";


/*
  =========================================================
  PSYCHOMETRIC API

  This file matches the CURRENT backend routes exactly.

  Backend mount:
  /api/psychometrics

  apiRequest() already handles the configured API base URL.
  =========================================================
*/


export const PSYCHOMETRIC_ENDPOINTS = {
  /*
    GET
    /api/psychometrics/tests
  */
  tests:
    "/psychometrics/tests",


  /*
    GET
    /api/psychometrics/tests/:code
  */
  test: (testCode) =>
    `/psychometrics/tests/${encodeURIComponent(
      testCode
    )}`,


  /*
    POST
    /api/psychometrics/tests/:code/start
  */
  startAttempt: (testCode) =>
    `/psychometrics/tests/${encodeURIComponent(
      testCode
    )}/start`,


  /*
    GET
    /api/psychometrics/attempts/:attemptId
  */
  attempt: (attemptId) =>
    `/psychometrics/attempts/${encodeURIComponent(
      attemptId
    )}`,

      /*
    GET
    /api/psychometrics/attempts/:attemptId/disclaimer
  */
  disclaimer: (attemptId) =>
    `/psychometrics/attempts/${encodeURIComponent(
      attemptId
    )}/disclaimer`,


  /*
    POST
    /api/psychometrics/attempts/:attemptId/disclaimer/acknowledge
  */
  acknowledgeDisclaimer: (attemptId) =>
    `/psychometrics/attempts/${encodeURIComponent(
      attemptId
    )}/disclaimer/acknowledge`,

  /*
    POST
    /api/psychometrics/attempts/:attemptId/answers
  */
  answers: (attemptId) =>
    `/psychometrics/attempts/${encodeURIComponent(
      attemptId
    )}/answers`,


  /*
    POST
    /api/psychometrics/attempts/:attemptId/sections/:sectionCode/start
  */
  startSection: (
    attemptId,
    sectionCode
  ) =>
    `/psychometrics/attempts/${encodeURIComponent(
      attemptId
    )}/sections/${encodeURIComponent(
      sectionCode
    )}/start`,


  /*
    POST
    /api/psychometrics/attempts/:attemptId/sections/:sectionCode/submit
  */
  submitSection: (
    attemptId,
    sectionCode
  ) =>
    `/psychometrics/attempts/${encodeURIComponent(
      attemptId
    )}/sections/${encodeURIComponent(
      sectionCode
    )}/submit`,


  /*
    POST
    /api/psychometrics/attempts/:attemptId/submit
  */
  submitAttempt: (
    attemptId
  ) =>
    `/psychometrics/attempts/${encodeURIComponent(
      attemptId
    )}/submit`,


  /*
    GET
    /api/psychometrics/attempts/:attemptId/result
  */
  result: (attemptId) =>
    `/psychometrics/attempts/${encodeURIComponent(
      attemptId
    )}/result`,

    analysis: (
  attemptId
) =>
  `/psychometrics/attempts/${encodeURIComponent(
    attemptId
  )}/analysis`,


report: (
  attemptId
) =>
  `/psychometrics/attempts/${encodeURIComponent(
    attemptId
  )}/report.pdf`,

unlockAnswers: (
  attemptId
) =>
  `/psychometrics/attempts/${encodeURIComponent(
    attemptId
  )}/unlock-answers`,

  /*
    GET
    /api/psychometrics/history
  */
  history:
    "/psychometrics/history",
};


/*
  =========================================================
  RESPONSE HELPER
  =========================================================
*/

function unwrap(
  response,
  preferredKeys = []
) {
  if (
    response === null ||
    response === undefined
  ) {
    return response;
  }


  for (
    const key of preferredKeys
  ) {
    if (
      response?.[key] !==
      undefined
    ) {
      return response[key];
    }
  }


  if (
    response?.data !==
    undefined
  ) {
    return response.data;
  }


  return response;
}


/*
  =========================================================
  ERROR MESSAGE
  =========================================================
*/

export function getPsychometricErrorMessage(
  error,
  fallback =
    "Something went wrong. Please try again."
) {
  return getUserFriendlyError(
    error,
    fallback
  );
}

export function isPsychometricPaymentRequired(
  error
) {
  const status =
    Number(
      error?.status ||
      error?.statusCode ||
      error?.response?.status ||
      error?.data?.status ||
      error?.response?.data
        ?.status ||
      0
    );


  const code =
    String(
      error?.code ||
      error?.data?.code ||
      error?.response?.data
        ?.code ||
      ""
    );


  const message =
    String(
      error?.message ||
      error?.data?.message ||
      error?.response?.data
        ?.message ||
      ""
    ).toLowerCase();


  return (
    status === 402 ||

    code ===
      "PAYMENT_REQUIRED" ||

    code ===
      "PSYCHOMETRIC_PAYMENT_REQUIRED" ||

    code ===
      "TOKEN_CONFIRMATION_REQUIRED" ||

    code ===
      "INSUFFICIENT_TOKENS" ||

    message.includes(
      "token"
    ) ||

    message.includes(
      "payment required"
    )
  );
}

/*
  =========================================================
  LIST TESTS
  =========================================================
*/

export async function getPsychometricTests() {
  const response =
    await apiRequest(
      PSYCHOMETRIC_ENDPOINTS.tests
    );


  const value =
    unwrap(
      response,
      [
        "tests",
        "psychometricTests",
      ]
    );


  if (
    Array.isArray(
      value
    )
  ) {
    return value;
  }


  if (
    Array.isArray(
      value?.tests
    )
  ) {
    return value.tests;
  }


  return [];
}


/*
  =========================================================
  GET ONE TEST
  =========================================================
*/

export async function getPsychometricTest(
  testCode
) {
  const response =
    await apiRequest(
      PSYCHOMETRIC_ENDPOINTS.test(
        testCode
      )
    );


  return unwrap(
    response,
    [
      "test",
      "psychometricTest",
    ]
  );
}


/*
  =========================================================
  START ATTEMPT

  Correct backend route:

  POST
  /tests/:code/start
  =========================================================
*/

export async function startPsychometricAttempt(
  testCode,
  {
    confirmTokenSpend = false,
  } = {}
) {
  const response =
    await apiRequest(
      PSYCHOMETRIC_ENDPOINTS.startAttempt(
        testCode
      ),
      {
        method: "POST",

        body:
          JSON.stringify({
            confirmTokenSpend:
              Boolean(
                confirmTokenSpend
              ),
          }),
      }
    );


  return unwrap(
    response,
    [
      "attempt",
      "result",
    ]
  );
}


/*
  =========================================================
  GET ATTEMPT
  =========================================================
*/

export async function getPsychometricAttempt(
  attemptId
) {
  const response =
    await apiRequest(
      PSYCHOMETRIC_ENDPOINTS.attempt(
        attemptId
      )
    );


  return unwrap(
    response,
    [
      "attempt",
    ]
  );
}

/*
  =========================================================
  DISCLAIMER
  =========================================================
*/

export async function getPsychometricDisclaimer(
  attemptId
) {
  const response =
    await apiRequest(
      PSYCHOMETRIC_ENDPOINTS.disclaimer(
        attemptId
      )
    );


  return unwrap(
    response,
    [
      "disclaimer",
    ]
  );
}


/*
  =========================================================
  ACKNOWLEDGE DISCLAIMER
  =========================================================
*/

export async function acknowledgePsychometricDisclaimer(
  attemptId
) {
  const response =
    await apiRequest(
      PSYCHOMETRIC_ENDPOINTS.acknowledgeDisclaimer(
        attemptId
      ),
      {
        method: "POST",

        body:
          JSON.stringify({
            accepted: true,
          }),
      }
    );


  return unwrap(
    response,
    [
      "acknowledgement",
    ]
  );
}

/*
  =========================================================
  SAVE ANSWERS

  Backend expects:

  {
    answers: [...]
  }

  POST
  /attempts/:attemptId/answers
  =========================================================
*/

export async function savePsychometricAnswers(
  attemptId,
  answers = []
) {
  if (
    !Array.isArray(answers) ||
    answers.length === 0
  ) {
    return {
      answers: [],
    };
  }

  const response =
    await apiRequest(
      PSYCHOMETRIC_ENDPOINTS.answers(
        attemptId
      ),
      {
        method: "POST",

        body: JSON.stringify({
          answers,
        }),
      }
    );

  return unwrap(
    response,
    [
      "result",
      "attempt",
      "answers",
    ]
  );
}


/*
  =========================================================
  START MARITIME SECTION

  IMPORTANT:

  Your backend DOES NOT have:

  GET /sections/:sectionCode

  It has:

  POST
  /sections/:sectionCode/start

  Therefore getPsychometricSection() intentionally starts
  or resumes the section through the backend start route.
  =========================================================
*/

export async function getPsychometricSection(
  attemptId,
  sectionCode
) {
  const response =
    await apiRequest(
      PSYCHOMETRIC_ENDPOINTS.startSection(
        attemptId,
        sectionCode
      ),
      {
        method: "POST",

        body:
          JSON.stringify(
            {}
          ),
      }
    );


  return unwrap(
    response,
    [
      "section",
      "attemptSection",
      "result",
    ]
  );
}


/*
  Alias with clearer name for any newer pages.
*/

export async function startPsychometricSection(
  attemptId,
  sectionCode
) {
  return getPsychometricSection(
    attemptId,
    sectionCode
  );
}


/*
  =========================================================
  SUBMIT MARITIME SECTION

  IMPORTANT:

  Your controller:

  submitPsychometricSectionController()

  does NOT read answers from req.body.

  Therefore frontend must:

  1. save answers
  2. submit/close the section

  This keeps the backend flow correct.
  =========================================================
*/

export async function submitPsychometricSection(
  attemptId,
  sectionCode,
  {
    answers = [],
    timedOut = false,
  } = {}
) {
  const response =
    await apiRequest(
      PSYCHOMETRIC_ENDPOINTS.submitSection(
        attemptId,
        sectionCode
      ),
      {
        method: "POST",

        body:
          JSON.stringify({
            answers:
              Array.isArray(
                answers
              )
                ? answers
                : [],

            timedOut:
              Boolean(
                timedOut
              ),
          }),
      }
    );


  return unwrap(
    response,
    [
      "result",
      "attempt",
      "section",
      "attemptSection",
    ]
  );
}


/*
  =========================================================
  COMPLETE LIKERT ASSESSMENT

  Used for:

  BIG_FIVE
  PERSONALITY_16PF
  MOTIVATION_VALUES

  Backend flow:

  save answers
      ↓
  POST /attempts/:attemptId/submit
  =========================================================
*/

export async function completePsychometricAttempt(
  attemptId,
  {
    answers = [],
  } = {}
) {
  /*
    Save all 20 Likert answers first.
  */

  if (
    Array.isArray(
      answers
    ) &&
    answers.length > 0
  ) {
    await savePsychometricAnswers(
      attemptId,
      answers
    );
  }


  /*
    Then complete the attempt.
  */

  const response =
    await apiRequest(
      PSYCHOMETRIC_ENDPOINTS.submitAttempt(
        attemptId
      ),
      {
        method: "POST",

        body:
          JSON.stringify(
            {}
          ),
      }
    );


  return unwrap(
    response,
    [
      "result",
      "attempt",
    ]
  );
}


/*
  =========================================================
  GET RESULT

  Correct backend URL is singular:

  /result

  NOT:

  /results
  =========================================================
*/

export async function getPsychometricResults(
  attemptId
) {
  const response =
    await apiRequest(
      PSYCHOMETRIC_ENDPOINTS.result(
        attemptId
      )
    );


  return unwrap(
    response,
    [
      "result",
      "results",
    ]
  );
}


/*
  Optional singular alias.
*/

export async function getPsychometricResult(
  attemptId
) {
  return getPsychometricResults(
    attemptId
  );
}

/*
  =========================================================
  GET ANALYTICAL RESULT

  Maritime:
  score + sections + analytics + responses

  Other 3 tests:
  profile analytics + dimensions + responses
  =========================================================
*/

export async function getPsychometricAnalysis(
  attemptId
) {
  const response =
    await apiRequest(
      PSYCHOMETRIC_ENDPOINTS.analysis(
        attemptId
      )
    );


  return unwrap(
    response,
    [
      "analysis",
    ]
  );
}

/*
  =========================================================
  DOWNLOAD PDF REPORT

  Backend returns:
  application/pdf

  apiRequest responseType="blob"
  prevents the PDF from being parsed as JSON.
  =========================================================
*/

export async function downloadPsychometricReport(
  attemptId
) {
  return apiRequest(
    PSYCHOMETRIC_ENDPOINTS.report(
      attemptId
    ),
    {
      method: "GET",

      responseType:
        "blob",

      headers: {
        Accept:
          "application/pdf",
      },
    }
  );
}

/*
  =========================================================
  HISTORY
  =========================================================
*/

export async function getPsychometricHistory() {
  const response =
    await apiRequest(
      PSYCHOMETRIC_ENDPOINTS.history
    );


  const history =
    unwrap(
      response,
      [
        "history",
      ]
    );


  return Array.isArray(
    history
  )
    ? history
    : [];
}


/*
  =========================================================
  CORRECT-ANSWER UNLOCK

  DO NOT call a fake endpoint here.

  Your current backend psychometric.route.ts does NOT define:

  /unlock-answers

  So we intentionally fail locally instead of producing a
  confusing Express HTML 404 response.

  We will implement this backend endpoint separately when
  we connect the "Use 1 Token" result-screen feature.
  =========================================================
*/

export async function unlockPsychometricAnswers(
  attemptId
) {
  const response =
    await apiRequest(
      PSYCHOMETRIC_ENDPOINTS.unlockAnswers(
        attemptId
      ),
      {
        method:
          "POST",

        body:
          JSON.stringify(
            {}
          ),
      }
    );


  return unwrap(
    response,
    [
      "result",
    ]
  );
}