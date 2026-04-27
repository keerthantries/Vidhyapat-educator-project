import httpClient from '@/utils/httpClient'

export const getDashboardSummary = async () => {
  const response = await httpClient.get('/educator/dashboard')
  return response.data
}

export const getDocuments = async () => {
  const response = await httpClient.get('/educator/documents')
  return response.data
}

export const uploadDocument = async (formData) => {
  const response = await httpClient.post('/educator/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const deleteDocument = async (id) => {
  const response = await httpClient.delete(`/educator/documents/${id}`)
  return response.data
}
