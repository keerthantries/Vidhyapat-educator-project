import React, { useState, useEffect } from 'react'
import { getDocuments, uploadDocument, deleteDocument } from '@/services/profile.service'

export default function DocumentManager() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  
  // Form state
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
      if (res.success) {
        setDocuments(res.data)
      }
    } catch (error) {
      console.error('Failed to fetch documents', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
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
        setShowModal(false)
        resetForm()
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
    if (!window.confirm('Are you sure you want to delete this document?')) return

    try {
      const res = await deleteDocument(id)
      if (res.success) {
        fetchDocuments()
      }
    } catch (error) {
      console.error('Failed to delete document', error)
      alert('Delete failed.')
    }
  }

  const resetForm = () => {
    setFile(null)
    setTitle('')
    setType('resume')
    setDescription('')
  }

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
  }

  return (
    <div className="document-manager">
      <div className="document-header">
        <h4>My Documents</h4>
        <button className="btn btn-primary px-4 rounded-pill" onClick={() => setShowModal(true)}>
          + Upload New
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <p>No documents uploaded yet.</p>
        </div>
      ) : (
        <div className="document-list">
          {documents.map((doc) => (
            <div key={doc._id} className="document-card">
              <div className="document-icon">
                📄
              </div>
              <div className="document-info">
                <h5>{doc.title}</h5>
                <p>{doc.description || 'No description provided'}</p>
                <div className="document-meta">
                  Type: <span className="badge bg-secondary">{doc.type}</span> • {new Date(doc.uploadedAt).toLocaleDateString()}
                </div>
              </div>
              <div className="document-actions mt-3">
                <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary flex-grow-1">
                  View
                </a>
                <button onClick={() => handleDelete(doc._id)} className="btn btn-sm btn-outline-danger">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal - Using Bootstrap Modal classes manually for simplicity */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered custom-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Upload Document</h5>
                <button type="button" className="btn-close" onClick={() => { setShowModal(false); resetForm(); }}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpload}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Document Title</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. My Professional Resume"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Document Type</label>
                    <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                      <option value="resume">Resume</option>
                      <option value="certificate">Certificate</option>
                      <option value="id_proof">ID Proof</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Description</label>
                    <textarea 
                      className="form-control" 
                      rows="2" 
                      placeholder="Brief description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-bold">File</label>
                    <div className={`upload-dropzone ${file ? 'has-file' : ''}`}>
                      <input 
                        type="file" 
                        className="form-control d-none" 
                        id="fileUpload" 
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                      <label htmlFor="fileUpload" className="w-100 h-100" style={{cursor: 'pointer'}}>
                        {file ? (
                          <div>
                            <div style={{fontSize: '24px'}}>📄</div>
                            <div className="mt-2 text-primary fw-bold">{file.name}</div>
                            <div className="text-muted small">Click to change file</div>
                          </div>
                        ) : (
                          <div>
                            <div style={{fontSize: '32px', color: '#adb5bd'}}>📁</div>
                            <div className="mt-2 text-muted fw-bold">Click to select a file</div>
                            <div className="text-muted small">Supported formats: PDF, DOC, JPG</div>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-light" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
                    <button type="submit" className="btn btn-primary px-4" disabled={!file || !title || uploading}>
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
