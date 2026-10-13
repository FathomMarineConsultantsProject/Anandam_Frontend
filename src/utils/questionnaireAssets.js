/*
  ============================================================
  QUESTIONNAIRE ILLUSTRATIONS
  ============================================================

  Folder:
  src/assets/questionary/

  Current Figma artwork:

  Ellipse 163  -> How you're feeling
  image 261    -> Sleep and rest
  image 264    -> Feeling anxious

  Images are discovered automatically through Vite.
*/


const questionnaireModules = import.meta.glob(
  "../assets/questionary/*.{png,jpg,jpeg,webp,avif,svg}",
  {
    eager: true,
    import: "default",
  }
);


function getFileName(path = "") {
  return (
    String(path)
      .split("/")
      .pop()
      ?.toLowerCase() || ""
  );
}


const QUESTIONNAIRE_ASSETS =
  Object.entries(questionnaireModules).map(
    ([path, src]) => ({
      path,
      src,
      name: getFileName(path),
    })
  );


function findAssetByName(partialName) {
  const search =
    String(partialName).toLowerCase();

  return (
    QUESTIONNAIRE_ASSETS.find(
      (asset) =>
        asset.name.includes(search)
    )?.src || ""
  );
}


const FEELING_IMAGE =
  findAssetByName("ellipse 163");

const SLEEP_IMAGE =
  findAssetByName("image 261");

const ANXIETY_IMAGE =
  findAssetByName("image 264");


function hashString(value = "") {
  let hash = 2166136261;

  const text = String(value);

  for (
    let index = 0;
    index < text.length;
    index += 1
  ) {
    hash ^= text.charCodeAt(index);

    hash +=
      (hash << 1) +
      (hash << 4) +
      (hash << 7) +
      (hash << 8) +
      (hash << 24);
  }

  return hash >>> 0;
}


function getFallbackArtwork(questionnaire) {
  if (!QUESTIONNAIRE_ASSETS.length) {
    return "";
  }

  const key =
    questionnaire?.slug ||
    questionnaire?.id ||
    questionnaire?.version?.title ||
    "questionnaire";

  const index =
    hashString(key) %
    QUESTIONNAIRE_ASSETS.length;

  return (
    QUESTIONNAIRE_ASSETS[index]?.src ||
    QUESTIONNAIRE_ASSETS[0]?.src ||
    ""
  );
}


export function getQuestionnaireIllustration(
  questionnaire
) {
  const combined = [
    questionnaire?.slug,
    questionnaire?.category,
    questionnaire?.version?.title,
    questionnaire?.version?.subtitle,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();


  if (
    combined.includes("sleep") ||
    combined.includes("rest")
  ) {
    return (
      SLEEP_IMAGE ||
      getFallbackArtwork(questionnaire)
    );
  }


  if (
    combined.includes("anxious") ||
    combined.includes("anxiety") ||
    combined.includes("worry")
  ) {
    return (
      ANXIETY_IMAGE ||
      getFallbackArtwork(questionnaire)
    );
  }


  if (
    combined.includes("feeling") ||
    combined.includes("mood") ||
    combined.includes("wellbeing")
  ) {
    return (
      FEELING_IMAGE ||
      getFallbackArtwork(questionnaire)
    );
  }


  return getFallbackArtwork(
    questionnaire
  );
}