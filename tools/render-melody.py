from pathlib import Path
import math, wave, array
notes={'G4':392,'A4':440,'B4':493.88,'C5':523.25,'D5':587.33,'E5':659.25,'F5':698.46,'G5':783.99}
melody=[('G4',.5),('G4',.5),('A4',1),('G4',1),('C5',1),('B4',2),('G4',.5),('G4',.5),('A4',1),('G4',1),('D5',1),('C5',2),('G4',.5),('G4',.5),('G5',1),('E5',1),('C5',1),('B4',1),('A4',2),('F5',.5),('F5',.5),('E5',1),('C5',1),('D5',1),('C5',2.5)]
rate=22050
length=sum(beats*.43 for _,beats in melody)+1.1
samples=[0.0]*math.ceil(length*rate)
start=.1
for note,beats in melody:
    duration=beats*.43
    for i in range(int((duration+.4)*rate)):
        t=i/rate
        envelope=min(t/.012,1)*math.exp(-3.9*t)*min(1,max(0,(duration+.4-t)/.08))
        tone=(math.sin(2*math.pi*notes[note]*t)+.12*math.sin(2*math.pi*notes[note]*2.75*t))*.18*envelope
        offset=int(start*rate)+i
        if offset<len(samples):samples[offset]+=tone
    start+=duration
pcm=array.array('h',(round(max(-1,min(1,v))*32767) for v in samples))
with wave.open('assets/birthday-melody.wav','wb') as out:
    out.setnchannels(1);out.setsampwidth(2);out.setframerate(rate);out.writeframes(pcm.tobytes())
print(f'Birthday melody: {length:.2f}s, {len(pcm)} samples, peak {max(abs(v) for v in pcm)/32767:.3f}')
