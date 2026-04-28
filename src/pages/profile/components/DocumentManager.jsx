import React, { useState, useEffect } from 'react'
import {
  FileText,
  UploadCloud,
  Eye,
  Trash2,
  ShieldCheck,
  CalendarDays,
  FolderPlus
} from 'lucide-react'
import { getDocuments, uploadDocument, deleteDocument } from '@/services/profile.service'
import './DocumentManager.css'

export default function DocumentManager() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [type, setType] = useState('resume')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const res = await getDocuments()
      if (res.success) setDocuments(res.data || [])
    } catch (error) {
      console.error('Failed to fetch documents', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0])
  }

  const resetForm = () => {
    setFile(null)
    setTitle('')
    setType('resume')
    setDescription('')
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file || !title) return

    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title)
    formData.append('type', type)
    formData.append('description', description)

    try {
      const res = await uploadDocument(formData)
      if (res.success) {
        closeModal()
        fetchDocuments()
      }
    } catch (error) {
      console.error('Failed to upload document', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document permanently?')) return

    try {
      const res = await deleteDocument(id)
      if (res.success) fetchDocuments()
    } catch (error) {
      console.error('Failed to delete document', error)
      alert('Delete failed.')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    )
  }

  return (
    <>
      <div className="document-vault card">
        <div className="card-body">
          <div className="document-vault-header">
            <div>
              <h3 className="page-title mb-1">Credential Vault</h3>
              <p className="page-subtitle mb-0">
                Maintain resumes, certificates, identity proofs and educator credentials securely.
              </p>
            </div>

            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <FolderPlus size={15} /> Upload Document
            </button>
          </div>

          {documents.length === 0 ? (
            <div className="document-empty-state">
              <UploadCloud size={34} />
              <h5>No Credentials Uploaded Yet</h5>
              <p>Start building your educator verification vault by uploading your professional documents.</p>
            </div>
          ) : (
            <div className="document-vault-list">
              {documents.map((doc) => (
                <div key={doc._id} className="document-vault-item">
                  <div className="document-file-icon">
                    <FileText size={18} />
                  </div>

                  <div className="document-file-body">
                    <div className="d-flex justify-content-between gap-3 flex-wrap align-items-start">
                      <div>
                        <h5 className="document-title">{doc.title}</h5>
                        <p className="document-desc">
                          {doc.description || 'No description provided for this credential.'}
                        </p>
                      </div>

                      <span className="document-type-chip">{doc.type}</span>
                    </div>

                    <div className="document-meta-row">
                      <span><CalendarDays size={13} /> Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      <span><ShieldCheck size={13} /> Stored Securely</span>
                    </div>
                  </div>

                  <div className="document-action-col">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-outline-primary"
                    >
                      <Eye size={13} /> View
                    </a>

                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="btn btn-sm btn-outline-danger"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15,23,41,0.45)' }}>
          <div className="modal-dialog modal-dialog-centered custom-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Upload New Credential</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleUpload}>
                  <div className="mb-3">
                    <label className="form-label">Document Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Document Type</label>
                    <select
                      className="form-select"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      <option value="resume">Resume</option>
                      <option value="certificate">Certificate</option>
                      <option value="id_proof">ID Proof</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="upload-zone mb-4">
                    <input
                      type="file"
                      id="docUpload"
                      className="d-none"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <label htmlFor="docUpload" className="upload-zone-label">
                      <UploadCloud size={28} />
                      <div>{file ? file.name : 'Click here to choose credential file'}</div>
                      <small>PDF, DOC, DOCX, JPG, PNG supported</small>
                    </label>
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={!file || !title || uploading}
                    >
                      {uploading ? 'Uploading...' : 'Upload Document'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}