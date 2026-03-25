import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  ShieldCheck,
  Camera,
  Eye,
  Activity,
  MapPin,
  KeyRound,
  Clock,
  ChevronDown,
} from "lucide-react";
import AppHeader from "../components/layout/AppHeader";
import BottomNav from "../components/layout/BottomNav";
import { workRestMockData } from "../data/workRestData";
import {
  getMyProfile,
  fetchMyWorkGrid,
  saveDailyWorkGrid,
} from "../api/workRestApi";
import "../styles/work-rest.css";

// ─── Time labels ──────────────────────────────────────────────────────────────

const HOUR_LABELS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

const SUB_LABELS = Array.from({ length: 48 }, (_, i) => {
  if (i % 2 !== 0) return ":30";
  const h = Math.floor(i / 2);
  if (h === 0) return "12AM";
  if (h === 12) return "12PM";
  if (h < 12) return `${h}AM`;
  return `${h - 12}PM`;
});

function getInitials(fullName = "") {
  return (
    fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "U"
  );
}

// ─── Schedule Grid ────────────────────────────────────────────────────────────
// The blue color comes 100% from CSS (.wr-period-cell.working).
// No inline background or border overrides — those were the original bug.

function ScheduleGrid({ member, date, editableBlocks, savingAny, onToggleBlock }) {
  const dateLabel = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="wr-schedule-wrap">
      <div className="wr-schedule-scroll">
        <div className="wr-schedule-inner">
          <div className="wr-date-label">{dateLabel}</div>

          {/* Header row */}
          <div className="wr-grid-row wr-grid-header">
            <div className="wr-grid-head-cell">Rank / Name</div>
            {HOUR_LABELS.map((lbl) => (
              <div key={lbl} className="wr-grid-head-cell">{lbl}</div>
            ))}
          </div>

          {/* Sub-label row */}
          <div className="wr-grid-row wr-grid-sublabel">
            <div className="wr-grid-sub-cell" style={{ fontSize: 10, color: "#64748b", paddingLeft: 4 }}>
              Click cells to mark work periods
            </div>
            {SUB_LABELS.map((lbl, i) => (
              <div key={i} className="wr-grid-sub-cell">{lbl}</div>
            ))}
          </div>

          {/* Single user row */}
          <div className="wr-grid-row">
            <div className="wr-name-cell">
              <div className="wr-crew-name">{member.name}</div>
              <div className="wr-crew-rank">{member.rank}</div>
            </div>

            {editableBlocks.map((isWorking, slotIdx) => (
              <button
                key={slotIdx}
                type="button"
                // className alone drives the blue — no inline background/border
                className={`wr-period-cell${isWorking ? " working" : ""}`}
                title={`${HOUR_LABELS[slotIdx]} — ${
                  isWorking ? "Working (click to unmark)" : "Rest (click to mark work)"
                }`}
                onClick={() => onToggleBlock(slotIdx)}
                disabled={savingAny}
                style={{
                  cursor: savingAny ? "wait" : "pointer",
                  transition: "background-color 0.12s ease",
                }}
              />
            ))}
          </div>

          <div className="wr-schedule-summary">
            <span>Schedule for <strong>{member.name}</strong></span>
            <span>Click a cell to toggle <strong>work</strong> — saves automatically</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Compliance ───────────────────────────────────────────────────────────────

function ComplianceSection({ compliance }) {
  return (
    <>
      <div className="wr-card">
        <div className="wr-compliance-card">
          <h2 className="wr-compliance-title">
            <ShieldCheck size={20} strokeWidth={2} />
            MLC 2.3 Compliance Summary
          </h2>
          <div className="wr-stats-row">
            <div>
              <div className="wr-stat-value green">{compliance.compliantCount}</div>
              <div className="wr-stat-label">Compliant Crew</div>
            </div>
            <div>
              <div className="wr-stat-value red">{compliance.violationCount}</div>
              <div className="wr-stat-label">Violations</div>
            </div>
            <div>
              <div className="wr-stat-value blue">{compliance.complianceRate}%</div>
              <div className="wr-stat-label">Compliance Rate</div>
            </div>
          </div>
          <div className="wr-requirements">
            <h3>MLC Requirements:</h3>
            <ul>
              {compliance.requirements.map((req, i) => <li key={i}>{req}</li>)}
            </ul>
          </div>
        </div>
      </div>
      <div className="wr-card">
        <div className="wr-remarks-card">
          <h2 className="wr-remarks-title">Remarks</h2>
          <ul className="wr-remarks-list">
            {compliance.remarks.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      </div>
    </>
  );
}

// ─── Face Detection Overlay ───────────────────────────────────────────────────

function FaceDetectionOverlay({ videoRef }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const scanY = useRef(0);
  const scanDir = useRef(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    function draw() {
      const w = video.videoWidth || canvas.offsetWidth || 640;
      const h = video.videoHeight || canvas.offsetHeight || 360;
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, w, h);
      const bx = w * 0.25, by = h * 0.08, bw = w * 0.5, bh = h * 0.78, cs = 18;
      ctx.strokeStyle = "#22c55e"; ctx.lineWidth = 2; ctx.strokeRect(bx, by, bw, bh);
      ctx.lineWidth = 4; ctx.beginPath();
      ctx.moveTo(bx, by + cs); ctx.lineTo(bx, by); ctx.lineTo(bx + cs, by);
      ctx.moveTo(bx + bw - cs, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + cs);
      ctx.moveTo(bx + bw, by + bh - cs); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw - cs, by + bh);
      ctx.moveTo(bx + cs, by + bh); ctx.lineTo(bx, by + bh); ctx.lineTo(bx, by + bh - cs);
      ctx.stroke();
      scanY.current += scanDir.current * 2;
      if (scanY.current >= bh - 2) scanDir.current = -1;
      if (scanY.current <= 2) scanDir.current = 1;
      const sy = by + scanY.current;
      const grad = ctx.createLinearGradient(bx, sy - 8, bx, sy + 8);
      grad.addColorStop(0, "rgba(34,197,94,0)");
      grad.addColorStop(0.5, "rgba(34,197,94,0.65)");
      grad.addColorStop(1, "rgba(34,197,94,0)");
      ctx.fillStyle = grad; ctx.fillRect(bx, sy - 8, bw, 16);
      ctx.fillStyle = "#22c55e"; ctx.font = "bold 11px system-ui,sans-serif"; ctx.textBaseline = "bottom";
      ctx.fillText("Face Detected", bx + 4, by - 4);
      animRef.current = requestAnimationFrame(draw);
    }
    animRef.current = requestAnimationFrame(draw);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [videoRef]);

  return <canvas ref={canvasRef} className="fr-canvas-overlay" />;
}

function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

const SHIP_LOCATIONS = [
  "Bridge", "Engine Room", "Galley", "Deck",
  "Cargo Hold", "Crew Quarters", "Medical Bay", "Accommodation",
];

function FaceRecognitionTab({ faceData, activityLog }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const now = useLiveClock();
  const [location, setLocation] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pin, setPin] = useState("");
  const canClock = location !== "";
  const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true });
  const dateStr = now.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      const vid = videoRef.current;
      if (vid) { vid.srcObject = stream; vid.onloadedmetadata = () => vid.play().catch(console.warn); }
      setCameraActive(true);
    } catch (err) {
      if (err.name === "NotAllowedError") setCameraError("Camera permission denied.");
      else if (err.name === "NotFoundError") setCameraError("No camera found on this device.");
      else setCameraError(`Could not access camera: ${err.message}`);
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false); setCameraError(null);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  return (
    <>
      <div className="wr-card">
        <div className="wr-fr-card-inner">
          <div className="wr-fr-title-row">
            <Camera size={18} strokeWidth={2} />
            <div>
              <h2 className="wr-fr-title">Face Recognition Status</h2>
              <p className="wr-fr-subtitle">Real-time face recognition system for crew member identification</p>
            </div>
          </div>
          <div className="wr-fr-two-col">
            <div className="wr-fr-info-col">
              <div className="wr-fr-info-row wr-fr-info-row--header">
                <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Face Recognition System</span>
                <span className={`wr-fr-status-badge ${cameraActive ? "active" : "inactive"}`}>
                  {cameraActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="wr-fr-info-row"><span className="wr-fr-info-key">Accuracy</span><span className="wr-fr-info-val">{faceData.accuracy}</span></div>
              <div className="wr-fr-info-row"><span className="wr-fr-info-key">Last Scan</span><span className="wr-fr-info-val">{faceData.lastScan}</span></div>
              <div className="wr-fr-info-row"><span className="wr-fr-info-key">Success Rate</span><span className="wr-fr-info-val">{faceData.successRate}</span></div>
            </div>
            <div className="wr-fr-camera-col">
              <div className="wr-fr-camera-header">
                <Eye size={14} strokeWidth={2} style={{ color: "#3b82f6" }} />
                <span className="wr-fr-camera-label">Camera Feed</span>
              </div>
              <div className="wr-fr-camera-box">
                <video ref={videoRef} className="wr-fr-video" autoPlay playsInline muted style={{ display: cameraActive ? "block" : "none" }} />
                {cameraActive && <FaceDetectionOverlay videoRef={videoRef} />}
                {!cameraActive && (
                  <div className="wr-fr-camera-placeholder">
                    <Camera size={36} strokeWidth={1.2} style={{ color: "#9ca3af" }} />
                    {cameraError && <p className="wr-fr-camera-error">{cameraError}</p>}
                  </div>
                )}
              </div>
              {cameraActive
                ? <button className="wr-fr-activate-btn wr-fr-deactivate-btn" type="button" onClick={stopCamera}>Deactivate Camera</button>
                : <button className="wr-fr-activate-btn" type="button" onClick={startCamera}>Activate Face Recognition</button>
              }
            </div>
          </div>
        </div>
      </div>

      <div className="wr-card">
        <div className="wr-tc-card-inner">
          <div className="wr-tc-title-row">
            <MapPin size={18} strokeWidth={2} />
            <div>
              <h2 className="wr-tc-title">Location-Based Time Clock</h2>
              <p className="wr-tc-subtitle">Clock in/out at specific ship locations with face recognition</p>
            </div>
          </div>
          <div className="wr-tc-two-col">
            <div className="wr-tc-left">
              <div className="wr-tc-field">
                <label className="wr-tc-label">Select Location</label>
                <div style={{ position: "relative" }}>
                  <button type="button" className="wr-tc-select-btn" onClick={() => setDropdownOpen((o) => !o)}>
                    <span style={{ color: location ? "#0f172a" : "#94a3b8" }}>{location || "Choose ship area"}</span>
                    <ChevronDown size={16} strokeWidth={2} style={{ opacity: 0.5, flexShrink: 0 }} />
                  </button>
                  {dropdownOpen && (
                    <div className="wr-tc-dropdown">
                      {SHIP_LOCATIONS.map((loc) => (
                        <button key={loc} type="button"
                          className={`wr-tc-dropdown-item${location === loc ? " selected" : ""}`}
                          onClick={() => { setLocation(loc); setDropdownOpen(false); }}>
                          {loc}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="wr-tc-field">
                <label className="wr-tc-label">Current Time</label>
                <div className="wr-tc-clock-box">
                  <div className="wr-tc-clock-time">{timeStr}</div>
                  <div className="wr-tc-clock-date">{dateStr}</div>
                </div>
              </div>
              <div className="wr-tc-clock-btns">
                <button type="button" className="wr-tc-btn wr-tc-btn--in" disabled={!canClock}>
                  <Clock size={16} strokeWidth={2} /> Clock In
                </button>
                <button type="button" className="wr-tc-btn wr-tc-btn--out" disabled={!canClock}>
                  <Clock size={16} strokeWidth={2} /> Clock Out
                </button>
              </div>
            </div>
            <div className="wr-tc-right">
              <div className="wr-tc-pin-box">
                <div className="wr-tc-pin-header">
                  <KeyRound size={16} strokeWidth={2} style={{ color: "#ea580c" }} />
                  <span className="wr-tc-pin-title">PIN Backup</span>
                </div>
                <p className="wr-tc-pin-desc">Use PIN if face recognition fails</p>
                <input type="password" className="wr-tc-pin-input" placeholder="Enter 4-digit PIN"
                  maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} />
                <button type="button" className="wr-tc-pin-auth-btn" disabled={pin.length !== 4}>
                  Authenticate with PIN
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="wr-card">
        <div className="wr-tc-activity-inner">
          <div className="wr-tc-activity-title">
            <Activity size={18} strokeWidth={2} />
            <span>Face Recognition Activity</span>
          </div>
          <div className="wr-tc-activity-list">
            {activityLog.map((entry, i) => (
              <div key={i} className={`wr-tc-activity-row wr-tc-activity-row--${entry.type}`}>
                <div className="wr-tc-activity-left">
                  <div className={`wr-tc-activity-dot wr-tc-activity-dot--${entry.type}`} />
                  <div>
                    <div className="wr-tc-activity-name">{entry.label}</div>
                    <div className="wr-tc-activity-meta">{entry.location} - {entry.time}</div>
                  </div>
                </div>
                <span className={`wr-tc-activity-badge wr-tc-activity-badge--${entry.type}`}>{entry.badgeLabel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function TimeClockTab({ timeClockRecords, dailySummary }) {
  return (
    <>
      <div className="wr-card">
        <div className="wr-tcr-inner">
          <div className="wr-tcr-title-row">
            <Clock size={18} strokeWidth={2} />
            <div>
              <h2 className="wr-tcr-title">Time Clock Records</h2>
              <p className="wr-tcr-subtitle">Complete log of clock in/out activities across ship locations</p>
            </div>
          </div>
          <div className="wr-tcr-list">
            {timeClockRecords.map((record) => (
              <div key={record.id} className="wr-tcr-row">
                <div className="wr-tcr-left">
                  <div className={`wr-tcr-dot wr-tcr-dot--${record.dotType}`} />
                  <div>
                    <div className="wr-tcr-name">{record.name}</div>
                    <div className="wr-tcr-location">{record.location}</div>
                  </div>
                </div>
                <div className="wr-tcr-middle">
                  <div className="wr-tcr-action">{record.action}</div>
                  <div className="wr-tcr-time">{record.time}</div>
                </div>
                <div className="wr-tcr-right">
                  <span className={`wr-tcr-badge wr-tcr-badge--${record.authType}`}>
                    {record.authType === "face" ? "Face Recognition" : "PIN Backup"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="wr-card">
        <div className="wr-dts-inner">
          <h2 className="wr-dts-title">Daily Time Summary</h2>
          <div className="wr-dts-grid">
            <div className="wr-dts-stat wr-dts-stat--green">
              <div className="wr-dts-value green">{dailySummary.hoursWorked}</div>
              <div className="wr-dts-label">Hours Worked</div>
            </div>
            <div className="wr-dts-stat wr-dts-stat--blue">
              <div className="wr-dts-value blue">{dailySummary.locationChanges}</div>
              <div className="wr-dts-label">Location Changes</div>
            </div>
            <div className="wr-dts-stat wr-dts-stat--purple">
              <div className="wr-dts-value purple">{dailySummary.faceRecognitionRate}</div>
              <div className="wr-dts-label">Face Recognition Rate</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function WorkRestPage() {
  const mockData = workRestMockData;

  const [activeTab, setActiveTab] = useState("schedule");
  const [selectedDate] = useState(new Date().toISOString().slice(0, 10));

  const [myProfile, setMyProfile] = useState(null);
  const [editableBlocks, setEditableBlocks] = useState(Array(48).fill(false));
  const [loadingGrid, setLoadingGrid] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [gridError, setGridError] = useState("");
  const [gridSuccess, setGridSuccess] = useState("");

  const { compliance, faceRecognition, activityLog, timeClockRecords, dailySummary, header, navigation } = mockData;

  const tabs = [
    { id: "schedule", label: "Work Schedule" },
    { id: "face",     label: "Face Recognition" },
    { id: "time",     label: "Time Clock" },
  ];

  // ── Load: profile + this user's own work blocks via /me/:date ────────────
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingGrid(true);
        setGridError("");

        // Fetch profile and this user's personal work grid in parallel
        const [profile, myBlocks] = await Promise.all([
          getMyProfile(),
          fetchMyWorkGrid(selectedDate),
        ]);

        setMyProfile(profile);
        setEditableBlocks(myBlocks);
      } catch (err) {
        console.error("Load failed:", err);
        setGridError(err.message || "Failed to load your schedule.");
      } finally {
        setLoadingGrid(false);
      }
    }
    loadData();
  }, [selectedDate]);

  const mergedHeader = useMemo(() => {
    if (!myProfile) return header;
    return {
      ...header,
      fullName: myProfile.fullName,
      userInitials: getInitials(myProfile.fullName),
    };
  }, [header, myProfile]);

  const scheduleInfo = useMemo(() => ({
    title: "WORKING SCHEDULE",
    vessel: myProfile?.vessel ?? mockData.scheduleInfo.vessel,
    imoNo: mockData.scheduleInfo.imoNo,
    flag: mockData.scheduleInfo.flag,
    location: mockData.scheduleInfo.location,
    date: selectedDate,
    scheduleType: mockData.scheduleInfo.scheduleType,
  }), [myProfile, selectedDate, mockData.scheduleInfo]);

  // The member object built from profile — only one row shown
  const myMember = useMemo(() => {
    if (!myProfile) return null;
    return {
      name: myProfile.fullName ?? "My Schedule",
      rank: myProfile.rank ?? "Crew",
    };
  }, [myProfile]);

  // ── Toggle a cell: optimistic blue → save to backend ────────────────────
  async function handleToggleBlock(slotIdx) {
    if (isSaving) return; // block while any save is in flight

    setGridError("");
    setGridSuccess("");

    const previousBlocks = [...editableBlocks];
    const nextBlocks = editableBlocks.map((v, i) => (i === slotIdx ? !v : v));

    // Optimistic update: turn blue instantly
    setEditableBlocks(nextBlocks);
    setIsSaving(true);

    try {
      await saveDailyWorkGrid(selectedDate, nextBlocks);
      setGridSuccess("Saved.");
      setTimeout(() => setGridSuccess(""), 2000);
    } catch (err) {
      console.error("Save failed:", err);
      setEditableBlocks(previousBlocks); // roll back on error
      setGridError(err.message || "Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="app-shell">
      <AppHeader header={mergedHeader} />

      <main className="wr-page">
        <div className="wr-card">
          {/* Page header */}
          <div className="wr-schedule-header">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h1 className="wr-schedule-title">{scheduleInfo.title}</h1>
                <div className="wr-meta-row">
                  <span><strong>Vessel:</strong> {scheduleInfo.vessel}</span>
                  <span><strong>IMO No:</strong> {scheduleInfo.imoNo}</span>
                  <span><strong>Flag:</strong> {scheduleInfo.flag}</span>
                  <span><strong>Location:</strong> {scheduleInfo.location}</span>
                </div>
              </div>
              <div className="wr-header-actions">
                <span className="wr-badge">{scheduleInfo.scheduleType}</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="wr-tabs">
            <div className="wr-tab-list" role="tablist">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`wr-tab-btn${activeTab === tab.id ? " active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule tab */}
          {activeTab === "schedule" && (
            <>
              {gridError && (
                <div style={{ margin: "12px 16px 0", padding: "10px 12px", borderRadius: 10, background: "#fff4f4", color: "#b42318", fontSize: 14, fontWeight: 500 }}>
                  {gridError}
                </div>
              )}
              {gridSuccess && (
                <div style={{ margin: "12px 16px 0", padding: "10px 12px", borderRadius: 10, background: "#eefbf3", color: "#067647", fontSize: 14, fontWeight: 500 }}>
                  {gridSuccess}
                </div>
              )}

              {loadingGrid ? (
                <div style={{ padding: 24, color: "#475569" }}>Loading your schedule…</div>
              ) : myMember ? (
                <ScheduleGrid
                  member={myMember}
                  date={scheduleInfo.date}
                  editableBlocks={editableBlocks}
                  savingAny={isSaving}
                  onToggleBlock={handleToggleBlock}
                />
              ) : (
                <div style={{ padding: 24, color: "#475569" }}>No schedule found for your account.</div>
              )}
            </>
          )}
        </div>

        {activeTab === "face" && (
          <FaceRecognitionTab faceData={faceRecognition} activityLog={activityLog} />
        )}
        {activeTab === "time" && (
          <TimeClockTab timeClockRecords={timeClockRecords} dailySummary={dailySummary} />
        )}
        {activeTab === "schedule" && (
          <ComplianceSection compliance={compliance} />
        )}
      </main>

      <BottomNav navigation={navigation} />
    </div>
  );
}

export default WorkRestPage;