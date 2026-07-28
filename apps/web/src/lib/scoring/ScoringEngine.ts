import { TIMING_WINDOWS, SCORE_WEIGHTS, getGrade } from '@music-learner/shared'
import type { ScoreResult } from '@music-learner/shared'

interface Event { expectedNote:number; expectedTime:number; playedNote:number|null; playedTime:number|null; timingError:number|null }

export class ScoringEngine {
  private events:Event[]=[];  private total=0
  reset(n:number) { this.events=[]; this.total=n }
  recordHit(en:number,et:number,pn:number,pt:number) { this.events.push({expectedNote:en,expectedTime:et,playedNote:pn,playedTime:pt,timingError:Math.abs(pt-et)}) }
  recordMiss(en:number,et:number) { this.events.push({expectedNote:en,expectedTime:et,playedNote:null,playedTime:null,timingError:null}) }

  calculate():ScoreResult {
    const hits=this.events.filter(e=>e.playedNote!==null)
    const noteAcc=this.total>0?(hits.length/this.total)*100:0
    let timing=0
    if(hits.length>0) {
      const pts=hits.map(h=>{ const e=h.timingError!; return e<=TIMING_WINDOWS.PERFECT?100:e<=TIMING_WINDOWS.GOOD?70:e<=TIMING_WINDOWS.OK?40:0 })
      timing=pts.reduce((a,b)=>a+b,0)/hits.length
    }
    let rhythm=0
    if(hits.length>=2) {
      const errs=hits.map(h=>h.timingError!),mean=errs.reduce((a,b)=>a+b,0)/errs.length
      const std=Math.sqrt(errs.reduce((a,e)=>a+(e-mean)**2,0)/errs.length)
      rhythm=Math.max(0,100-std/3)
    } else if(hits.length===1) rhythm=60
    const overall=noteAcc*SCORE_WEIGHTS.NOTE_ACCURACY+timing*SCORE_WEIGHTS.TIMING+rhythm*SCORE_WEIGHTS.RHYTHM
    return { noteAccuracy:Math.round(noteAcc), timingAccuracy:Math.round(timing), rhythmScore:Math.round(rhythm), overall:Math.round(overall), grade:getGrade(Math.round(overall)), hits:hits.length, misses:this.events.filter(e=>e.playedNote===null).length, totalNotes:this.total }
  }

  getFeedback(r:ScoreResult):string {
    if(r.overall>=95) return '🌟 Absolutely perfect!'
    if(r.overall>=85) return '🎯 Excellent work!'
    if(r.overall>=70) return '👍 Good job! Keep practicing.'
    if(r.overall>=55) return '📈 Getting there! Focus on timing.'
    if(r.noteAccuracy<50) return '🎵 Try to hit more correct notes.'
    return '💪 Keep practicing!'
  }
}
