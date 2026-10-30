import {makeRound,soundById} from './course.js';
import {usableClip} from './clips.js';

export function drillClips(clips,accent){
  if(!['en-AU','en-GB'].includes(accent))return [];
  return [...new Map(clips.filter(clip=>usableClip(clip)&&clip.accent===accent).map(clip=>[clip.id,clip])).values()];
}
export class ListeningSession{
  constructor(clips,{accent='en-AU',rounds=6,random=Math.random}={}){
    this.clips=drillClips(clips,accent);
    if(this.clips.length<2)throw Error('Add at least two reviewed sound models with the same Australian or UK accent label.');
    if(!Number.isInteger(rounds)||rounds<1||rounds>20)throw Error('Choose between 1 and 20 practice rounds.');
    this.accent=accent;this.total=rounds;this.random=random;this.history=[];this.round=null;this.heard=false;this.finished=false;
  }
  next(){
    if(this.finished)return null;
    if(this.round&&!this.record.correct&&!this.record.revealed)throw Error('Answer correctly or reveal the model before moving on.');
    if(this.history.length===this.total){this.finished=true;this.round=null;return null;}
    this.round=makeRound(this.clips.map(clip=>soundById(clip.id)),this.random);
    this.record={soundId:this.round.target.id,attempts:0,firstCorrect:null,correct:false,revealed:false};
    this.history.push(this.record);this.heard=false;return this.round;
  }
  clip(){return this.round?this.clips.find(clip=>clip.id===this.round.target.id):null;}
  markHeard(){if(this.round&&!this.finished)this.heard=true;}
  replay(){if(this.round&&!this.finished)this.heard=false;}
  answer(id){
    if(!this.round||this.finished)throw Error('Start a sound round first.');
    if(!this.heard)throw Error('Listen to the complete sound clip before choosing.');
    if(!this.round.options.some(sound=>sound.id===id))throw Error('Choose one of the displayed sound tiles.');
    if(this.record.correct)return {correct:true,alreadyAnswered:true};
    const correct=id===this.round.target.id;
    this.record.attempts++;
    if(this.record.attempts===1&&!this.record.revealed)this.record.firstCorrect=correct;
    this.record.correct=correct;
    return {correct,alreadyAnswered:false};
  }
  reveal(){
    if(!this.round||this.finished)throw Error('Start a sound round first.');
    this.record.revealed=true;return this.round.target;
  }
  summary(){
    return {finished:this.finished,accent:this.accent,rounds:this.history.length,independentFirstCorrect:this.history.filter(record=>record.firstCorrect===true).length,revealed:this.history.filter(record=>record.revealed).length,extraAttempts:this.history.reduce((total,record)=>total+Math.max(0,record.attempts-1),0)};
  }
}
