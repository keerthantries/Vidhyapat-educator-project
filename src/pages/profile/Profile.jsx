/**
 * Profile.jsx — Educator Profile Page
 * Tabs: Overview | Edit Profile | Availability | Documents
 * Location: src/pages/profile/Profile.jsx
 */

import React, { useState, useEffect } from 'react'
import {
  Mail, GraduationCap, Briefcase, Globe, ExternalLink,
  CheckCircle, AlertCircle, ShieldCheck, Languages,
  BadgeCheck, FolderOpen, Edit3, CalendarCheck,
  Plus, X, Clock, Loader2, Trash2, Save
} from 'lucide-react'
import { getDashboardSummary } from '@/services/profile.service'
import {
  getEducatorProfile, updateEducatorProfile,
  getAvailability, createAvailability, updateAvailability, deleteAvailability
} from '@/services/api/educator.api'
import DocumentManager from './components/DocumentManager'
import './Profile.css'

/* ── helpers ──────────────────────────────────── */
const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function InfoTile({ icon: Icon, label, value }) {
  if (!value && value !== 0) return null
  return (
    <div className="profile-info-tile">
      <div className="profile-info-icon"><Icon size={15} strokeWidth={1.8} /></div>
      <div>
        <div className="detail-label">{label}</div>
        <div className="detail-value mt-1">{value}</div>
      </div>
    </div>
  )
}

/* ── Tab pills ────────────────────────────────── */
function TabBar({ active, onChange }) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BadgeCheck },
    { id: 'edit', label: 'Edit Profile', icon: Edit3 },
    { id: 'availability', label: 'Availability', icon: CalendarCheck },
    { id: 'documents', label: 'Documents', icon: FolderOpen },
  ]
  return (
    <div className="profile-tab-bar">
      {tabs.map(t => {
        const Icon = t.icon
        return (
          <button key={t.id}
            className={`profile-tab ${active === t.id ? 'profile-tab--active' : ''}`}
            onClick={() => onChange(t.id)}>
            <Icon size={14} strokeWidth={1.8} />
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

/* ── Overview tab ─────────────────────────────── */
function OverviewTab({ profileData }) {
  const { name, email, verificationStatus, educatorProfile: ep = {} } = profileData
  const initial = name?.charAt(0).toUpperCase() || 'E'
  const isVerified = verificationStatus === 'approved'

  return (
    <>
      <div className="profile-top-grid">
        <div className="profile-identity-panel">
          <div className="profile-avatar-xl">{initial}</div>
          <div className="profile-identity-content">
            <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
              <h2 className="page-title mb-0">{name}</h2>
              {isVerified
                ? <span className="badge bg-success d-flex align-items-center gap-1"><CheckCircle size={11} /> Verified</span>
                : <span className="badge bg-warning d-flex align-items-center gap-1"><AlertCircle size={11} /> Pending</span>}
            </div>
            <p className="page-subtitle mb-3">{ep.title || 'Professional Educator'}</p>
            <div className="profile-link-row">
              {ep.linkedinUrl && (
                <a href={ep.linkedinUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary">
                  <Globe size={13} /> LinkedIn
                </a>
              )}
              {ep.portfolioUrl && (
                <a href={ep.portfolioUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-secondary">
                  <ExternalLink size={13} /> Portfolio
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="profile-status-panel">
          <div className="profile-mini-stat">
            <ShieldCheck size={16} />
            <div>
              <div className="detail-label">Verification</div>
              <div className="detail-value">{isVerified ? 'Approved Profile' : 'Under Review'}</div>
            </div>
          </div>
          <div className="profile-mini-stat">
            <BadgeCheck size={16} />
            <div>
              <div className="detail-label">Experience</div>
              <div className="detail-value">{ep.yearsOfExperience ? `${ep.yearsOfExperience} Years` : 'Not Added'}</div>
            </div>
          </div>
          <div className="profile-mini-stat">
            <FolderOpen size={16} />
            <div>
              <div className="detail-label">Documents</div>
              <div className="detail-value">Credential Vault Active</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-1">
        <div className="col-lg-6">
          <div className="profile-surface-card h-100">
            <div className="section-label">About Educator</div>
            <p className="profile-bio-text">{ep.bio || 'No educator biography added yet.'}</p>
            {ep.expertiseAreas?.length > 0 && (
              <div className="mt-4">
                <div className="section-label">Expertise Areas</div>
                <div className="d-flex flex-wrap gap-2">
                  {ep.expertiseAreas.map((item, i) => <span key={i} className="profile-chip">{item}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="col-lg-6">
          <div className="profile-surface-card h-100">
            <div className="section-label">Professional Details</div>
            <div className="d-flex flex-column gap-4">
              <InfoTile icon={Mail} label="Email Address" value={email} />
              <InfoTile icon={GraduationCap} label="Highest Qualification" value={ep.highestQualification} />
              <InfoTile icon={Briefcase} label="Work Type" value={ep.workType || 'Not Specified'} />
              {ep.languages?.length > 0 && (
                <InfoTile icon={Languages} label="Languages" value={ep.languages.join(', ')} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Edit Profile tab ─────────────────────────── */
function EditProfileTab({ profileData, onSaved }) {
  const ep = profileData?.educatorProfile || {}
  const [form, setForm] = useState({
    title: ep.title || '',
    bio: ep.bio || '',
    highestQualification: ep.highestQualification || '',
    yearsOfExperience: ep.yearsOfExperience || '',
    expertiseAreas: (ep.expertiseAreas || []).join(', '),
    languages: (ep.languages || []).join(', '),
    linkedinUrl: ep.linkedinUrl || '',
    portfolioUrl: ep.portfolioUrl || '',
    workType: ep.workType || 'fullTime',
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setSuccess(false) }

  const handleSave = async () => {
    if (!form.title.trim() || !form.bio.trim()) { setError('Title and Bio are required.'); return }
    setError(''); setSaving(true); setSuccess(false)
    try {
      await updateEducatorProfile({
        educatorProfile: {
          title: form.title.trim(),
          bio: form.bio.trim(),
          highestQualification: form.highestQualification.trim(),
          yearsOfExperience: parseInt(form.yearsOfExperience) || 0,
          expertiseAreas: form.expertiseAreas.split(',').map(s => s.trim()).filter(Boolean),
          languages: form.languages.split(',').map(s => s.trim()).filter(Boolean),
          linkedinUrl: form.linkedinUrl.trim(),
          portfolioUrl: form.portfolioUrl.trim(),
          workType: form.workType,
        },
      })
      setSuccess(true)
      onSaved?.()
    } catch (err) {
      setError(err?.message || 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="profile-surface-card">
      <div className="section-label mb-4">Edit Educator Profile</div>

      {error && <div className="alert alert-danger py-2 mb-4 text-sm">{error}</div>}
      {success && <div className="alert alert-success py-2 mb-4 text-sm"><CheckCircle size={14} /> Profile updated successfully.</div>}

      <div className="row g-3">
        <div className="col-md-8">
          <label className="form-label">Professional Title *</label>
          <input className="form-control" value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="e.g. Senior Math Educator" />
        </div>
        <div className="col-md-4">
          <label className="form-label">Work Type</label>
          <select className="form-select" value={form.workType} onChange={e => set('workType', e.target.value)}>
            <option value="fullTime">Full-Time</option>
            <option value="partTime">Part-Time</option>
            <option value="freelance">Freelance</option>
            <option value="contract">Contract</option>
          </select>
        </div>

        <div className="col-12">
          <label className="form-label">Professional Bio *</label>
          <textarea className="form-control" rows="4" value={form.bio}
            onChange={e => set('bio', e.target.value)}
            placeholder="Describe your teaching background..." />
        </div>

        <div className="col-md-6">
          <label className="form-label">Highest Qualification</label>
          <input className="form-control" value={form.highestQualification}
            onChange={e => set('highestQualification', e.target.value)}
            placeholder="e.g. PhD in Mathematics" />
        </div>
        <div className="col-md-6">
          <label className="form-label">Years of Experience</label>
          <input className="form-control" type="number" value={form.yearsOfExperience}
            onChange={e => set('yearsOfExperience', e.target.value)} placeholder="10" />
        </div>

        <div className="col-md-6">
          <label className="form-label">Expertise Areas <span className="text-muted fw-normal">(comma separated)</span></label>
          <input className="form-control" value={form.expertiseAreas}
            onChange={e => set('expertiseAreas', e.target.value)}
            placeholder="Calculus, Algebra, Statistics" />
        </div>
        <div className="col-md-6">
          <label className="form-label">Languages <span className="text-muted fw-normal">(comma separated)</span></label>
          <input className="form-control" value={form.languages}
            onChange={e => set('languages', e.target.value)}
            placeholder="English, Hindi" />
        </div>

        <div className="col-md-6">
          <label className="form-label">LinkedIn URL</label>
          <input className="form-control" value={form.linkedinUrl}
            onChange={e => set('linkedinUrl', e.target.value)}
            placeholder="https://linkedin.com/in/yourprofile" />
        </div>
        <div className="col-md-6">
          <label className="form-label">Portfolio URL</label>
          <input className="form-control" value={form.portfolioUrl}
            onChange={e => set('portfolioUrl', e.target.value)}
            placeholder="https://yoursite.com" />
        </div>
      </div>

      <div className="d-flex justify-content-end mt-5">
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 size={14} className="ob-spin" /> Saving…</> : <><Save size={14} /> Save Changes</>}
        </button>
      </div>
    </div>
  )
}

/* ── Availability tab ─────────────────────────── */
function AvailabilityTab() {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editSlot, setEditSlot] = useState(null) // { id, data }
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({ days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], startTime: '09:00', endTime: '13:00' })

  const fmtTime = t => {
    if (!t) return '—'
    const [h, m] = t.split(':')
    const hour = parseInt(h)
    return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
  }

  const fetchSlots = async () => {
    setLoading(true)
    try {
      const res = await getAvailability()
      if (res.success) setSlots(Array.isArray(res.data) ? res.data : res.data ? [res.data] : [])
    } catch { /* no slots yet */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchSlots() }, [])

  const toggleDay = (day) => setForm(p => ({
    ...p,
    days: p.days.includes(day) ? p.days.filter(d => d !== day) : [...p.days, day]
  }))

  const openCreate = () => {
    setEditSlot(null)
    setForm({ days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], startTime: '09:00', endTime: '13:00' })
    setError(''); setSuccess('')
    setShowForm(true)
  }

  const openEdit = (slot) => {
    setEditSlot(slot)
    setForm({ days: [...slot.daysOfWeek], startTime: slot.startTime, endTime: slot.endTime })
    setError(''); setSuccess('')
    setShowForm(true)
  }

  const handleSave = async () => {
    if (form.days.length === 0) { setError('Select at least one day.'); return }
    if (!form.startTime || !form.endTime) { setError('Start and end time required.'); return }
    setError(''); setSaving(true)
    try {
      if (editSlot) {
        await updateAvailability(editSlot._id, { startTime: form.startTime, endTime: form.endTime, daysOfWeek: form.days })
        setSuccess('Availability updated.')
      } else {
        await createAvailability({ daysOfWeek: form.days, startTime: form.startTime, endTime: form.endTime })
        setSuccess('Availability added.')
      }
      setShowForm(false)
      fetchSlots()
    } catch (err) {
      setError(err?.message || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this availability slot?')) return
    try {
      await deleteAvailability(id)
      setSuccess('Slot removed.')
      fetchSlots()
    } catch {
      setError('Failed to delete.')
    }
  }

  if (loading) return <div className="loading-overlay"><div className="spinner-border text-primary" /></div>

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="page-title mb-1">Teaching Availability</h3>
          <p className="page-subtitle mb-0">Define when you're available to teach. Admins use this for scheduling.</p>
        </div>
        {!showForm && (
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={15} /> Add Slot
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger  py-2 mb-4 text-sm">{error}</div>}
      {success && <div className="alert alert-success py-2 mb-4 text-sm"><CheckCircle size={14} /> {success}</div>}

      {showForm && (
        <div className="profile-surface-card mb-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <span className="fw-semibold">{editSlot ? 'Edit Slot' : 'New Availability Slot'}</span>
            <button className="btn-close" onClick={() => setShowForm(false)} />
          </div>

          <div className="mb-3">
            <label className="form-label">Days of Week</label>
            <div className="d-flex gap-2 flex-wrap">
              {DAYS_OF_WEEK.map(day => (
                <button key={day}
                  className={`ob-day-pill ${form.days.includes(day) ? 'ob-day-pill--active' : ''}`}
                  onClick={() => toggleDay(day)}>
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label"><Clock size={12} className="me-1" />Start Time</label>
              <input type="time" className="form-control" value={form.startTime}
                onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} />
            </div>
            <div className="col-md-6">
              <label className="form-label"><Clock size={12} className="me-1" />End Time</label>
              <input type="time" className="form-control" value={form.endTime}
                onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button className="btn btn-outline-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 size={14} className="ob-spin" /> Saving…</> : <><Save size={14} /> {editSlot ? 'Update' : 'Add Slot'}</>}
            </button>
          </div>
        </div>
      )}

      {slots.length === 0 && !showForm ? (
        <div className="empty-state py-10">
          <div className="empty-state-icon"><CalendarCheck size={40} strokeWidth={1.2} /></div>
          <div className="empty-state-title">No availability set</div>
          <div className="empty-state-text">Click "Add Slot" to define your teaching hours.</div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {slots.map(slot => (
            <div key={slot._id} className="avail-slot-item">
              <div className="avail-slot-days">
                {DAYS_OF_WEEK.map(day => (
                  <span key={day} className={`ob-day-pill ${slot.daysOfWeek.includes(day) ? 'ob-day-pill--active' : ''}`}
                    style={{ cursor: 'default' }}>
                    {day}
                  </span>
                ))}
              </div>
              <div className="avail-slot-time">
                <Clock size={14} className="text-muted" />
                <span className="fw-semibold text-sm">{fmtTime(slot.startTime)} – {fmtTime(slot.endTime)}</span>
                <span className="text-xs text-muted">{slot.timeZone}</span>
                {slot.active && <span className="badge" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>Active</span>}
              </div>
              <div className="avail-slot-actions">
                <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(slot)}>
                  <Edit3 size={12} /> Edit
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(slot._id)}>
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ══ Main Profile Page ══════════════════════════ */
export default function Profile() {
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')

  const fetchProfile = async () => {
    try {
      const res = await getEducatorProfile()
      if (res.success && res.data) setProfileData(res.data)
    } catch {
      // fallback to dashboard summary
      try {
        const res2 = await getDashboardSummary()
        if (res2.success && res2.data?.profile) setProfileData(res2.data.profile)
      } catch (err) {
        console.error('Failed to fetch profile', err)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProfile() }, [])

  if (loading) return <div className="loading-overlay"><div className="spinner-border text-primary" role="status" /></div>

  if (!profileData) {
    return (
      <div className="container-lg py-4">
        <div className="alert alert-warning">Failed to load profile. Please refresh.</div>
      </div>
    )
  }

  return (
    <div className="container-lg py-4">
      <div className="profile-shell card mb-4">
        <div className="card-body">
          <TabBar active={tab} onChange={setTab} />

          <div className="mt-4">
            {tab === 'overview' && <OverviewTab profileData={profileData} />}
            {tab === 'edit' && <EditProfileTab profileData={profileData} onSaved={fetchProfile} />}
            {tab === 'availability' && <AvailabilityTab />}
            {tab === 'documents' && <DocumentManager />}
          </div>
        </div>
      </div>
    </div>
  )
}