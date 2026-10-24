import cameraOnIcon
  from "../../assets/videocall/Property 1=Frame 2147240591 (1).png";

import micOnIcon
  from "../../assets/videocall/Property 1=Frame 2147240591.png";

import cameraOffIcon
  from "../../assets/videocall/Property 1=Frame 2147240596 (1).png";

import micOffIcon
  from "../../assets/videocall/Property 1=Frame 2147240596.png";

import extraControlIcon
  from "../../assets/videocall/Property 1=Group 1597885845.png";

import extraMutedIcon
  from "../../assets/videocall/Property 1=Group 1597885846.png";


const ICONS = {
  mic:
    micOnIcon,

  micOff:
    micOffIcon,

  camera:
    cameraOnIcon,

  cameraOff:
    cameraOffIcon,

  settings:
    extraControlIcon,

  muted:
    extraMutedIcon,
};


export default function VideoControlIcon({
  name,
  alt = "",
}) {
  const source =
    ICONS[name];

  if (!source) {
    return null;
  }

  return (
    <img
      src={
        source
      }
      alt={
        alt
      }
      aria-hidden={
        alt
          ? undefined
          : "true"
      }
      className="vc-control-image"
    />
  );
}