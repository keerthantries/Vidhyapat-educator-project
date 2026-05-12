/**
 * Onboarding.jsx — Post-signup educator verification wizard
 * Steps: 1. Complete Profile  2. Upload Documents  3. Set Availability
 * Location: src/pages/onboarding/Onboarding.jsx
 *
 * Redirects to /dashboard after completion.
 * Also accessible from profile if incomplete.
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    UserCircle2, FolderOpen, CalendarCheck,
    CheckCircle2, ArrowRight, ArrowLeft,
    UploadCloud, FileText, Trash2, Plus, X,
    Clock, CalendarDays, Loader2
} from 'lucide-react'
import { updateEducatorProfile, createAvailability } from '@/services/api/educator.api'
import { uploadDocument } from '@/services/profile.service'
import './Onboarding.css'

/* ── Step config ──────────────────────────────── */
const STEPS = [
    { id: 1, label: 'Complete Profile', icon: UserCircle2 },
    { id: 2, label: 'Upload Documents', icon: FolderOpen },
    { id: 3, label: 'Set Availability', icon: CalendarCheck },
]

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const DOC_TYPES = [
    { value: 'resume', label: 'Resume / CV' },
    { value: 'certificate', label: 'Certificate' },
    { value: 'id_proof', label: 'ID Proof' },
    { value: 'other', label: 'Other' },
]

/* ── Step indicator ────────────────────────────── */
function StepBar({ current }) {
    return (
        <div className="ob-step-bar">
            {STEPS.map((s, i) => {
                const done = s.id < current
                const active = s.id === current
                const Icon = s.icon
                return (
                    <React.Fragment key={s.id}>
                        <div className={`ob-step ${active ? 'ob-step--active' : ''} ${done ? 'ob-step--done' : ''}`}>
                            <div className="ob-step-circle">
                                {done ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                            </div>
                            <span className="ob-step-label">{s.label}</span>
                        </div>
                        {i < STEPS.length - 1 && <div className={`ob-step-line ${done ? 'ob-step-line--done' : ''}`} />}
                    </React.Fragment>
                )
            })}
        </div>
    )
}

/* ══ STEP 1: Complete Profile ══════════════════ */
function StepProfile({ onNext }) {
    const [form, setForm] = useState({
        title: '',
        bio: '',
        highestQualification: '',
        yearsOfExperience: '',
        expertiseAreas: '',
        languages: '',
        linkedinUrl: '',
        portfolioUrl: '',
        workType: 'fullTime',
    })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

    const handleSubmit = async () => {
        if (!form.title.trim() || !form.bio.trim()) {
            setError('Title and Bio are required.')
            return
        }
        setSaving(true)
        setError('')
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
            onNext()
        } catch (err) {
            setError(err?.message || 'Failed to save profile. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="ob-card">
            <div className="ob-card-header">
                <UserCircle2 size={20} className="text-primary" />
                <div>
                    <h4 className="ob-card-title">Complete Your Profile</h4>
                    <p className="ob-card-sub">Help learners know who you are. All fields marked * are required.</p>
                </div>
            </div>

            {error && <div className="alert alert-danger py-2 mb-4 text-sm">{error}</div>}

            <div className="row g-3">
                <div className="col-md-8">
                    <label className="form-label">Professional Title *</label>
                    <input className="form-control" placeholder="e.g. Senior Math Educator" value={form.title}
                        onChange={e => set('title', e.target.value)} />
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
                    <textarea className="form-control" rows="3"
                        placeholder="Describe your teaching background, expertise and what you bring to learners..."
                        value={form.bio} onChange={e => set('bio', e.target.value)} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Highest Qualification</label>
                    <input className="form-control" placeholder="e.g. PhD in Mathematics" value={form.highestQualification}
                        onChange={e => set('highestQualification', e.target.value)} />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Years of Experience</label>
                    <input className="form-control" type="number" placeholder="10" value={form.yearsOfExperience}
                        onChange={e => set('yearsOfExperience', e.target.value)} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Expertise Areas <span className="text-muted fw-normal">(comma separated)</span></label>
                    <input className="form-control" placeholder="Calculus, Algebra, Statistics" value={form.expertiseAreas}
                        onChange={e => set('expertiseAreas', e.target.value)} />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Languages <span className="text-muted fw-normal">(comma separated)</span></label>
                    <input className="form-control" placeholder="English, Hindi" value={form.languages}
                        onChange={e => set('languages', e.target.value)} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">LinkedIn URL</label>
                    <input className="form-control" placeholder="https://linkedin.com/in/yourprofile" value={form.linkedinUrl}
                        onChange={e => set('linkedinUrl', e.target.value)} />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Portfolio URL</label>
                    <input className="form-control" placeholder="https://yoursite.com" value={form.portfolioUrl}
                        onChange={e => set('portfolioUrl', e.target.value)} />
                </div>
            </div>

            <div className="ob-actions">
                <div />
                <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                    {saving ? <><Loader2 size={15} className="ob-spin" /> Saving…</> : <>Continue <ArrowRight size={15} /></>}
                </button>
            </div>
        </div>
    )
}

/* ══ STEP 2: Upload Documents ══════════════════ */
function StepDocuments({ onNext, onBack }) {
    const [uploaded, setUploaded] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [file, setFile] = useState(null)
    const [title, setTitle] = useState('')
    const [docType, setDocType] = useState('resume')
    const [description, setDesc] = useState('')
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')

    const resetForm = () => { setFile(null); setTitle(''); setDocType('resume'); setDesc('') }

    const handleUpload = async () => {
        if (!file || !title.trim()) { setError('Title and file are required.'); return }
        setError('')
        setUploading(true)
        const fd = new FormData()
        fd.append('file', file)
        fd.append('title', title.trim())
        fd.append('type', docType)
        fd.append('description', description.trim())
        try {
            const res = await uploadDocument(fd)
            if (res.success) {
                setUploaded(p => [...p, { ...res.data, _id: res.data._id || res.data.id || Date.now() }])
                setShowForm(false)
                resetForm()
            }
        } catch (err) {
            setError(err?.message || 'Upload failed. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="ob-card">
            <div className="ob-card-header">
                <FolderOpen size={20} className="text-primary" />
                <div>
                    <h4 className="ob-card-title">Upload Your Credentials</h4>
                    <p className="ob-card-sub">Upload your resume, certificates, and ID proof for verification. You can skip and do this later from your profile.</p>
                </div>
            </div>

            {error && <div className="alert alert-danger py-2 mb-3 text-sm">{error}</div>}

            {/* Uploaded docs list */}
            {uploaded.length > 0 && (
                <div className="ob-doc-list mb-4">
                    {uploaded.map(doc => (
                        <div key={doc._id} className="ob-doc-item">
                            <div className="ob-doc-icon"><FileText size={16} /></div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="fw-semibold text-sm text-truncate">{doc.title}</div>
                                <div className="text-xs text-muted mt-1">{doc.type}</div>
                            </div>
                            <span className="badge" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                                <CheckCircle2 size={10} className="me-1" />Uploaded
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Add document form */}
            {showForm ? (
                <div className="ob-upload-form">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="fw-semibold text-sm">Add Document</span>
                        <button className="btn-close btn-sm" onClick={() => { setShowForm(false); resetForm(); setError('') }} />
                    </div>

                    <div className="row g-3">
                        <div className="col-md-7">
                            <label className="form-label">Document Title *</label>
                            <input className="form-control" placeholder="My Resume" value={title}
                                onChange={e => setTitle(e.target.value)} />
                        </div>
                        <div className="col-md-5">
                            <label className="form-label">Document Type</label>
                            <select className="form-select" value={docType} onChange={e => setDocType(e.target.value)}>
                                {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                        <div className="col-12">
                            <label className="form-label">Description</label>
                            <textarea className="form-control" rows="2" placeholder="Brief description…"
                                value={description} onChange={e => setDesc(e.target.value)} />
                        </div>
                        <div className="col-12">
                            <label className="form-label">File *</label>
                            <div className="ob-file-drop">
                                <input type="file" id="ob-file" className="d-none"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />
                                <label htmlFor="ob-file" className="ob-file-label">
                                    <UploadCloud size={24} />
                                    <span>{file ? file.name : 'Click to choose file'}</span>
                                    <small className="text-muted">PDF, DOC, DOCX, JPG, PNG</small>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-3">
                        <button className="btn btn-outline-secondary" onClick={() => { setShowForm(false); resetForm(); setError('') }}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleUpload} disabled={!file || !title.trim() || uploading}>
                            {uploading ? <><Loader2 size={14} className="ob-spin" /> Uploading…</> : <><UploadCloud size={14} /> Upload</>}
                        </button>
                    </div>
                </div>
            ) : (
                <button className="ob-add-doc-btn" onClick={() => setShowForm(true)}>
                    <Plus size={16} /> Add Document
                </button>
            )}

            <div className="ob-actions">
                <button className="btn btn-outline-secondary" onClick={onBack}><ArrowLeft size={15} /> Back</button>
                <button className="btn btn-primary" onClick={onNext}>
                    {uploaded.length === 0 ? 'Skip for now' : 'Continue'} <ArrowRight size={15} />
                </button>
            </div>
        </div>
    )
}

/* ══ STEP 3: Set Availability ══════════════════ */
function StepAvailability({ onNext, onBack }) {
    const [slots, setSlots] = useState([{ days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], startTime: '09:00', endTime: '13:00' }])
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const addSlot = () => setSlots(p => [...p, { days: ['Mon'], startTime: '09:00', endTime: '13:00' }])
    const removeSlot = (i) => setSlots(p => p.filter((_, idx) => idx !== i))
    const updateSlot = (i, k, v) => setSlots(p => p.map((s, idx) => idx === i ? { ...s, [k]: v } : s))
    const toggleDay = (slotIdx, day) => setSlots(p => p.map((s, idx) => {
        if (idx !== slotIdx) return s
        const days = s.days.includes(day) ? s.days.filter(d => d !== day) : [...s.days, day]
        return { ...s, days }
    }))

    const handleSave = async () => {
        for (const s of slots) {
            if (s.days.length === 0) { setError('Each slot must have at least one day selected.'); return }
            if (!s.startTime || !s.endTime) { setError('Start and end time are required.'); return }
        }
        setError('')
        setSaving(true)
        try {
            await Promise.all(slots.map(s => createAvailability({
                daysOfWeek: s.days,
                startTime: s.startTime,
                endTime: s.endTime,
            })))
            onNext()
        } catch (err) {
            setError(err?.message || 'Failed to save availability.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="ob-card">
            <div className="ob-card-header">
                <CalendarCheck size={20} className="text-primary" />
                <div>
                    <h4 className="ob-card-title">Set Your Availability</h4>
                    <p className="ob-card-sub">Tell learners and admins when you're available to teach. You can update this anytime.</p>
                </div>
            </div>

            {error && <div className="alert alert-danger py-2 mb-3 text-sm">{error}</div>}

            <div className="d-flex flex-column gap-4">
                {slots.map((slot, i) => (
                    <div key={i} className="ob-avail-slot">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="fw-semibold text-sm" style={{ color: 'var(--color-primary)' }}>Slot {i + 1}</span>
                            {slots.length > 1 && (
                                <button className="btn btn-sm btn-outline-danger" onClick={() => removeSlot(i)}>
                                    <X size={12} /> Remove
                                </button>
                            )}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Days of Week</label>
                            <div className="d-flex gap-2 flex-wrap">
                                {DAYS_OF_WEEK.map(day => (
                                    <button key={day}
                                        className={`ob-day-pill ${slot.days.includes(day) ? 'ob-day-pill--active' : ''}`}
                                        onClick={() => toggleDay(i, day)}>
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label"><Clock size={12} className="me-1" />Start Time</label>
                                <input type="time" className="form-control" value={slot.startTime}
                                    onChange={e => updateSlot(i, 'startTime', e.target.value)} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label"><Clock size={12} className="me-1" />End Time</label>
                                <input type="time" className="form-control" value={slot.endTime}
                                    onChange={e => updateSlot(i, 'endTime', e.target.value)} />
                            </div>
                        </div>
                    </div>
                ))}

                <button className="ob-add-slot-btn" onClick={addSlot}>
                    <Plus size={15} /> Add Another Slot
                </button>
            </div>

            <div className="ob-actions">
                <button className="btn btn-outline-secondary" onClick={onBack}><ArrowLeft size={15} /> Back</button>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary" onClick={onNext}>Skip</button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? <><Loader2 size={14} className="ob-spin" /> Saving…</> : <>Finish Setup <CheckCircle2 size={15} /></>}
                    </button>
                </div>
            </div>
        </div>
    )
}

/* ══ DONE screen ═══════════════════════════════ */
function StepDone({ onGo }) {
    return (
        <div className="ob-card ob-done">
            <div className="ob-done-icon"><CheckCircle2 size={52} /></div>
            <h3 className="ob-done-title">You're all set! 🎉</h3>
            <p className="ob-done-sub">Your profile is submitted for verification. You can now explore your dashboard, manage batches, and start teaching.</p>
            <button className="btn btn-primary btn-lg" onClick={onGo}>
                Go to Dashboard <ArrowRight size={16} />
            </button>
        </div>
    )
}

/* ══ Main Onboarding Page ══════════════════════ */
export default function Onboarding() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)

    const next = () => setStep(p => Math.min(p + 1, 4))
    const back = () => setStep(p => Math.max(p - 1, 1))

    return (
        <div className="ob-root">
            {/* Brand */}
            <div className="ob-brand">
                <img
                    src="https://res.cloudinary.com/doqbjnliq/image/upload/logoblue2_t5elbf.png"
                    alt="Vidhyapat"
                    style={{ height: 44, objectFit: 'contain' }}
                />
            </div>

            <div className="ob-inner">
                <div className="ob-header">
                    <h2 className="ob-main-title">Finish your educator setup</h2>
                    <p className="ob-main-sub">Complete these steps to activate your account and get verified.</p>
                </div>

                {step < 4 && <StepBar current={step} />}

                <div className="ob-content">
                    {step === 1 && <StepProfile onNext={next} />}
                    {step === 2 && <StepDocuments onNext={next} onBack={back} />}
                    {step === 3 && <StepAvailability onNext={next} onBack={back} />}
                    {step === 4 && <StepDone onGo={() => navigate('/dashboard')} />}
                </div>
            </div>
        </div>
    )
}