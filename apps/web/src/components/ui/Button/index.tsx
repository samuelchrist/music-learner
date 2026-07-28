import { ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'
interface P extends ButtonHTMLAttributes<HTMLButtonElement> { variant?:'primary'|'secondary'|'ghost'|'danger'; size?:'sm'|'md'|'lg'; loading?:boolean }
export default function Button({ variant='primary', size='md', loading, children, className, disabled, ...p }: P) {
  const v={primary:'btn-primary',secondary:'btn-secondary',ghost:'btn-ghost',danger:'bg-red-900/30 text-red-400 border border-red-800 hover:bg-red-900/50 px-4 py-2.5 rounded-lg text-sm transition-colors'}
  const s={sm:'text-xs px-3 py-1.5',md:'',lg:'text-base px-6 py-3'}
  return <button className={clsx(v[variant],s[size],className)} disabled={disabled||loading} {...p}>{loading?<span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"/>Loading...</span>:children}</button>
}
