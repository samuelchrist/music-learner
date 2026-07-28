import { motion, AnimatePresence } from 'framer-motion'
export default function FeedbackFlash({ text, color, show }: { text:string; color:string; show:boolean }) {
  return (
    <AnimatePresence>
      {show&&<motion.div key={text+Date.now()} initial={{scale:.5,opacity:0}} animate={{scale:1.2,opacity:1}} exit={{scale:1,opacity:0}} transition={{duration:.3}}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-black pointer-events-none z-50"
        style={{color,textShadow:`0 0 30px ${color}`}}>{text}</motion.div>}
    </AnimatePresence>
  )
}
