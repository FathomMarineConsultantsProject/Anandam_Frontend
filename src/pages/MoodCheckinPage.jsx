import { useEffect, useMemo, useState } from 'react';
import {
    Heart,
    Clock3,
    BookOpen,
    Lightbulb,
    Zap,
    Brain,
    X,
} from 'lucide-react';
import AppHeader from '../components/layout/AppHeader';
import BottomNav from '../components/layout/BottomNav';
import { homePageMockData } from '../data/homeData';
import { moodCheckinMockData } from '../data/moodCheckinData';
import { submitMoodCheckin } from '../api/moodCheckinApi';
import '../styles/mood-checkin.css';

function getMoodVisual(value) {
    if (value <= 3) {
        return { moodClass: 'sad', color: 'var(--mood-red)' };
    }
    if (value <= 7) {
        return { moodClass: 'neutral', color: 'var(--mood-yellow)' };
    }
    return { moodClass: 'happy', color: 'var(--mood-green)' };
}

function getEnergyColor(value) {
    if (value <= 3) return 'var(--mood-red)';
    if (value <= 7) return 'var(--mood-orange)';
    return 'var(--mood-green)';
}

function getStressColor(value) {
    if (value <= 3) return 'var(--mood-green)';
    if (value <= 7) return 'var(--mood-orange)';
    return 'var(--mood-red)';
}


function getEmotionColorClass(emotionId) {
    const colorMap = {
        adventurous: 'emotion-blue',
        homesick: 'emotion-yellow',
        proud: 'emotion-green',
        lonely: 'emotion-purple',
        excited: 'emotion-orange',
        calm: 'emotion-cyan',
        anxious: 'emotion-gray',
        grateful: 'emotion-pink',
        determined: 'emotion-soft',
        peaceful: 'emotion-indigo',
        frustrated: 'emotion-red',
        hopeful: 'emotion-gold',
    };

    return colorMap[emotionId] || 'emotion-soft';
}

function getRangeStyle(value, max = 10) {
    const percent = (value / max) * 100;

    return {
        background: `linear-gradient(to right, #2f8ee5 0%, #2f8ee5 ${percent}%, #e8eef5 ${percent}%, #e8eef5 100%)`,
    };
}

function MoodCheckinPage() {
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        mood: 5,
        energy: 5,
        stress: 5,
        sleepHours: 7,
        workload: 'normal',
        notes: '',
        emotions: [],
        journalEntry: '',
    });

    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const navigation = useMemo(() => {
        return {
            ...homePageMockData.navigation,
            activeTab: 'mood',
        };
    }, []);

    useEffect(() => {
        if (!toast) return;

        const timer = setTimeout(() => {
            setToast(null);
        }, 3500);

        return () => clearTimeout(timer);
    }, [toast]);

    function updateField(name, value) {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function toggleEmotion(emotionId) {
        setFormData((prev) => {
            const alreadySelected = prev.emotions.includes(emotionId);

            return {
                ...prev,
                emotions: alreadySelected
                    ? prev.emotions.filter((id) => id !== emotionId)
                    : [...prev.emotions, emotionId],
            };
        });
    }

    async function handleFinalSubmit() {
        try {
            setIsSaving(true);
            setToast(null);

            await submitMoodCheckin(formData);

            setToast({
                type: 'success',
                title: 'Success',
                message: moodCheckinMockData.ui.successMessage,
            });
        } catch {
            setToast({
                type: 'error',
                title: 'Error',
                message: moodCheckinMockData.ui.errorMessage,
            });
        } finally {
            setIsSaving(false);
        }
    }

    const moodVisual = getMoodVisual(formData.mood);

    return (
        <div className="app-shell">
            <AppHeader header={homePageMockData.header} />

            <main className="page-content mood-checkin-page-content">
                <div className="mood-checkin-shell">
                    {step === 1 && (
                        <div className="mood-checkin-card mood-checkin-card-step1">
                            <div className="checkin-header-center">
                                <div className="checkin-main-title-row">
                                    <Heart size={31} strokeWidth={2.1} className="checkin-title-heart" />
                                    <h1>Daily Mood Check</h1>
                                </div>

                                <p className="checkin-subtitle">
                                    Take a moment to reflect on how you're feeling today
                                </p>
                            </div>

                            <div className="mood-face-wrap">
                                <div
                                    className={`mood-face-icon-custom ${moodVisual.moodClass}`}
                                    style={{ color: moodVisual.color }}
                                >
                                    <span className="face-eye left" />
                                    <span className="face-eye right" />
                                    <span className="face-mouth" />
                                </div>
                            </div>

                            <h2 className="checkin-section-question">How is your mood today?</h2>

                            <div className="slider-block">
                                <input
                                    className="themed-range"
                                    type="range"
                                    min="0"
                                    max="10"
                                    value={formData.mood}
                                    onChange={(e) => updateField('mood', Number(e.target.value))}
                                    style={getRangeStyle(formData.mood, 10)}
                                />
                                <div className="slider-meta-row">
                                    <span>Very Low</span>
                                    <strong>{formData.mood}/10</strong>
                                    <span>Excellent</span>
                                </div>
                            </div>

                            <div className="metric-heading" style={{ color: getEnergyColor(formData.energy) }}>
                                <Zap size={23} strokeWidth={2.1} />
                                <span>Energy Level</span>
                            </div>

                            <div className="slider-block">
                                <input
                                    className="themed-range"
                                    type="range"
                                    min="0"
                                    max="10"
                                    value={formData.energy}
                                    onChange={(e) => updateField('energy', Number(e.target.value))}
                                    style={getRangeStyle(formData.energy, 10)}
                                />
                                <div className="slider-meta-row">
                                    <span>Exhausted</span>
                                    <strong>{formData.energy}/10</strong>
                                    <span>Energized</span>
                                </div>
                            </div>

                            <div className="metric-heading" style={{ color: getStressColor(formData.stress) }}>
                                <Brain size={23} strokeWidth={2.1} />
                                <span>Stress Level</span>
                            </div>

                            <div className="slider-block">
                                <input
                                    className="themed-range"
                                    type="range"
                                    min="0"
                                    max="10"
                                    value={formData.stress}
                                    onChange={(e) => updateField('stress', Number(e.target.value))}
                                    style={getRangeStyle(formData.stress, 10)}
                                />
                                <div className="slider-meta-row">
                                    <span>Very Calm</span>
                                    <strong>{formData.stress}/10</strong>
                                    <span>Very Stressed</span>
                                </div>
                            </div>

                            <div className="checkin-actions center">
                                <button
                                    type="button"
                                    className="checkin-primary-btn"
                                    onClick={() => setStep(2)}
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="mood-checkin-card mood-checkin-card-step2">
                            <div className="checkin-header-center">
                                <div className="checkin-main-title-row">
                                    <Clock3 size={30} strokeWidth={2.1} className="checkin-title-blue" />
                                    <h1>Sleep &amp; Work Assessment</h1>
                                </div>
                            </div>

                            <h2 className="checkin-section-question">Hours of sleep last night</h2>

                            <div className="slider-block">
                                <input
                                    className="themed-range"
                                    type="range"
                                    min="0"
                                    max="12"
                                    value={formData.sleepHours}
                                    onChange={(e) => updateField('sleepHours', Number(e.target.value))}
                                    style={getRangeStyle(formData.sleepHours, 12)}
                                />
                                <div className="slider-meta-row">
                                    <span>0 hours</span>
                                    <strong>{formData.sleepHours} hours</strong>
                                    <span>12 hours</span>
                                </div>
                            </div>

                            <h2 className="checkin-section-question left workload-question">
                                How would you describe your current workload?
                            </h2>

                            <div className="workload-group">
                                {moodCheckinMockData.step2.workloadOptions.map((option) => (
                                    <label key={option.id} className="workload-option">
                                        <input
                                            type="radio"
                                            name="workload"
                                            checked={formData.workload === option.id}
                                            onChange={() => updateField('workload', option.id)}
                                        />
                                        <span>{option.label}</span>
                                    </label>
                                ))}
                            </div>

                            <h2 className="checkin-section-question left notes-question">
                                Any additional thoughts or concerns?
                            </h2>

                            <textarea
                                className="checkin-textarea"
                                placeholder="Share anything that's on your mind..."
                                value={formData.notes}
                                onChange={(e) => updateField('notes', e.target.value)}
                            />

                            <div className="checkin-actions">
                                <button
                                    type="button"
                                    className="checkin-secondary-btn"
                                    onClick={() => setStep(1)}
                                >
                                    Back
                                </button>

                                <button
                                    type="button"
                                    className="checkin-primary-btn"
                                    onClick={() => setStep(3)}
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="mood-checkin-card mood-checkin-card-step3">
                            <div className="checkin-header-center">
                                <div className="checkin-main-title-row">
                                    <Heart size={29} strokeWidth={2.1} className="checkin-title-pink" />
                                    <h1>Emotions &amp; Journal</h1>
                                </div>

                                <p className="checkin-subtitle">
                                    Express your emotions and record your thoughts
                                </p>
                            </div>

                            <div className="subsection-title with-icon">
                                <Lightbulb size={18} strokeWidth={2.1} className="checkin-title-yellow" />
                                <span>How are you feeling? (Select all that apply)</span>
                            </div>

                            <div className="emotion-grid">
                                {moodCheckinMockData.step3.emotions.map((emotion) => {
                                    const selected = formData.emotions.includes(emotion.id);
                                    const colorClass = getEmotionColorClass(emotion.id);

                                    return (
                                        <button
                                            key={emotion.id}
                                            type="button"
                                            className={`emotion-tile ${selected ? `selected ${colorClass}` : ''}`}
                                            onClick={() => toggleEmotion(emotion.id)}
                                        >
                                            <span className="emotion-emoji">{emotion.emoji}</span>
                                            <span>{emotion.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {formData.emotions.length > 0 ? (
                                <div className="selected-emotions-box">
                                    <div className="selected-emotions-title">Selected emotions:</div>
                                    <div className="selected-emotions-list">
                                        {moodCheckinMockData.step3.emotions
                                            .filter((emotion) => formData.emotions.includes(emotion.id))
                                            .map((emotion) => emotion.label)
                                            .join(', ')}
                                    </div>
                                </div>
                            ) : null}

                            <div className="subsection-title with-icon journal-title">
                                <BookOpen size={18} strokeWidth={2.1} className="checkin-title-green" />
                                <span>Journal Entry</span>
                            </div>

                            <p className="journal-subtitle">
                                Write about your day, thoughts, experiences, or anything you'd like to remember
                            </p>

                            <textarea
                                className="checkin-textarea journal"
                                placeholder="Dear Journal, today I..."
                                value={formData.journalEntry}
                                onChange={(e) => updateField('journalEntry', e.target.value)}
                            />

                            <div className="journal-count">
                                {formData.journalEntry.length} characters
                            </div>

                            <div className="checkin-actions">
                                <button
                                    type="button"
                                    className="checkin-secondary-btn"
                                    onClick={() => setStep(2)}
                                >
                                    Back
                                </button>

                                <button
                                    type="button"
                                    className="checkin-primary-btn"
                                    onClick={handleFinalSubmit}
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Saving...' : 'Complete Check-in'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {toast ? (
                <div className={`mood-checkin-toast ${toast.type}`}>
                    <button
                        type="button"
                        className="toast-close-btn"
                        onClick={() => setToast(null)}
                        aria-label="Close notification"
                    >
                        <X size={18} strokeWidth={2.2} />
                    </button>

                    <div className="toast-title">{toast.title}</div>
                    <div className="toast-message">{toast.message}</div>
                </div>
            ) : null}

            <BottomNav navigation={navigation} />
        </div>
    );
}

export default MoodCheckinPage;