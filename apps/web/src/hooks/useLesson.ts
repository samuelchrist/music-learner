import { useQuery }      from '@tanstack/react-query'
import { lessonService } from '@/services/lesson.service'

export function useLessons(instrument?: string) {
  return useQuery({ queryKey:['lessons',instrument], queryFn:async()=>{ const {data}=await lessonService.getAll(instrument); return data.data }, staleTime:5*60*1000 })
}
export function useLesson(id:string) {
  return useQuery({ queryKey:['lesson',id], queryFn:async()=>{ const {data}=await lessonService.getById(id); return data.data }, enabled:!!id })
}
