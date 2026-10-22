export default function VideoControlIcon({ name }) {
  if (name === "mic") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="9" y="3.5" width="6" height="11" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M6.8 11.5a5.2 5.2 0 0 0 10.4 0M12 16.7v3.2M9.2 20h5.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "micOff") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 4l16 16M9.2 8.8V6.5A2.8 2.8 0 0 1 12 3.7a2.8 2.8 0 0 1 2.8 2.8v5.2M7 11.5a5 5 0 0 0 7.6 4.3M17 11.5a5 5 0 0 1-.5 2.2M12 16.6V20M9.3 20h5.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "camera") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.5" y="6" width="12.5" height="12" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="m16 10 4-2.2v8.4L16 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "cameraOff") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 4l16 16M6.2 6H5.7A2.2 2.2 0 0 0 3.5 8.2v7.6A2.2 2.2 0 0 0 5.7 18H16V8.6M16 10l4-2.2v8.4L18.7 15.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "leave") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10 6H6.5A2.5 2.5 0 0 0 4 8.5v7A2.5 2.5 0 0 0 6.5 18H10M14 8l4 4-4 4M8 12h10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.2 10.2c3.8-2.1 7.8-2.1 11.6 0 .8.4 1.1 1.4.7 2.2l-1 1.9c-.4.7-1.3 1-2 .7l-2.2-.9a3.8 3.8 0 0 0-2.6 0l-2.2.9c-.8.3-1.7 0-2-.7l-1-1.9c-.4-.8-.1-1.8.7-2.2Z" fill="currentColor" />
    </svg>
  );
}
