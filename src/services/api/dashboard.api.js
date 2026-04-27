/**
 * dashboard.api.js — Dashboard API calls
 * Location: src/services/api/dashboard.api.js
 */

import httpClient from '@/utils/httpClient'

export const getDashboardSummary = () =>
    httpClient.get('/educator/dashboard').then(r => r.data)

export const getMyBatches = () =>
    httpClient.get('/educator/dashboard/batches').then(r => r.data)

export const getCalendarEvents = () =>
    httpClient.get('/educator/calendar').then(r => r.data)