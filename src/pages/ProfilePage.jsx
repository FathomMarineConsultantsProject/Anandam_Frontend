import { useEffect, useMemo, useState } from 'react';
import AppHeader from '../components/layout/AppHeader';
import BottomNav from '../components/layout/BottomNav';
import { homePageMockData } from '../data/homeData';
import { getProfile, updateProfile } from '../api/profileApi';

function getInitials(fullName = '') {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U';
}

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    rank: '',
    vessel: '',
    contactNumber: '',
    emergencyContact: '',
    homeCountry: '',
    contractStart: '',
    contractEnd: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError('');
        const data = await getProfile();
        setProfile(data);
        setForm({
          rank: data?.rank || '',
          vessel: data?.vessel || '',
          contactNumber: data?.contactNumber || '',
          emergencyContact: data?.emergencyContact || '',
          homeCountry: data?.homeCountry || '',
          contractStart: data?.contractStart ? String(data.contractStart).slice(0, 10) : '',
          contractEnd: data?.contractEnd ? String(data.contractEnd).slice(0, 10) : '',
        });
      } catch (err) {
        console.error('Failed to load profile', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');
      setMessage('');

      const updated = await updateProfile({
        rank: form.rank || null,
        vessel: form.vessel || null,
        contactNumber: form.contactNumber || null,
        emergencyContact: form.emergencyContact || null,
        homeCountry: form.homeCountry || null,
        contractStart: form.contractStart || null,
        contractEnd: form.contractEnd || null,
      });

      setProfile(updated);
      setMessage('Profile updated successfully.');
    } catch (err) {
      console.error('Failed to update profile', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  const headerData = useMemo(() => {
    return {
      ...homePageMockData.header,
      userInitials: getInitials(profile?.fullName || ''),
      fullName: profile?.fullName || '',
    };
  }, [profile]);

  if (loading) {
    return (
      <div className="app-shell">
        <AppHeader header={headerData} />
        <main className="page-content">
          <div style={{ padding: '24px', color: '#475569' }}>Loading profile...</div>
        </main>
        <BottomNav navigation={homePageMockData.navigation} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <AppHeader header={headerData} />

      <main className="page-content">
        <section
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            background: '#fff',
            border: '1px solid #dbe4ee',
            borderRadius: '20px',
            padding: '24px',
          }}
        >
          <h1 style={{ marginBottom: '8px', color: '#0f172a' }}>My Profile</h1>
          <p style={{ marginBottom: '24px', color: '#64748b' }}>
            Keep your maritime and contact details up to date.
          </p>

          {error ? (
            <div
              style={{
                marginBottom: '16px',
                padding: '12px 14px',
                borderRadius: '12px',
                background: '#fff4f4',
                color: '#b42318',
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          ) : null}

          {message ? (
            <div
              style={{
                marginBottom: '16px',
                padding: '12px 14px',
                borderRadius: '12px',
                background: '#eefbf3',
                color: '#067647',
                fontWeight: 500,
              }}
            >
              {message}
            </div>
          ) : null}

          <div
            style={{
              display: 'grid',
              gap: '16px',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              marginBottom: '24px',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Full Name</div>
              <div style={{ fontWeight: 600, color: '#0f172a' }}>{profile?.fullName || '-'}</div>
            </div>

            <div>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Email</div>
              <div style={{ fontWeight: 600, color: '#0f172a' }}>{profile?.email || '-'}</div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: 'grid',
                gap: '16px',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              }}
            >
              <label style={{ display: 'grid', gap: '8px' }}>
                <span>Rank</span>
                <input name="rank" value={form.rank} onChange={handleChange} className="pd-input" />
              </label>

              <label style={{ display: 'grid', gap: '8px' }}>
                <span>Vessel</span>
                <input name="vessel" value={form.vessel} onChange={handleChange} className="pd-input" />
              </label>

              <label style={{ display: 'grid', gap: '8px' }}>
                <span>Contact Number</span>
                <input name="contactNumber" value={form.contactNumber} onChange={handleChange} className="pd-input" />
              </label>

              <label style={{ display: 'grid', gap: '8px' }}>
                <span>Emergency Contact</span>
                <input name="emergencyContact" value={form.emergencyContact} onChange={handleChange} className="pd-input" />
              </label>

              <label style={{ display: 'grid', gap: '8px' }}>
                <span>Home Country</span>
                <input name="homeCountry" value={form.homeCountry} onChange={handleChange} className="pd-input" />
              </label>

              <label style={{ display: 'grid', gap: '8px' }}>
                <span>Contract Start</span>
                <input name="contractStart" type="date" value={form.contractStart} onChange={handleChange} className="pd-input" />
              </label>

              <label style={{ display: 'grid', gap: '8px' }}>
                <span>Contract End</span>
                <input name="contractEnd" type="date" value={form.contractEnd} onChange={handleChange} className="pd-input" />
              </label>
            </div>

            <div style={{ marginTop: '24px' }}>
              <button type="submit" className="mood-submit-button" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </section>
      </main>

      <BottomNav navigation={homePageMockData.navigation} />
    </div>
  );
}

export default ProfilePage;