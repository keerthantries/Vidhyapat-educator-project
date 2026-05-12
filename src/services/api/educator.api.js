/**
 * educator.api.js — Educator Profile, Availability, Courses, Batches
 * Location: src/services/api/educator.api.js
 */

import httpClient from '@/utils/httpClient'

/* ── Profile ─────────────────────────────────────── */
export const getEducatorProfile = () =>
    httpClient.get('/educator/profile').then(r => r.data)

export const updateEducatorProfile = (payload) =>
    httpClient.patch('/educator/profile', payload).then(r => r.data)

/* ── Availability ────────────────────────────────── */
export const getAvailability = () =>
    httpClient.get('/educator/availability').then(r => r.data)

export const createAvailability = (payload) =>
    httpClient.post('/educator/availability', payload).then(r => r.data)

export const updateAvailability = (id, payload) =>
    httpClient.patch(`/educator/availability/${id}`, payload).then(r => r.data)

export const deleteAvailability = (id) =>
    httpClient.delete(`/educator/availability/${id}`).then(r => r.data)

/* ── Courses ─────────────────────────────────────── */
export const getMyCourses = (page = 1, limit = 12) =>
    httpClient.get(`/educator/courses?page=${page}&limit=${limit}`).then(r => r.data)

export const getCourseById = (id) =>
    httpClient.get(`/educator/courses/${id}`).then(r => r.data)

/* ── Batches ─────────────────────────────────────── */
export const createBatch = (payload) =>
    httpClient.post('/educator/batches', payload).then(r => r.data)