import {soundById} from './course.js';

export const CLIP_LIMITS=Object.freeze({bytes:1000000,minSeconds:0.1,maxSeconds:10,database:'lexiquest-sound-studio-clips-v1'});
export const clipMimeTypes=['audio/webm','audio/ogg','audio/mp4','audio/x-m4a','audio/m4a','audio/mpeg','audio/mp3','audio/wav','audio/x-wav','audio/wave'];
const mimeType=blob=>String(blob?.type||'').toLowerCase().split(';')[0].trim();
export function validateClipBlob(blob){
  if(!(blob instanceof Blob)||!blob.size||blob.size>CLIP_LIMITS.bytes)throw Error('Use a non-empty audio clip of at most 1 MB.');
  if(!clipMimeTypes.includes(mimeType(blob)))throw Error('Use a supported WebM, Ogg, MP4/M4A, MP3 or WAV audio file.');
  return blob;
}
// Browsers label an audio-only .webm file as video/webm from its extension. inspectClip still decodes it as audio.
export function audioTypedFile(file){return mimeType(file)==='video/webm'?new Blob([file],{type:'audio/webm'}):file;}
export async function inspectClip(blob,AudioContextType=globalThis.AudioContext||globalThis.webkitAudioContext){
  validateClipBlob(blob);
  if(!AudioContextType)throw Error('This browser cannot inspect audio safely. Try a current browser with audio decoding support.');
  const context=new AudioContextType();
  try{
    const buffer=await context.decodeAudioData(await blob.arrayBuffer());
    if(!Number.isFinite(buffer.duration)||buffer.duration<CLIP_LIMITS.minSeconds||buffer.duration>CLIP_LIMITS.maxSeconds)throw Error('Use a sound model lasting between 0.1 and 10 seconds.');
    return {duration:buffer.duration,channels:buffer.numberOfChannels};
  }catch(error){
    if(error.message==='Use a sound model lasting between 0.1 and 10 seconds.')throw error;
    throw Error('This file could not be decoded as supported audio. Try a different audio format.');
  }finally{try{await context.close();}catch{}}
}
export function reviewedClip({soundId,blob,duration,accent,source='upload',consent,reviewed,playbackCompleted},now=new Date()){
  if(!soundById(soundId))throw Error('Choose one of the 44 reference sounds.');
  validateClipBlob(blob);
  if(!Number.isFinite(duration)||duration<CLIP_LIMITS.minSeconds||duration>CLIP_LIMITS.maxSeconds)throw Error('Use a sound model lasting between 0.1 and 10 seconds.');
  if(consent!==true)throw Error('Confirm permission to use this audio and that it contains no student personal information.');
  if(playbackCompleted!==true||reviewed!==true)throw Error('Play the complete preview, then confirm you reviewed this isolated sound model.');
  if(!['en-AU','en-GB','other'].includes(accent))throw Error('Choose the model accent, or Other / not specified.');
  if(!['upload','recording'].includes(source))throw Error('Unknown clip source.');
  return {id:soundId,blob,duration,accent,source,reviewed:true,reviewedAt:now.toISOString(),version:1};
}
export function usableClip(value){
  try{
    if(value?.version!==1||value.reviewed!==true||!value.reviewedAt)return false;
    reviewedClip({soundId:value.id,blob:value.blob,duration:value.duration,accent:value.accent,source:value.source,consent:true,reviewed:true,playbackCompleted:true});
    return true;
  }catch{return false;}
}

export class LocalClipStore{
  constructor(indexedDB=globalThis.indexedDB){this.indexedDB=indexedDB;this.opening=null;}
  async open(){
    if(!this.indexedDB)throw Error('Local audio storage is unavailable. Nothing has been saved.');
    if(!this.opening){
      this.opening=new Promise((resolve,reject)=>{
        const request=this.indexedDB.open(CLIP_LIMITS.database,1);
        let failed=false;
        request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('clips'))request.result.createObjectStore('clips',{keyPath:'id'});};
        request.onsuccess=()=>{
          const database=request.result;
          if(failed){database.close();return;}
          database.onversionchange=()=>{database.close();this.opening=null;};
          resolve(database);
        };
        const fail=message=>{failed=true;this.opening=null;reject(Error(message));};
        request.onerror=()=>fail('Local audio storage could not be opened. Nothing has been saved.');
        request.onblocked=()=>fail('Close other Sound Studio tabs and try again. Local audio storage is blocked.');
      });
    }
    const opening=this.opening;
    try{return await opening;}catch(error){if(this.opening===opening)this.opening=null;throw error;}
  }
  async transaction(mode,operation){
    const database=await this.open();
    return new Promise((resolve,reject)=>{
      const transaction=database.transaction('clips',mode);
      let value;
      const request=operation(transaction.objectStore('clips'));
      request.onsuccess=()=>{value=request.result;};
      transaction.oncomplete=()=>resolve(value);
      transaction.onabort=()=>reject(Error('Local audio storage failed or is full. The requested change was not saved.'));
      transaction.onerror=()=>{};
    });
  }
  async list(){return (await this.transaction('readonly',store=>store.getAll())).filter(usableClip);}
  async get(id){if(!soundById(id))return null;const value=await this.transaction('readonly',store=>store.get(id));return usableClip(value)?value:null;}
  async save(input){const clip=reviewedClip(input);await this.transaction('readwrite',store=>store.put(clip));return clip;}
  async remove(id){if(!soundById(id))throw Error('Unknown sound.');await this.transaction('readwrite',store=>store.delete(id));}
  async close(){const opening=this.opening;this.opening=null;try{(await opening)?.close();}catch{}}
}

export class SoundClipPlayer{
  constructor(audio,{url=globalThis.URL,onStatus=()=>{},onPlay=()=>{}}={}){
    this.audio=audio;this.url=url;this.onStatus=onStatus;this.onPlay=onPlay;this.objectURL=null;this.playbackCompleted=false;this.disposed=false;
    this.playListener=()=>{this.playbackCompleted=false;this.onPlay();};
    this.endListener=()=>{if(!this.objectURL||this.audio.currentSrc!==this.objectURL||this.audio.ended!==true)return;this.playbackCompleted=true;this.onStatus('Preview finished. A teacher must judge sound accuracy before saving.');};
    this.errorListener=()=>{this.playbackCompleted=false;this.onStatus('This preview could not play. Try a different audio file.');};
    audio.addEventListener('play',this.playListener);audio.addEventListener('ended',this.endListener);audio.addEventListener('error',this.errorListener);
  }
  load(blob){
    if(this.disposed)throw Error('This audio preview has been closed.');
    validateClipBlob(blob);this.clear();this.objectURL=this.url.createObjectURL(blob);this.audio.src=this.objectURL;this.audio.load();
    this.onStatus('Use the audio Play control to listen. This is a supplied clip, not a verified phoneme.');
  }
  clear(){
    this.audio.pause();this.audio.removeAttribute('src');this.audio.load();this.playbackCompleted=false;
    if(this.objectURL){this.url.revokeObjectURL(this.objectURL);this.objectURL=null;}
  }
  dispose(){
    this.clear();this.disposed=true;
    this.audio.removeEventListener('play',this.playListener);this.audio.removeEventListener('ended',this.endListener);this.audio.removeEventListener('error',this.errorListener);
  }
}
