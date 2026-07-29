import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  onComplete: () => void
  bpm:        number
  message?:   string
  color?:     string
}

export default function Countdown({ onComplete, bpm, message, color = '#a855f7' }: Props) {
  const [phase, setPhase] = useState<'message' | 'counting'>('message')
  const [count, setCount] = useState(3)

  // Show message for 1.5s then start counting
  useEffect(() => {
    if (!message) { setPhase('counting'); return }
    const t = setTimeout(() => setPhase('counting'), 1500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (phase !== 'counting') return
    if (count === 0) { onComplete(); return }
    const t = setTimeout(() => setCount(c => c - 1), (60 / bpm) * 1000)
    return () => clearTimeout(t)
  }, [count, bpm, phase])

  return (
    <div style={{
      position:       'fixed', inset: 0,
      background:     'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(6px)',
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      zIndex:         50, gap: 24,
    }}>
      <AnimatePresence mode="wait">
        {phase === 'message' && message ? (
          <motion.div
            key="msg"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0,   opacity: 1 }}
            exit={{    y:  20, opacity: 0 }}
            style={{
              fontSize:   28,
              fontWeight: 800,
              color,
              textAlign:  'center',
              padding:    '0 32px',
              textShadow: `0 0 40px ${color}`,
            }}
          >
            {message}
          </motion.div>
        ) : (
          <motion.div
            key={count}
            initial={{ scale: 1.6, opacity: 0 }}
            animate={{ scale: 1,   opacity: 1 }}
            exit={{    scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              fontSize:   120,
              fontWeight: 900,
              color,
              lineHeight: 1,
              textShadow: `0 0 60px ${color}`,
            }}
          >
            {count === 0 ? 'GO!' : count}
          </motion.div>
        )}
      </AnimatePresence>

      {/* BPM dots */}
      {phase === 'counting' && (
        <div style={{ display: 'flex', gap: 10 }}>
          {[1,2,3,4].map(b => (
            <motion.div
              key={b}
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 60/bpm, delay: (b-1)*(60/bpm), repeat: Infinity }}
              style={{
                width: 10, height: 10, borderRadius: '50%',
                background: color,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
