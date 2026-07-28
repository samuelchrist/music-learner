import { clsx } from 'clsx'
export default function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return <span className={clsx('badge',`badge-${difficulty}`)}>{difficulty}</span>
}
