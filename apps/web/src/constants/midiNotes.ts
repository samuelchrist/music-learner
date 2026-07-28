export const NOTE: Record<string,number> = {
  C3:48,D3:50,E3:52,F3:53,G3:55,A3:57,B3:59,
  C4:60,D4:62,E4:64,F4:65,G4:67,A4:69,B4:71,
  C5:72,D5:74,E5:76,F5:77,G5:79,A5:81,B5:83,
  Cs4:61,Ds4:63,Fs4:66,Gs4:68,As4:70,
  Cs5:73,Ds5:75,Fs5:78,Gs5:80,As5:82
}
export const DRUM: Record<string,number> = {
  KICK:36,SNARE:38,HIHAT:42,OHAT:46,CLAP:39,
  TOM_HI:50,TOM_MD:47,TOM_LO:45,CRASH:49,RIDE:51
}
export const midiToName = (m: number) => {
  if(m===0) return '—'
  const n=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
  return `${n[m%12]}${Math.floor(m/12)-1}`
}
export const midiToFreq = (m: number) => 440*Math.pow(2,(m-69)/12)
