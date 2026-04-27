import React, { useState, useEffect } from 'react'
import { getDashboardSummary } from '@/services/profile.service'
import DocumentManager from './components/DocumentManager'
import './Profile.css'

export default function Profile() {
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchProfile() }, [])

  const fetchProfile = async () => {
    try {
      const res = await getDashboardSummary()
      if (res.success && res.data?.profile) {
        setProfileData(res.data.profile)
      }
    } catch (error) {
      console.error('Failed to fetch profile', error)
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

  const { name, email, verificationStatus, educatorProfile } = profileData
  const initial = name?.charAt(0).toUpperCase() || 'U'
  const isVerified = verificationStatus === 'approved'

  return (
    <div className="container-lg py-4">

      {/* Profile Card */}
      <div className="card mb-4" style={{ overflow: 'hidden' }}>
        <div className="profile-banner" />

        <div className="card-body">

          {/* Avatar + Name */}
          <div className="d-flex align-items-end gap-4 mb-5">
            <div className="profile-avatar">{initial}</div>
            <div className="pb-1">
              <h4 className="page-title mb-1">
                {name}
                {isVerified && <span className="badge bg-success ms-2 align-middle" style={{ fontSize: 11 }}>✓ Verified</span>}
              </h4>
              <p className="page-subtitle mb-0">{educatorProfile?.title || 'Educator'}</p>
            </div>
          </div>

          <div className="row g-4">

            {/* Left: Bio + Expertise */}
            <div className="col-lg-7">
              <p className="section-label">About</p>
              <p className="text-secondary mb-4" style={{ lineHeight: 'var(--leading-loose)' }}>
                {educatorProfile?.bio || <span className="text-muted fst-italic">No bio provided.</span>}
              </p>

              {educatorProfile?.expertiseAreas?.length > 0 && (
                <>
                  <p className="section-label">Expertise</p>
                  <div className="d-flex flex-wrap gap-2">
                    {educatorProfile.expertiseAreas.map((area, idx) => (
                      <span key={idx} className="expertise-badge">{area}</span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Right: Details */}
            <div className="col-lg-5">
              <div className="surface-primary p-4">
                <p className="section-label mb-4">Contact & Details</p>

                <div className="mb-4">
                  <div className="detail-label">Email</div>
                  <div className="detail-value">{email}</div>
                </div>

                <div className="mb-4">
                  <div className="detail-label">Qualification</div>
                  <div className="detail-value">{educatorProfile?.highestQualification || <span className="text-muted">N/A</span>}</div>
                </div>

                <div className="mb-4">
                  <div className="detail-label">Experience</div>
                  <div className="detail-value">
                    {educatorProfile?.yearsOfExperience ? `${educatorProfile.yearsOfExperience} Years` : <span className="text-muted">N/A</span>}
                  </div>
                </div>

                <div>
                  <div className="detail-label">Status</div>
                  <div className="detail-value">
                    {isVerified
                      ? <span className="badge bg-success">Verified Educator</span>
                      : <span className="badge bg-warning text-dark">Pending Verification</span>}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Document Manager */}
      <DocumentManager />
    </div>
  )
}