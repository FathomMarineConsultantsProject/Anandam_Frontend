import dailyReviewImage
  from "../../assets/journal/daily review.png";

import stressSignalImage
  from "../../assets/journal/stress is a signal.png";

import difficultDayImage
  from "../../assets/journal/difficult day.png";

import momentsKeepingImage
  from "../../assets/journal/moments woth keeping.png";

import needRightNowImage
  from "../../assets/journal/need right now.png";

import restRechargeImage
  from "../../assets/journal/rest recharge.png";

import letterFutureImage
  from "../../assets/journal/letter to future.png";

import boundaryImage
  from "../../assets/journal/boundary.png";

import firstPageImage
  from "../../assets/journal/first page.png";


const JOURNAL_IMAGES = {
  "daily-review":
    dailyReviewImage,

  "stress-is-a-signal":
    stressSignalImage,

  "a-difficult-day":
    difficultDayImage,

  "moments-worth-keeping":
    momentsKeepingImage,

  "what-i-need-right-now":
    needRightNowImage,

  "rest-and-recharge":
    restRechargeImage,

  "letter-to-my-future-self":
    letterFutureImage,

  "boundary-i-want-to-practise":
    boundaryImage,
};


export function getJournalImage(
  imageKey
) {
  return (
    JOURNAL_IMAGES[
      imageKey
    ] || null
  );
}


export {
  firstPageImage,
};