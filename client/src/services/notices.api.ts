import { http } from './http'
import type { Notice } from '../types'

export interface NoticeInput {
  title: string
  body: string
  audience: 'all' | 'teachers' | 'students'
}

export const noticesApi = {
  list: () => http.get<{ notices: Notice[] }>('/notices'),
  create: (data: NoticeInput) => http.post<{ notice: Notice }>('/notices', data),
  update: (id: number, data: Partial<NoticeInput>) =>
    http.patch<{ notice: Notice }>(`/notices/${id}`, data),
  remove: (id: number) => http.del<{ message: string }>(`/notices/${id}`),
}
