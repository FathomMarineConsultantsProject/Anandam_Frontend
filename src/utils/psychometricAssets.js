import maritimeIllustration
  from "../assets/psychometrics/maritime-human-performance.png";

import personalityIllustration
  from "../assets/psychometrics/personality-insights.png";

import behaviourIllustration
  from "../assets/psychometrics/behavioural-pattern.png";

import motivationIllustration
  from "../assets/psychometrics/motivation-values.png";

import seniorLeadershipIllustration
  from "../assets/psychometrics/maritime-human-performance.png";


const TYPE_MAP = {
  MARITIME_HUMAN_PERFORMANCE:
    maritimeIllustration,

  SENIOR_LEADERSHIP_PERSONALITY:
    seniorLeadershipIllustration,

  BIG_FIVE:
    personalityIllustration,

  PERSONALITY_16PF:
    behaviourIllustration,

  MOTIVATION_VALUES:
    motivationIllustration,
};


export function getPsychometricIllustration(
  test
) {
  if (!test) {
    return null;
  }


  return (
    TYPE_MAP[
      test.type
    ] ||
    null
  );
}