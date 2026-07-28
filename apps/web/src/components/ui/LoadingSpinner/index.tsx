import { clsx } from 'clsx'
export default function LoadingSpinner({ fullScreen, size='md' }: { fullScreen?:boolean; size?:'sm'|'md'|'lg' }) {
  const s={sm:'w-5 h-5',md:'w-8 h-8',lg:'w-12 h-12'}
  const el=<div className={clsx('border-4 border-slate-700 border-t-accent rounded-full animate-spin',s[size])}/>
  return fullScreen ? <div className="fixed inset-0 bg-bg flex items-center justify-center">{el}</div> : el
}
