import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
export default function Countdown({ onComplete, bpm }: { onComplete:()=>void; bpm:number }) {
  const [count,setCount]=useState(3)
  useEffect(()=>{
    if(count===0){onComplete();return}
    const t=setTimeout(()=>setCount(c=>c-1),(60/bpm)*1000)
    return()=>clearTimeout(t)
  },[count,bpm])
  return (
    <div className="fixed inset-0 bg-bg/90 backdrop-blur-sm flex items-center justify-center z-50">
      <AnimatePresence mode="wait">
        <motion.div key={count} initial={{scale:1.5,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.5,opacity:0}} transition={{duration:.3}}
          className="text-9xl font-black text-accent-light" style={{textShadow:'0 0 60px #7c3aed'}}>
          {count===0?'GO!':count}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
