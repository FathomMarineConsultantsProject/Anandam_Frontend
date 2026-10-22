import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deletePractitionerDocument,
  getPractitionerOnboarding,
  getPractitionerOnboardingSpecialties,
  getPractitionerDocumentDownloadUrl,
  PRACTITIONER_DOCUMENT_MAX_BYTES,
  PRACTITIONER_PROFILE_IMAGE_MAX_BYTES,
  savePractitionerBasicDetails,
  savePractitionerOnlinePresence,
  savePractitionerProfessionalDetails,
  selectPractitionerAvatar,
  submitPractitionerOnboarding,
  uploadPractitionerFile,
} from "../api/practitionerOnboardingApi";
import { getUserFriendlyError } from "../api/client";
import { updateStoredPractitionerOnboarding } from "../api/authApi";
import "../styles/practitioner-onboarding.css";

const LANGUAGES = [
  "English", "Hindi", "Marathi", "Bengali", "Arabic", "French", "German", "Gujarati",
  "Punjabi", "Tamil", "Telugu", "Malayalam", "Kannada", "Urdu", "Spanish", "Portuguese",
  "Italian", "Mandarin", "Japanese", "Korean", "Russian"
];

const PRACTITIONER_TYPES = [
  "Counsellor", "Psychologist", "Therapist", "Life coach", "Wellness coach",
  "Yoga instructor", "Meditation teacher", "Breathwork practitioner", "Nutritionist",
  "Dietitian", "Fitness trainer", "Ayurveda practitioner", "Reiki practitioner",
  "Sound healing practitioner", "Spiritual guide", "Astrologer", "Tarot card reader", "Other"
];

const avatarModules = import.meta.glob(
  "../assets/profile/avatar *.*",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);

const AVATARS = Object.entries(avatarModules)
  .map(([path, url]) => {
    const match = path.match(/avatar\s*(\d+)/i);
    const number = match ? Number(match[1]) : 999;

    return {
      id: `avatar-${number}`,
      number,
      url,
      label: `Avatar ${number}`,
    };
  })
  .filter((item) => Number.isFinite(item.number) && item.number >= 1 && item.number <= 10)
  .sort((a, b) => a.number - b.number);

const getAvatarUrl = (avatarId) =>
  AVATARS.find((avatar) => avatar.id === avatarId)?.url || null;

const emptyQualification = () => ({ qualificationName: "", institution: "", year: "" });
const profileImageMaxLabel = "2 MB";
const documentMaxLabel = "4.5 MB";

function Stepper({ step, onStep }) {
  const items = ["Basic details", "Professional details", "Online presence", "Review & submit"];
  return (
    <div className="po-stepper">
      {items.map((label, index) => {
        const number = index + 1;
        const reached = number <= step;
        return (
          <div className="po-stepper-fragment" key={label}>
            <button
              type="button"
              className={`po-step ${reached ? "is-reached" : ""} ${number === step ? "is-current" : ""}`}
              onClick={() => number <= step && onStep(number)}
            >
              <span className="po-step-number">{number}</span>
              <span>{label}</span>
            </button>
            {index < items.length - 1 ? <span className={`po-chevron ${number < step ? "is-reached" : ""}`}>»</span> : null}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, required = false, children }) {
  return (
    <label className="po-field">
      <span className="po-label">{label}{required ? <b> *</b> : null}</span>
      {children}
    </label>
  );
}

function MultiSelect({ values, options, placeholder, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef(null);

  useEffect(() => {
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const filtered = options.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()));
  const toggle = (value) => {
    onChange(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  };

  return (
    <div className="po-multiselect" ref={rootRef}>
      {values.length ? (
        <div className="po-chips">
          {values.map((value) => {
            const item = options.find((option) => option.value === value);
            return (
              <button type="button" className="po-chip" key={value} onClick={() => toggle(value)}>
                {item?.label || value}<span>×</span>
              </button>
            );
          })}
        </div>
      ) : null}
      <button type="button" className="po-select-trigger" onClick={() => setOpen((value) => !value)}>
        <span>{placeholder}</span><span>⌄</span>
      </button>
      {open ? (
        <div className="po-dropdown-panel">
          <div className="po-dropdown-search"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" /></div>
          <div className="po-dropdown-list">
            {filtered.map((item) => (
              <label key={item.value} className="po-dropdown-option">
                <input type="checkbox" checked={values.includes(item.value)} onChange={() => toggle(item.value)} />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SingleSelect({ value, placeholder, options, onChange }) {
  return (
    <select className="po-input po-select" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((item) => <option value={item} key={item}>{item}</option>)}
    </select>
  );
}

function SocialField({ icon, value, placeholder, onChange }) {
  return (
    <div className="po-social-field">
      <span className="po-social-icon">{icon}</span>
      <input className="po-input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

export default function PractitionerOnboardingPage() {
  const navigate = useNavigate();
  const profileInputRef = useRef(null);
  const documentInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [practitioner, setPractitioner] = useState(null);
  const [specialtyOptions, setSpecialtyOptions] = useState([]);
  const [showAvatarChoices, setShowAvatarChoices] = useState(false);

  const [basic, setBasic] = useState({ fullName: "", email: "", phoneNumber: "", location: "", languages: [], about: "" });
  const [professional, setProfessional] = useState({ practitionerType: "", professionalTitle: "", specialtyIds: [], experienceYears: "", qualifications: [emptyQualification()] });
  const [online, setOnline] = useState({ websiteUrl: "", instagramUrl: "", facebookUrl: "", youtubeUrl: "" });

  const hydrate = (profile) => {
    if (!profile) return;
    setPractitioner(profile);
    setBasic({
      fullName: profile.user?.fullName || "",
      email: profile.user?.email || "",
      phoneNumber: profile.user?.contactNumber || "",
      location: profile.location || "",
      languages: profile.languages || [],
      about: profile.about || "",
    });
    setProfessional({
      practitionerType: profile.practitionerType || "",
      professionalTitle: profile.professionalTitle || "",
      specialtyIds: (profile.specialties || []).map((item) => item.specialty?.id).filter(Boolean),
      experienceYears: profile.experienceYears ?? "",
      qualifications: profile.qualifications?.length
        ? profile.qualifications.map((item) => ({ qualificationName: item.qualificationName || "", institution: item.institution || "", year: item.year ?? "" }))
        : [emptyQualification()],
    });
    setOnline({
      websiteUrl: profile.websiteUrl || "",
      instagramUrl: profile.instagramUrl || "",
      facebookUrl: profile.facebookUrl || "",
      youtubeUrl: profile.youtubeUrl || "",
    });
    setStep(Math.min(Math.max(profile.onboardingStep || 1, 1), 4));
  };

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const [profileData, specialtiesData] = await Promise.all([
        getPractitionerOnboarding(),
        getPractitionerOnboardingSpecialties().catch(() => ({ specialties: [] })),
      ]);
      hydrate(profileData.practitioner);
      setSpecialtyOptions((specialtiesData.specialties || []).map((item) => ({ value: item.id, label: item.name })));
    } catch (err) {
      setError(getUserFriendlyError(err, "Unable to load your practitioner profile."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const languageOptions = useMemo(() => LANGUAGES.map((item) => ({ value: item, label: item })), []);

  const handleProfileFile = async (file) => {
    if (!file) return;
    if (file.size > PRACTITIONER_PROFILE_IMAGE_MAX_BYTES) {
      setError(`Profile image must be ${profileImageMaxLabel} or smaller.`);
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Profile image must be JPG, PNG or WEBP.");
      return;
    }
    try {
      setError("");
      setUploadingProfile(true);
      const data = await uploadPractitionerFile({ file, kind: "PROFILE_IMAGE" });
      hydrate(data.practitioner);
      setShowAvatarChoices(false);
    } catch (err) {
      setError(getUserFriendlyError(err, err.message || "Unable to upload profile image."));
    } finally {
      setUploadingProfile(false);
      if (profileInputRef.current) profileInputRef.current.value = "";
    }
  };

  const chooseAvatar = async (avatarMode, avatarId = null) => {
    try {
      setSaving(true);
      setError("");
      const data = await selectPractitionerAvatar({ avatarMode, avatarId });
      hydrate(data.practitioner);
      setShowAvatarChoices(false);
    } catch (err) {
      setError(getUserFriendlyError(err, "Unable to update avatar."));
    } finally {
      setSaving(false);
    }
  };

  const uploadDocuments = async (files) => {
    if (!files?.length) return;
    const tooLarge = Array.from(files).find((file) => file.size > PRACTITIONER_DOCUMENT_MAX_BYTES);
    if (tooLarge) {
      setError(`${tooLarge.name} is larger than ${documentMaxLabel}.`);
      return;
    }
    try {
      setError("");
      setUploadingDocument(true);
      for (const file of Array.from(files)) {
        await uploadPractitionerFile({ file, kind: "DOCUMENT" });
      }
      const fresh = await getPractitionerOnboarding();
      hydrate(fresh.practitioner);
    } catch (err) {
      setError(getUserFriendlyError(err, err.message || "Unable to upload document."));
    } finally {
      setUploadingDocument(false);
      if (documentInputRef.current) documentInputRef.current.value = "";
    }
  };

  const removeDocument = async (documentId) => {
    try {
      setSaving(true);
      await deletePractitionerDocument(documentId);
      const fresh = await getPractitionerOnboarding();
      hydrate(fresh.practitioner);
    } catch (err) {
      setError(getUserFriendlyError(err, "Unable to remove document."));
    } finally {
      setSaving(false);
    }
  };

  const openDocument = async (documentId) => {
    try {
      const data = await getPractitionerDocumentDownloadUrl(documentId);
      window.open(data.downloadUrl || data.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(getUserFriendlyError(err, "Unable to open document."));
    }
  };

  const saveBasic = async () => {
    if (!basic.fullName.trim() || !basic.email.trim()) {
      setError("Full name and email are required.");
      return;
    }
    try {
      setSaving(true); setError("");
      const data = await savePractitionerBasicDetails(basic);
      hydrate(data.practitioner); setStep(2);
    } catch (err) { setError(getUserFriendlyError(err, "Unable to save basic details.")); }
    finally { setSaving(false); }
  };

  const saveProfessional = async () => {
    try {
      setSaving(true); setError("");
      const payload = {
        ...professional,
        experienceYears: professional.experienceYears === "" ? null : Number(professional.experienceYears),
        qualifications: professional.qualifications,
      };
      const data = await savePractitionerProfessionalDetails(payload);
      hydrate(data.practitioner); setStep(3);
    } catch (err) { setError(getUserFriendlyError(err, "Unable to save professional details.")); }
    finally { setSaving(false); }
  };

  const saveOnline = async () => {
    try {
      setSaving(true); setError("");
      const data = await savePractitionerOnlinePresence(online);
      hydrate(data.practitioner); setStep(4);
    } catch (err) { setError(getUserFriendlyError(err, "Unable to save online presence.")); }
    finally { setSaving(false); }
  };

  const skipOnline = async () => {
    try {
      setSaving(true); setError("");
      const data = await savePractitionerOnlinePresence(online);
      hydrate(data.practitioner); setStep(4);
    } catch (err) { setError(getUserFriendlyError(err, "Unable to continue.")); }
    finally { setSaving(false); }
  };

  const submit = async () => {
    try {
      setSaving(true); setError("");
      const data = await submitPractitionerOnboarding();
      hydrate(data.practitioner);
      updateStoredPractitionerOnboarding({
        required: false,
        completed: true,
        approvalStatus: data.practitioner?.approvalStatus || "PENDING_REVIEW",
        nextStep: 4,
        profileId: data.practitioner?.id || null,
      });
      navigate("/dashboard", { replace: true });
    } catch (err) { setError(getUserFriendlyError(err, "Unable to submit your practitioner profile.")); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="po-page"><div className="po-card po-loading">Loading your profile…</div></div>;

  return (
    <main className="po-page">
      <div className="po-bg-wave po-bg-wave-left" />
      <div className="po-bg-wave po-bg-wave-right" />

      <section className={`po-card ${step === 4 ? "po-card-review" : ""}`}>
        <header className="po-header">
          <h1>Create your practitioner profile</h1>
          <p>Tell us about yourself so users can get to know you.</p>
        </header>
        <div className="po-rule" />
        <Stepper step={step} onStep={setStep} />

        {error ? <div className="po-error">{error}</div> : null}

        {step === 1 ? (
          <div className="po-step-content">
            <div className={`po-photo-row ${showAvatarChoices ? "is-avatar-open" : ""}`}>
              <button type="button" className="po-profile-photo" onClick={() => setShowAvatarChoices((value) => !value)}>
                {practitioner?.profileImageUrl ? (
                  <img src={practitioner.profileImageUrl} alt="Profile" />
                ) : practitioner?.user?.avatarMode === "AVATAR" && getAvatarUrl(practitioner?.user?.avatarId) ? (
                  <img src={getAvatarUrl(practitioner.user.avatarId)} alt="Selected avatar" />
                ) : practitioner?.user?.avatarMode === "INITIALS" ? (
                  <span className="po-photo-initials">{basic.fullName?.trim()?.[0]?.toUpperCase() || "P"}</span>
                ) : (
                  <span className="po-photo-placeholder">▧</span>
                )}
              </button>
              <div>
                <h2>Upload profile photo</h2>
                <p>Choose a clear photo of yourself. JPG, PNG or WEBP. Image size must be {profileImageMaxLabel} or smaller.</p>
                <button type="button" className="po-text-action" onClick={() => setShowAvatarChoices((value) => !value)}>Photo, initials or avatar</button>
              </div>
              {showAvatarChoices ? (
                <div className="po-avatar-popover">
                  {/* <button type="button" onClick={() => profileInputRef.current?.click()}>Upload photo</button> */}
                  <button type="button" onClick={() => chooseAvatar("INITIALS")}>Use initials</button>
                  <div className="po-avatar-options">
                    {AVATARS.map((avatar) => (
                      <button
                        type="button"
                        className={`po-avatar-choice ${practitioner?.user?.avatarMode === "AVATAR" && practitioner?.user?.avatarId === avatar.id ? "is-selected" : ""}`}
                        key={avatar.id}
                        onClick={() => chooseAvatar("AVATAR", avatar.id)}
                        aria-label={`Choose ${avatar.label}`}
                      >
                        <img src={avatar.url} alt="" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <input ref={profileInputRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleProfileFile(e.target.files?.[0])} />
            </div>

            <div className="po-grid-2">
              <Field label="Full Name" required><input className="po-input" value={basic.fullName} onChange={(e) => setBasic({ ...basic, fullName: e.target.value })} placeholder="Enter your full name" /></Field>
              <Field label="Phone Number"><input className="po-input" value={basic.phoneNumber} onChange={(e) => setBasic({ ...basic, phoneNumber: e.target.value })} placeholder="Eg. 9999999999" /></Field>
              <Field label="Email" required><input className="po-input" type="email" value={basic.email} onChange={(e) => setBasic({ ...basic, email: e.target.value })} placeholder="Enter your email address" /></Field>
              <Field label="Location"><div className="po-icon-input"><span>⌖</span><input className="po-input" value={basic.location} onChange={(e) => setBasic({ ...basic, location: e.target.value })} placeholder="Eg. Dubai" /></div></Field>
            </div>

            <Field label="Languages You Speak">
              <MultiSelect values={basic.languages} options={languageOptions} placeholder="Search & select" onChange={(languages) => setBasic({ ...basic, languages })} />
            </Field>

            <Field label="About You">
              <textarea className="po-textarea" value={basic.about} onChange={(e) => setBasic({ ...basic, about: e.target.value })} placeholder="Tell users about yourself and your approach to wellbeing" />
            </Field>

            <div className="po-actions po-actions-right">
              <button type="button" className="po-btn po-btn-outline" onClick={() => navigate("/dashboard")}>Cancel</button>
              <button type="button" className="po-btn po-btn-primary" onClick={saveBasic} disabled={saving || uploadingProfile}>{saving ? "Saving…" : "Continue"}</button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="po-step-content">
            <div className="po-grid-2">
              <Field label="Practitioner Type"><SingleSelect value={professional.practitionerType} placeholder="Select practitioner type" options={PRACTITIONER_TYPES} onChange={(practitionerType) => setProfessional({ ...professional, practitionerType })} /></Field>
              <Field label="Professional Title"><input className="po-input" value={professional.professionalTitle} onChange={(e) => setProfessional({ ...professional, professionalTitle: e.target.value })} placeholder="e.g. Yoga Instructor" /></Field>
              <Field label="Specialties"><MultiSelect values={professional.specialtyIds} options={specialtyOptions} placeholder="Search & select specialties" onChange={(specialtyIds) => setProfessional({ ...professional, specialtyIds })} /></Field>
              <Field label="Years Of Experience"><input className="po-input" type="number" min="0" max="80" value={professional.experienceYears} onChange={(e) => setProfessional({ ...professional, experienceYears: e.target.value })} placeholder="Enter years of experience" /></Field>
            </div>

            <div className="po-bordered-section">
              <h3>Qualifications</h3>
              {professional.qualifications.map((qualification, index) => (
                <div className="po-qualification-row" key={index}>
                  <Field label="Qualification Name"><input className="po-input" value={qualification.qualificationName} onChange={(e) => { const next = [...professional.qualifications]; next[index] = { ...qualification, qualificationName: e.target.value }; setProfessional({ ...professional, qualifications: next }); }} placeholder="Enter qualification or course name" /></Field>
                  <Field label="Institution"><input className="po-input" value={qualification.institution} onChange={(e) => { const next = [...professional.qualifications]; next[index] = { ...qualification, institution: e.target.value }; setProfessional({ ...professional, qualifications: next }); }} placeholder="Enter institution or training provider" /></Field>
                  <Field label="Year"><input className="po-input" type="number" value={qualification.year} onChange={(e) => { const next = [...professional.qualifications]; next[index] = { ...qualification, year: e.target.value }; setProfessional({ ...professional, qualifications: next }); }} placeholder="Enter year" /></Field>
                  {professional.qualifications.length > 1 ? <button type="button" className="po-remove-row" onClick={() => setProfessional({ ...professional, qualifications: professional.qualifications.filter((_, i) => i !== index) })}>×</button> : null}
                </div>
              ))}
              <button type="button" className="po-add-row" onClick={() => setProfessional({ ...professional, qualifications: [...professional.qualifications, emptyQualification()] })}>＋ Add another qualification</button>
            </div>

            {/* <div className="po-bordered-section">
              <h3>Certificates and supporting documents</h3>
              <button type="button" className="po-dropzone" onClick={() => documentInputRef.current?.click()}>
                <span className="po-upload-icon">☁</span>
                <span>Drag & drop files or <u>Browse</u></span>
                <small>PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, WEBP · maximum {documentMaxLabel} per file</small>
              </button>
              <input ref={documentInputRef} hidden multiple type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,image/jpeg,image/png,image/webp" onChange={(e) => uploadDocuments(e.target.files)} />
              {practitioner?.documents?.length ? (
                <div className="po-document-list">
                  {practitioner.documents.map((doc) => (
                    <div className="po-document" key={doc.id}>
                      <button type="button" onClick={() => openDocument(doc.id)}>▣ {doc.fileName}</button>
                      <button type="button" className="po-document-delete" onClick={() => removeDocument(doc.id)}>×</button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div> */}

            <div className="po-actions po-actions-right">
              <button type="button" className="po-btn po-btn-outline" onClick={() => setStep(1)}>‹ Back</button>
              <button type="button" className="po-btn po-btn-primary" onClick={saveProfessional} disabled={saving || uploadingDocument}>{saving || uploadingDocument ? "Saving…" : "Continue"}</button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="po-step-content po-online-step">
            <div className="po-section-heading">
              <h2>Your online presence</h2>
              <p>Share your website or professional profiles to help us learn more about your practice.</p>
            </div>
            <div className="po-rule" />
            <div className="po-social-list">
              <SocialField icon="◎" value={online.websiteUrl} onChange={(websiteUrl) => setOnline({ ...online, websiteUrl })} placeholder="Paste your website link" />
              <SocialField icon="◉" value={online.instagramUrl} onChange={(instagramUrl) => setOnline({ ...online, instagramUrl })} placeholder="Paste your Instagram profile link" />
              <SocialField icon="f" value={online.facebookUrl} onChange={(facebookUrl) => setOnline({ ...online, facebookUrl })} placeholder="Paste your Facebook page or profile link" />
              <SocialField icon="▶" value={online.youtubeUrl} onChange={(youtubeUrl) => setOnline({ ...online, youtubeUrl })} placeholder="Paste your YouTube channel link" />
            </div>
            <div className="po-actions po-online-actions">
              <button type="button" className="po-btn po-btn-outline" onClick={() => setStep(2)}>‹ Back</button>
              <div><button type="button" className="po-skip" onClick={skipOnline}>Skip for now</button><button type="button" className="po-btn po-btn-primary" onClick={saveOnline} disabled={saving}>{saving ? "Saving…" : "Continue"}</button></div>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="po-step-content po-review">
            <div className="po-section-heading"><h2>Review your details</h2><p>Make sure everything is correct. You can edit any section before submitting.</p></div>
            <div className="po-rule" />

            <section className="po-review-section">
              <div className="po-review-title"><h3>Basic details</h3><button type="button" onClick={() => setStep(1)}>✎ Edit</button></div>
              <div className="po-review-profile">
                <div className="po-review-avatar">
                  {practitioner?.profileImageUrl ? (
                    <img src={practitioner.profileImageUrl} alt="Profile" />
                  ) : practitioner?.user?.avatarMode === "AVATAR" && getAvatarUrl(practitioner?.user?.avatarId) ? (
                    <img src={getAvatarUrl(practitioner.user.avatarId)} alt="Selected avatar" />
                  ) : (
                    <span>{basic.fullName?.slice(0,1)?.toUpperCase() || "P"}</span>
                  )}
                </div>
              </div>
              <div className="po-review-grid"><div><b>Full Name</b><span>{basic.fullName || "—"}</span></div><div><b>Phone Number</b><span>{basic.phoneNumber || "—"}</span></div><div><b>Email</b><span>{basic.email || "—"}</span></div><div><b>Location</b><span>{basic.location || "—"}</span></div></div>
              <div className="po-review-long"><b>Languages</b><span>{basic.languages.length ? basic.languages.join(", ") : "—"}</span></div>
              <div className="po-review-long"><b>About You</b><span>{basic.about || "—"}</span></div>
            </section>

            <section className="po-review-section">
              <div className="po-review-title"><h3>Professional details</h3><button type="button" onClick={() => setStep(2)}>✎ Edit</button></div>
              <div className="po-review-grid"><div><b>Practitioner Type</b><span>{professional.practitionerType || "—"}</span></div><div><b>Professional Title</b><span>{professional.professionalTitle || "—"}</span></div><div><b>Years Of Experience</b><span>{professional.experienceYears === "" ? "—" : `${professional.experienceYears} years`}</span></div></div>
              <div className="po-review-long"><b>Specialties</b><div className="po-review-chips">{professional.specialtyIds.length ? professional.specialtyIds.map((id) => <span key={id}>{specialtyOptions.find((item) => item.value === id)?.label || id}</span>) : <span>—</span>}</div></div>
              <div className="po-review-qualifications"><b>Qualifications</b>{professional.qualifications.filter((item) => item.qualificationName || item.institution || item.year).map((item, index) => <div className="po-review-grid po-review-qualification" key={index}><div><b>Qualification Name</b><span>{item.qualificationName || "—"}</span></div><div><b>Institution</b><span>{item.institution || "—"}</span></div><div><b>Year</b><span>{item.year || "—"}</span></div></div>)}</div>
              <div className="po-review-long"><b>Documents Uploaded</b><div className="po-document-list">{practitioner?.documents?.length ? practitioner.documents.map((doc) => <button type="button" className="po-review-doc" key={doc.id} onClick={() => openDocument(doc.id)}>▣ {doc.fileName}</button>) : <span>—</span>}</div></div>
            </section>

            <section className="po-review-section">
              <div className="po-review-title"><h3>Online presence</h3><button type="button" onClick={() => setStep(3)}>✎ Edit</button></div>
              <div className="po-review-socials">{[["◎", online.websiteUrl],["◉", online.instagramUrl],["f", online.facebookUrl],["▶", online.youtubeUrl]].map(([icon,url], index) => url ? <a href={url} target="_blank" rel="noreferrer" key={index}><span>{icon}</span>{url}</a> : null)}{!Object.values(online).some(Boolean) ? <span>—</span> : null}</div>
            </section>

            <div className="po-actions po-actions-right"><button type="button" className="po-btn po-btn-primary" onClick={submit} disabled={saving}>{saving ? "Submitting…" : "Submit"}</button></div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
