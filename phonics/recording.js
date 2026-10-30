import {CLIP_LIMITS} from './clips.js';

export class PhonemeRecorder{
  constructor({mediaDevices=globalThis.navigator?.mediaDevices,Recorder=globalThis.MediaRecorder,setTimer=globalThis.setTimeout,clearTimer=globalThis.clearTimeout,onStatus=()=>{}}={}){
    this.mediaDevices=mediaDevices;this.Recorder=Recorder;this.setTimer=setTimer.bind(globalThis);this.clearTimer=clearTimer.bind(globalThis);this.onStatus=onStatus;
    this.generation=0;this.busy=false;this.stream=null;this.recorder=null;this.timer=null;this.finish=null;
  }
  get supported(){return Boolean(this.mediaDevices?.getUserMedia&&this.Recorder);}
  releaseTracks(){this.stream?.getTracks().forEach(track=>track.stop());this.stream=null;}
  async start({consent=false}={}){
    if(consent!==true)throw Error('Confirm recording consent before requesting microphone access.');
    if(!this.supported)throw Error('Microphone recording is unavailable. Upload an existing permitted clip instead.');
    if(this.busy)throw Error('A recording or microphone request is already in progress.');
    this.busy=true;const generation=++this.generation;
    this.onStatus('Requesting microphone permission. You can cancel without recording.');
    let stream;
    try{stream=await this.mediaDevices.getUserMedia({audio:true});}
    catch{if(generation===this.generation){this.busy=false;this.onStatus('Microphone access was not granted. No recording was saved.');}return null;}
    if(generation!==this.generation){stream.getTracks().forEach(track=>track.stop());return null;}
    this.stream=stream;
    const mime=['audio/webm;codecs=opus','audio/ogg;codecs=opus','audio/mp4','audio/webm'].find(type=>this.Recorder.isTypeSupported?.(type));
    let recorder;
    try{recorder=new this.Recorder(stream,mime?{mimeType:mime}:undefined);}
    catch{this.busy=false;this.releaseTracks();throw Error('This browser could not start audio capture. No recording was saved.');}
    this.recorder=recorder;
    const chunks=[];let bytes=0,failed=false;
    const result=new Promise(resolve=>{this.finish=resolve;});
    const finish=blob=>{
      if(generation!==this.generation)return;
      this.clearTimer(this.timer);this.timer=null;this.releaseTracks();this.recorder=null;this.busy=false;
      const resolve=this.finish;this.finish=null;resolve?.(blob);
    };
    recorder.ondataavailable=event=>{
      if(generation!==this.generation||!event.data?.size)return;
      bytes+=event.data.size;
      if(bytes>CLIP_LIMITS.bytes){failed=true;this.stop();return;}
      chunks.push(event.data);
    };
    recorder.onerror=()=>{if(generation!==this.generation)return;failed=true;this.stop();finish(null);this.onStatus('Recording failed. No audio was saved.');};
    recorder.onstop=()=>{
      if(generation!==this.generation)return;
      const blob=failed||!chunks.length?null:new Blob(chunks,{type:recorder.mimeType||chunks[0].type});
      finish(blob);this.onStatus(blob?'Recording captured locally. Preview and review before saving.':'Recording was empty or exceeded its limit. Nothing was saved.');
    };
    try{recorder.start(200);this.onStatus('Microphone is recording · maximum 10 seconds.');this.timer=this.setTimer(()=>this.stop(),CLIP_LIMITS.maxSeconds*1000);}
    catch{failed=true;finish(null);this.onStatus('Recording could not start. No audio was saved.');}
    return result;
  }
  stop(){
    this.clearTimer(this.timer);this.timer=null;
    if(this.busy&&!this.recorder){this.cancel();return;}
    if(this.recorder&&this.recorder.state!=='inactive'){
      try{this.recorder.stop();}catch{this.cancel();}
    }
    this.releaseTracks();
  }
  cancel(){
    this.generation++;this.clearTimer(this.timer);this.timer=null;
    if(this.recorder&&this.recorder.state!=='inactive'){try{this.recorder.stop();}catch{}}
    this.recorder=null;this.releaseTracks();this.busy=false;this.finish?.(null);this.finish=null;
    this.onStatus('Recording cancelled. Nothing was saved.');
  }
}
