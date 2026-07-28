import { clsx } from 'clsx'
const IB=(n:number)=>[1,3,6,8,10].includes(n%12)
export default function PianoRoll({ activeNotes, expectedNote, startMidi=48, endMidi=84 }: { activeNotes:Set<number>; expectedNote?:number; startMidi?:number; endMidi?:number }) {
  const whites=[]
  const names=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
  for(let m=startMidi;m<=endMidi;m++) {
    if(!IB(m)) whites.push(
      <div key={m} className={clsx('piano-key-white',activeNotes.has(m)&&'active',m===expectedNote&&'expected')}>
        {names[m%12]}{Math.floor(m/12)-1}
      </div>
    )
  }
  return <div className="flex overflow-x-auto p-4 justify-center"><div className="flex">{whites}</div></div>
}
