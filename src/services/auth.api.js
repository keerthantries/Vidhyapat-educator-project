import httpClient from '@/utils/httpClient'

export const educatorLogin = async (data) => {
  const response = await httpClient.post('/auth/educator/login', data)
  return response.data
}
