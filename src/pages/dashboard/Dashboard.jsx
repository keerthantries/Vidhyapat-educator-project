import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, Users, CalendarCheck, TrendingUp,
  Clock, CalendarDays, ArrowRight, CheckCircle2,
  AlertCircle, Video, LayoutGrid
} from 'lucide-react'
import { getDashboardSummary, getMyBatches, getCalendarEvents } from '@/services/api/dashboard.api.js'
import './Dashboard.css'

/* ── Helpers ─────────────────────────────────── */
const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
const fmtDay = (d) => new Date(d).getDate()
const fmtMon = (d) => new Date(d).toLocaleDateString('en-IN', { month: 'short' })
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
const buildCalendarEvents = (batches) => {
  const evts = []
  batches.forEach(b => {
    evts.push({ date: b.startDate, title: b.name, type: 'batch_start' })
    evts.push({ date: b.endDate, title: b.name, type: 'batch_end' })
  })
  return evts
}

/* ── Stat Card ─────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="dash-stat-card">
      <div className="dash-stat-icon" style={{ background: bg, color }}>
        <Icon size={20} strokeWidth={1.8} />
      </div>
      <div className="dash-stat-value">{value ?? 0}</div>
      <div className="dash-stat-label">{label}</div>
    </div>
  )
}

/* ── Batch Table Row ─────────────────────────── */
function BatchTableRow({ batch, onClick }) {
  const status = getBatchStatus(batch)
  const fill = batch.capacity ? Math.round((batch.enrollmentCount / batch.capacity) * 100) : 0

  return (
    <tr className="dash-batch-tr" onClick={onClick}>
      {/* Batch name + code */}
      <td>
        <div className="fw-semibold text-sm">{batch.name}</div>
        <span className="dash-code-badge">{batch.code || '—'}</span>
      </td>

      {/* Courses */}
      <td className="d-none d-xl-table-cell">
        {batch.courseId?.length > 0
          ? <div className="d-flex flex-wrap gap-1">
            {batch.courseId.slice(0, 2).map(c => (
              <span key={c._id} className="dash-course-pill">{c.title}</span>
            ))}
            {batch.courseId.length > 2 &&
              <span className="dash-course-pill">+{batch.courseId.length - 2}</span>}
          </div>
          : <span className="text-muted text-xs">—</span>
        }
      </td>

      {/* Dates */}
      <td className="d-none d-md-table-cell">
        <div className="text-xs fw-medium">{fmt(batch.startDate)}</div>
        <div className="text-xs text-muted">→ {fmt(batch.endDate)}</div>
      </td>

      {/* Time + Days */}
      <td className="d-none d-lg-table-cell">
        <div className="text-xs d-flex align-items-center gap-1 fw-medium">
          <Clock size={11} strokeWidth={2} className="text-muted flex-shrink-0" />
          {fmtTime(batch.schedule?.startTime)} – {fmtTime(batch.schedule?.endTime)}
        </div>
        <div className="text-xs text-muted mt-1">
          {batch.schedule?.daysOfWeek?.slice(0, 5).join(', ')}
        </div>
      </td>

      {/* Enrollment */}
      <td className="d-none d-lg-table-cell">
        <div className="d-flex align-items-center gap-2">
          <div className="dash-mini-bar">
            <div className="dash-mini-fill" style={{ width: `${fill}%` }} />
          </div>
          <span className="text-xs text-muted" style={{ minWidth: 36 }}>{batch.enrollmentCount}/{batch.capacity}</span>
        </div>
      </td>

      {/* Mode + Status */}
      <td>
        <div className="d-flex flex-column gap-1 align-items-start">
          <span className={`mode-pill mode-${batch.mode}`}>{batch.mode}</span>
          <span className={`status-pill status-${status}`}>{status}</span>
        </div>
      </td>

      {/* Join — stop propagation so row click doesn't fire */}
      <td onClick={e => e.stopPropagation()}>
        {batch.classUrl
          ? <a
            href={batch.classUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1"
            style={{ fontSize: 11, padding: '4px 12px', whiteSpace: 'nowrap' }}>
            <Video size={11} strokeWidth={2} /> Join
          </a>
          : <span className="text-muted text-xs">no link</span>
        }
      </td>
    </tr>
  )
}

/* ── Event Item ─────────────────────────────────── */
function EventItem({ event }) {
  const isStart = event.type === 'batch_start'
  const isPast = new Date(event.date) < new Date()
  return (
    <div className={`dash-event-item${isPast ? ' is-past' : ''}`}>
      <div className="dash-event-date">
        <div className="dash-event-day">{fmtDay(event.date)}</div>
        <div className="dash-event-mon">{fmtMon(event.date)}</div>
      </div>
      <div className="dash-event-stripe" style={{ background: isStart ? 'var(--color-success)' : 'var(--color-danger)' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="text-sm fw-medium text-truncate">{event.title}</div>
        <div className="text-xs mt-1 d-flex align-items-center gap-1"
          style={{ color: isStart ? 'var(--color-success)' : 'var(--color-danger)' }}>
          {isStart
            ? <><CheckCircle2 size={10} strokeWidth={2.5} /> Starts</>
            : <><AlertCircle size={10} strokeWidth={2.5} /> Ends</>}
        </div>
      </div>
      {isPast && <span className="dash-past-tag">past</span>}
    </div>
  )
}

/* ── Dashboard ─────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [batches, setBatches] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    Promise.all([getDashboardSummary(), getMyBatches(), getCalendarEvents()])
      .then(([s, b, c]) => {
        if (s.success) setSummary(s.data)
        if (b.success) {
          setBatches(b.data)
          if (!c.success || !c.data?.length) setEvents(buildCalendarEvents(b.data))
        }
        if (c.success && c.data?.length) setEvents(c.data)
      })
      .catch(err => console.error('Dashboard error', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="loading-overlay"><div className="spinner-border text-primary" role="status" /></div>
  }

  const { learnerCount } = summary || {}
  const greetName = summary?.profile?.name?.split(' ')[0] || 'Educator'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const realStats = {
    total: batches.length,
    ongoing: batches.filter(b => getBatchStatus(b) === 'ongoing').length,
    upcoming: batches.filter(b => getBatchStatus(b) === 'upcoming').length,
    completed: batches.filter(b => getBatchStatus(b) === 'completed').length,
  }

  const filteredBatches = filter === 'all'
    ? batches
    : batches.filter(b => getBatchStatus(b) === filter)

  const now = new Date(); now.setHours(0, 0, 0, 0)
  const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date))
  const upcomingEvents = sortedEvents.filter(e => new Date(e.date) >= now).slice(0, 10)
  const displayEvents = upcomingEvents.length > 0 ? upcomingEvents : sortedEvents.slice(-8).reverse()

  return (
    <div className="container-lg py-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-5">
        <div>
          <h1 className="page-title mb-1">{greeting}, {greetName} 👋</h1>
          <p className="page-subtitle">Here's what's happening with your batches today.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/batches')}>
          <LayoutGrid size={15} /> All Batches
        </button>
      </div>

      {/* Stat Row */}
      <div className="row g-3 mb-5">
        <div className="col-6 col-md-3">
          <StatCard label="Total Batches" value={realStats.total}
            icon={BookOpen} color="var(--color-primary)" bg="var(--color-primary-light)" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard label="Ongoing" value={realStats.ongoing}
            icon={TrendingUp} color="var(--color-success)" bg="var(--color-success-bg)" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard label="Upcoming" value={realStats.upcoming}
            icon={CalendarCheck} color="var(--color-info)" bg="var(--color-info-bg)" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard label="Total Learners" value={learnerCount ?? 0}
            icon={Users} color="var(--color-warning)" bg="var(--color-warning-bg)" />
        </div>
      </div>

      {/* Main */}
      <div className="row g-4">

        {/* Batches Table */}
        <div className="col-xl-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div className="fw-semibold d-flex align-items-center gap-2">
                <BookOpen size={16} strokeWidth={1.8} className="text-primary" />
                My Batches
                <span className="text-xs fw-normal text-muted">({filteredBatches.length} shown)</span>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                {['all', 'ongoing', 'upcoming', 'completed'].map(f => (
                  <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`}
                    onClick={() => setFilter(f)}>
                    {f} ({realStats[f] ?? batches.length})
                  </button>
                ))}
              </div>
            </div>

            {filteredBatches.length === 0 ? (
              <div className="card-body">
                <div className="empty-state">
                  <div className="empty-state-icon"><BookOpen size={40} strokeWidth={1.2} /></div>
                  <div className="empty-state-title">No {filter !== 'all' ? filter : ''} batches</div>
                  <div className="empty-state-text">Nothing to display here.</div>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Batch</th>
                      <th className="d-none d-xl-table-cell">Courses</th>
                      <th className="d-none d-md-table-cell">Dates</th>
                      <th className="d-none d-lg-table-cell">Schedule</th>
                      <th className="d-none d-lg-table-cell">Enrollment</th>
                      <th>Mode / Status</th>
                      <th>Join</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBatches.map(b => (
                      <BatchTableRow key={b._id} batch={b} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="card-footer d-flex justify-content-between align-items-center">
              <span className="text-xs text-muted">Click any row to view full details</span>
              <button className="btn btn-sm btn-outline-primary" onClick={() => navigate('/batches')}>
                View all <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="col-xl-4">
          <div className="card" style={{ height: '100%' }}>
            <div className="card-header d-flex align-items-center gap-2">
              <CalendarDays size={16} strokeWidth={1.8} className="text-primary" />
              <span className="fw-semibold">
                {upcomingEvents.length > 0 ? 'Upcoming Events' : 'Recent Events'}
              </span>
              <span className="ms-auto badge"
                style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontSize: 11 }}>
                {displayEvents.length}
              </span>
            </div>
            <div className="card-body py-2">
              {displayEvents.length === 0
                ? <div className="empty-state">
                  <div className="empty-state-icon"><CalendarDays size={36} strokeWidth={1.2} /></div>
                  <div className="empty-state-title">No events</div>
                  <div className="empty-state-text">Calendar is clear.</div>
                </div>
                : displayEvents.map((ev, i) => <EventItem key={i} event={ev} />)
              }
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}