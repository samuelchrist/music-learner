import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
export default function NotFound() {
  const nav=useNavigate()
  return <div className="min-h-[calc(100vh-57px)] flex flex-col items-center justify-center gap-6"><p className="text-8xl">🎵</p><h1 className="text-4xl font-black">404 — Off Key!</h1><p className="text-slate-400">This page doesn't exist.</p><Button onClick={()=>nav('/')}>Back Home</Button></div>
}
