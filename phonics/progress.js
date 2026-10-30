import {lessonById} from './course.js';

export const PROGRESS_KEY='lexiquest-sound-studio-progress-v1';
const emptyState=()=>({version:1,lessons:{},sessions:[]});
const count=value=>Number.isInteger(value)&&value>=0&&value<=10000;
const date=value=>typeof value==='string'&&value.length<=40&&Number.isFinite(Date.parse(value));
export function validSummary(value){
  return value?.finished===true&&['en-AU','en-GB'].includes(value.accent)&&Number.isInteger(value.rounds)&&value.rounds>=1&&value.rounds<=20&&count(value.independentFirstCorrect)&&value.independentFirstCorrect<=value.rounds&&count(value.revealed)&&value.revealed<=value.rounds&&count(value.extraAttempts);
}
export function parseProgress(raw){
  if(raw===null)return emptyState();
  if(typeof raw!=='string'||raw.length>250000)throw Error('Invalid progress size.');
  const value=JSON.parse(raw);
  if(!value||value.version!==1||!value.lessons||typeof value.lessons!=='object'||Array.isArray(value.lessons)||!Array.isArray(value.sessions)||value.sessions.length>50||Object.keys(value.lessons).length>149)throw Error('Invalid progress format.');
  const state=emptyState();
  for(const [id,record] of Object.entries(value.lessons)){
    if(!lessonById(id)||!record||!count(record.attempts)||typeof record.practised!=='boolean'||!date(record.updatedAt)||!(record.firstCorrect===null||typeof record.firstCorrect==='boolean')||!(record.lastCorrect===null||typeof record.lastCorrect==='boolean')||(record.attempts===0&&(record.firstCorrect!==null||record.lastCorrect!==null))||(record.attempts>0&&(record.firstCorrect===null||record.lastCorrect===null)))throw Error('Invalid lesson history.');
    state.lessons[id]={attempts:record.attempts,firstCorrect:record.firstCorrect,lastCorrect:record.lastCorrect,practised:record.practised,updatedAt:record.updatedAt};
  }
  state.sessions=value.sessions.map(record=>{
    if(!validSummary(record)||!date(record.completedAt)||typeof record.id!=='string'||record.id.length>100)throw Error('Invalid listening history.');
    return {id:record.id,finished:true,accent:record.accent,rounds:record.rounds,independentFirstCorrect:record.independentFirstCorrect,revealed:record.revealed,extraAttempts:record.extraAttempts,completedAt:record.completedAt};
  });
  return state;
}
export class ProgressStore{
  constructor({storage,now=()=>new Date(),id=()=>globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`}={}){
    this.now=now;this.id=id;this.state=emptyState();this.issue='';this.volatile=false;this.blocked=false;
    try{this.storage=storage===undefined?globalThis.localStorage:storage;if(!this.storage)throw Error('unavailable');this.state=parseProgress(this.storage.getItem(PROGRESS_KEY));}
    catch{this.blocked=true;this.volatile=true;this.issue='Saved progress is unavailable or unreadable. Existing data was not changed. Practice can continue in this tab; use Reset learning history to retry storage.';}
  }
  snapshot(){return JSON.parse(JSON.stringify(this.state));}
  persist(state){
    this.state=state;
    if(this.blocked)return {saved:false,message:this.issue};
    try{this.storage.setItem(PROGRESS_KEY,JSON.stringify(state));this.volatile=false;this.issue='';return {saved:true,message:'Practice history saved on this browser only.'};}
    catch{this.volatile=true;this.issue='Practice history could not be saved. It remains in this tab only and may be lost on reload.';return {saved:false,message:this.issue};}
  }
  lessonRecord(id){
    if(!lessonById(id))throw Error('Unknown lesson.');
    return this.state.lessons[id]||{attempts:0,firstCorrect:null,lastCorrect:null,practised:false,updatedAt:this.now().toISOString()};
  }
  reflection(id,correct){
    if(typeof correct!=='boolean')throw Error('Use a true/false reflection result.');
    const state=this.snapshot(),record={...this.lessonRecord(id)};
    if(record.attempts===0)record.firstCorrect=correct;
    record.attempts=Math.min(10000,record.attempts+1);record.lastCorrect=correct;record.updatedAt=this.now().toISOString();
    state.lessons[id]=record;return this.persist(state);
  }
  practise(id){
    const state=this.snapshot();state.lessons[id]={...this.lessonRecord(id),practised:true,updatedAt:this.now().toISOString()};return this.persist(state);
  }
  completeSession(summary){
    if(!validSummary(summary))throw Error('Only complete, valid listening practice can be saved.');
    const state=this.snapshot();state.sessions.push({id:this.id(),finished:true,accent:summary.accent,rounds:summary.rounds,independentFirstCorrect:summary.independentFirstCorrect,revealed:summary.revealed,extraAttempts:summary.extraAttempts,completedAt:this.now().toISOString()});
    state.sessions=state.sessions.slice(-50);return this.persist(state);
  }
  reset(){
    try{if(!this.storage)throw Error('unavailable');this.storage.removeItem(PROGRESS_KEY);this.state=emptyState();this.blocked=false;this.volatile=false;this.issue='';return {saved:true,message:'Only Sound Studio learning history was reset. Sound models and classroom demo data were not changed.'};}
    catch{return {saved:false,message:'Learning history could not be reset. Existing stored data was not changed.'};}
  }
}
