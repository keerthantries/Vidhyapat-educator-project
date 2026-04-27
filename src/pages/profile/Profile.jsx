import React, { useState, useEffect } from 'react'
import {
  Mail, GraduationCap, Briefcase, Globe,
  ExternalLink, Shield, Languages, Clock,
  CheckCircle, AlertCircle, FileText
} from 'lucide-react'
import { getDashboardSummary } from '@/services/profile.service'
import DocumentManager from './components/DocumentManager'
import './Profile.css'

/* ── Detail Row ──────────────────────────────── */
function DetailRow({ icon: Icon, label, value }) {
  if (!value && value !== 0) return null
  return (
    <div className="profile-detail-row">
      <div className="profile-detail-icon">
        <Icon size={14} strokeWidth={1.8} />
      </div>
      <div>
        <div className="detail-label">{label}</div>
        <div className="detail-value mt-1">{value}</div>
      </div>
    </div>
  )
}

export default function Profile() {
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchProfile() }, [])

  const fetchProfile = async () => {
    try {
      const res = await getDashboardSummary()
      if (res.success && res.data?.profile) setProfileData(res.data.profile)
    } catch (err) {
      console.error('Failed to fetch profile', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading-overlay"><div className="spinner-border text-primary" role="status" /></div>
  }

  if (!profileData) {
    return (
      <div className="container-lg py-4">
        <div className="alert alert-warning">Failed to load profile. Please try again.</div>
      </div>
    )
  }

  const { name, email, verificationStatus, educatorProfile: ep = {} } = profileData
  const initial = name?.charAt(0).toUpperCase() || 'U'
  const isVerified = verificationStatus === 'approved'

  return (
    <div className="container-lg py-4">

      {/* ── Hero Card ── */}
      <div className="card mb-4" style={{ overflow: 'hidden' }}>

        {/* Banner */}
        <div className="profile-banner">
          <div className="profile-banner-pattern" />
        </div>

        <div className="card-body pt-0">
          {/* Avatar row */}
          <div className="profile-hero-row">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">{initial}</div>
            </div>
            <div className="profile-hero-info">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <h2 className="page-title mb-0">{name}</h2>
                {isVerified
                  ? <span className="badge bg-success d-flex align-items-center gap-1" style={{ fontSize: 11 }}>
                    <CheckCircle size={10} strokeWidth={2.5} /> Verified
                  </span>
                  : <span className="badge bg-warning text-dark d-flex align-items-center gap-1" style={{ fontSize: 11 }}>
                    <AlertCircle size={10} strokeWidth={2.5} /> Pending
                  </span>
                }
              </div>
              <p className="page-subtitle mt-1 mb-0">{ep.title || 'Educator'}</p>
              {/* External links */}
              <div className="d-flex gap-2 mt-3 flex-wrap">
                {ep.linkedinUrl &&
                  <a href={ep.linkedinUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary">
                    <Globe size={13} /> LinkedIn
                  </a>
                }
                {ep.portfolioUrl &&
                  <a href={ep.portfolioUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-secondary">
                    <ExternalLink size={13} /> Portfolio
                  </a>
                }
              </div>
            </div>
          </div>

          {/* ── 3-column layout below avatar ── */}
          <div className="row g-4 mt-1">

            {/* Col 1 — About + Expertise */}
            <div className="col-lg-5">
              <p className="section-label">About</p>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-loose)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-5)' }}>
                {ep.bio || <span className="text-muted fst-italic">No bio provided.</span>}
              </p>

              {ep.expertiseAreas?.length > 0 && (
                <>
                  <p className="section-label">Expertise Areas</p>
                  <div className="d-flex flex-wrap gap-2">
                    {ep.expertiseAreas.map((area, i) => (
                      <span key={i} className="expertise-badge">{area}</span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Col 2 — Languages + Work Type */}
            <div className="col-lg-3">
              {ep.languages?.length > 0 && (
                <div className="mb-4">
                  <p className="section-label">Languages</p>
                  <div className="d-flex flex-wrap gap-2">
                    {ep.languages.map((lang, i) => (
                      <span key={i} className="badge"
                        style={{ background: 'var(--color-info-bg)', color: 'var(--color-info)', fontSize: 12, padding: '4px 12px' }}>
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {ep.workType && (
                <div className="mb-4">
                  <p className="section-label">Work Type</p>
                  <span className="badge"
                    style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', fontSize: 12, padding: '4px 12px' }}>
                    {ep.workType === 'fullTime' ? 'Full Time' : ep.workType === 'partTime' ? 'Part Time' : ep.workType}
                  </span>
                </div>
              )}

              <p className="section-label">Verification</p>
              {isVerified
                ? <span className="badge bg-success">✓ Verified Educator</span>
                : <span className="badge bg-warning text-dark">Pending Verification</span>
              }
            </div>

            {/* Col 3 — Contact Details */}
            <div className="col-lg-4">
              <div className="surface-primary p-4">
                <p className="section-label mb-3">Contact & Details</p>
                <div className="d-flex flex-column gap-3">
                  <DetailRow icon={Mail} label="Email" value={email} />
                  <DetailRow icon={GraduationCap} label="Qualification" value={ep.highestQualification} />
                  <DetailRow
                    icon={Briefcase}
                    label="Experience"
                    value={ep.yearsOfExperience ? `${ep.yearsOfExperience} years` : null}
                  />
                  {ep.languages?.length > 0 &&
                    <DetailRow icon={Languages} label="Languages" value={ep.languages.join(', ')} />}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Documents ── */}
      <DocumentManager />

    </div>
  )
}