import { http } from './http'
import type { ClassResult, ResultCard } from '../types'

export const resultsApi = {
  exams: (sectionId: number) =>
    http.get<{ exams: string[] }>(`/results/exams?sectionId=${sectionId}`),
  classResults: (sectionId: number, examName: string) =>
    http.get<ClassResult>(
      `/results/class?sectionId=${sectionId}&examName=${encodeURIComponent(examName)}`
    ),
  card: (studentId: number, examName: string) =>
    http.get<{ card: ResultCard }>(
      `/results/card?studentId=${studentId}&examName=${encodeURIComponent(examName)}`
    ),
}
