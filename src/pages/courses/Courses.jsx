/**
 * Courses.jsx — Educator My Courses Page
 * Lists all courses. Click a card → detail modal.
 * Location: src/pages/courses/Courses.jsx
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
    BookOpen, Search, X, ChevronLeft, ChevronRight,
    Tag, Clock, Users, Globe, Layers, Star,
    ExternalLink, PlayCircle, TrendingUp, CheckCircle2
} from 'lucide-react'
import { getMyCourses, getCourseById } from '@/services/api/educator.api'
import './Courses.css'

/* ── Helpers ──────────────────────────────────── */
const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

const LEVEL_CONFIG = {
    beginner: { label: 'Beginner', color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
    intermediate: { label: 'Intermediate', color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
    advanced: { label: 'Advanced', color: 'var(--color-danger)', bg: 'var(--color-danger-bg)' },
    'all-levels': { label: 'All Levels', color: 'var(--color-info)', bg: 'var(--color-info-bg)' },
}

const STATUS_CONFIG = {
    published: { label: 'Published', color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
    draft: { label: 'Draft', color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
    archived: { label: 'Archived', color: 'var(--color-text-muted)', bg: 'var(--color-border-light)' },
}

const formatPrice = (price, currency) => {
    if (!price || price === 0) return 'Free'
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency || 'INR', maximumFractionDigits: 0 }).format(price)
}

/* ── Course Card ──────────────────────────────── */
function CourseCard({ course, onClick }) {
    const level = LEVEL_CONFIG[course.level] || LEVEL_CONFIG['all-levels']
    const status = STATUS_CONFIG[course.status] || STATUS_CONFIG.draft

    return (
        <div className="course-card card card-hoverable" onClick={onClick}>
            {/* Thumbnail */}
            <div className="course-thumb">
                {course.thumbnailUrl
                    ? <img src={course.thumbnailUrl} alt={course.title} className="course-thumb-img" />
                    : <div className="course-thumb-placeholder">
                        <BookOpen size={32} strokeWidth={1.2} />
                    </div>
                }
                <span className="course-status-badge" style={{ background: status.bg, color: status.color }}>
                    {status.label}
                </span>
            </div>

            <div className="card-body d-flex flex-column gap-2">
                <div className="d-flex align-items-start justify-content-between gap-2">
                    <h5 className="course-title">{course.title}</h5>
                    <span className="course-level-badge" style={{ background: level.bg, color: level.color }}>
                        {level.label}
                    </span>
                </div>

                {course.shortDescription && (
                    <p className="course-desc">{course.shortDescription}</p>
                )}

                <div className="course-meta">
                    <span><Layers size={11} /> {course.category}</span>
                    <span><Globe size={11} /> {course.language}</span>
                    {course.totalLessons > 0 && <span><PlayCircle size={11} /> {course.totalLessons} lessons</span>}
                    {course.totalDurationMinutes > 0 && <span><Clock size={11} /> {course.totalDurationMinutes}m</span>}
                </div>

                <div className="d-flex align-items-center justify-content-between mt-auto pt-2">
                    <span className="course-price">
                        {course.pricing?.isFree ? 'Free' : formatPrice(course.price, course.currency)}
                    </span>
                    {course.pricing?.discountPercentage > 0 && (
                        <span className="course-discount-badge">{course.pricing.discountPercentage}% off</span>
                    )}
                </div>
            </div>
        </div>
    )
}

/* ── Course Detail Modal ──────────────────────── */
function CourseDetailModal({ courseId, onClose }) {
    const [course, setCourse] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getCourseById(courseId)
            .then(res => { if (res.success) setCourse(res.data) })
            .catch(err => console.error('Course detail error', err))
            .finally(() => setLoading(false))
    }, [courseId])

    const level = course ? (LEVEL_CONFIG[course.level] || LEVEL_CONFIG['all-levels']) : null
    const status = course ? (STATUS_CONFIG[course.status] || STATUS_CONFIG.draft) : null

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 'var(--z-modal)' }} onClick={onClose}>
            <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable" onClick={e => e.stopPropagation()}>
                <div className="modal-content">
                    {loading ? (
                        <div className="modal-body d-flex align-items-center justify-content-center py-5">
                            <div className="spinner-border text-primary" role="status" />
                        </div>
                    ) : !course ? (
                        <div className="modal-body py-5 text-center text-muted">Failed to load course.</div>
                    ) : (
                        <>
                            {/* Thumbnail header */}
                            <div className="course-modal-header">
                                {course.thumbnailUrl
                                    ? <img src={course.thumbnailUrl} alt={course.title} className="course-modal-thumb" />
                                    : <div className="course-modal-thumb-placeholder"><BookOpen size={48} strokeWidth={1.2} /></div>
                                }
                                <div className="course-modal-overlay">
                                    <div className="d-flex gap-2 mb-3 flex-wrap">
                                        <span className="badge" style={{ background: status.bg, color: status.color }}>{status.label}</span>
                                        <span className="badge" style={{ background: level.bg, color: level.color }}>{level.label}</span>
                                    </div>
                                    <h3 className="course-modal-title">{course.title}</h3>
                                    {course.subtitle && <p className="course-modal-sub">{course.subtitle}</p>}
                                </div>
                                <button className="btn-close course-modal-close btn-close-white" onClick={onClose} />
                            </div>

                            <div className="modal-body">
                                {/* Stats row */}
                                <div className="course-stats-row">
                                    <div className="course-stat">
                                        <PlayCircle size={16} className="text-primary" />
                                        <span className="fw-semibold">{course.totalLessons}</span>
                                        <span className="text-muted">Lessons</span>
                                    </div>
                                    <div className="course-stat">
                                        <Clock size={16} className="text-primary" />
                                        <span className="fw-semibold">{course.totalDurationMinutes || 0}m</span>
                                        <span className="text-muted">Duration</span>
                                    </div>
                                    <div className="course-stat">
                                        <Layers size={16} className="text-primary" />
                                        <span className="fw-semibold">{course.category}</span>
                                        <span className="text-muted">Category</span>
                                    </div>
                                    <div className="course-stat">
                                        <Globe size={16} className="text-primary" />
                                        <span className="fw-semibold" style={{ textTransform: 'capitalize' }}>{course.language}</span>
                                        <span className="text-muted">Language</span>
                                    </div>
                                    <div className="course-stat">
                                        <Tag size={16} className="text-primary" />
                                        <span className="fw-semibold">{course.pricing?.isFree ? 'Free' : formatPrice(course.price, course.currency)}</span>
                                        <span className="text-muted">Price</span>
                                    </div>
                                </div>

                                {/* Description */}
                                {(course.shortDescription || course.fullDescription) && (
                                    <div className="mb-4">
                                        <div className="section-label">About this course</div>
                                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-loose)' }}>
                                            {course.fullDescription || course.shortDescription}
                                        </p>
                                    </div>
                                )}

                                {/* Learning outcomes */}
                                {course.learningOutcomes?.length > 0 && (
                                    <div className="mb-4">
                                        <div className="section-label">What learners will achieve</div>
                                        <div className="d-flex flex-column gap-2">
                                            {course.learningOutcomes.map((o, i) => (
                                                <div key={i} className="d-flex gap-2 text-sm">
                                                    <CheckCircle2 size={14} className="text-primary flex-shrink-0 mt-1" strokeWidth={2.5} />
                                                    <span style={{ color: 'var(--color-text-secondary)' }}>{o}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Requirements */}
                                {course.requirements?.length > 0 && (
                                    <div className="mb-4">
                                        <div className="section-label">Prerequisites</div>
                                        <div className="d-flex flex-column gap-2">
                                            {course.requirements.map((r, i) => (
                                                <div key={i} className="d-flex gap-2 text-sm">
                                                    <span style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-bold)' }}>•</span>
                                                    <span style={{ color: 'var(--color-text-secondary)' }}>{r}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Summary + Tags */}
                                <div className="row g-4">
                                    {course.summary && (
                                        <div className="col-md-6">
                                            <div className="section-label">Summary</div>
                                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{course.summary}</p>
                                        </div>
                                    )}
                                    {course.tags?.length > 0 && (
                                        <div className="col-md-6">
                                            <div className="section-label">Tags</div>
                                            <div className="d-flex flex-wrap gap-2">
                                                {course.tags.map((t, i) => (
                                                    <span key={i} className="profile-chip">{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Meta */}
                                <div className="course-modal-meta mt-4">
                                    <span>Created: {fmt(course.createdAt)}</span>
                                    <span>Updated: {fmt(course.updatedAt)}</span>
                                    {course.pricing?.discountPercentage > 0 && (
                                        <span className="course-discount-badge">{course.pricing.discountPercentage}% discount active</span>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

/* ── Pagination ───────────────────────────────── */
function Pagination({ page, totalPages, onChange }) {
    if (totalPages <= 1) return null
    return (
        <div className="d-flex align-items-center justify-content-center gap-2 mt-5">
            <button className="btn btn-sm btn-outline-secondary" disabled={page === 1} onClick={() => onChange(page - 1)}>
                <ChevronLeft size={14} />
            </button>
            <span className="text-sm text-muted">Page {page} of {totalPages}</span>
            <button className="btn btn-sm btn-outline-secondary" disabled={page === totalPages} onClick={() => onChange(page + 1)}>
                <ChevronRight size={14} />
            </button>
        </div>
    )
}

/* ── Courses Page ─────────────────────────────── */
export default function Courses() {
    const [courses, setCourses] = useState([])
    const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 })
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [selectedId, setSelectedId] = useState(null)

    const fetchCourses = useCallback(async (page = 1) => {
        setLoading(true)
        try {
            const res = await getMyCourses(page, 12)
            if (res.success) {
                setCourses(res.data?.items || [])
                setPagination(res.data?.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 })
            }
        } catch (err) {
            console.error('Courses error', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchCourses(1) }, [fetchCourses])

    const allStatuses = ['all', ...new Set(courses.map(c => c.status))]

    const filtered = courses.filter(c => {
        const matchStatus = statusFilter === 'all' || c.status === statusFilter
        const matchSearch = !search ||
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.category?.toLowerCase().includes(search.toLowerCase()) ||
            c.shortDescription?.toLowerCase().includes(search.toLowerCase())
        return matchStatus && matchSearch
    })

    const statusCounts = { all: courses.length }
    courses.forEach(c => { statusCounts[c.status] = (statusCounts[c.status] || 0) + 1 })

    if (loading) return <div className="loading-overlay"><div className="spinner-border text-primary" role="status" /></div>

    return (
        <div className="container-lg py-4">

            {/* Header */}
            <div className="page-header d-flex justify-content-between align-items-start flex-wrap gap-3">
                <div>
                    <h1 className="page-title mb-1">My Courses</h1>
                    <p className="page-subtitle">{pagination.total} total courses across all your subjects</p>
                </div>
            </div>

            {/* Filters */}
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-5">
                <div className="d-flex gap-2 flex-wrap">
                    {allStatuses.map(s => (
                        <button key={s} className={`filter-tab ${statusFilter === s ? 'active' : ''}`}
                            onClick={() => setStatusFilter(s)}>
                            {s} ({statusCounts[s] || 0})
                        </button>
                    ))}
                </div>
                <div style={{ position: 'relative', minWidth: 240 }}>
                    <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                    <input
                        type="text"
                        className="form-control text-sm"
                        placeholder="Search title, category…"
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
            {filtered.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon"><BookOpen size={48} strokeWidth={1.2} /></div>
                    <div className="empty-state-title">No courses found</div>
                    <div className="empty-state-text">Try a different search or filter.</div>
                </div>
            ) : (
                <div className="row g-4">
                    {filtered.map(c => (
                        <div key={c.id} className="col-12 col-md-6 col-xl-4">
                            <CourseCard course={c} onClick={() => setSelectedId(c.id)} />
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination — server-side (no local search active) */}
            {!search && statusFilter === 'all' && (
                <Pagination page={pagination.page} totalPages={pagination.totalPages}
                    onChange={(p) => fetchCourses(p)} />
            )}

            {/* Modal */}
            {selectedId && (
                <CourseDetailModal courseId={selectedId} onClose={() => setSelectedId(null)} />
            )}
        </div>
    )
}