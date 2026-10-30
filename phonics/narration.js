const novelty=/\b(albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|trinoids|whisper|wobble|zarvox|superstar|junior|grandma|grandpa|fred|ralph|kathy|eddy|flo|reed|rocko|sandy|shelley)\b/i;
export function narrationVoices(voices=[]){
  const score=voice=>{
    const locale=String(voice.lang).toLowerCase().replace('_','-');
    return (locale==='en-au'?500:locale==='en-gb'?300:0)+(/premium|enhanced|natural|neural/i.test(voice.name)?50:0)+(voice.default?1:0);
  };
  return voices.filter(voice=>/^en(?:[-_]|$)/i.test(voice.lang||'')&&!novelty.test(voice.name||'')).sort((first,second)=>score(second)-score(first)||String(first.name).localeCompare(String(second.name)));
}
export function narrationChunks(text,limit=240){
  const words=String(text??'').trim().split(/\s+/).filter(Boolean);
  const chunks=[];
  for(const word of words){
    if(chunks.length&&chunks[chunks.length-1].length+word.length+1<=limit)chunks[chunks.length-1]+=' '+word;
    else chunks.push(word);
  }
  return chunks;
}
export class WordNarrator{
  constructor({speech=globalThis.speechSynthesis,Utterance=globalThis.SpeechSynthesisUtterance,onStatus=()=>{},onVoices=()=>{}}={}){
    this.speech=speech;this.Utterance=Utterance;this.onStatus=onStatus;
    this.generation=0;this.playing=false;this.paused=false;this.current=null;
    this.voiceListener=()=>onVoices(this.voices());
    speech?.addEventListener?.('voiceschanged',this.voiceListener);
  }
  get supported(){return Boolean(this.speech&&typeof this.Utterance==='function');}
  voices(){return this.supported?narrationVoices(this.speech.getVoices()):[];}
  status(message){this.onStatus(message,{playing:this.playing,paused:this.paused});}
  stop(announce=true){
    this.generation++;this.playing=false;this.paused=false;this.current=null;
    this.speech?.cancel();
    if(announce)this.status('Word narration stopped.');
  }
  speak(text,{voiceURI='',rate=1}={}){
    this.stop(false);
    if(!this.supported){this.status('Device narration is unavailable. Read the text or ask for a teacher model.');return false;}
    const voices=this.voices(),voice=voices.find(item=>item.voiceURI===voiceURI)||voices[0];
    if(!voice){this.status('No suitable English voice is available yet. Try Refresh voices or check your device settings.');return false;}
    const content=String(text??'').trim();
    if(!content||content.length>12000){this.status('Choose a non-empty word or passage of up to 12,000 characters.');return false;}
    const chunks=narrationChunks(content),generation=this.generation;
    const playbackRate=Math.max(0.75,Math.min(1.15,Number(rate)||1));
    let index=0;
    this.playing=true;
    const next=()=>{
      if(generation!==this.generation)return;
      if(index===chunks.length){this.playing=false;this.paused=false;this.current=null;this.status('Word narration finished. This was not an isolated phoneme model.');return;}
      const utterance=new this.Utterance(chunks[index++]);
      utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=playbackRate;
      this.current=utterance;
      utterance.onstart=()=>{if(generation===this.generation)this.status(`Reading words · ${voice.name} · ${index}/${chunks.length}`);};
      utterance.onend=next;
      utterance.onerror=()=>{
        if(generation!==this.generation)return;
        this.stop(false);this.status('Device speech could not finish. Try another available voice or use a teacher model.');
      };
      try{this.speech.speak(utterance);}catch{utterance.onerror();}
    };
    this.status('Starting device word narration…');next();return this.playing;
  }
  togglePause(){
    if(!this.playing)return;
    if(this.paused){this.speech.resume();this.paused=false;this.status('Word narration resumed.');}
    else{this.speech.pause();this.paused=true;this.status('Word narration paused.');}
  }
  dispose(){this.stop(false);this.speech?.removeEventListener?.('voiceschanged',this.voiceListener);}
}
