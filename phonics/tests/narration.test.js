import {test} from 'node:test';
import assert from 'node:assert/strict';
import {narrationVoices,narrationChunks,WordNarrator} from '../narration.js';

const voices=[{name:'US Natural',lang:'en-US',voiceURI:'us'},{name:'Daniel',lang:'en-GB',voiceURI:'uk'},{name:'Karen',lang:'en-AU',voiceURI:'au'},{name:'Boing',lang:'en-US',voiceURI:'novelty'},{name:'Spanish',lang:'es-ES',voiceURI:'es'}];
function harness(){
  const events=[],queue=[],listeners=new Map();
  const speech={getVoices:()=>voices,speak:utterance=>queue.push(utterance),cancel(){this.cancelled=(this.cancelled||0)+1;},pause(){this.didPause=true;},resume(){this.didResume=true;},addEventListener:(name,listener)=>listeners.set(name,listener),removeEventListener:name=>listeners.delete(name)};
  const narrator=new WordNarrator({speech,Utterance:class{constructor(text){this.text=text;}},onStatus:(message,state)=>events.push({message,...state})});
  return {narrator,speech,queue,events,listeners};
}
test('only actual English non-novelty voices are offered, with Australian then UK preference',()=>{
  assert.deepEqual(narrationVoices(voices).map(voice=>voice.voiceURI),['au','uk','us']);
  assert.equal(voices.length,5);
  assert.equal(narrationVoices([{name:'Ralph',lang:'en-US',voiceURI:'ralph'}]).length,0);
});
test('long spoken instructions are bounded chunks without dropped or repeated words',()=>{
  const text=Array.from({length:140},(_,index)=>'word'+index).join(' ');
  const chunks=narrationChunks(text);
  assert.ok(chunks.every(chunk=>chunk.length<=240));
  assert.equal(chunks.join(' '),text);
  assert.deepEqual(narrationChunks('  a   whole word  '),['a whole word']);
  assert.deepEqual(narrationChunks(''),[]);
});
test('narration uses the selected real voice and clamps unreasonable rates',()=>{
  const {narrator,queue}=harness();
  assert.equal(narrator.speak('A meaningful whole word.',{voiceURI:'uk',rate:10}),true);
  assert.equal(queue[0].text,'A meaningful whole word.');
  assert.equal(queue[0].voice.voiceURI,'uk');
  assert.equal(queue[0].rate,1.15);
  narrator.speak('moon',{voiceURI:'novelty',rate:0.1});
  assert.equal(queue[1].voice.voiceURI,'au');
  assert.equal(queue[1].rate,0.75);
});
test('stale end/error callbacks cannot restart cancelled speech or interrupt a newer request',()=>{
  const {narrator,queue,events}=harness();
  narrator.speak('old '.repeat(200));const stale=queue[0];
  narrator.speak('new sentence');const current=queue[1];
  const count=events.length;
  stale.onend();stale.onerror();stale.onstart();
  assert.equal(queue.length,2);assert.equal(events.length,count);
  assert.equal(narrator.current,current);assert.equal(narrator.playing,true);
  narrator.stop();current.onend();assert.equal(queue.length,2);
  assert.equal(narrator.playing,false);
});
test('queued chunks finish with an honest word-model status; pause/resume and disposal work',()=>{
  const {narrator,speech,queue,events,listeners}=harness();
  narrator.speak('instruction '.repeat(35));
  narrator.togglePause();assert.equal(speech.didPause,true);assert.equal(narrator.paused,true);
  narrator.togglePause();assert.equal(speech.didResume,true);assert.equal(narrator.paused,false);
  for(let index=0;index<queue.length;index++){queue[index].onstart();queue[index].onend();}
  assert.ok(queue.length>1);assert.equal(narrator.playing,false);
  assert.match(events.at(-1).message,/not an isolated phoneme/);
  narrator.dispose();assert.equal(listeners.has('voiceschanged'),false);
});
test('missing API, empty voice lists, invalid content and speech failures have actionable fallbacks',()=>{
  const messages=[];
  const missing=new WordNarrator({speech:null,Utterance:null,onStatus:message=>messages.push(message)});
  assert.equal(missing.speak('test'),false);assert.match(messages.at(-1),/unavailable/);
  const {narrator,speech,events}=harness();
  speech.getVoices=()=>[];assert.equal(narrator.speak('word'),false);assert.match(events.at(-1).message,/No suitable English voice/);
  speech.getVoices=()=>voices;assert.equal(narrator.speak(''),false);assert.equal(narrator.speak('x'.repeat(12001)),false);
  speech.speak=()=>{throw Error('blocked');};assert.equal(narrator.speak('word'),false);assert.match(events.at(-1).message,/could not finish/);
});
