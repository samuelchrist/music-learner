import { motion } from 'framer-motion'

const DIFFICULTY_CONFIG = {
  easy:   { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  label: 'Easy'   },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  label: 'Medium' },
  hard:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'Hard'   },
  expert: { color: '#a855f7', bg: 'rgba(168,85,247,0.1)',  label: 'Expert' },
} as const

const GRADE_CONFIG: Record<number, { color: string; bg: string }> = {
  1: { color: '#10b981', bg: 'rgba(16,185,129,0.15)'  },
  2: { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)'  },
  3: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)'  },
  4: { color: '#f97316', bg: 'rgba(249,115,22,0.15)'  },
  5: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)'   },
}

const PLAN_CONFIG = {
  FREE:  { color: '#10b981', label: 'Free',  icon: '🆓' },
  BASIC: { color: '#3b82f6', label: 'Basic', icon: '⭐' },
  PRO:   { color: '#a855f7', label: 'Pro',   icon: '👑' },
}

interface Props {
  lesson:    any
  index:     number
  onClick:   () => void
  playingId?: string | null
  onListen?: (lesson: any) => void
}

function getGradeLetter(score: number): string {
  if (score >= 95) return 'S'
  if (score >= 90) return 'A+'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B+'
  if (score >= 60) return 'B'
  return 'C'
}

export default function LessonCard({ lesson, index, onClick, playingId, onListen }: Props) {
  const { progress }  = lesson
  const locked        = !progress?.unlocked
  const completed     = !!progress?.bestScore
  const diff          = DIFFICULTY_CONFIG[lesson.difficulty as keyof typeof DIFFICULTY_CONFIG]
  const gradeNum      = lesson.grade ?? 1
  const gradeConf     = GRADE_CONFIG[gradeNum] || GRADE_CONFIG[1]
  const planConf      = PLAN_CONFIG[lesson.requiredPlan as keyof typeof PLAN_CONFIG] || PLAN_CONFIG.FREE
  const bestScore     = progress?.bestScore ? Math.round(progress.bestScore) : null
  const isPlaying     = playingId === lesson.id

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      style={{
        background:   locked ? '#0f172a' : '#1a1a2e',
        border:       `1px solid ${locked ? '#1e293b' : completed ? '#10b98144' : '#1e293b'}`,
        borderLeft:   `4px solid ${locked ? '#1e293b' : completed ? '#10b981' : gradeConf.color}`,
        borderRadius: 12,
        padding:      '14px 16px',
        cursor:       locked ? 'not-allowed' : 'pointer',
        opacity:      locked ? 0.5 : 1,
        transition:   'all 0.2s ease',
        display:      'flex',
        alignItems:   'center',
        gap:          14,
        position:     'relative',
      }}
    >

      {/* Left — Number / Check */}
      <div
        onClick={() => !locked && onClick()}
        style={{
          width:          40,
          height:         40,
          borderRadius:   '50%',
          background:     completed
            ? 'linear-gradient(135deg,#10b981,#059669)'
            : locked ? '#1e293b' : gradeConf.bg,
          border:         `2px solid ${completed ? '#10b981' : locked ? '#334155' : gradeConf.color}`,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          fontWeight:     700,
          fontSize:       completed ? 18 : 14,
          color:          completed ? '#fff' : locked ? '#475569' : gradeConf.color,
          flexShrink:     0,
          boxShadow:      completed ? '0 0 12px rgba(16,185,129,0.4)' : 'none',
        }}
      >
        {completed ? '✓' : locked ? '🔒' : index + 1}
      </div>

      {/* Center — Info */}
      <div
        onClick={() => !locked && onClick()}
        style={{ flex: 1, minWidth: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{
            fontSize:  15,
            fontWeight: 700,
            color:     locked ? '#475569' : '#e2e8f0',
          }}>
            {lesson.name}
          </span>
          {lesson.composer && (
            <span style={{ fontSize: 11, color: 'var(--text-sub)' }}>
              — {lesson.composer}
            </span>
          )}
        </div>
        <p style={{ fontSize: 12, color: '#64748b', marginBottom: 6, lineHeight: 1.4 }}>
          {lesson.description}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{
            padding:      '2px 8px',
            borderRadius: 999,
            fontSize:     11,
            fontWeight:   700,
            background:   gradeConf.bg,
            color:        gradeConf.color,
            border:       `1px solid ${gradeConf.color}44`,
          }}>
            Grade {gradeNum}
          </span>

          <span style={{
            padding:      '2px 8px',
            borderRadius: 999,
            fontSize:     11,
            fontWeight:   600,
            background:   diff?.bg,
            color:        diff?.color,
          }}>
            {diff?.label}
          </span>

          <span style={{
            padding:      '2px 8px',
            borderRadius: 999,
            fontSize:     11,
            color:        '#64748b',
            background:   '#1e293b',
            border:       '1px solid #334155',
          }}>
            ♩ {lesson.bpm} BPM
          </span>

          {lesson.requiredPlan !== 'FREE' && (
            <span style={{
              padding:      '2px 8px',
              borderRadius: 999,
              fontSize:     11,
              fontWeight:   600,
              background:   `${planConf.color}22`,
              color:        planConf.color,
              border:       `1px solid ${planConf.color}44`,
            }}>
              {planConf.icon} {planConf.label}
            </span>
          )}
        </div>
      </div>

      {/* Right — Listen + Score */}
      <div style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'flex-end',
        gap:            8,
        flexShrink:     0,
      }}>

        {/* Listen button */}
        {onListen && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onListen(lesson)
            }}
            title={isPlaying ? 'Stop preview' : 'Preview melody'}
            style={{
              display:        'flex',
              alignItems:     'center',
              gap:            5,
              padding:        '5px 10px',
              borderRadius:   8,
              fontSize:       12,
              fontWeight:     600,
              border:         `1px solid ${isPlaying ? '#a855f7' : 'var(--border)'}`,
              background:     isPlaying
                ? 'rgba(168,85,247,0.2)'
                : 'var(--surface2)',
              color:          isPlaying ? '#a855f7' : 'var(--text-sub)',
              cursor:         'pointer',
              transition:     'all .2s',
            }}
          >
            {isPlaying ? (
              <>
                <span style={{ fontSize: 14 }}>⏹</span>
                Stop
              </>
            ) : (
              <>
                <span style={{ fontSize: 14 }}>▶</span>
                Listen
              </>
            )}
          </button>
        )}

        {/* Score */}
        {bestScore !== null ? (
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize:   22,
              fontWeight: 900,
              color:      '#f59e0b',
              lineHeight: 1,
            }}>
              {getGradeLetter(bestScore)}
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              {bestScore}%
            </div>
          </div>
        ) : !locked ? (
          <div style={{ fontSize: 11, color: '#475569', fontStyle: 'italic' }}>
            Not played
          </div>
        ) : (
          <div style={{
            fontSize:     11,
            color:        planConf.color,
            background:   `${planConf.color}22`,
            padding:      '4px 8px',
            borderRadius: 6,
            fontWeight:   600,
          }}>
            {planConf.icon} {planConf.label}
          </div>
        )}

        {/* XP */}
        <div style={{ fontSize: 11, color: '#a855f7', fontWeight: 600 }}>
          +{lesson.xpReward} XP
        </div>

        {/* Attempts */}
        {progress?.attempts > 0 && (
          <div style={{ fontSize: 10, color: '#475569' }}>
            {progress.attempts} attempt{progress.attempts > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </motion.div>
  )
}
