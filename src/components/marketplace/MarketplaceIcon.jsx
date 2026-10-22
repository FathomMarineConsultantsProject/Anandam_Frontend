import locationIcon from "../../assets/marketplace/basil_location-solid.svg";
import expertiseIcon from "../../assets/marketplace/boxicons_medal-star-alt-2-filled.svg";
import dateIcon from "../../assets/marketplace/date_range.svg";
import languageIcon from "../../assets/marketplace/famicons_language-outline.svg";
import paymentIcon from "../../assets/marketplace/ic_outline-payments.svg";
import timeIcon from "../../assets/marketplace/schedule.svg";
import speakIcon from "../../assets/marketplace/Vector.png";
import videoIcon from "../../assets/marketplace/video_call.svg";
import moreIcon from "../../assets/marketplace/more_vertical.svg";

const icons = {
  location: locationIcon,
  expertise: expertiseIcon,
  date: dateIcon,
  language: languageIcon,
  payment: paymentIcon,
  time: timeIcon,
  speak: speakIcon,
  video: videoIcon,
  more: moreIcon,
};

export default function MarketplaceIcon({ name, className = "" }) {
  return <img className={`mk-asset-icon ${className}`.trim()} src={icons[name]} alt="" aria-hidden="true" />;
}
