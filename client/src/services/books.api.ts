import { http } from './http'
import type { Book } from '../types'

export const booksApi = {
  list: (classId?: number) =>
    http.get<{ books: Book[] }>(
      `/books${classId ? `?classId=${classId}` : ''}`
    ),
  create: (data: { classId: number; title: string; subject?: string }) =>
    http.post<{ book: Book }>('/books', data),
  update: (id: number, data: { title?: string; subject?: string | null }) =>
    http.patch<{ book: Book }>(`/books/${id}`, data),
  remove: (id: number) => http.del<{ message: string }>(`/books/${id}`),
}
