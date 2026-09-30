import { http } from './http'
import type { DashboardStats } from '../types'

export const dashboardApi = {
  get: () => http.get<DashboardStats>('/dashboard'),
}
