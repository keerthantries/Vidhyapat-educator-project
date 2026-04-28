import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    BookOpen, Clock, Users, Calendar, Globe, Monitor,
    MapPin, ExternalLink, Search, X,
    CheckCheck, Timer, Video, Code
} from 'lucide-react'
import { getMyBatches } from '@/services/api/dashboard.api.js'
import './Batches.css'

/* ── Helpers ─────────────────────────────────── */
const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
const fmtTime = (t) => {
    if (!t) return '—'
    const [h, m] = t.split(':')
    const hour = parseInt(h)
    return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
}
const getBatchStatus = (b) => {
    const now = new Date(); now.setHours(0, 0, 0, 0)
    const s = new Date(b.startDate); s.setHours(0, 0, 0, 0)
    const e = new Date(b.endDate); e.setHours(0, 0, 0, 0)
    if (now < s) return 'upcoming'
    if (now > e) return 'completed'
    return 'ongoing'
}
const getDurationDays = (b) => Math.ceil((new Date(b.endDate) - new Date(b.startDate)) / 86400000)

const STATUS_CONFIG = {
    ongoing: { label: 'Ongoing', color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
    upcoming: { label: 'Upcoming', color: 'var(--color-info)', bg: 'var(--color-info-bg)' },
    completed: { label: 'Completed', color: 'var(--color-text-muted)', bg: 'var(--color-border-light)' },
}
const MODE_CONFIG = {
    online: { label: 'Online', color: 'var(--color-info)', bg: 'var(--color-info-bg)', icon: Globe },
    offline: { label: 'Offline', color: 'var(--color-warning)', bg: 'var(--color-warning-bg)', icon: MapPin },
    hybrid: { label: 'Hybrid', color: 'var(--color-success)', bg: 'var(--color-success-bg)', icon: Monitor },
}

/* ── Batch Card ─────────────────────────────── */
function BatchCard({ batch, onClick }) {
    const status = getBatchStatus(batch)
    const fill = batch.capacity ? Math.round((batch.enrollmentCount / batch.capacity) * 100) : 0
    const sc = STATUS_CONFIG[status]
    const mc = MODE_CONFIG[batch.mode] || MODE_CONFIG.online
    const ModeIcon = mc.icon

    return (
        <div className="batch-card card card-hoverable h-100" onClick={onClick}>
            {/* Status stripe */}
            <div className="batch-card-stripe" style={{ background: sc.color }} />

            <div className="card-body d-flex flex-column gap-3">
                {/* Header */}
                <div className="d-flex align-items-start justify-content-between gap-2">
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="fw-semibold text-sm text-truncate mb-1" title={batch.name}>{batch.name}</div>
                        <span className="batch-code">{batch.code || '—'}</span>
                    </div>
                    <span className="badge" style={{ background: sc.bg, color: sc.color, fontSize: 10, whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {sc.label}
                    </span>
                </div>

                {/* Courses */}
                {batch.courseId?.length > 0 &&
                    <div className="d-flex flex-wrap gap-1">
                        {batch.courseId.map(c => (
                            <span key={c._id} className="batch-course-tag">
                                <Code size={9} /> {c.title}
                            </span>
                        ))}
                    </div>
                }

                {/* Date range */}
                <div className="d-flex align-items-center gap-2 text-xs text-muted">
                    <Calendar size={12} strokeWidth={1.8} className="flex-shrink-0" />
                    <span>{fmt(batch.startDate)}</span>
                    <span>→</span>
                    <span>{fmt(batch.endDate)}</span>
                    <span className="ms-auto fw-medium" style={{ color: 'var(--color-text-secondary)' }}>{getDurationDays(batch)}d</span>
                </div>

                {/* Time */}
                <div className="d-flex align-items-center gap-2 text-xs text-muted">
                    <Clock size={12} strokeWidth={1.8} className="flex-shrink-0" />
                    <span>{fmtTime(batch.schedule?.startTime)} – {fmtTime(batch.schedule?.endTime)}</span>
                </div>

                {/* Day pills */}
                {batch.schedule?.daysOfWeek?.length > 0 &&
                    <div className="d-flex gap-1 flex-wrap">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                            const active = batch.schedule.daysOfWeek.includes(day)
                            return <span key={day} className={`batch-day-pill ${active ? 'active' : ''}`}>{day}</span>
                        })}
                    </div>
                }

                {/* Enrollment */}
                <div>
                    <div className="d-flex justify-content-between text-xs text-muted mb-1">
                        <span><Users size={11} className="me-1" />{batch.enrollmentCount} / {batch.capacity} enrolled</span>
                        <span>{fill}%</span>
                    </div>
                    <div className="progress">
                        <div className="progress-bar" style={{ width: `${fill}%` }} />
                    </div>
                </div>

                {/* Footer: mode + join */}
                <div className="d-flex align-items-center justify-content-between mt-auto pt-1">
                    <span className="d-flex align-items-center gap-1 text-xs fw-semibold"
                        style={{ color: mc.color, background: mc.bg, padding: '3px 10px', borderRadius: 20 }}>
                        <ModeIcon size={11} /> {mc.label}
                    </span>
                    {batch.classUrl
                        ? <a
                            href={batch.classUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1"
                            style={{ fontSize: 11, padding: '5px 12px' }}>
                            <Video size={11} strokeWidth={2} /> Join
                        </a>
                        : <span className="text-muted text-xs">No link</span>
                    }
                </div>
            </div>
        </div>
    )
}

/* ── Batch Detail Modal ──────────────────────── */
function BatchDetailModal({ batch, onClose }) {
    if (!batch) return null
    const status = getBatchStatus(batch)
    const fill = batch.capacity ? Math.round((batch.enrollmentCount / batch.capacity) * 100) : 0
    const sc = STATUS_CONFIG[status]
    const mc = MODE_CONFIG[batch.mode] || MODE_CONFIG.online
    const ModeIcon = mc.icon

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 'var(--z-modal)' }} onClick={onClose}>
            <div className="modal-dialog modal-dialog-centered modal-lg" onClick={e => e.stopPropagation()}>
                <div className="modal-content">
                    <div style={{ height: 5, background: sc.color, borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0' }} />

                    <div className="modal-header">
                        <div>
                            <div className="modal-title">{batch.name}</div>
                            <span className="batch-code mt-1 d-inline-block">{batch.code}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2 ms-auto me-3">
                            <span className="badge" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                        </div>
                        <button className="btn-close" onClick={onClose} />
                    </div>

                    <div className="modal-body">
                        <div className="row g-4">
                            <div className="col-md-7">
                                {/* Courses */}
                                {batch.courseId?.length > 0 &&
                                    <div className="mb-4">
                                        <p className="section-label">Courses</p>
                                        <div className="d-flex flex-wrap gap-2">
                                            {batch.courseId.map(c => (
                                                <span key={c._id} className="badge"
                                                    style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', fontSize: 12, padding: '5px 12px' }}>
                                                    {c.title}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                }

                                {/* Schedule */}
                                <div className="mb-4">
                                    <p className="section-label">Schedule</p>
                                    <div className="surface-primary p-3 d-flex flex-column gap-3">
                                        <div className="d-flex align-items-center gap-2 text-sm">
                                            <Calendar size={14} strokeWidth={1.8} className="text-primary flex-shrink-0" />
                                            <span className="fw-medium">{fmt(batch.startDate)}</span>
                                            <span className="text-muted">to</span>
                                            <span className="fw-medium">{fmt(batch.endDate)}</span>
                                            <span className="ms-auto text-muted text-xs">{getDurationDays(batch)} days</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-2 text-sm">
                                            <Clock size={14} strokeWidth={1.8} className="text-primary flex-shrink-0" />
                                            <span className="fw-medium">{fmtTime(batch.schedule?.startTime)}</span>
                                            <span className="text-muted">–</span>
                                            <span className="fw-medium">{fmtTime(batch.schedule?.endTime)}</span>
                                            <span className="ms-auto text-xs text-muted">{batch.schedule?.timeZone}</span>
                                        </div>
                                        {batch.schedule?.daysOfWeek?.length > 0 &&
                                            <div className="d-flex gap-1 flex-wrap">
                                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                                                    const active = batch.schedule.daysOfWeek.includes(day)
                                                    return <span key={day} className={`batch-day-pill ${active ? 'active' : ''}`}>{day}</span>
                                                })}
                                            </div>
                                        }
                                    </div>
                                </div>

                                {/* Join */}
                                {batch.classUrl &&
                                    <div>
                                        <p className="section-label">Class Link</p>
                                        <a href={batch.classUrl} target="_blank" rel="noreferrer"
                                            className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2">
                                            <Video size={13} strokeWidth={2} /> Join Class
                                        </a>
                                    </div>
                                }
                            </div>

                            <div className="col-md-5">
                                <div className="surface-primary p-4 d-flex flex-column gap-4">
                                    <div>
                                        <div className="detail-label">Mode</div>
                                        <div className="d-flex align-items-center gap-2 mt-1">
                                            <ModeIcon size={14} style={{ color: mc.color }} />
                                            <span className="detail-value">{mc.label}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="detail-label">Enrollment</div>
                                        <div className="detail-value mt-1">{batch.enrollmentCount} / {batch.capacity}</div>
                                        <div className="progress mt-2">
                                            <div className="progress-bar" style={{ width: `${fill}%` }} />
                                        </div>
                                        <div className="text-xs text-muted mt-1">{fill}% capacity</div>
                                    </div>
                                    <div>
                                        <div className="detail-label">Status</div>
                                        <span className="badge mt-1" style={{ background: sc.bg, color: sc.color, fontSize: 12 }}>{sc.label}</span>
                                    </div>
                                    <div>
                                        <div className="detail-label">Created</div>
                                        <div className="detail-value">{fmt(batch.createdAt)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ── Batches Page ──────────────────────────── */
export default function Batches() {
    const navigate = useNavigate()
    const { id } = useParams()
    const [batches, setBatches] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [selectedBatch, setSelectedBatch] = useState(null)

    useEffect(() => {
        getMyBatches()
            .then(res => { if (res.success) setBatches(res.data) })
            .catch(err => console.error('Batches error', err))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        if (id && batches.length > 0) {
            const found = batches.find(b => b._id === id)
            if (found) setSelectedBatch(found)
        }
    }, [id, batches])

    if (loading) {
        return <div className="loading-overlay"><div className="spinner-border text-primary" role="status" /></div>
    }

    const counts = {
        all: batches.length,
        ongoing: batches.filter(b => getBatchStatus(b) === 'ongoing').length,
        upcoming: batches.filter(b => getBatchStatus(b) === 'upcoming').length,
        completed: batches.filter(b => getBatchStatus(b) === 'completed').length,
    }

    const filtered = batches
        .filter(b => filter === 'all' || getBatchStatus(b) === filter)
        .filter(b => !search ||
            b.name.toLowerCase().includes(search.toLowerCase()) ||
            b.code?.toLowerCase().includes(search.toLowerCase())
        )

    return (
        <div className="container-lg py-4">

            {/* Header */}
            <div className="page-header d-flex justify-content-between align-items-start flex-wrap gap-3">
                <div>
                    <div className="d-flex align-items-center gap-2 mb-1">

                        <h1 className="page-title mb-0">My Batches</h1>
                    </div>
                    <p className="page-subtitle">{batches.length} total batches</p>
                </div>
            </div>

            {/* Filter + Search bar */}
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
                <div className="d-flex gap-2 flex-wrap">
                    {['all', 'ongoing', 'upcoming', 'completed'].map(f => (
                        <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}>
                            {f} ({counts[f]})
                        </button>
                    ))}
                </div>
                <div style={{ position: 'relative', minWidth: 240 }}>
                    <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                    <input
                        type="text"
                        className="form-control text-sm"
                        placeholder="Search name or code…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: 34, paddingRight: search ? 34 : 14 }}
                    />
                    {search && (
                        <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 0 }}>
                            <X size={13} />
                        </button>
                    )}
                </div>
            </div>

            {/* Grid */}
            {filtered.length === 0
                ? <div className="empty-state">
                    <div className="empty-state-icon"><BookOpen size={48} strokeWidth={1.2} /></div>
                    <div className="empty-state-title">No batches found</div>
                    <div className="empty-state-text">Try a different filter or search term.</div>
                </div>
                : <div className="row g-4">
                    {filtered.map(b => (
                        <div key={b._id} className="col-12 col-md-6 col-xl-4">
                            <BatchCard batch={b} onClick={() => setSelectedBatch(b)} />
                        </div>
                    ))}
                </div>
            }

            {/* Modal */}
            {selectedBatch &&
                <BatchDetailModal
                    batch={selectedBatch}
                    onClose={() => { setSelectedBatch(null); if (id) navigate('/batches') }}
                />
            }
        </div>
    )
}