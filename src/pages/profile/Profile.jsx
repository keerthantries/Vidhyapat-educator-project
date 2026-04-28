
import React, { useState, useEffect } from 'react'
import {
  Mail, GraduationCap, Briefcase, Globe, ExternalLink,
  CheckCircle, AlertCircle, ShieldCheck, Languages,
  UserCircle2, BadgeCheck, FolderOpen
} from 'lucide-react'
import { getDashboardSummary } from '@/services/profile.service'
import DocumentManager from './components/DocumentManager'
import './Profile.css'

function InfoTile({ icon: Icon, label, value }) {
  if (!value && value !== 0) return null

  return (
    <div className="profile-info-tile">
      <div className="profile-info-icon">
        <Icon size={15} strokeWidth={1.8} />
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
  const initial = name?.charAt(0).toUpperCase() || 'E'
  const isVerified = verificationStatus === 'approved'

  return (
    <div className="container-lg py-4">

      <div className="profile-shell card mb-4">
        <div className="card-body">

          <div className="profile-top-grid">
            <div className="profile-identity-panel">
              <div className="profile-avatar-xl">{initial}</div>

              <div className="profile-identity-content">
                <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                  <h2 className="page-title mb-0">{name}</h2>
                  {isVerified ? (
                    <span className="badge bg-success d-flex align-items-center gap-1">
                      <CheckCircle size={11} /> Verified
                    </span>
                  ) : (
                    <span className="badge bg-warning d-flex align-items-center gap-1">
                      <AlertCircle size={11} /> Pending
                    </span>
                  )}
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
                      {ep.expertiseAreas.map((item, i) => (
                        <span key={i} className="profile-chip">{item}</span>
                      ))}
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
        </div>
      </div>

      <DocumentManager />
    </div>
  )
}


