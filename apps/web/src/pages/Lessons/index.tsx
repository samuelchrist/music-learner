import { useState }          from 'react'
import { useNavigate }       from 'react-router-dom'
import { useLessons }        from '@/hooks/useLesson'
import { useLessonPlayer }   from '@/hooks/useLessonPlayer'
import LessonCard            from '@/components/lessons/LessonCard'
import LoadingSpinner        from '@/components/ui/LoadingSpinner'
import { ROUTES }            from '@/constants/routes'

const INSTRUMENTS = [
  { id: 'piano',  icon: '🎹', label: 'Piano'         },
  { id: 'guitar', icon: '🎸', label: 'Guitar'        },
  { id: 'bass4',  icon: '🎸', label: '4-String Bass' },
  { id: 'bass5',  icon: '🎸', label: '5-String Bass' },
  { id: 'drums',  icon: '🥁', label: 'Drums'         },
]

const PIANO_CATEGORIES = [
  { id: 'all',       icon: '🎵', label: 'All'       },
  { id: 'abrsm',     icon: '🎓', label: 'ABRSM'     },
  { id: 'classical', icon: '🎼', label: 'Classical' },
  { id: 'jazz',      icon: '🎷', label: 'Jazz'      },
  { id: 'pop',       icon: '🎤', label: 'Pop'       },
  { id: 'exercises', icon: '💪', label: 'Exercises' },
  { id: 'custom',    icon: '🎯', label: 'Custom'    },
]

const SUBCATEGORY_MAP: Record<string, { id: string; label: string }[]> = {
  abrsm: [
    { id: 'grade1', label: 'Grade 1' },
    { id: 'grade2', label: 'Grade 2' },
    { id: 'grade3', label: 'Grade 3' },
    { id: 'grade4', label: 'Grade 4' },
    { id: 'grade5', label: 'Grade 5' },
  ],
  classical: [
    { id: 'baroque',          label: 'Baroque'   },
    { id: 'classical_period', label: 'Classical' },
    { id: 'romantic',         label: 'Romantic'  },
    { id: 'modern',           label: 'Modern'    },
  ],
  exercises: [
    { id: 'hanon',            label: 'Hanon'         },
    { id: 'czerny',           label: 'Czerny'        },
    { id: 'scales_arpeggios', label: 'Scales'        },
    { id: 'sight_reading',    label: 'Sight Reading' },
  ],
  jazz: [
    { id: 'blues',          label: 'Blues'     },
    { id: 'jazz_basics',    label: 'Basics'    },
    { id: 'jazz_standards', label: 'Standards' },
    { id: 'improvisation',  label: 'Improv'    },
  ],
}

const SUBCATEGORY_LABELS: Record<string, string> = {
  grade1: 'Grade 1', grade2: 'Grade 2', grade3: 'Grade 3',
  grade4: 'Grade 4', grade5: 'Grade 5',
  baroque: 'Baroque', classical_period: 'Classical Period',
  romantic: 'Romantic', modern: 'Modern',
  hanon: 'Hanon Exercises', czerny: 'Czerny Studies',
  scales_arpeggios: 'Scales & Arpeggios', sight_reading: 'Sight Reading',
  blues: 'Blues', jazz_basics: 'Jazz Basics',
  jazz_standards: 'Jazz Standards', improvisation: 'Improvisation',
  pop_beginner: 'Beginner', pop_chords: 'Chords', pop_songs: 'Songs',
  theory_builder: 'Theory Builder', ear_training: 'Ear Training',
  fun_challenges: 'Fun Challenges',
}

function TabButton({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '7px 14px', borderRadius: 10,
      fontWeight: 600, fontSize: 13,
      border: `2px solid ${active ? '#a855f7' : 'var(--border)'}`,
      background: active ? 'rgba(168,85,247,.15)' : 'var(--surface2)',
      color: active ? '#a855f7' : 'var(--text-sub)',
      cursor: 'pointer', transition: 'all .2s', whiteSpace: 'nowrap',
    }}>
      {children}
    </button>
  )
}

function SubTabButton({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 12px', borderRadius: 8,
      fontWeight: 600, fontSize: 12,
      border: `1px solid ${active ? '#a855f7' : 'var(--border)'}`,
      background: active ? 'rgba(168,85,247,.12)' : 'transparent',
      color: active ? '#a855f7' : 'var(--text-sub)',
      cursor: 'pointer', transition: 'all .2s', whiteSpace: 'nowrap',
    }}>
      {children}
    </button>
  )
}

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <div style={{ height: 1, width: 12, background: '#a855f7' }} />
      <span style={{
        fontSize: 13, fontWeight: 700, color: '#a855f7',
        textTransform: 'uppercase', letterSpacing: 1,
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      <span style={{ fontSize: 11, color: 'var(--text-sub)' }}>
        {count} lesson{count !== 1 ? 's' : ''}
      </span>
    </div>
  )
}

export default function Lessons() {
  const [instrument,  setInstrument]  = useState('piano')
  const [category,    setCategory]    = useState('all')
  const [subcategory, setSubcategory] = useState('all')
  const nav = useNavigate()
  const { playingId, play, stop } = useLessonPlayer()

  const { data: lessons, isLoading } = useLessons(instrument)

  const filtered = (lessons ?? []).filter((l: any) => {
    if (category === 'all') return true
    if (l.category !== category) return false
    if (subcategory === 'all') return true
    return l.subcategory === subcategory
  })

  const grouped = filtered.reduce((acc: Record<string, any[]>, l: any) => {
    const key = l.subcategory || 'general'
    if (!acc[key]) acc[key] = []
    acc[key].push(l)
    return acc
  }, {})

  const categoryCounts = (lessons ?? []).reduce((acc: Record<string, number>, l: any) => {
    acc[l.category] = (acc[l.category] || 0) + 1
    return acc
  }, {})

  const showCategories    = instrument === 'piano'
  const showSubcategories = showCategories && category !== 'all' && !!SUBCATEGORY_MAP[category]
  const showGrouped       = showCategories && category !== 'all' && !!SUBCATEGORY_MAP[category]

  function handleInstrumentChange(id: string) {
    stop()
    setInstrument(id)
    setCategory('all')
    setSubcategory('all')
  }

  function handleCategoryChange(id: string) {
    stop()
    setCategory(id)
    setSubcategory('all')
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 24 }}>Lessons</h1>

      {/* Instrument tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {INSTRUMENTS.map(inst => (
          <TabButton
            key={inst.id}
            active={instrument === inst.id}
            onClick={() => handleInstrumentChange(inst.id)}
          >
            <span style={{ fontSize: 16 }}>{inst.icon}</span>
            {inst.label}
          </TabButton>
        ))}
      </div>

      {/* Category tabs — piano only */}
      {showCategories && (
        <div style={{
          display: 'flex', gap: 8, marginBottom: 16,
          flexWrap: 'wrap', paddingBottom: 16,
          borderBottom: '1px solid var(--border)',
        }}>
          {PIANO_CATEGORIES.map(cat => {
            const count = cat.id === 'all'
              ? (lessons?.length ?? 0)
              : (categoryCounts[cat.id] ?? 0)
            if (cat.id !== 'all' && count === 0) return null
            return (
              <TabButton
                key={cat.id}
                active={category === cat.id}
                onClick={() => handleCategoryChange(cat.id)}
              >
                <span>{cat.icon}</span>
                {cat.label}
                <span style={{
                  background:   category === cat.id ? 'rgba(168,85,247,.3)' : 'var(--border)',
                  color:        category === cat.id ? '#a855f7' : 'var(--text-sub)',
                  borderRadius: 999, fontSize: 10, fontWeight: 700,
                  padding: '1px 6px', marginLeft: 2,
                }}>
                  {count}
                </span>
              </TabButton>
            )
          })}
        </div>
      )}

      {/* Subcategory tabs */}
      {showSubcategories && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          <SubTabButton active={subcategory === 'all'} onClick={() => setSubcategory('all')}>
            All
          </SubTabButton>
          {SUBCATEGORY_MAP[category].map(sub => (
            <SubTabButton
              key={sub.id}
              active={subcategory === sub.id}
              onClick={() => setSubcategory(sub.id)}
            >
              {sub.label}
            </SubTabButton>
          ))}
        </div>
      )}

      {/* Lesson list */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <LoadingSpinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 60,
          color: 'var(--text-sub)', fontSize: 14,
        }}>
          No lessons found.
        </div>
      ) : !showGrouped ? (
        // Flat list
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((lesson: any, i: number) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              index={i}
              onClick={() => nav(ROUTES.PRACTICE(lesson.id))}
              playingId={playingId}
              onListen={play}
            />
          ))}
        </div>
      ) : (
        // Grouped by subcategory
        Object.entries(grouped).map(([subcat, items]) => (
          <div key={subcat} style={{ marginBottom: 32 }}>
            <SectionHeader
              label={SUBCATEGORY_LABELS[subcat] ?? subcat}
              count={items.length}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(items as any[]).map((lesson: any, i: number) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  index={i}
                  onClick={() => nav(ROUTES.PRACTICE(lesson.id))}
                  playingId={playingId}
                  onListen={play}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
