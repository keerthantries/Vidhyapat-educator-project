import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, Users, CalendarCheck, TrendingUp,
  Plus, Clock, ChevronRight, CalendarDays
} from 'lucide-react'
import { getDashboardSummary, getMyBatches, getCalendarEvents } from '@/services/api/dashboard.api.js'
import './Dashboard.css'

/* ── Helpers ─────────────────────────────────── */
const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
const fmtDay = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric' })
const fmtMon = (d) => new Date(d).toLocaleDateString('en-IN', { month: 'short' })
const fmtTime = (t) => {
  if (!t) return '—'
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
}
const getBatchStatus = (b) => {
  const now = new Date()
  if (now < new Date(b.startDate)) return 'upcoming'
  if (now > new Date(b.endDate)) return 'completed'
  return 'ongoing'
}

/* ── Stat Card — uses base.css: stat-card, stat-icon, stat-value, stat-label ── */
function StatCard({ label, value, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="stat-card">
      <div className="d-flex align-items-start justify-content-between">
        <div>
          <div className="stat-value">{value}</div>
          <div className="stat-label mt-1">{label}</div>
        </div>
        <div className="stat-icon" style={{ background: iconBg, color: iconColor }}>
          <Icon size={20} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  )
}

/* ── Batch Row — uses base.css: detail-label, detail-value + Dashboard.css: batch-row ── */
function BatchRow({ batch }) {
  const status = getBatchStatus(batch)
  const fill = batch.capacity ? Math.round((batch.enrollmentCount / batch.capacity) * 100) : 0

  return (
    <div className="batch-row">
      <div className={`status-dot ${status}`} />

      {/* Name + date */}
      <div style={{ flex: '1 1 180px', minWidth: 0 }}>
        <div className="fw-semibold text-sm text-truncate">{batch.name}</div>
        <div className="text-xs text-muted mt-1">{fmt(batch.startDate)} → {fmt(batch.endDate)}</div>
      </div>

      {/* Time */}
      <div className="d-none d-md-flex align-items-center gap-1 text-xs text-muted" style={{ minWidth: 90 }}>
        <Clock size={12} strokeWidth={1.8} />
        {fmtTime(batch.schedule?.startTime)} – {fmtTime(batch.schedule?.endTime)}
      </div>

      {/* Mode */}
      <span className={`mode-pill mode-${batch.mode} d-none d-md-inline`}>{batch.mode}</span>

      {/* Enrollment — uses base.css: progress, progress-bar */}
      <div className="d-none d-lg-flex align-items-center gap-2" style={{ minWidth: 120 }}>
        <div className="progress flex-grow-1">
          <div className="progress-bar" style={{ width: `${fill}%` }} />
        </div>
        <span className="text-xs text-muted" style={{ minWidth: 36, flexShrink: 0 }}>
          {batch.enrollmentCount}/{batch.capacity}
        </span>
      </div>
    </div>
  )
}

/* ── Event Row ─────────────────────────────────── */
function EventRow({ event }) {
  const isStart = event.type === 'batch_start'
  return (
    <div className="event-row">
      <div className="event-date-box">
        <div className="e-day">{fmtDay(event.date)}</div>
        <div className="e-mon">{fmtMon(event.date)}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="fw-medium text-sm text-truncate">{event.title}</div>
        <div className="text-xs mt-1" style={{ color: isStart ? 'var(--color-success)' : 'var(--color-danger)' }}>
          {isStart ? 'Batch starts' : 'Batch ends'}
        </div>
      </div>
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
        if (b.success) setBatches(b.data)
        if (c.success) setEvents(c.data)
      })
      .catch(err => console.error('Dashboard error', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="loading-overlay"><div className="spinner-border text-primary" role="status" /></div>
  }

  const { batchStats, learnerCount } = summary || {}

  const counts = {
    all: batches.length,
    ongoing: batches.filter(b => getBatchStatus(b) === 'ongoing').length,
    upcoming: batches.filter(b => getBatchStatus(b) === 'upcoming').length,
    completed: batches.filter(b => getBatchStatus(b) === 'completed').length,
  }

  const filteredBatches = filter === 'all'
    ? batches
    : batches.filter(b => getBatchStatus(b) === filter)

  const upcomingEvents = events
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 8)

  return (
    <div className="container-lg py-4">

      {/* Header */}
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1 className="page-title">Dashboard</h1>
        </div>
        {/* <button className="btn btn-primary" onClick={() => navigate('/batches/new')}>
          <Plus size={15} /> New Batch
        </button> */}
      </div>

      {/* Stat Cards — 4 across */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <StatCard label="Total Batches" value={batchStats?.total ?? 0}
            icon={BookOpen} iconBg="var(--color-primary-light)" iconColor="var(--color-primary)" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard label="Ongoing" value={batchStats?.ongoing ?? 0}
            icon={TrendingUp} iconBg="var(--color-success-bg)" iconColor="var(--color-success)" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard label="Upcoming" value={batchStats?.upcoming ?? 0}
            icon={CalendarCheck} iconBg="var(--color-info-bg)" iconColor="var(--color-info)" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard label="Total Learners" value={learnerCount ?? 0}
            icon={Users} iconBg="var(--color-warning-bg)" iconColor="var(--color-warning)" />
        </div>
      </div>

      {/* Main grid */}
      <div className="row g-4">

        {/* Batches — full list, airy row layout */}
        <div className="col-xl-8">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
              <span className="fw-semibold">
                My Batches
                <span className="ms-2 fw-normal text-muted text-xs">{filteredBatches.length} shown</span>
              </span>
              <div className="d-flex gap-2 flex-wrap">
                {['all', 'ongoing', 'upcoming', 'completed'].map(f => (
                  <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`}
                    onClick={() => setFilter(f)}>
                    {f} ({counts[f]})
                  </button>
                ))}
              </div>
            </div>

            <div className="card-body py-2">
              {filteredBatches.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><BookOpen size={40} strokeWidth={1.2} /></div>
                  <div className="empty-state-title">No {filter !== 'all' ? filter : ''} batches</div>
                  <div className="empty-state-text">Nothing to display here.</div>
                </div>
              ) : (
                filteredBatches.map(b => <BatchRow key={b._id} batch={b} />)
              )}
            </div>
          </div>
        </div>

        {/* Upcoming events */}
        <div className="col-xl-4">
          <div className="card h-100">
            <div className="card-header d-flex align-items-center gap-2">
              <CalendarDays size={16} strokeWidth={1.8} className="text-primary" />
              <span className="fw-semibold">Upcoming Events</span>
            </div>
            <div className="card-body py-2">
              {upcomingEvents.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><CalendarDays size={40} strokeWidth={1.2} /></div>
                  <div className="empty-state-title">No upcoming events</div>
                  <div className="empty-state-text">Your calendar is clear.</div>
                </div>
              ) : (
                upcomingEvents.map((ev, i) => <EventRow key={i} event={ev} />)
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}