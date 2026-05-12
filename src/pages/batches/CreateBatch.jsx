/**
 * CreateBatch.jsx — Page for creating a new batch
 * Location: src/pages/batches/CreateBatch.jsx
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ArrowLeft, Loader2, Save, X, Plus,
    Calendar, Clock, ShieldCheck, Info
} from 'lucide-react'
import { getMyCourses, createBatch } from '@/services/api/educator.api'
import './Batches.css'

export default function CreateBatch() {
    const navigate = useNavigate()
    const [courses, setCourses] = useState([])
    const [loadingCourses, setLoadingCourses] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const [form, setForm] = useState({
        name: '',
        code: '',
        courseId: [],
        startDate: '',
        endDate: '',
        capacity: 30,
        status: 'draft',
        schedule: {
            daysOfWeek: [],
            startTime: '10:00',
            endTime: '11:30',
            timeZone: 'Asia/Kolkata'
        }
    })

    useEffect(() => {
        getMyCourses(1, 100)
            .then(res => { if (res.success) setCourses(res.data.items || []) })
            .catch(err => console.error('Error fetching courses', err))
            .finally(() => setLoadingCourses(false))
    }, [])

    const handleChange = (k, v) => setForm(p => ({ ...p, [k]: v }))
    const handleSchedule = (k, v) => setForm(p => ({ ...p, schedule: { ...p.schedule, [k]: v } }))
    const toggleDay = (dayNum) => {
        const current = form.schedule.daysOfWeek
        const next = current.includes(dayNum) ? current.filter(d => d !== dayNum) : [...current, dayNum]
        handleSchedule('daysOfWeek', next.sort())
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.name || !form.courseId.length || !form.startDate || !form.endDate) {
            setError('Please fill all required fields.')
            window.scrollTo(0, 0)
            return
        }
        setSubmitting(true)
        setError('')
        try {
            const res = await createBatch(form)
            if (res.success) {
                setSuccess(true)
                setTimeout(() => navigate('/batches'), 1500)
            } else {
                setError(res.message || 'Failed to create batch.')
                window.scrollTo(0, 0)
            }
        } catch (err) {
            setError(err.message || 'Something went wrong.')
            window.scrollTo(0, 0)
        } finally {
            setSubmitting(false)
        }
    }

    if (success) {
        return (
            <div className="container-lg py-10 text-center">
                <div className="mb-4 d-inline-flex align-items-center justify-content-center bg-success-bg text-success rounded-circle p-4" style={{ width: 80, height: 80 }}>
                    <ShieldCheck size={40} />
                </div>
                <h2 className="fw-bold mb-2">Batch Created Successfully!</h2>
                <p className="text-muted mb-0">Redirecting you to batches list...</p>
            </div>
        )
    }

    return (
        <div className="container-lg py-4">
            {/* Header */}
            <div className="d-flex align-items-center gap-3 mb-5">
                <button className="btn btn-icon btn-outline-secondary" onClick={() => navigate('/batches')}>
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="page-title mb-0">Create New Batch</h1>
                    <p className="page-subtitle mb-0">Launch a new learning group with your courses.</p>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    <form className="card shadow-sm border-0" onSubmit={handleSubmit}>
                        <div className="card-body p-4 p-md-5">
                            {error && <div className="alert alert-danger py-2 text-sm mb-4">{error}</div>}

                            <p className="section-label mb-4">Basic Information</p>
                            <div className="row g-4 mb-5">
                                <div className="col-md-8">
                                    <label className="form-label fw-semibold small">Batch Name *</label>
                                    <input className="form-control form-control-lg" placeholder="e.g. Full Stack Advanced Batch A" value={form.name} onChange={e => handleChange('name', e.target.value)} required />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-semibold small">Batch Code</label>
                                    <input className="form-control form-control-lg" placeholder="e.g. FS-ADV-A" value={form.code} onChange={e => handleChange('code', e.target.value)} />
                                </div>
                            </div>

                            <p className="section-label mb-4">Course Selection</p>
                            <div className="mb-5">
                                <label className="form-label fw-semibold small mb-2">Select one or more courses *</label>
                                {loadingCourses ? (
                                    <div className="d-flex align-items-center gap-2 text-muted text-sm">
                                        <Loader2 size={14} className="ob-spin" /> Loading courses…
                                    </div>
                                ) : (
                                    <div className="d-flex flex-wrap gap-2">
                                        {courses.length === 0 ? (
                                            <div className="alert alert-info w-100 py-2 text-sm">No courses found. Please create a course first.</div>
                                        ) : courses.map(c => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                className={`batch-course-pill-btn ${form.courseId.includes(c.id) ? 'active' : ''}`}
                                                style={{ padding: '8px 18px', fontSize: 13 }}
                                                onClick={() => {
                                                    const next = form.courseId.includes(c.id) ? form.courseId.filter(id => id !== c.id) : [...form.courseId, c.id]
                                                    handleChange('courseId', next)
                                                }}
                                            >
                                                {c.title}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <p className="section-label mb-4">Timeline &amp; Capacity</p>
                            <div className="row g-4 mb-5">
                                <div className="col-md-4">
                                    <label className="form-label fw-semibold small">Start Date *</label>
                                    <div className="position-relative">
                                        <Calendar size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                        <input type="date" className="form-control ps-5" value={form.startDate} onChange={e => handleChange('startDate', e.target.value)} required />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-semibold small">End Date *</label>
                                    <div className="position-relative">
                                        <Calendar size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                        <input type="date" className="form-control ps-5" value={form.endDate} onChange={e => handleChange('endDate', e.target.value)} required />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-semibold small">Capacity</label>
                                    <div className="position-relative">
                                        <Plus size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                        <input type="number" className="form-control ps-5" placeholder="30" value={form.capacity} onChange={e => handleChange('capacity', parseInt(e.target.value))} />
                                    </div>
                                </div>
                            </div>

                            <p className="section-label mb-4">Weekly Schedule</p>
                            <div className="surface-primary p-4 rounded-4 border mb-5">
                                <div className="mb-4">
                                    <label className="form-label small text-muted mb-3 d-block">Days of Week *</label>
                                    <div className="d-flex gap-3 flex-wrap">
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, i) => {
                                            const dayNum = i + 1
                                            const active = form.schedule.daysOfWeek.includes(dayNum)
                                            return (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    className={`batch-day-pill px-4 py-2 ${active ? 'active' : ''}`}
                                                    style={{ fontSize: 13, minWidth: 60, height: 'auto', borderRadius: 10 }}
                                                    onClick={() => toggleDay(dayNum)}
                                                >
                                                    {day.slice(0, 3)}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <label className="form-label small text-muted">Start Time</label>
                                        <div className="position-relative">
                                            <Clock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                            <input type="time" className="form-control ps-5" value={form.schedule.startTime} onChange={e => handleSchedule('startTime', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small text-muted">End Time</label>
                                        <div className="position-relative">
                                            <Clock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                            <input type="time" className="form-control ps-5" value={form.schedule.endTime} onChange={e => handleSchedule('endTime', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex justify-content-end gap-3 pt-4 border-top">
                                <button type="button" className="btn btn-outline-secondary px-4 py-2" onClick={() => navigate('/batches')}>Cancel</button>
                                <button type="submit" className="btn btn-primary px-5 py-2 d-flex align-items-center gap-2" disabled={submitting}>
                                    {submitting ? <Loader2 size={18} className="ob-spin" /> : <Save size={18} />}
                                    {submitting ? 'Creating…' : 'Create Batch'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="col-lg-4">
                    <div className="card shadow-sm border-0 sticky-top" style={{ top: '2rem' }}>
                        <div className="card-body p-4">
                            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                <Info size={16} className="text-primary" /> Create Batch Guide
                            </h6>
                            <ul className="text-sm text-muted p-0 m-0" style={{ listStyle: 'none' }}>
                                <li className="mb-3 d-flex gap-2">
                                    <div className="mt-1 bg-primary-light text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 18, height: 18, fontSize: 10 }}>1</div>
                                    Batches are groupings of students linked to specific courses.
                                </li>
                                <li className="mb-3 d-flex gap-2">
                                    <div className="mt-1 bg-primary-light text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 18, height: 18, fontSize: 10 }}>2</div>
                                    Once created, you can manage enrollments and class links.
                                </li>
                                <li className="mb-3 d-flex gap-2">
                                    <div className="mt-1 bg-primary-light text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 18, height: 18, fontSize: 10 }}>3</div>
                                    Make sure the schedule does not conflict with your existing batches.
                                </li>
                            </ul>
                            <div className="mt-4 p-3 bg-light rounded-3 text-xs">
                                <p className="mb-0 fw-medium text-primary mb-1">Status Note:</p>
                                By default, new batches are created as <strong>Draft</strong>. You can publish them later when you're ready to accept enrollments.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
