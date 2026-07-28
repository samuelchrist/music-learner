import { HTMLAttributes } from 'react'
import { clsx } from 'clsx'
interface P extends HTMLAttributes<HTMLDivElement> { hover?: boolean }
export default function Card({ hover, children, className, ...p }: P) {
  return <div className={clsx('card', hover&&'hover:border-accent/50 hover:translate-x-1 transition-all cursor-pointer', className)} {...p}>{children}</div>
}
